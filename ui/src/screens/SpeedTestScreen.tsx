import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowDown, ArrowUp, RotateCw, InfoCircleFilled } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseButton } from '../components/WindowControls';
import {
  useSpeedTestStore,
  type SpeedTestWarning,
  type ExperienceRating,
  type GraphPoint,
} from '../stores/speedTestStore';

interface SpeedTestScreenProps {
  onBack: () => void;
}

// ── Main Screen ────────────────────────────────────────────

export function SpeedTestScreen({ onBack }: SpeedTestScreenProps) {
  const { t } = useTranslation();
  const { phase, startTest, reset, cancelTest } = useSpeedTestStore();

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';

  const handleRestart = useCallback(() => {
    if (isRunning) cancelTest();
    reset();
    startTest();
  }, [isRunning, cancelTest, reset, startTest]);

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
          <Button variant="ghost" size="icon" onClick={handleRestart} disabled={phase === 'idle'}>
            <RotateCw className="w-5 h-5 text-muted-foreground" />
          </Button>
          <CloseButton />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-4 pb-6">
          {/* Circle progress (hidden when done) */}
          {phase !== 'done' && <CircleProgress />}

          {/* Speed metrics */}
          <SpeedMetrics />

          {/* Graph */}
          <SpeedGraph />

          {/* Latency metrics */}
          <LatencyMetrics />

          {/* Error state */}
          {phase === 'error' && <ErrorCard />}

          {/* Warning cards (on result) */}
          {phase === 'done' && <WarningCards />}

          {/* Experience ratings (on result) */}
          {phase === 'done' && <ExperienceRatingsSection />}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Circle Progress ────────────────────────────────────────

const CIRCLE_R = 90;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function CircleProgress() {
  const { t } = useTranslation();
  const { phase, progress, currentValue, currentUnit, startTest } = useSpeedTestStore();

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const strokeColor = phase === 'upload' ? '#a855f7' : 'hsl(var(--primary))';

  const phaseLabel = phase === 'ping' ? t('speed_test.phase_ping') : '';

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-[220px] h-[220px]">
        <svg className="-rotate-90" width="220" height="220">
          <circle
            className="fill-none stroke-accent"
            cx="110" cy="110" r={CIRCLE_R}
            strokeWidth="2"
          />
          <circle
            className="fill-none"
            cx="110" cy="110" r={CIRCLE_R}
            strokeWidth="2"
            strokeLinecap="round"
            stroke={strokeColor}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {phase === 'idle' && (
            <button onClick={() => startTest()} className="text-center">
              <span className="text-lg font-medium text-primary">
                {t('speed_test.start')}
              </span>
            </button>
          )}

          {(phase === 'ping' || phase === 'download' || phase === 'upload') && (
            <div className="text-center">
              <div className="text-4xl font-semibold text-foreground font-mono">
                {currentValue}
              </div>
              <div className="text-sm text-muted-foreground font-mono">{t(currentUnit)}</div>
              <div className="flex justify-center mt-1">
                {phase === 'ping' && (
                  <span className="text-xs" style={{ color: strokeColor }}>{phaseLabel}</span>
                )}
                {phase === 'download' && (
                  <ArrowDown className="w-4 h-4 text-primary" />
                )}
                {phase === 'upload' && (
                  <ArrowUp className="w-4 h-4 text-purple-500" />
                )}
              </div>
            </div>
          )}

          {phase === 'error' && (
            <button onClick={() => startTest()} className="text-center">
              <span className="text-lg font-medium text-primary">
                {t('speed_test.start')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Speed Metrics ──────────────────────────────────────────

function SpeedMetrics() {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();

  return (
    <div className="flex justify-around mb-3">
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

// ── Latency Metrics ────────────────────────────────────────

function LatencyMetrics() {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  return (
    <div className="mb-6 relative">
      <div className="flex justify-center gap-8 pl-4">
        <LatencyItem
          label={t('speed_test.ping')}
          value={metrics.ping}
          tooltipKey="ping"
          onShow={setActiveTooltip}
          onHide={() => setActiveTooltip(null)}
        />
        <LatencyItem
          label={t('speed_test.latency')}
          value={metrics.latency}
          tooltipKey="latency"
          onShow={setActiveTooltip}
          onHide={() => setActiveTooltip(null)}
        />
        <LatencyItem
          label={t('speed_test.jitter')}
          value={metrics.jitter}
          tooltipKey="jitter"
          onShow={setActiveTooltip}
          onHide={() => setActiveTooltip(null)}
        />
      </div>

      {/* Tooltip popover */}
      {activeTooltip && (
        <div className="absolute left-2 right-2 top-full mt-2 bg-tooltip text-tooltip-foreground rounded-lg p-3 text-sm leading-relaxed z-50 shadow-lg animate-tooltip-in">
          {t(`speed_test.tooltip_${activeTooltip}`)}
        </div>
      )}
    </div>
  );
}

interface LatencyItemProps {
  label: string;
  value: number | null;
  tooltipKey: string;
  onShow: (key: string) => void;
  onHide: () => void;
}

function LatencyItem({ label, value, tooltipKey, onShow, onHide }: LatencyItemProps) {
  const { t } = useTranslation();
  return (
    <div className="flex-1">
      <div
        className="flex items-center gap-1 mb-1 text-muted-foreground hover:text-foreground hover:opacity-100 opacity-70 transition-all cursor-default"
        onMouseEnter={() => onShow(tooltipKey)}
        onMouseLeave={onHide}
      >
        <span className="text-sm">{label}</span>
        <InfoCircleFilled className="w-3.5 h-3.5 opacity-50" />
      </div>
      <div className="flex items-baseline gap-0.5">
        {value !== null ? (
          <>
            <span className="text-xl font-semibold text-foreground font-mono">
              {Math.round(value)}
            </span>
            <span className="text-sm text-muted-foreground font-mono">{t('speed_test.unit_ms')}</span>
          </>
        ) : (
          <span className="text-xl font-semibold text-foreground font-mono">—</span>
        )}
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
    <div className="space-y-3 mb-4 px-1">
      {warnings.map((w) => (
        <WarningCard key={w.titleKey} warning={w} t={t} />
      ))}
    </div>
  );
}

function WarningCard({ warning, t }: { warning: SpeedTestWarning; t: (key: string, params?: Record<string, string>) => string }) {
  return (
    <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/15">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-600 dark:text-amber-300/70 text-sm font-medium">
          {t(warning.titleKey)}
        </span>
      </div>
      <p className="text-sm text-amber-600 dark:text-amber-300/70 leading-relaxed">
        {t(warning.descKey, warning.descParams)}
      </p>
    </div>
  );
}

// ── Experience Ratings ─────────────────────────────────────

function ExperienceRatingsSection() {
  const { t } = useTranslation();
  const { experienceRatings } = useSpeedTestStore();

  if (experienceRatings.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 mt-5 px-1">
      {experienceRatings.map((rating) => (
        <RatingBar key={rating.nameKey} rating={rating} t={t} />
      ))}
    </div>
  );
}

function RatingBar({ rating, t }: { rating: ExperienceRating; t: (key: string) => string }) {
  return (
    <div className="bg-accent/50 rounded-xl p-3">
      <span className="text-sm text-foreground">{t(rating.nameKey)}</span>
      <span className="block text-xs font-medium mt-0.5 mb-2" style={{ color: rating.color }}>
        {t(`speed_test.rating_${rating.level}`)}
      </span>
      <div className="h-1 bg-black/10 dark:bg-white/15 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${rating.fillPercent}%`,
            backgroundColor: rating.color,
          }}
        />
      </div>
    </div>
  );
}
