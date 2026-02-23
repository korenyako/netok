import { cn } from '@/lib/utils';

function pingColorClass(ms: number): string {
  if (ms < 50) return 'text-success';
  if (ms <= 150) return 'text-warning';
  return 'text-destructive';
}

export function PingBadge({ value }: { value: number | null | undefined }) {
  if (value === undefined) {
    return <span className="text-xs font-mono text-muted-foreground shrink-0 self-start mt-0.5">...</span>;
  }
  if (value === null) {
    return <span className="text-xs font-mono text-muted-foreground shrink-0 self-start mt-0.5">&mdash;</span>;
  }
  return (
    <span className={cn("text-xs font-mono shrink-0 self-start mt-0.5", pingColorClass(value))}>
      {value} ms
    </span>
  );
}
