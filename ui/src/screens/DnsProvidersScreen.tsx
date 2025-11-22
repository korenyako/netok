import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';

interface DnsProvidersScreenProps {
  onBack: () => void;
  onSelectCloudflare: () => void;
  onSelectAdGuard: () => void;
  onSelectDns4Eu: () => void;
  onSelectCleanBrowsing: () => void;
  onSelectQuad9: () => void;
  onSelectOpenDns: () => void;
  onSelectGoogle: () => void;
}

type DnsProvider = 'auto' | 'cloudflare' | 'google' | 'adguard' | 'dns4eu' | 'cleanbrowsing' | 'quad9' | 'opendns';

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

export function DnsProvidersScreen({ onBack, onSelectCloudflare, onSelectAdGuard, onSelectDns4Eu, onSelectCleanBrowsing, onSelectQuad9, onSelectOpenDns, onSelectGoogle }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: apiProvider } = useDnsStore();
  const [isApplying, setIsApplying] = useState(false);

  // Check if protection is enabled
  const isProtectionEnabled = apiProvider !== null && apiProvider.type !== 'Auto';
  const activeProviderName = isProtectionEnabled ? getProviderDisplayName(apiProvider.type) : null;

  // Map API provider to local type
  const currentProvider: DnsProvider | null = apiProvider
    ? apiProvider.type === 'Auto' ? 'auto'
    : apiProvider.type === 'Cloudflare' ? 'cloudflare'
    : apiProvider.type === 'Google' ? 'google'
    : apiProvider.type === 'AdGuard' ? 'adguard'
    : apiProvider.type === 'Dns4Eu' ? 'dns4eu'
    : apiProvider.type === 'CleanBrowsing' ? 'cleanbrowsing'
    : apiProvider.type === 'Quad9' ? 'quad9'
    : apiProvider.type === 'OpenDns' ? 'opendns'
    : 'auto'
    : null;

  const handleProviderClick = async (providerId: DnsProvider) => {
    if (providerId === 'auto') {
      try {
        setIsApplying(true);
        await setDns({ type: 'Auto' });
        dnsStore.setProvider({ type: 'Auto' });
      } catch (err) {
        console.error('Failed to set DNS to Auto:', err);
      } finally {
        setIsApplying(false);
      }
    } else if (providerId === 'cloudflare') {
      onSelectCloudflare();
    } else if (providerId === 'google') {
      onSelectGoogle();
    } else if (providerId === 'adguard') {
      onSelectAdGuard();
    } else if (providerId === 'dns4eu') {
      onSelectDns4Eu();
    } else if (providerId === 'cleanbrowsing') {
      onSelectCleanBrowsing();
    } else if (providerId === 'quad9') {
      onSelectQuad9();
    } else if (providerId === 'opendns') {
      onSelectOpenDns();
    }
  };

  const providers: Array<{
    id: DnsProvider;
    name: string;
    description: string;
  }> = [
    { id: 'auto', name: t('dns_providers.auto'), description: t('dns_providers.auto_desc') },
    { id: 'adguard', name: t('dns_providers.adguard'), description: t('dns_providers.adguard_desc') },
    { id: 'cleanbrowsing', name: t('dns_providers.cleanbrowsing'), description: t('dns_providers.cleanbrowsing_desc') },
    { id: 'cloudflare', name: t('dns_providers.cloudflare'), description: t('dns_providers.cloudflare_desc') },
    { id: 'dns4eu', name: t('dns_providers.dns4eu'), description: t('dns_providers.dns4eu_desc') },
    { id: 'google', name: t('dns_providers.google'), description: t('dns_providers.google_desc') },
    { id: 'opendns', name: t('dns_providers.opendns'), description: t('dns_providers.opendns_desc') },
    { id: 'quad9', name: t('dns_providers.quad9'), description: t('dns_providers.quad9_desc') },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button */}
      <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-foreground-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground leading-[28.8px] mb-[16px]">
          {t('dns_providers.title')}
        </h1>

        {/* Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] max-w-[269px]">
          {t('dns_providers.description')}
        </p>

        {/* Active Protection Status */}
        <div className="flex items-center gap-2 mt-2 mb-4">
          <div className={`w-2 h-2 rounded-full ${isProtectionEnabled ? 'bg-primary' : 'bg-amber-500'}`} />
          <p className={`text-sm ${isProtectionEnabled ? 'text-primary' : 'text-amber-500'}`}>
            {isProtectionEnabled && activeProviderName
              ? t('status.dns_protection_with_provider', { provider: activeProviderName })
              : t('dns_providers.auto_desc')}
          </p>
        </div>

        {/* DNS Provider Options */}
        <div className="space-y-2">
          {providers.map((provider) => {
            const isSelected = currentProvider === provider.id;

            return (
              <button
                key={provider.id}
                onClick={() => handleProviderClick(provider.id)}
                disabled={isApplying}
                className={`w-full rounded-[12px] border px-4 py-3 text-left focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSelected ? 'border-primary' : 'border-transparent'
                } hover:bg-neutral-100 dark:hover:bg-background-hover`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-base font-medium text-foreground leading-5">
                      {provider.name}
                    </div>
                    <p className="text-sm text-foreground-secondary leading-[19.6px]">
                      {provider.description}
                    </p>
                  </div>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-primary mt-[2px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 16 16"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
