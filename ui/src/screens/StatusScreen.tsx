import { useTranslation } from 'react-i18next';
import { Check, AlertTriangle, X } from 'lucide-react';
import type { DiagnosticsSnapshot } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { deriveScenario } from '../utils/deriveScenario';
import { cn } from '@/lib/utils';

interface StatusScreenProps {
  onOpenDiagnostics: () => void;
  onNavigateToDnsProviders: () => void;
  diagnostics: DiagnosticsSnapshot | null;
}

// Known providers that count as "protection enabled"
const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'CleanBrowsing', 'Quad9', 'OpenDns'];

// Get display name for DNS provider
function getProviderDisplayName(type: string): string {
  const names: Record<string, string> = {
    'Cloudflare': 'Cloudflare',
    'Google': 'Google',
    'AdGuard': 'AdGuard',
    'Dns4Eu': 'DNS4EU',
    'CleanBrowsing': 'CleanBrowsing',
    'Quad9': 'Quad9',
    'OpenDns': 'OpenDNS',
  };
  return names[type] || type;
}

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, diagnostics }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider } = useDnsStore();

  // Determine if DNS protection is enabled (only known providers count as enabled)
  // Auto and Custom are treated as "protection disabled"
  const isDnsProtectionEnabled = dnsProvider !== null && KNOWN_PROVIDERS.includes(dnsProvider.type);
  const providerName = isDnsProtectionEnabled ? getProviderDisplayName(dnsProvider.type) : null;

  // Derive diagnostic scenario from nodes
  const scenarioResult = diagnostics ? deriveScenario(diagnostics.nodes) : null;
  const severity = scenarioResult?.severity ?? 'success';

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background">
      {/* Main Content - Clickable Area */}
      <button
        onClick={onOpenDiagnostics}
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 focus:outline-none"
      >
        {/* Status Circle */}
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center mb-6",
          severity === 'success' && "bg-primary",
          severity === 'warning' && "bg-warning",
          severity === 'error' && "bg-destructive",
        )}>
          {severity === 'success' && <Check className="w-14 h-14 text-white" strokeWidth={3} />}
          {severity === 'warning' && <AlertTriangle className="w-14 h-14 text-white" strokeWidth={2} />}
          {severity === 'error' && <X className="w-14 h-14 text-white" strokeWidth={3} />}
        </div>

        {/* Status Text */}
        <h1 className="text-4xl font-semibold text-foreground text-center mb-2">
          {scenarioResult
            ? t(`diagnostic.scenario.${scenarioResult.scenario}.title`)
            : t('status.waiting')
          }
        </h1>

        {/* Network Info */}
        {diagnostics && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {/* Connection Type */}
            <span>
              {diagnostics.network.connection_type === 'Wifi' && 'Wi-Fi'}
              {diagnostics.network.connection_type === 'Ethernet' && 'Ethernet'}
              {diagnostics.network.connection_type === 'Usb' && 'USB'}
              {diagnostics.network.connection_type === 'Mobile' && 'Mobile'}
              {diagnostics.network.connection_type === 'Unknown' && t('network.unknown')}
            </span>
            {/* Network Name (SSID for Wi-Fi) */}
            {diagnostics.network.ssid && <span>{diagnostics.network.ssid}</span>}
          </div>
        )}
      </button>

      {/* DNS Protection Status */}
      <div className="px-4 pb-4">
        <button
          onClick={onNavigateToDnsProviders}
          className={cn(
            'w-full text-left rounded-lg border p-4 focus:outline-none',
            isDnsProtectionEnabled ? 'border-primary/50' : 'border-warning/50'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
              <span className={cn(
                'w-2 h-2 rounded-full',
                isDnsProtectionEnabled ? 'bg-primary' : 'bg-warning'
              )} />
            </span>
            <div className="flex-1">
              <p className={cn(
                'text-base font-medium leading-normal mb-1',
                isDnsProtectionEnabled ? 'text-primary' : 'text-warning'
              )}>
                {isDnsProtectionEnabled
                  ? t('status.dns_protection_with_provider', { provider: providerName })
                  : t('status.dns_protection_disabled')
                }
              </p>
              <p className="text-sm text-muted-foreground leading-normal">
                {isDnsProtectionEnabled
                  ? t('status.dns_protection_enabled')
                  : t('status.dns_protection_disabled_desc')
                }
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
