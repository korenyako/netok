import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowDown, ArrowUp, RotateCw, ChevronRight, Video, TvMinimalPlay, Gamepad2, HouseWifi } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import {
  useSpeedTestStore,
  type SpeedTestWarning,
  type ExperienceRating,
  type GraphPoint,
} from '../stores/speedTestStore';
import { useDiagnosticsStore, getNetworkAvailability, type NetworkAvailability } from '../stores/diagnosticsStore';

interface SpeedTestScreenProps {
  onBack: () => void;
}

// ── Main Screen ────────────────────────────────────────────

export function SpeedTestScreen({ onBack }: SpeedTestScreenProps) {
  const { t } = useTranslation();
  const { phase, cooldownSecondsLeft, startTest, reset, cancelTest } = useSpeedTestStore();
  const nodes = useDiagnosticsStore(s => s.nodes);
  const availability = getNetworkAvailability(nodes);
  const internetBlocked = availability !== 'full';
  const [showDetails, setShowDetails] = useState(false);

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const isCoolingDown = cooldownSecondsLeft > 0;

  const handleRestart = useCallback(() => {
    if (isRunning) cancelTest();
    reset();
    startTest();
  }, [isRunning, cancelTest, reset, startTest]);

  if (showDetails) {
    return <LatencyDetailsView onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('speed_test.title')}
          </h1>
          <Button variant="ghost" size="icon" onClick={handleRestart} disabled={phase === 'idle' || isCoolingDown || internetBlocked}>
            <RotateCw className="w-5 h-5 text-muted-foreground" />
          </Button>
          <CloseButton />
        </div>
      </div>

      <div className="flex-1 px-4 pb-6 overflow-y-auto">
          {/* Circle progress (hidden when done) */}
          {phase !== 'done' && <CircleProgress internetBlocked={internetBlocked} availability={availability} />}

          {phase === 'done' ? (
            <>
              {/* 1 — Download / Upload */}
              <SpeedMetrics />

              {/* 2 — Experience ratings */}
              <ExperienceRatingsSection />

              {/* 3 — Ping / Latency / Jitter */}
              <div className="mt-3">
                <LatencySummary onClick={() => setShowDetails(true)} />
              </div>

              {/* 4,5,6 — Warning messages */}
              <WarningCards />
            </>
          ) : (
            <>
              {/* Speed metrics */}
              <SpeedMetrics />

              {/* Graph */}
              <SpeedGraph />

              {/* Error state */}
              {phase === 'error' && <ErrorCard />}
            </>
          )}
      </div>
    </div>
  );
}

// ── Circle Progress ────────────────────────────────────────

