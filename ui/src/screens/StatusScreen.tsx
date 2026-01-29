import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { DiagnosticsSnapshot } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { Card, CardContent } from '@/components/ui/card';

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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content - Clickable Area */}
      <button
        onClick={onOpenDiagnostics}
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 focus:outline-none"
      >
        {/* Green Circle with Check */}
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6">
          <Check className="w-14 h-14 text-white" strokeWidth={3} />
        </div>

        {/* Status Text */}
        <h1 className="text-4xl font-semibold text-foreground text-center mb-2">
          {t('status.internet_ok')}
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

      {/* DNS Protection Widget - Clickable */}
      <div className="px-4 pb-4">
        <Card className="cursor-pointer hover:bg-accent transition-colors" onClick={onNavigateToDnsProviders}>
          <CardContent className="p-4">
            <h3 className="text-base font-medium leading-normal mb-1">
              {isDnsProtectionEnabled
                ? t('status.dns_protection_with_provider', { provider: providerName })
                : t('status.dns_protection_disabled')
              }
            </h3>
            <p className="text-sm text-muted-foreground leading-normal">
              {isDnsProtectionEnabled
                ? t('status.dns_protection_enabled')
                : t('status.dns_protection_disabled_desc')
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
