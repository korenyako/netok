import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from '../components/icons/UIIcons';
import { setDns, pingDnsServer, type DnsProvider as ApiDnsProvider } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { PingBadge } from '@/components/PingBadge';
import { cn } from '@/lib/utils';
import { CloseButton } from '../components/WindowControls';
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
  pingIp: string;
}

const PROVIDER_CARDS: ProviderCard[] = [
  {
    id: 'cloudflare',
    nameKey: 'dns_providers.cloudflare',
    descKey: 'dns_providers.goal_fast_desc',
    dnsPayload: { type: 'Cloudflare', variant: 'Standard' },
    matchType: 'Cloudflare',
    pingIp: '1.1.1.1',
  },
  {
    id: 'adguard',
    nameKey: 'dns_providers.adguard',
    descKey: 'dns_providers.goal_adblock_desc',
    dnsPayload: { type: 'AdGuard', variant: 'Standard' },
    matchType: 'AdGuard',
    pingIp: '94.140.14.14',
  },
  {
    id: 'quad9',
    nameKey: 'dns_providers.quad9',
    descKey: 'dns_providers.goal_secure_desc',
    dnsPayload: { type: 'Quad9', variant: 'Recommended' },
    matchType: 'Quad9',
    pingIp: '9.9.9.9',
  },
];

function isProtected(provider: ApiDnsProvider | null): boolean {
  if (!provider) return false;
  return provider.type !== 'Auto';
}

function RadioDot({ selected, applying }: { selected: boolean; applying: boolean }) {
  if (applying) return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
  return (
    <div className={cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
      selected ? "border-primary" : "border-muted-foreground/40"
    )}>
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </div>
  );
}

export function DnsProvidersScreen({ onBack, onCustomIp }: DnsProvidersScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: apiProvider } = useDnsStore();
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const isApplying = applyingId !== null;

  // Ping latency state: id → ms | null (unreachable) | undefined (loading)
  const [pings, setPings] = useState<Record<string, number | null | undefined>>({});

  const runPings = useCallback(() => {
    // Mark all as loading
    const loading: Record<string, undefined> = {};
    for (const card of PROVIDER_CARDS) loading[card.id] = undefined;

    // Also ping custom DNS if saved
    const config = loadCustomDnsConfig();
    const customIp = config?.primary || config?.primaryIpv6;
    if (customIp) loading['custom'] = undefined;

    setPings(loading);

    // Ping each provider in parallel
    for (const card of PROVIDER_CARDS) {
      pingDnsServer(card.pingIp)
        .then((ms) => setPings((prev) => ({ ...prev, [card.id]: ms })))
        .catch(() => setPings((prev) => ({ ...prev, [card.id]: null })));
    }

    if (customIp) {
      pingDnsServer(customIp)
        .then((ms) => setPings((prev) => ({ ...prev, custom: ms })))
        .catch(() => setPings((prev) => ({ ...prev, custom: null })));
    }
  }, []);

  useEffect(() => {
    runPings();
    const id = setInterval(runPings, 10_000);
    return () => clearInterval(id);
  }, [runPings]);

  const protectionEnabled = isProtected(apiProvider);

  // Custom is active only when the current provider doesn't match any predefined card
  const matchesPredefined = PROVIDER_CARDS.some(c => c.matchType === apiProvider?.type);
  const isCustomActive = protectionEnabled && !matchesPredefined;

  // Resolve custom DNS IP for ping display and subtitle
  const customConfig = loadCustomDnsConfig();
  const customIp = customConfig?.primary || customConfig?.primaryIpv6 || null;

  // Build subtitle for Custom card: show saved IPv4 or IPv6 address
  const customSubtitle = (): string | undefined => {
    if (!customIp) return undefined;
    const providerName = lookupDnsProvider(customIp);
    return providerName ? `${customIp} (${providerName})` : customIp;
  };

  const applyProvider = async (id: string, provider: ApiDnsProvider) => {
    try {
      setApplyingId(id);
      await setDns(provider);
      dnsStore.setProvider(provider);
      toast.success(t('dns_providers.applied'));
    } catch (err) {
      const msg = String(err);
      if (msg.includes('elevation_denied')) {
        toast.error(t('dns_providers.error_elevation_denied'));
      } else {
        console.error('[DNS] set_dns error:', msg);
        toast.error(t('dns_providers.error_set_failed'), {
          description: msg.length > 100 ? msg.slice(0, 100) + '…' : msg,
        });
      }
    } finally {
      setApplyingId(null);
    }
  };

  const handleCardSelect = async (card: ProviderCard) => {
    if (isApplying) return;
    const isActive = protectionEnabled && apiProvider?.type === card.matchType && !isCustomActive;
    if (isActive) return;
    await applyProvider(card.id, card.dnsPayload);
  };

  const handleCustomSelect = async () => {
    if (isApplying) return;
    if (isCustomActive) return;
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
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {/* System DNS card */}
          {(() => {
            const isSystemActive = !protectionEnabled;
            const isSystemApplying = applyingId === 'system';
            return (
              <div className={cn(isApplying && !isSystemActive && !isSystemApplying && 'pointer-events-none opacity-50')}>
                <MenuCard
                  variant="ghost"
                  icon={<RadioDot selected={isSystemActive} applying={isSystemApplying} />}
                  title={t('dns_providers.system')}
                  subtitle={t('dns_providers.system_desc')}
                  onClick={async () => {
                    if (isApplying || isSystemActive) return;
                    await applyProvider('system', { type: 'Auto' });
                  }}
                />
              </div>
            );
          })()}

          {PROVIDER_CARDS.map((card) => {
            const isActive = protectionEnabled && apiProvider?.type === card.matchType && !isCustomActive;
            const isCardApplying = applyingId === card.id;

            return (
              <div key={card.id} className={cn(isApplying && !isActive && !isCardApplying && 'pointer-events-none opacity-50')}>
                <MenuCard
                  variant="ghost"
                  icon={<RadioDot selected={isActive} applying={isCardApplying} />}
                  title={t(card.nameKey)}
                  badge={card.badgeKey ? t(card.badgeKey) : undefined}
                  subtitle={t(card.descKey)}
                  trailing={<PingBadge value={pings[card.id]} />}
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
                  variant="ghost"
                  className="group ghost-action-card"
                  icon={<RadioDot selected={isCustomActive} applying={isCustomApplying} />}
                  title={t('dns_providers.custom')}
                  subtitle={customSubtitle() || t('dns_providers.custom_ip_desc')}
                  trailing={
                    <div className="shrink-0 self-start">
                      {customIp && (
                        <span className="group-hover:hidden">
                          <PingBadge value={pings['custom']} />
                        </span>
                      )}
                      <button
                        className="ghost-action px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all shrink-0 hidden group-hover:inline-flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCustomIp();
                        }}
                      >
                        {t('dns_providers.custom_ip_edit')}
                      </button>
                    </div>
                  }
                  onClick={handleCustomSelect}
                />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
