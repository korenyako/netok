interface ScanProgressRingProps {
  /** Progress value 0–100 */
  percent: number;
  /** Stage label shown below the percentage */
  stageLabel?: string;
}

// Match StatusScreen circle dimensions (240px, stroke 2)
const SIZE = 240;
const STROKE_WIDTH = 2;
const RADIUS = (SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScanProgressRing({ percent, stageLabel }: ScanProgressRingProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="relative w-60 h-60">
        <svg
          className="w-full h-full"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          fill="none"
        >
          {/* Background track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            stroke="hsl(var(--muted-foreground))"
            opacity={0.12}
          />
          {/* Progress arc */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            stroke="hsl(var(--primary))"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.3s ease-out',
            }}
          />
        </svg>

        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex items-start">
            <span className="font-mono text-6xl font-semibold text-foreground leading-none">
              {Math.round(clamped)}
            </span>
            <span className="font-mono text-lg text-muted-foreground ml-0.5 mt-1">%</span>
          </div>
        </div>
      </div>

      {/* Stage label */}
      {stageLabel && (
        <p className="text-sm text-muted-foreground">{stageLabel}</p>
      )}
    </div>
  );
}
