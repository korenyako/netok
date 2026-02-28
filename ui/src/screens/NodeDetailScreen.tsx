import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, ArrowUpRight } from '../components/icons/UIIcons';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '@/components/ui/button';
import { DiagnosticMessage } from '../components/DiagnosticMessage';
import { PingBadge } from '../components/PingBadge';
import { useLivePing } from '../hooks/useLivePing';

import type { SingleNodeResult, DiagnosticScenario } from '../api/tauri';
import { notifications } from '../utils/notifications';
import { CloseButton } from '../components/WindowControls';
import { useVpnStore } from '../stores/vpnStore';
import { useSpeedTestStore } from '../stores/speedTestStore';

interface NodeDetailScreenProps {
  nodeId: string;
  result: SingleNodeResult;
  onBack: () => void;
  onNavigateToDnsProviders?: () => void;
  onNavigateToVpn?: () => void;
}

/** Remove AS number prefix from ISP string */
function cleanIspName(isp: string): string {
  return isp.replace(/^AS\d+\s+/, '');
}

function getNodeTitleKey(nodeId: string): string {
  switch (nodeId) {
    case 'computer': return 'diagnostics.computer';
    case 'network': return 'diagnostics.wifi';
    case 'dns': return 'diagnostics.router';
    case 'internet': return 'diagnostics.internet';
    default: return '';
  }
}

type SignalLevel = 'excellent' | 'good' | 'fair' | 'weak' | 'very_weak';

function getSignalLevel(rssi: number): SignalLevel {
  if (rssi >= -50) return 'excellent';
  if (rssi >= -60) return 'good';
  if (rssi >= -70) return 'fair';
  if (rssi >= -80) return 'weak';
  return 'very_weak';
}

const SIGNAL_BADGE_CLASS: Record<SignalLevel, string> = {
  excellent: 'text-success bg-success/10', good: 'text-success bg-success/10',
  fair: 'text-warning bg-warning/10',
  weak: 'text-destructive bg-destructive/10', very_weak: 'text-destructive bg-destructive/10',
};

type EncryptionLevel = 'safe' | 'warning' | 'danger';

function getEncryptionLevel(encryption: string): EncryptionLevel {
  switch (encryption) {
    case 'WPA2':
    case 'WPA3':
      return 'safe';
    case 'WEP':
    case 'WPA':
      return 'warning';
    case 'Open':
      return 'danger';
    default:
      return 'safe'; // Unknown encryption types — assume safe
  }
}

function getEncryptionI18nKey(encryption: string): string {
  switch (encryption) {
    case 'WPA2':
    case 'WPA3':
      return 'nodes.network.security_protected';
    case 'WEP':
      return 'nodes.network.security_weak_wep';
    case 'WPA':
      return 'nodes.network.security_weak_wpa';
    case 'Open':
      return 'nodes.network.security_open';
    default:
      return 'nodes.network.security_protected';
  }
}

const ENCRYPTION_BADGE_CLASS: Record<EncryptionLevel, string> = {
  safe: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  danger: 'text-destructive bg-destructive/10',
};

type LatencyLevel = 'excellent' | 'good' | 'fair' | 'slow';

function getLatencyLevel(ms: number): LatencyLevel {
  if (ms < 20) return 'excellent';
  if (ms <= 50) return 'good';
  if (ms <= 100) return 'fair';
  return 'slow';
}

const LATENCY_TEXT_COLOR: Record<LatencyLevel, string> = {
  excellent: 'text-success', good: 'text-success',
  fair: 'text-warning', slow: 'text-destructive',
};

interface InfoRow {
  label: string;
  value: string;
  copyable?: boolean;
  valueClass?: string;
  subtitle?: string;
  subtitleClass?: string;
}

