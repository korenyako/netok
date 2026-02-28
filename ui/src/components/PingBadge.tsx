import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function pingColorClass(ms: number): string {
  if (ms < 50) return 'text-success';
  if (ms <= 150) return 'text-warning';
  return 'text-destructive';
}

export function PingBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  const { t } = useTranslation();

  const colorClass = value === undefined
    ? 'text-foreground'
    : value === null
      ? 'text-warning'
      : pingColorClass(value);

  const label = value === undefined
    ? '...'
    : value === null
      ? '\u2014'
      : `${value}\u2009${t('speed_test.unit_ms')}`;

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono shrink-0 self-start mt-0.5", colorClass, className)}>
      <span className="ping-dot" />
      {label}
    </span>
  );
}
