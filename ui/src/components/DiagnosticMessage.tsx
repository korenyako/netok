import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';

interface DiagnosticMessageProps {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
  className?: string;
  onAction?: () => void;
  actionLabel?: string;
}

const severityStyles: Record<DiagnosticSeverity, { bead: string; title: string }> = {
  success: { bead: 'bg-primary', title: 'text-primary' },
  warning: { bead: 'bg-warning', title: 'text-warning' },
  error: { bead: 'bg-destructive', title: 'text-destructive' },
};

export function DiagnosticMessage({ scenario, severity, className, onAction, actionLabel }: DiagnosticMessageProps) {
  const { t } = useTranslation();
  const styles = severityStyles[severity];
  const action = t(`diagnostic.scenario.${scenario}.action`);

  return (
    <div className={cn('rounded-lg bg-accent p-4', className)}>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
          <span className={cn('w-2 h-2 rounded-full', styles.bead)} />
        </span>
        <div className="flex-1">
          <p className={cn('text-base font-medium leading-normal mb-1', styles.title)}>
            {t(`diagnostic.scenario.${scenario}.message`)}
          </p>
          {action && (
            <p className="text-sm text-muted-foreground leading-normal">
              {action}
            </p>
          )}
          {onAction && actionLabel && (
            <Button
              variant="outline-card"
              size="sm"
              className="mt-3"
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
