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
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">
          {t('speed_test.title')}
        </h1>
        <Button variant="ghost" size="icon" onClick={handleRestart} disabled={phase === 'idle'}>
          <RotateCw className="w-5 h-5 text-muted-foreground" />
        </Button>
        <CloseButton />
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

const CIRCLE_R = 72;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

function CircleProgress() {
  const { t } = useTranslation();
  const { phase, progress, currentValue, currentUnit, startTest } = useSpeedTestStore();

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const strokeColor = phase === 'upload' ? '#a855f7' : 'hsl(var(--primary))';

  const phaseLabel = phase === 'ping' ? t('speed_test.phase_ping') : '';

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="relative w-[180px] h-[180px]">
        <svg className="-rotate-90" width="180" height="180">
          <circle
            className="fill-none stroke-accent"
            cx="90" cy="90" r={CIRCLE_R}
            strokeWidth="2"
          />
          <circle
            className="fill-none"
            cx="90" cy="90" r={CIRCLE_R}
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
              <div className="text-3xl font-semibold text-foreground font-mono">
                {currentValue}
              </div>
              <div className="text-sm text-muted-foreground font-mono">{currentUnit}</div>
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
  const { metrics } = useSpeedTestStore();

  return (
    <div className="flex justify-around mb-3">
      <div className="flex items-center justify-center gap-1">
        <ArrowDown className="w-6 h-6 text-primary" />
        <span className={`text-[28px] font-semibold font-mono ${metrics.download !== null ? 'text-primary' : 'text-muted-foreground'}`}>
          {metrics.download !== null ? Math.round(metrics.download) : '—'}
        </span>
        <span className="text-sm text-muted-foreground font-mono">Mbps</span>
      </div>
      <div className="flex items-center justify-center gap-1">
        <ArrowUp className="w-6 h-6 text-purple-500" />
        <span className={`text-[28px] font-semibold font-mono ${metrics.upload !== null ? 'text-purple-500' : 'text-muted-foreground'}`}>
          {metrics.upload !== null ? Math.round(metrics.upload) : '—'}
        </span>
        <span className="text-sm text-muted-foreground font-mono">Mbps</span>
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

  // Gradient fill (extend 1px each side to match round lineCap overhang)
  ctx.beginPath();
  ctx.moveTo(points[0].x - 1, height);
  ctx.lineTo(points[0].x - 1, points[0].y);
  points.forEach((p) => ctx.lineTo(p.x, p.y));
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

  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
}

// ── Latency Metrics ────────────────────────────────────────

function LatencyMetrics() {
  const { t } = useTranslation();
  const { metrics } = useSpeedTestStore();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleTooltip = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTooltip(activeTooltip === key ? null : key);
  };

  // Auto-dismiss tooltip
  useEffect(() => {
    if (!activeTooltip) return;
    const timer = setTimeout(() => setActiveTooltip(null), 3000);
    return () => clearTimeout(timer);
  }, [activeTooltip]);

  // Dismiss on outside click
  useEffect(() => {
    if (!activeTooltip) return;
    const handler = () => setActiveTooltip(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [activeTooltip]);

  return (
    <div className="mb-6 relative">
      <div className="flex justify-center gap-8 pl-4">
        <LatencyItem
          label={t('speed_test.ping')}
          value={metrics.ping}
          tooltipKey="ping"
          activeTooltip={activeTooltip}
          onTooltip={handleTooltip}
        />
        <LatencyItem
          label={t('speed_test.latency')}
          value={metrics.latency}
          tooltipKey="latency"
          activeTooltip={activeTooltip}
          onTooltip={handleTooltip}
        />
        <LatencyItem
          label={t('speed_test.jitter')}
          value={metrics.jitter}
          tooltipKey="jitter"
          activeTooltip={activeTooltip}
          onTooltip={handleTooltip}
        />
      </div>

      {/* Tooltip popover */}
      {activeTooltip && (
        <div className="absolute left-2 right-2 top-full mt-2 bg-card rounded-lg p-3 text-sm text-foreground leading-relaxed z-50 shadow-lg">
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
  activeTooltip: string | null;
  onTooltip: (key: string, e: React.MouseEvent) => void;
}

function LatencyItem({ label, value, tooltipKey, onTooltip }: LatencyItemProps) {
  return (
    <div className="flex-1">
      <button
        className="flex items-center gap-1 mb-1 text-muted-foreground hover:text-foreground hover:opacity-100 opacity-70 transition-all"
        onClick={(e) => onTooltip(tooltipKey, e)}
      >
        <span className="text-sm">{label}</span>
        <InfoCircleFilled className="w-3.5 h-3.5 opacity-50" />
      </button>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-semibold text-foreground font-mono">
          {value !== null ? Math.round(value) : '—'}
        </span>
        <span className="text-sm text-muted-foreground font-mono">ms</span>
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
    <div className="space-y-3 mb-4">
      {warnings.map((w) => (
        <WarningCard key={w.titleKey} warning={w} t={t} />
      ))}
    </div>
  );
}

function WarningCard({ warning, t }: { warning: SpeedTestWarning; t: (key: string, params?: Record<string, string>) => string }) {
  return (
    <div className="rounded-xl p-4 border border-amber-900/50" style={{
      background: 'linear-gradient(135deg, rgba(61,42,0,0.4) 0%, rgba(45,32,0,0.4) 100%)',
    }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-amber-400 text-sm font-medium">
          {t(warning.titleKey)}
        </span>
      </div>
      <p className="text-sm text-amber-200/80 leading-relaxed">
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
    <div className="space-y-4 mt-5 px-1">
      {experienceRatings.map((rating) => (
        <RatingBar key={rating.nameKey} rating={rating} t={t} />
      ))}
    </div>
  );
}

function RatingBar({ rating, t }: { rating: ExperienceRating; t: (key: string) => string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-foreground">{t(rating.nameKey)}</span>
        <span className="text-xs" style={{ color: rating.color }}>
          {t(`speed_test.rating_${rating.level}`)}
        </span>
      </div>
      <div className="h-1 bg-accent rounded-full overflow-hidden">
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
