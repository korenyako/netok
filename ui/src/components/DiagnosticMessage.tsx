import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';

interface DiagnosticMessageProps {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
  className?: string;
}

const severityStyles: Record<DiagnosticSeverity, { bead: string; title: string }> = {
  success: { bead: 'bg-primary', title: 'text-primary' },
  warning: { bead: 'bg-warning', title: 'text-warning' },
  error: { bead: 'bg-destructive', title: 'text-destructive' },
};

export function DiagnosticMessage({ scenario, severity, className }: DiagnosticMessageProps) {
  const { t } = useTranslation();
  const styles = severityStyles[severity];

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', styles.bead)} />
      <div>
        <p className={cn('text-base font-medium leading-normal', styles.title)}>
          {t(`diagnostic.scenario.${scenario}.title`)}
        </p>
        <p className="text-sm text-foreground">
          {t(`diagnostic.scenario.${scenario}.message`)}
        </p>
      </div>
    </div>
  );
}
