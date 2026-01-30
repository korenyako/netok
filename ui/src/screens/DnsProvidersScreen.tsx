import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Circle } from 'lucide-react';
import { setDns } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

// Static provider display names (only non-identical mappings)
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  'Dns4Eu': 'DNS4EU',
  'OpenDns': 'OpenDNS',
};

// Get display name for DNS provider
function getProviderDisplayName(type: string): string {
  return PROVIDER_DISPLAY_NAMES[type] || type;
}

// Map API type to local provider type
const API_TO_LOCAL_PROVIDER: Record<string, DnsProvider> = {
  'Auto': 'auto',
  'Cloudflare': 'cloudflare',
  'Google': 'google',
  'AdGuard': 'adguard',
  'Dns4Eu': 'dns4eu',
  'CleanBrowsing': 'cleanbrowsing',
  'Quad9': 'quad9',
  'OpenDns': 'opendns',
};

// Get variant translation key based on provider type and variant
function getVariantTranslationKey(type: string, variant: string): string {
  const variantKeys: Record<string, Record<string, string>> = {
    'Cloudflare': {
      'Standard': 'dns_detail.cloudflare.standard',
      'Malware': 'dns_detail.cloudflare.malware',
      'Family': 'dns_detail.cloudflare.family',
    },
    'AdGuard': {
      'Standard': 'dns_detail.adguard.standard',
      'NonFiltering': 'dns_detail.adguard.unfiltered',
      'Family': 'dns_detail.adguard.family',
    },
    'Dns4Eu': {
      'Protective': 'dns_detail.dns4eu.protective',
      'ProtectiveChild': 'dns_detail.dns4eu.protective_child',
      'ProtectiveAd': 'dns_detail.dns4eu.protective_ad',
      'ProtectiveChildAd': 'dns_detail.dns4eu.protective_child_ad',
      'Unfiltered': 'dns_detail.dns4eu.unfiltered',
    },
    'CleanBrowsing': {
      'Family': 'dns_detail.cleanbrowsing.family',
      'Adult': 'dns_detail.cleanbrowsing.adult',
      'Security': 'dns_detail.cleanbrowsing.security',
    },
    'Quad9': {
      'Recommended': 'dns_detail.quad9.recommended',
      'SecuredEcs': 'dns_detail.quad9.secured_ecs',
      'Unsecured': 'dns_detail.quad9.unsecured',
    },
    'OpenDns': {
      'FamilyShield': 'dns_detail.opendns.familyshield',
      'Home': 'dns_detail.opendns.home',
    },
  };
  return variantKeys[type]?.[variant] || variant;
}

export function DnsProvidersScreen({ onBack, onSelectCloudflare, onSelectAdGuard, onSelectDns4Eu, onSelectCleanBrowsing, onSelectQuad9, onSelectOpenDns, onSelectGoogle }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: apiProvider } = useDnsStore();
  const [isApplying, setIsApplying] = useState(false);

  // Check if protection is enabled (Auto and Custom = disabled, known providers = enabled)
  const isKnownProvider = apiProvider !== null && API_TO_LOCAL_PROVIDER[apiProvider.type] !== undefined && apiProvider.type !== 'Auto';
  const isProtectionEnabled = isKnownProvider;
  const activeProviderName = isProtectionEnabled ? getProviderDisplayName(apiProvider.type) : null;
  const activeVariantKey = isProtectionEnabled && 'variant' in apiProvider
    ? getVariantTranslationKey(apiProvider.type, apiProvider.variant as string)
    : null;

  // Map API provider to local type (Custom treated as auto since it's not configurable in UI)
  const currentProvider: DnsProvider | null = apiProvider
    ? apiProvider.type === 'Custom' ? 'auto' : (API_TO_LOCAL_PROVIDER[apiProvider.type] ?? null)
    : null;

  const handleProviderClick = async (providerId: DnsProvider) => {
    if (providerId === 'auto') {
      if (currentProvider === 'auto') return;
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
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {t('dns_providers.title')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Protection Status */}
        <div className={cn(
          'rounded-lg border p-4 mb-4',
          isProtectionEnabled ? 'border-primary/50' : 'border-warning/50'
        )}>
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
              <span className={cn(
                'w-2 h-2 rounded-full',
                isProtectionEnabled ? 'bg-primary' : 'bg-warning'
              )} />
            </span>
            <div className="flex-1">
              <p className={cn(
                'text-base font-medium leading-normal mb-1',
                isProtectionEnabled ? 'text-primary' : 'text-warning'
              )}>
                {isProtectionEnabled && activeProviderName
                  ? activeVariantKey
                    ? t('dns_providers.protection_enabled_with_mode', { provider: activeProviderName, mode: t(activeVariantKey) })
                    : t('dns_providers.protection_enabled', { provider: activeProviderName })
                  : t('dns_providers.protection_disabled')}
              </p>
              <p className="text-sm text-muted-foreground leading-normal">
                {isProtectionEnabled
                  ? t('dns_providers.description')
                  : t('dns_providers.protection_disabled_with_hint')}
              </p>
            </div>
          </div>
        </div>

        {/* DNS Provider Options */}
        <div className="space-y-2">
          {providers.map((provider) => {
            const isSelected = currentProvider === provider.id;

            return (
              <div key={provider.id} className={cn(isApplying && 'pointer-events-none opacity-50')}>
                <Card
                  className={cn(
                    'cursor-pointer hover:bg-accent transition-colors',
                    !isSelected && 'bg-transparent'
                  )}
                  onClick={() => handleProviderClick(provider.id)}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className={cn(
                      'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 mt-1',
                      isSelected ? 'border-primary' : 'border-muted-foreground'
                    )}>
                      {isSelected && (
                        <Circle className="w-2 h-2 fill-primary text-primary" />
                      )}
                    </span>
                    <div className="flex-1">
                      <div className="text-base font-medium leading-normal mb-1">
                        {provider.name}
                      </div>
                      <p className="text-sm text-muted-foreground leading-normal">
                        {provider.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
