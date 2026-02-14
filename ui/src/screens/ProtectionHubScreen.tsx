import { useTranslation } from 'react-i18next';
import { ArrowLeft, DnsShield, DnsShieldCheck, Lock, LockOpen, ShieldCheck, ChevronRight } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useDnsStore } from '../stores/useDnsStore';
import { useVpnStore } from '../stores/vpnStore';
import { useWifiSecurityStore } from '../stores/wifiSecurityStore';
import { loadCustomDnsConfig } from '../utils/customDnsStorage';
import { lookupDnsProvider } from '../utils/dnsProviderLookup';
import { cn } from '@/lib/utils';

interface ProtectionHubScreenProps {
  onBack: () => void;
  onNavigateToDns: () => void;
  onNavigateToVpn: () => void;
  onNavigateToWifiSecurity: () => void;
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

export function ProtectionHubScreen({ onBack, onNavigateToDns, onNavigateToVpn, onNavigateToWifiSecurity }: ProtectionHubScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
  const { configs, activeIndex, connectionState } = useVpnStore();
  const { report: securityReport, isRunning: isSecurityRunning, runScan } = useWifiSecurityStore();
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

  // WiFi Security card click handler
  const handleSecurityClick = () => {
    if (!securityReport && !isSecurityRunning) {
      // No previous result — start scan, then navigate
      runScan();
    }
    onNavigateToWifiSecurity();
  };

  // WiFi Security card rendering
  const renderSecurityCard = () => {
    // State A: Never scanned
    if (!securityReport && !isSecurityRunning) {
      return (
        <Card
          className="bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          onClick={handleSecurityClick}
        >
          <CardContent className="flex py-4 items-center gap-3 px-4">
            <ShieldCheck className="w-6 h-6 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium leading-normal">Wi-Fi</p>
              <p className="text-sm text-muted-foreground leading-normal mt-0.5">
                {t('protection.check_security')}
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
          </CardContent>
        </Card>
      );
    }

    // State B: Safe — no threats
    if (securityReport && securityReport.overall_status === 'safe') {
      return (
        <Card
          className="bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          onClick={onNavigateToWifiSecurity}
        >
          <CardContent className="flex py-4 items-center gap-3 px-4">
            <NodeOkIcon className="w-6 h-6 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium leading-normal">
                {t('protection.no_threats')}
              </p>
              {securityReport.network_ssid && (
                <p className="text-sm text-muted-foreground leading-normal mt-0.5">
                  {securityReport.network_ssid}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
          </CardContent>
        </Card>
      );
    }

    // State C: Threats detected (warning or danger)
    if (securityReport) {
      const isDanger = securityReport.overall_status === 'danger';
      return (
        <Card
          className="bg-accent hover:bg-accent-hover transition-colors cursor-pointer"
          onClick={onNavigateToWifiSecurity}
        >
          <CardContent className="flex py-4 items-center gap-3 px-4">
            {isDanger
              ? <NodeErrorIcon className="w-6 h-6 text-destructive shrink-0" />
              : <NodeWarningIcon className="w-6 h-6 text-warning shrink-0" />
            }
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-base font-medium leading-normal",
                isDanger ? "text-destructive" : "text-warning"
              )}>
                {t('protection.threats_detected')}
              </p>
              {securityReport.network_ssid && (
                <p className="text-sm text-muted-foreground leading-normal mt-0.5">
                  {securityReport.network_ssid}
                </p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
          </CardContent>
        </Card>
      );
    }

    // Scanning in progress (no report yet)
    return (
      <Card
        className="bg-accent transition-colors cursor-pointer"
        onClick={onNavigateToWifiSecurity}
      >
        <CardContent className="flex py-4 items-center gap-3 px-4">
          <ShieldCheck className="w-6 h-6 text-muted-foreground animate-pulse shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium leading-normal">Wi-Fi</p>
            <p className="text-sm text-muted-foreground leading-normal mt-0.5">
              {t('wifi_security.checking')}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rtl-flip" />
        </CardContent>
      </Card>
    );
  };

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
        {/* WiFi Security status card — prominent, on top */}
        <div className="mb-4">
          {renderSecurityCard()}
        </div>

        {/* DNS + VPN list */}
        <div className="space-y-2">
          <MenuCard
            variant="ghost"
            icon={isDnsEnabled
              ? <DnsShieldCheck className={`w-5 h-5 ${dnsIconColor}`} />
              : <DnsShield className={`w-5 h-5 ${dnsIconColor}`} />
            }
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
