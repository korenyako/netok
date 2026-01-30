import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';

interface DiagnosticMessageProps {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
  className?: string;
}

const severityStyles: Record<DiagnosticSeverity, { border: string; bead: string; title: string }> = {
  success: { border: 'border-primary/50', bead: 'bg-primary', title: 'text-primary' },
  warning: { border: 'border-warning/50', bead: 'bg-warning', title: 'text-warning' },
  error: { border: 'border-destructive/50', bead: 'bg-destructive', title: 'text-destructive' },
};

export function DiagnosticMessage({ scenario, severity, className }: DiagnosticMessageProps) {
  const { t } = useTranslation();
  const styles = severityStyles[severity];

  return (
    <div className={cn('rounded-lg border p-4', styles.border, className)}>
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
          <span className={cn('w-2 h-2 rounded-full', styles.bead)} />
        </span>
        <div className="flex-1">
          <p className={cn('text-base font-medium leading-normal mb-1', styles.title)}>
            {t(`diagnostic.scenario.${scenario}.title`)}
          </p>
          <p className="text-sm text-muted-foreground leading-normal">
            {t(`diagnostic.scenario.${scenario}.message`)}
          </p>
        </div>
      </div>
    </div>
  );
}
