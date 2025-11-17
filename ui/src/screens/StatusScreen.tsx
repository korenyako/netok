import { useTranslation } from 'react-i18next';
import type { DiagnosticsSnapshot } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';

interface StatusScreenProps {
  onOpenDiagnostics: () => void;
  onNavigateToDnsProviders: () => void;
  diagnostics: DiagnosticsSnapshot | null;
}

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, diagnostics }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();

  // Determine if DNS protection is enabled
  const isDnsProtectionEnabled = dnsProvider && dnsProvider.type !== 'Auto';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Content - Clickable Area */}
      <button
        onClick={onOpenDiagnostics}
        className="flex-1 flex flex-col items-center justify-center px-4 py-16 focus:outline-none"
      >
        {/* Green Circle with Check */}
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Status Text */}
        <h1 className="text-4xl font-semibold text-foreground text-center mb-2">
          {t('status.internet_ok')}
        </h1>

        {/* Network Info */}
        {diagnostics && (
          <div className="flex items-center gap-2 text-sm text-foreground-secondary">
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
        <button
          onClick={onNavigateToDnsProviders}
          className="w-full bg-background-tertiary rounded-xl p-4 text-left focus:outline-none hover:opacity-80 transition-opacity"
        >
          {!isDnsLoading && (
            <>
              <h3 className="text-base font-medium text-foreground leading-5 mb-2">
                {isDnsProtectionEnabled ? t('status.dns_protection') : t('status.dns_protection_disabled')}
              </h3>
              <p className="text-sm text-foreground-secondary leading-[19.6px]">
                {isDnsProtectionEnabled
                  ? t('status.dns_protection_enabled')
                  : t('status.dns_protection_disabled_desc')
                }
              </p>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
