import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Lock, LockOpen, ChevronRight } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { CloseButton } from '../components/WindowControls';
import { useDnsStore } from '../stores/useDnsStore';
import { useVpnStore } from '../stores/vpnStore';
import { loadCustomDnsConfig } from '../utils/customDnsStorage';
import { lookupDnsProvider } from '../utils/dnsProviderLookup';

interface ProtectionHubScreenProps {
  onBack: () => void;
  onNavigateToDns: () => void;
  onNavigateToVpn: () => void;
}

const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'Quad9', 'OpenDns', 'Custom'];

const PROVIDER_DISPLAY: Record<string, string> = {
  Cloudflare: 'Cloudflare',
  AdGuard: 'AdGuard',
  Quad9: 'Quad9',
  Google: 'Google',
  Dns4Eu: 'DNS4EU',
  OpenDns: 'OpenDNS',
};

export function ProtectionHubScreen({ onBack, onNavigateToDns, onNavigateToVpn }: ProtectionHubScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
  const { configs, activeIndex, connectionState } = useVpnStore();
  const vpnConfig = activeIndex !== null ? configs[activeIndex] : null;

  const isDnsEnabled = dnsProvider !== null && KNOWN_PROVIDERS.includes(dnsProvider.type);

  const dnsSubtitle = (() => {
    if (isDnsLoading) return t('dns_providers.status_applying');
    if (!isDnsEnabled) return t('dns_providers.system_desc');
    if (dnsProvider) {
      if (dnsProvider.type === 'Custom') {
        const config = loadCustomDnsConfig();
        const ip = config?.primary || config?.primaryIpv6;
        if (ip) {
          const providerName = lookupDnsProvider(ip);
          return providerName ? `${ip} (${providerName})` : ip;
        }
        return t('dns_providers.custom');
      }
      return PROVIDER_DISPLAY[dnsProvider.type] || dnsProvider.type;
    }
    return t('dns_providers.status_disabled');
  })();

  const vpnSubtitle = (() => {
    if (!vpnConfig) return configs.length > 0 ? t('vpn.disabled') : t('vpn.not_configured');
    switch (connectionState.type) {
      case 'connecting': return t('vpn.connecting');
      case 'connected': {
        const location = [vpnConfig.country, vpnConfig.city].filter(Boolean).join(', ');
        return location || t('vpn.connected');
      }
      case 'disconnecting': return t('vpn.disconnecting');
      case 'error': return t('vpn.connection_error');
      case 'elevation_denied': return t('vpn.elevation_denied');
      default: return t('vpn.disabled');
    }
  })();

  const dnsIconColor = isDnsLoading
    ? 'text-warning animate-pulse'
    : isDnsEnabled ? 'text-primary' : 'text-muted-foreground';

  const vpnIconColor = (() => {
    switch (connectionState.type) {
      case 'connecting':
      case 'disconnecting':
        return 'text-warning animate-pulse';
      case 'connected':
        return 'text-primary';
      case 'error':
      case 'elevation_denied':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  })();

  const trailing = (
    <div className="flex items-center self-center">
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('protection.title')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        {/* DNS + VPN list */}
        <div className="space-y-2">
          <MenuCard
            variant="ghost"
            icon={<Globe className={`w-5 h-5 ${dnsIconColor}`} />}
            title={t('protection.dns_protection')}
            subtitle={dnsSubtitle}
            trailing={trailing}
            onClick={onNavigateToDns}
          />

          <MenuCard
            variant="ghost"
            icon={connectionState.type === 'connected'
              ? <Lock className={`w-5 h-5 ${vpnIconColor}`} />
              : <LockOpen className={`w-5 h-5 ${vpnIconColor}`} />
            }
            title={t('protection.vpn_tunnel')}
            subtitle={vpnSubtitle}
            trailing={trailing}
            onClick={onNavigateToVpn}
          />
        </div>
      </div>
    </div>
  );
}
