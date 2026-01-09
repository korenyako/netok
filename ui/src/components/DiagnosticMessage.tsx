import { useTranslation } from 'react-i18next';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';

interface DiagnosticMessageProps {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
  className?: string;
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );
}

const severityConfig = {
  success: {
    icon: CheckIcon,
    containerClass: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    iconClass: 'text-green-600 dark:text-green-400',
    titleClass: 'text-green-800 dark:text-green-200',
    messageClass: 'text-green-700 dark:text-green-300',
  },
  warning: {
    icon: WarningIcon,
    containerClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
    titleClass: 'text-yellow-800 dark:text-yellow-200',
    messageClass: 'text-yellow-700 dark:text-yellow-300',
  },
  error: {
    icon: ErrorIcon,
    containerClass: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    titleClass: 'text-red-800 dark:text-red-200',
    messageClass: 'text-red-700 dark:text-red-300',
  },
};

export function DiagnosticMessage({ scenario, severity, className = '' }: DiagnosticMessageProps) {
  const { t } = useTranslation();

  const config = severityConfig[severity];
  const IconComponent = config.icon;

  const title = t(`diagnostic.scenario.${scenario}.title`);
  const message = t(`diagnostic.scenario.${scenario}.message`);

  return (
    <div className={`rounded-lg border p-4 ${config.containerClass} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${config.iconClass}`}>
          <IconComponent />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${config.titleClass}`}>
            {title}
          </h3>
          <p className={`mt-1 text-sm ${config.messageClass}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
