import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { CloseButton } from '../components/WindowControls';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import type { DiagnosticScenario, DiagnosticSeverity } from '../api/tauri';
import { cn } from '@/lib/utils';

interface DebugScenariosScreenProps {
  onBack: () => void;
  onNavigateToHome: () => void;
}

const SCENARIOS: Array<{ scenario: DiagnosticScenario; label: string; severity: DiagnosticSeverity }> = [
  { scenario: 'all_good', label: 'All Good', severity: 'success' },
  { scenario: 'wifi_disabled', label: 'Wi-Fi Disabled', severity: 'error' },
  { scenario: 'wifi_not_connected', label: 'Wi-Fi Not Connected', severity: 'error' },
  { scenario: 'weak_signal', label: 'Weak Signal', severity: 'warning' },
  { scenario: 'router_unreachable', label: 'Router Unreachable', severity: 'error' },
  { scenario: 'no_internet', label: 'No Internet', severity: 'error' },
  { scenario: 'dns_failure', label: 'DNS Failure', severity: 'warning' },
  { scenario: 'http_blocked', label: 'HTTP Blocked', severity: 'warning' },
];

const SEVERITY_DOT: Record<DiagnosticSeverity, string> = {
  success: 'bg-primary',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

export function DebugScenariosScreen({ onBack, onNavigateToHome }: DebugScenariosScreenProps) {
  const { t } = useTranslation();
  const { overrideScenario, clearOverride, scenarioOverride } = useDiagnosticsStore();

  const handleSelect = (scenario: DiagnosticScenario) => {
    overrideScenario(scenario, t);
    onNavigateToHome();
  };

  const handleReset = () => {
    clearOverride(t);
    onNavigateToHome();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">Debug Scenarios</h1>
          <CloseButton />
        </div>
      </div>

      {/* Scenario list */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-1.5">
          {SCENARIOS.map(({ scenario, label, severity }) => (
            <button
              key={scenario}
              onClick={() => handleSelect(scenario)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors',
                'hover:bg-accent/50',
                scenarioOverride === scenario && 'bg-accent',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full shrink-0', SEVERITY_DOT[severity])} />
              <span className="flex-1 text-foreground">{label}</span>
              <span className="text-xs text-muted-foreground font-mono">{scenario}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Reset button */}
        <Button
          variant="outline"
          className="w-full text-sm font-medium"
          onClick={handleReset}
        >
          <RotateCw className="w-4 h-4" />
          Reset (Run Real Diagnostics)
        </Button>
      </div>
    </div>
  );
}