export function NodeDetailScreen({ nodeId, result, onBack, onNavigateToDnsProviders, onNavigateToVpn }: NodeDetailScreenProps) {
  const { t } = useTranslation();
  const vpnConfigured = useVpnStore(s => s.configs.length > 0);
  const vpnActive = useVpnStore(s => s.connectionState.type === 'connected');

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    notifications.success(t('dns_detail.ip_copied'));
  };

  const routerIp = nodeId === 'dns' ? result.router?.gateway_ip : null;

  // Live ping for Router (gateway IP) and Internet (1.1.1.1) detail screens
  // Skip router ping when VPN is active (DNS-based ping goes through tunnel)
  const showPing = (nodeId === 'internet' || (nodeId === 'dns' && !vpnActive)) && result.node.status !== 'down';
  const pingTargetIp = nodeId === 'dns'
    ? (result.router?.gateway_ip ?? null)
    : nodeId === 'internet'
      ? '1.1.1.1'
      : null;
  const livePing = useLivePing(pingTargetIp, showPing && !!pingTargetIp);

  const handleOpenRouter = async () => {
    if (routerIp) {
      await openUrl(`http://${routerIp}`);
    }
  };

  const rows: InfoRow[] = [];

  if (nodeId === 'computer' && result.computer) {
    if (result.computer.adapter) {
      rows.push({ label: t('node_detail.adapter'), value: result.computer.adapter });
    }
    if (result.computer.local_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.computer.local_ip, copyable: true });
    }
    // Bandwidth (link speed) with bottleneck warning
    if (result.network?.link_speed_mbps != null) {
      const linkSpeed = result.network.link_speed_mbps;
      const downloadMbps = useSpeedTestStore.getState().metrics.download;
      const isBottleneck =
        downloadMbps != null &&
        linkSpeed <= 150 &&
        downloadMbps >= linkSpeed * 0.7;

      rows.push({
        label: t('node_detail.bandwidth'),
        value: `${linkSpeed} ${t('node_detail.unit_mbps')}`,
        ...(isBottleneck && {
          subtitle: t('node_detail.bandwidth_bottleneck'),
          subtitleClass: 'text-warning bg-warning/10',
        }),
      });
    }
  }

  if (nodeId === 'network' && result.network) {
    const net = result.network;

    // Network name
    if (net.ssid) {
      rows.push({ label: t('node_detail.network_name'), value: net.ssid });
    }

    // Security
    if (net.encryption) {
      rows.push({
        label: t('node_detail.security'),
        value: net.encryption,
        subtitle: t(getEncryptionI18nKey(net.encryption)),
        subtitleClass: ENCRYPTION_BADGE_CLASS[getEncryptionLevel(net.encryption)],
      });
    }

    // Signal
    if (net.rssi != null) {
      const level = getSignalLevel(net.rssi);
      rows.push({
        label: t('node_detail.signal'),
        value: `${net.rssi} dBm`,
        subtitle: t(`nodes.network.signal_label_${level}`),
        subtitleClass: SIGNAL_BADGE_CLASS[level],
      });
    }

    // Frequency + Channel
    if (net.frequency) {
      const freqValue = net.channel
        ? `${net.frequency} (${t('nodes.network.channel', { channel: net.channel })})`
        : net.frequency;
      rows.push({
        label: t('node_detail.frequency'),
        value: freqValue,
      });
    }

    // Bandwidth (link speed) with bottleneck warning
    if (net.link_speed_mbps != null) {
      const downloadMbps = useSpeedTestStore.getState().metrics.download;
      const isBottleneck =
        downloadMbps != null &&
        net.link_speed_mbps <= 150 &&
        downloadMbps >= net.link_speed_mbps * 0.7;

      rows.push({
        label: t('node_detail.bandwidth'),
        value: `${net.link_speed_mbps} ${t('node_detail.unit_mbps')}`,
        ...(isBottleneck && {
          subtitle: t('node_detail.bandwidth_bottleneck'),
          subtitleClass: 'text-warning bg-warning/10',
        }),
      });
    }
  }

  if (nodeId === 'dns' && result.router) {
    if (result.router.vendor) {
      rows.push({ label: t('node_detail.manufacturer'), value: result.router.vendor });
    }
    if (result.router.gateway_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.router.gateway_ip, copyable: true });
    }
  }

  // Internet node data
  const inet = nodeId === 'internet' ? result.internet : null;
  const inetBothOk = inet ? (inet.dns_ok === true && inet.http_ok === true) : true;

  // Derive internet failure scenario
  let inetScenario: DiagnosticScenario | null = null;
  let inetSeverity: 'error' | 'warning' = 'error';
  let inetActionHandler: (() => void) | undefined;
  let inetActionLabel: string | undefined;

  if (inet && !inetBothOk) {
    if (inet.dns_ok && !inet.http_ok) {
      inetScenario = 'http_blocked';
      inetSeverity = 'warning';
      if (vpnConfigured) {
        inetActionHandler = () => onNavigateToVpn?.();
        inetActionLabel = t('diagnostic.scenario.http_blocked.button');
      }
    } else if (!inet.dns_ok && inet.http_ok) {
      inetScenario = 'dns_failure';
      inetSeverity = 'warning';
      inetActionHandler = () => onNavigateToDnsProviders?.();
      inetActionLabel = t('diagnostic.scenario.dns_failure.button');
    } else {
      // Both failed
      inetScenario = 'no_internet';
      inetSeverity = 'error';
    }
  }

  // ISP, location, IP rows for internet node (always shown when inet exists)
  if (inet) {
    const dash = '—';
    rows.push({ label: t('node_detail.isp'), value: inet.isp ? cleanIspName(inet.isp) : dash });

    const location = inet.city && inet.country
      ? `${inet.city}, ${inet.country}`
      : inet.country ?? inet.city ?? dash;
    rows.push({ label: t('node_detail.location'), value: location });

    if (inet.public_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: inet.public_ip, copyable: true });
    } else {
      rows.push({ label: t('node_detail.ip_address'), value: dash });
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t(getNodeTitleKey(nodeId))}
          </h1>
          <CloseButton />
        </div>
      </div>

      {/* Content — ps-12 inside px-4 aligns text under the title (16+48 = 64px) */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        {/* Internet failure scenario card */}
        {inetScenario && (
          <div className="pb-3">
            <DiagnosticMessage
              scenario={inetScenario}
              severity={inetSeverity}
              onAction={inetActionHandler}
              actionLabel={inetActionLabel}
            />
          </div>
        )}

        <div className="ps-12 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-sm text-muted-foreground">{row.label}</p>
              {row.copyable ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground" dir="ltr">{row.value}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleCopyIp(row.value)}
                  >
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm min-w-0 ${row.valueClass ?? 'text-foreground'}`} dir="ltr">{row.value}</span>
                    {row.subtitle && (
                      <span className={`inline-flex items-center text-xs font-normal px-1.5 py-0.5 rounded ${row.subtitleClass ?? 'text-muted-foreground bg-muted'}`}>{row.subtitle}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Live ping for Router and Internet nodes */}
          {showPing && (
            <div>
              <p className="text-sm text-muted-foreground">{t('speed_test.ping')}</p>
              <div className="mt-0.5">
                <PingBadge value={livePing} />
              </div>
            </div>
          )}

          {/* Response time indicator for Internet node */}
          {inet?.latency_ms != null && (() => {
            const ms = inet.latency_ms!;
            const level = getLatencyLevel(ms);
            const textColor = LATENCY_TEXT_COLOR[level];

            return (
              <div>
                <p className="text-sm text-muted-foreground">{t('node_detail.response_time')}</p>
                <p className={`text-base font-medium ${textColor}`}>
                  {t(`node_detail.response_time_${level}`)}
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  {ms} ms
                </p>
              </div>
            );
          })()}

        </div>

        <div className="flex-1" />

        {routerIp && (
          <Button
            variant="outline"
            className="w-full text-sm font-medium"
            onClick={handleOpenRouter}
          >
            {t('node_detail.open_router')}
            <ArrowUpRight className="w-4 h-4 ms-2" />
          </Button>
        )}
      </div>

    </div>
  );
}
