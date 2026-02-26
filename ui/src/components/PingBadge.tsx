import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

function pingColorClass(ms: number): string {
  if (ms < 50) return 'text-success';
  if (ms <= 150) return 'text-warning';
  return 'text-destructive';
}

export function PingBadge({ value, className }: { value: number | null | undefined; className?: string }) {
  const { t } = useTranslation();

  if (value === undefined) {
    return <span className={cn("text-xs font-mono text-muted-foreground shrink-0 self-start mt-0.5", className)}>...</span>;
  }
  if (value === null) {
    return <span className={cn("text-xs font-mono text-muted-foreground shrink-0 self-start mt-0.5", className)}>&mdash;</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-mono shrink-0 self-start mt-0.5", pingColorClass(value), className)}>
      <span className="ping-dot" />
      {value}&thinsp;{t('speed_test.unit_ms')}
    </span>
  );
}