const CIRCLE_SIZE = 240;
const STROKE_WIDTH = 2;
const CIRCLE_R = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function CircleProgress({ internetBlocked, availability }: { internetBlocked: boolean; availability: NetworkAvailability }) {
  const { t } = useTranslation();
  const { phase, progress, currentValue, currentUnit, cooldownSecondsLeft, startTest, metrics } = useSpeedTestStore();

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const strokeColor = phase === 'upload' ? '#a855f7' : 'hsl(var(--primary))';

  const showPingInCircle = metrics.ping !== null && (phase === 'download' || phase === 'upload');

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-60 h-60">
        <svg className="-rotate-90" viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} fill="none" style={{ width: '100%', height: '100%' }}>
          <circle
            className="fill-none stroke-accent"
            cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={CIRCLE_R}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            className="fill-none"
            cx={CIRCLE_SIZE / 2} cy={CIRCLE_SIZE / 2} r={CIRCLE_R}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            stroke={strokeColor}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {phase === 'idle' && cooldownSecondsLeft > 0 && (
            <div className="text-center">
              <div className="text-4xl font-semibold text-muted-foreground font-mono">
                {cooldownSecondsLeft}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('speed_test.cooldown_wait')}
              </div>
            </div>
          )}

          {phase === 'idle' && cooldownSecondsLeft === 0 && !internetBlocked && (
            <button onClick={() => startTest()} className="text-center">
              <span className="text-lg font-medium text-primary">
                {t('speed_test.start')}
              </span>
            </button>
          )}

          {phase === 'idle' && cooldownSecondsLeft === 0 && internetBlocked && (
            <div className="text-center px-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {availability === 'no_network'
                  ? t('network.scan_unavailable_no_network')
                  : t('network.scan_unavailable_no_internet')}
              </p>
            </div>
          )}

          {phase === 'ping' && (
            <div className="text-center">
              <div className="text-4xl font-semibold text-foreground font-mono">
                {currentValue}
              </div>
              <div className="text-sm text-muted-foreground font-mono">{t(currentUnit)}</div>
              <span className="text-xs mt-1" style={{ color: strokeColor }}>{t('speed_test.phase_ping')}</span>
            </div>
          )}

          {(phase === 'download' || phase === 'upload') && (
            <div className="text-center">
              <div className="text-4xl font-semibold text-foreground font-mono">
                {currentValue}
              </div>
              <div className="text-sm text-muted-foreground font-mono">{t(currentUnit)}</div>
              <div className="flex justify-center mt-1">
                {phase === 'download' && <ArrowDown className="w-4 h-4 text-primary" />}
                {phase === 'upload' && <ArrowUp className="w-4 h-4 text-purple-500" />}
              </div>
            </div>
          )}

          {phase === 'error' && cooldownSecondsLeft > 0 && (
            <div className="text-center">
              <div className="text-4xl font-semibold text-muted-foreground font-mono">
                {cooldownSecondsLeft}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('speed_test.cooldown_wait')}
              </div>
            </div>
          )}

          {phase === 'error' && cooldownSecondsLeft === 0 && !internetBlocked && (
            <button onClick={() => startTest()} className="text-center">
              <span className="text-lg font-medium text-primary">
                {t('speed_test.start')}
              </span>
            </button>
          )}

          {phase === 'error' && cooldownSecondsLeft === 0 && internetBlocked && (
            <div className="text-center px-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {availability === 'no_network'
                  ? t('network.scan_unavailable_no_network')
                  : t('network.scan_unavailable_no_internet')}
              </p>
            </div>
          )}
        </div>

        {/* Ping result at the bottom of the circle */}
        {showPingInCircle && (
          <div className="absolute bottom-10 inset-x-0 flex flex-col items-center animate-in fade-in duration-300">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">{t('speed_test.ping')}</p>
            <span className="text-xs font-mono text-muted-foreground">
              {Math.round(metrics.ping!)} {t('speed_test.unit_ms')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Speed Metrics ──────────────────────────────────────────

function SpeedMetrics() {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();

  return (
    <div className="flex justify-around mt-3 mb-3">
      <div className="flex items-center justify-center gap-2">
        <ArrowDown className="w-5 h-5 text-primary" />
        <div className="text-center">
          <div className={`text-[28px] leading-tight font-semibold font-mono ${metrics.download !== null ? 'text-primary' : 'text-muted-foreground'}`}>
            {metrics.download !== null ? Math.round(metrics.download) : '—'}
          </div>
          {metrics.download !== null && (
            <div className="text-xs text-muted-foreground font-mono">{t('speed_test.unit_mbps')}</div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2">
        <ArrowUp className="w-5 h-5 text-purple-500" />
        <div className="text-center">
          <div className={`text-[28px] leading-tight font-semibold font-mono ${metrics.upload !== null ? 'text-purple-500' : 'text-muted-foreground'}`}>
            {metrics.upload !== null ? Math.round(metrics.upload) : '—'}
          </div>
          {metrics.upload !== null && (
            <div className="text-xs text-muted-foreground font-mono">{t('speed_test.unit_mbps')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Speed Graph (Canvas) ───────────────────────────────────

function SpeedGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { downloadData, uploadData, phase } = useSpeedTestStore();

  const hasData = downloadData.length > 1 || uploadData.length > 1;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !hasData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);

    const allValues = [
      ...downloadData.map((d) => d.value),
      ...uploadData.map((d) => d.value),
    ];
    const maxVal = Math.max(...allValues, 1);

    const primaryRaw = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const [h, s, l] = primaryRaw.split(/[\s,]+/);
    const primaryColor = `hsl(${h}, ${s}, ${l})`;

    if (downloadData.length > 1) {
      drawLine(ctx, downloadData, width, height, primaryColor, maxVal);
    }
    if (uploadData.length > 1) {
      drawLine(ctx, uploadData, width, height, '#a855f7', maxVal);
    }
  }, [downloadData, uploadData, phase, hasData]);

  if (!hasData) return null;

  return (
    <div ref={containerRef} className="h-20 overflow-hidden relative mt-2 mb-3">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function withAlpha(color: string, alpha: number): string {
  if (color.startsWith('hsl(')) {
    // CSS var may be space-separated "hsl(152 50% 47%)" — normalize to comma syntax
    const inner = color.slice(4, -1).trim();
    const parts = inner.includes(',')
      ? inner.split(',').map((s) => s.trim())
      : inner.split(/\s+/);
    return `hsla(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }
  if (color.startsWith('#') && color.length >= 7) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  data: GraphPoint[],
  width: number,
  height: number,
  color: string,
  maxVal: number,
) {
  const padding = 5;
  const graphHeight = height - padding * 2;

  const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: padding + graphHeight - (d.value / maxVal) * graphHeight,
  }));

  if (points.length < 2) return;

  // Trace path using midpoint subdivision for gentle smoothing:
  // straight lines to midpoints between data points, with
  // quadratic curves through the actual data points as control points.
  function tracePath(fromIndex: number) {
    for (let i = fromIndex; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const midX = (curr.x + next.x) / 2;
      const midY = (curr.y + next.y) / 2;

      if (i === fromIndex) {
        ctx.lineTo(curr.x, curr.y);
        ctx.lineTo(midX, midY);
      } else {
        ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
      }
    }
    // Final segment to last point
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  // Gradient fill (extend 1px each side to match round lineCap overhang)
  ctx.beginPath();
  ctx.moveTo(points[0].x - 1, height);
  ctx.lineTo(points[0].x - 1, points[0].y);
  tracePath(0);
  ctx.lineTo(points[points.length - 1].x + 1, points[points.length - 1].y);
  ctx.lineTo(points[points.length - 1].x + 1, height);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, withAlpha(color, 0.25));
  gradient.addColorStop(1, withAlpha(color, 0));
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke line
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.moveTo(points[0].x, points[0].y);
  tracePath(0);

  ctx.stroke();
}

// ── Latency Summary (clickable row) ───────────────────────

function LatencySummary({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();

  const items = [
    { label: t('speed_test.ping'), value: metrics.ping, getLevel: getPingLevel },
    { label: t('speed_test.latency'), value: metrics.latency, getLevel: getPingLevel },
    { label: t('speed_test.jitter'), value: metrics.jitter, getLevel: getJitterLevel },
  ];

  return (
    <Card className="bg-transparent hover:bg-accent transition-colors cursor-pointer" onClick={onClick}>
      <CardContent className="flex items-center py-3 px-4 gap-3">
        <div className="flex-1 flex gap-6">
          {items.map((item) => {
            const level = item.value !== null ? item.getLevel(item.value) : null;
            const colorClass = level ? LATENCY_COLOR[level] : '';

            return (
              <div key={item.label}>
                <p className="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">{item.label}</p>
                <span className={`text-xs font-mono ${colorClass}`}>
                  {item.value !== null ? `${Math.round(item.value)} ${t('speed_test.unit_ms')}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center rtl-flip" />
      </CardContent>
    </Card>
  );
}

// ── Latency Details View ──────────────────────────────────

type LatencyLevel = 'excellent' | 'good' | 'fair' | 'slow';

function getPingLevel(ms: number): LatencyLevel {
  if (ms < 20) return 'excellent';
  if (ms <= 50) return 'good';
  if (ms <= 100) return 'fair';
  return 'slow';
}

function getJitterLevel(ms: number): LatencyLevel {
  if (ms < 5) return 'excellent';
  if (ms <= 15) return 'good';
  if (ms <= 30) return 'fair';
  return 'slow';
}

const LATENCY_COLOR: Record<LatencyLevel, string> = {
  excellent: 'text-success', good: 'text-success',
  fair: 'text-warning', slow: 'text-destructive',
};

function LatencyDetailsView({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();

  const items = [
    { label: t('speed_test.ping'), value: metrics.ping, desc: t('speed_test.tooltip_ping'), getLevel: getPingLevel },
    { label: t('speed_test.latency'), value: metrics.latency, desc: t('speed_test.tooltip_latency'), getLevel: getPingLevel },
    { label: t('speed_test.jitter'), value: metrics.jitter, desc: t('speed_test.tooltip_jitter'), getLevel: getJitterLevel },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('speed_test.title')}
          </h1>
          <CloseButton />
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-3">
          {items.map((item) => {
            const level = item.value !== null ? item.getLevel(item.value) : null;
            const colorClass = level ? LATENCY_COLOR[level] : '';

            return (
              <div key={item.label} className="bg-accent/50 rounded-xl p-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-xs font-mono uppercase tracking-wider ${colorClass || 'text-foreground'}`}>{item.label}</span>
                  <span className={`text-xs font-mono ${colorClass}`}>
                    {item.value !== null ? <>{Math.round(item.value)}<span className="ml-0.5 text-[10px]">{t('speed_test.unit_ms')}</span></> : '—'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  {item.desc}
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ── Error Card ─────────────────────────────────────────────

function ErrorCard() {
  const { t } = useTranslation();
  const { error } = useSpeedTestStore();

  return (
    <div className="mb-4 rounded-xl bg-destructive/5 p-4">
      <p className="text-sm text-destructive">{t(error || 'speed_test.error_test_failed')}</p>
    </div>
  );
}

// ── Warning Cards ──────────────────────────────────────────

function WarningCards() {
  const { t } = useTranslation();
  const { warnings } = useSpeedTestStore();

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {warnings.map((w) => (
        <WarningCard key={w.titleKey} warning={w} t={t} />
      ))}
    </div>
  );
}

function WarningCard({ warning, t }: { warning: SpeedTestWarning; t: (key: string, params?: Record<string, string>) => string }) {
  return (
    <div className="rounded-lg bg-accent p-4">
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
          <span className="w-2 h-2 rounded-full bg-warning" />
        </span>
        <div className="flex-1">
          <p className="text-base font-medium leading-normal mb-1 text-warning">
            {t(warning.titleKey)}
          </p>
          <p className="text-sm text-muted-foreground leading-normal">
            {t(warning.descKey, warning.descParams)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Experience Ratings ─────────────────────────────────────

function ExperienceRatingsSection() {
  const { t } = useTranslation();
  const { experienceRatings } = useSpeedTestStore();

  if (experienceRatings.length === 0) return null;

  return (
    <div className="space-y-2 mt-3">
      {experienceRatings.map((rating) => (
        <RatingBar key={rating.nameKey} rating={rating} t={t} />
      ))}
    </div>
  );
}

const RATING_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'speed_test.rating_video_calls': Video,
  'speed_test.rating_streaming': TvMinimalPlay,
  'speed_test.rating_gaming': Gamepad2,
  'speed_test.rating_work_from_home': HouseWifi,
};

function RatingBar({ rating, t }: { rating: ExperienceRating; t: (key: string) => string }) {
  const Icon = RATING_ICONS[rating.nameKey];
  return (
    <div className="flex items-center py-1.5">
      <span className="flex items-center gap-2 flex-1 text-sm text-muted-foreground">
        {Icon && <Icon className="w-4 h-4" />}
        {t(rating.nameKey)}
      </span>
      <span className="text-sm font-medium" style={{ color: rating.color }}>
        {t(`speed_test.rating_${rating.level}`)}
      </span>
    </div>
  );
}
