import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, ChevronRight, Loader2 } from 'lucide-react';
import { setDns, type DnsProvider as ApiDnsProvider } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { CloseButton } from '../components/WindowControls';

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
  {
    id: 'cleanbrowsing',
    nameKey: 'dns_providers.cleanbrowsing',
    descKey: 'dns_providers.goal_family_desc',
    dnsPayload: { type: 'CleanBrowsing', variant: 'Family' },
    matchType: 'CleanBrowsing',
  },
];

const LAST_DNS_KEY = 'netok_last_dns';
const DEFAULT_DNS: ApiDnsProvider = { type: 'Cloudflare', variant: 'Standard' };

function saveLastDns(provider: ApiDnsProvider): void {
  try {
    localStorage.setItem(LAST_DNS_KEY, JSON.stringify(provider));
  } catch {
    // Ignore localStorage errors
  }
}

function loadLastDns(): ApiDnsProvider {
  try {
    const raw = localStorage.getItem(LAST_DNS_KEY);
    if (raw) return JSON.parse(raw) as ApiDnsProvider;
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_DNS;
}

function isProtected(provider: ApiDnsProvider | null): boolean {
  if (!provider) return false;
  return provider.type !== 'Auto';
}

const PROVIDER_DISPLAY: Record<string, string> = {
  Cloudflare: 'Cloudflare',
  AdGuard: 'AdGuard',
  Quad9: 'Quad9',
  CleanBrowsing: 'CleanBrowsing',
  Google: 'Google',
  Dns4Eu: 'DNS4EU',
  OpenDns: 'OpenDNS',
};

export function DnsProvidersScreen({ onBack, onCustomIp }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: apiProvider } = useDnsStore();
  const [isApplying, setIsApplying] = useState(false);

  const protectionEnabled = isProtected(apiProvider);
  const isCustomActive = protectionEnabled && apiProvider?.type === 'Custom';

  useEffect(() => {
    if (apiProvider && apiProvider.type !== 'Auto') {
      saveLastDns(apiProvider);
    }
  }, [apiProvider]);

  const statusSubtitle = (() => {
    if (!protectionEnabled) return t('dns_providers.status_disabled');
    if (apiProvider) {
      if (apiProvider.type === 'Custom') return t('dns_providers.custom_display');
      return PROVIDER_DISPLAY[apiProvider.type] || apiProvider.type;
    }
    return t('dns_providers.status_disabled');
  })();

  const applyProvider = async (provider: ApiDnsProvider) => {
    try {
      setIsApplying(true);
      await setDns(provider);
      dnsStore.setProvider(provider);
    } catch (err) {
      console.error('Failed to set DNS:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleToggle = async (checked: boolean) => {
    if (isApplying) return;
    if (checked) {
      const lastDns = loadLastDns();
      await applyProvider(lastDns);
    } else {
      await applyProvider({ type: 'Auto' });
    }
  };

  const handleCardSelect = async (card: ProviderCard) => {
    if (isApplying) return;
    if (protectionEnabled && apiProvider?.type === card.matchType) return;
    await applyProvider(card.dnsPayload);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('dns_providers.title')}
          </h1>
          {isApplying ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <Switch
              checked={protectionEnabled}
              onCheckedChange={handleToggle}
              disabled={isApplying}
            />
          )}
          <CloseButton />
        </div>
        <p className="text-xs text-foreground ml-12 mt-0.5">
          {statusSubtitle}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {PROVIDER_CARDS.map((card) => {
            const isActive = protectionEnabled && apiProvider?.type === card.matchType;

            return (
              <div key={card.id} className={cn(isApplying && !isActive && 'pointer-events-none opacity-50')}>
                <Card
                  className={cn(
                    'cursor-pointer transition-colors',
                    isActive
                      ? 'border-primary bg-primary/10 hover:bg-primary/15 dark:bg-primary/10 dark:hover:bg-primary/15'
                      : 'bg-transparent hover:bg-accent'
                  )}
                  onClick={() => handleCardSelect(card)}
                >
                  <CardContent className="flex items-start gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-medium leading-normal">
                        {t(card.nameKey)}
                      </span>
                      <p className="text-sm text-muted-foreground leading-normal mt-0.5">
                        {t(card.descKey)}
                      </p>
                    </div>
                    {isActive && (
                      <Check className="w-5 h-5 text-primary shrink-0 self-center" />
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}

          {/* Custom IP card */}
          <div className={cn(isApplying && !isCustomActive && 'pointer-events-none opacity-50')}>
            <Card
              className={cn(
                'cursor-pointer transition-colors',
                isCustomActive
                  ? 'border-primary bg-primary/10 hover:bg-primary/15 dark:bg-primary/10 dark:hover:bg-primary/15'
                  : 'bg-transparent hover:bg-accent'
              )}
              onClick={onCustomIp}
            >
              <CardContent className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium leading-normal">
                    {t('dns_providers.custom_ip')}
                  </span>
                  <p className="text-sm text-muted-foreground leading-normal mt-0.5">
                    {t('dns_providers.custom_ip_desc')}
                  </p>
                </div>
                {isCustomActive ? (
                  <Check className="w-5 h-5 text-primary shrink-0 self-center" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
