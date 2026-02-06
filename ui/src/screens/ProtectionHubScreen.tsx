import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Lock, ChevronRight } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { CloseButton } from '../components/WindowControls';
import { useDnsStore } from '../stores/useDnsStore';
import { useVpnStore } from '../stores/vpnStore';

interface ProtectionHubScreenProps {
  onBack: () => void;
  onNavigateToDns: () => void;
  onNavigateToVpn: () => void;
}

const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'CleanBrowsing', 'Quad9', 'OpenDns'];

const PROVIDER_DISPLAY: Record<string, string> = {
  Cloudflare: 'Cloudflare',
  AdGuard: 'AdGuard',
  Quad9: 'Quad9',
  CleanBrowsing: 'CleanBrowsing',
  Google: 'Google',
  Dns4Eu: 'DNS4EU',
  OpenDns: 'OpenDNS',
};

export function ProtectionHubScreen({ onBack, onNavigateToDns, onNavigateToVpn }: ProtectionHubScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider } = useDnsStore();
  const { config: vpnConfig, isEnabled: vpnEnabled, isConnecting: vpnConnecting } = useVpnStore();

  const isDnsEnabled = dnsProvider !== null && KNOWN_PROVIDERS.includes(dnsProvider.type);

  const dnsSubtitle = (() => {
    if (!isDnsEnabled) return t('dns_providers.status_disabled');
    if (dnsProvider) {
      if (dnsProvider.type === 'Custom') return t('dns_providers.custom_display');
      return PROVIDER_DISPLAY[dnsProvider.type] || dnsProvider.type;
    }
    return t('dns_providers.status_disabled');
  })();

  const vpnSubtitle = (() => {
    if (!vpnConfig) return t('vpn.not_configured');
    if (vpnConnecting) return t('vpn.connecting');
    if (!vpnEnabled) return t('vpn.disabled');
    return `${vpnConfig.country}, ${vpnConfig.city}`;
  })();

  const dnsIconColor = isDnsEnabled ? 'text-primary' : 'text-muted-foreground';

  const vpnIconColor = vpnConnecting
    ? 'text-warning animate-pulse'
    : vpnEnabled
      ? 'text-primary'
      : 'text-muted-foreground';

  const trailing = (
    <div className="flex items-center self-center">
      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
    </div>
  );

  return (
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('protection.title')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">
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
            icon={<Lock className={`w-5 h-5 ${vpnIconColor}`} />}
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
