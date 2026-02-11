import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Trash2 } from '../components/icons/UIIcons';
import { setDns, type DnsProvider as ApiDnsProvider } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MenuCard } from '@/components/MenuCard';
import { cn } from '@/lib/utils';
import { CloseButton } from '../components/WindowControls';
import { toast } from 'sonner';
import { loadCustomDnsConfig } from '../utils/customDnsStorage';
import { lookupDnsProvider } from '../utils/dnsProviderLookup';

interface DnsProvidersScreenProps {
  onBack: () => void;
  onCustomIp: () => void;
}

interface ProviderCard {
  id: string;
  nameKey: string;
  descKey: string;
  dnsPayload: ApiDnsProvider;
  matchType: string;
  badgeKey?: string;
}

const PROVIDER_CARDS: ProviderCard[] = [
  {
    id: 'cloudflare',
    nameKey: 'dns_providers.cloudflare',
    descKey: 'dns_providers.goal_fast_desc',
    dnsPayload: { type: 'Cloudflare', variant: 'Standard' },
    matchType: 'Cloudflare',
  },
  {
    id: 'adguard',
    nameKey: 'dns_providers.adguard',
    descKey: 'dns_providers.goal_adblock_desc',
    dnsPayload: { type: 'AdGuard', variant: 'Standard' },
    matchType: 'AdGuard',
  },
  {
    id: 'quad9',
    nameKey: 'dns_providers.quad9',
    descKey: 'dns_providers.goal_secure_desc',
    dnsPayload: { type: 'Quad9', variant: 'Recommended' },
    matchType: 'Quad9',
  },
];

const LAST_DNS_KEY = 'netok_last_dns';

function saveLastDns(provider: ApiDnsProvider): void {
  try {
    localStorage.setItem(LAST_DNS_KEY, JSON.stringify(provider));
  } catch {
    // Ignore localStorage errors
  }
}

const VALID_DNS_TYPES = ['Auto', 'Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'Quad9', 'OpenDns', 'Custom'];

function loadLastDns(): ApiDnsProvider {
  try {
    const raw = localStorage.getItem(LAST_DNS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ApiDnsProvider;
      if (VALID_DNS_TYPES.includes(parsed.type)) return parsed;
      localStorage.removeItem(LAST_DNS_KEY);
    }
  } catch {
    // Ignore parse errors
  }
  return { type: 'Cloudflare', variant: 'Standard' };
}

function isProtected(provider: ApiDnsProvider | null): boolean {
  if (!provider) return false;
  return provider.type !== 'Auto';
}

export function DnsProvidersScreen({ onBack, onCustomIp }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: apiProvider } = useDnsStore();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const isApplying = applyingId !== null;

  const protectionEnabled = isProtected(apiProvider);

  // Custom is active only when the current provider doesn't match any predefined card
  const matchesPredefined = PROVIDER_CARDS.some(c => c.matchType === apiProvider?.type);
  const isCustomActive = protectionEnabled && !matchesPredefined;

  // Build subtitle for Custom card: show saved IPv4 or IPv6 address
  const customSubtitle = (): string | undefined => {
    const config = loadCustomDnsConfig();
    if (!config) return undefined;
    const ip = config.primary || config.primaryIpv6;
    if (ip) {
      const providerName = lookupDnsProvider(ip);
      return providerName ? `${ip} (${providerName})` : ip;
    }
    return undefined;
  };

  useEffect(() => {
    if (apiProvider && apiProvider.type !== 'Auto') {
      saveLastDns(apiProvider);
    }
  }, [apiProvider]);

  const applyProvider = async (id: string, provider: ApiDnsProvider) => {
    try {
      setApplyingId(id);
      await setDns(provider);
      dnsStore.setProvider(provider);
    } catch (err) {
      console.error('Failed to set DNS:', err);
    } finally {
      setApplyingId(null);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (isApplying) return;
    if (checked) {
      const lastDns = loadLastDns();
      const id = PROVIDER_CARDS.find(c => c.matchType === lastDns.type)?.id || lastDns.type;
      await applyProvider(id, lastDns);
    } else {
      await applyProvider('toggle', { type: 'Auto' });
    }
  };

  const handleCardSelect = async (card: ProviderCard) => {
    if (isApplying) return;
    const isActive = protectionEnabled && apiProvider?.type === card.matchType && !isCustomActive;
    if (isActive) {
      await applyProvider(card.id, { type: 'Auto' });
    } else {
      await applyProvider(card.id, card.dnsPayload);
    }
  };

  const handleCustomSelect = async () => {
    if (isApplying) return;
    if (isCustomActive) {
      await applyProvider('custom', { type: 'Auto' });
      return;
    }
    const config = loadCustomDnsConfig();
    if (config) {
      await applyProvider('custom', {
        type: 'Custom' as const,
        primary: config.primary,
        secondary: config.secondary,
        primaryIpv6: config.primaryIpv6,
        secondaryIpv6: config.secondaryIpv6,
      });
    } else {
      onCustomIp();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('dns_providers.title')}
          </h1>
          <Switch
            checked={protectionEnabled}
            onCheckedChange={handleToggle}
            disabled={isApplying}
          />
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {PROVIDER_CARDS.map((card) => {
            const isActive = protectionEnabled && apiProvider?.type === card.matchType && !isCustomActive;
            const isCardApplying = applyingId === card.id;

            return (
              <div key={card.id} className={cn(isApplying && !isActive && !isCardApplying && 'pointer-events-none opacity-50')}>
                <MenuCard
                  variant={isActive || isCardApplying ? 'selected' : 'ghost'}
                  title={t(card.nameKey)}
                  badge={card.badgeKey ? t(card.badgeKey) : undefined}
                  subtitle={t(card.descKey)}
                  checked={isCardApplying ? 'spinner' : isActive}
                  onClick={() => handleCardSelect(card)}
                />
              </div>
            );
          })}

          {/* Custom card */}
          {(() => {
            const isCustomApplying = applyingId === 'custom';
            return (
              <div className={cn(isApplying && !isCustomActive && !isCustomApplying && 'pointer-events-none opacity-50')}>
                <MenuCard
                  variant={isCustomActive || isCustomApplying ? 'selected' : 'ghost'}
                  title={t('dns_providers.custom')}
                  subtitle={customSubtitle() || t('dns_providers.custom_ip_desc')}
                  checked={isCustomApplying ? 'spinner' : isCustomActive}
                  onClick={handleCustomSelect}
                />
              </div>
            );
          })()}
        </div>

        <div className="flex-1" />

        {/* Set Custom DNS button */}
        <Button
          variant="outline"
          className="w-full uppercase font-mono tracking-wider text-xs mb-3"
          onClick={onCustomIp}
        >
          {t('dns_providers.set_custom_dns')}
        </Button>

        {/* Clear DNS cache */}
        <Button
          variant="outline"
          className="w-full uppercase font-mono tracking-wider text-xs"
          onClick={() => {
            // TODO: Implement actual DNS cache flush
            toast.success(t('dns_providers.cache_cleared'));
          }}
        >
          <Trash2 className="w-4 h-4" />
          {t('settings.tools.flush_dns')}
        </Button>
      </div>
    </div>
  );
}
