import { useTranslation } from 'react-i18next';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';

interface DiagnosticMessageProps {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
  className?: string;
}

const severityConfig = {
  success: { icon: CheckCircle, variant: 'success' as const },
  warning: { icon: AlertTriangle, variant: 'warning' as const },
  error: { icon: XCircle, variant: 'destructive' as const },
};

export function DiagnosticMessage({ scenario, severity, className }: DiagnosticMessageProps) {
  const { t } = useTranslation();

  const { icon: IconComponent, variant } = severityConfig[severity];

  return (
    <Alert variant={variant} className={className}>
      <IconComponent className="h-4 w-4" />
      <AlertTitle>{t(`diagnostic.scenario.${scenario}.title`)}</AlertTitle>
      <AlertDescription>{t(`diagnostic.scenario.${scenario}.message`)}</AlertDescription>
    </Alert>
  );
}
