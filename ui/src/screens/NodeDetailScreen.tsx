import { useTranslation } from 'react-i18next';
import { ArrowLeft, Copy, ExternalLink } from '../components/icons/UIIcons';
import { NetokLogoIcon, ShieldIcon, ToolsIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '@/components/ui/button';

import type { SingleNodeResult } from '../api/tauri';
import { notifications } from '../utils/notifications';
import { CloseButton } from '../components/WindowControls';

interface NodeDetailScreenProps {
  nodeId: string;
  result: SingleNodeResult;
  onBack: () => void;
  onNavigateToHome?: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToTools?: () => void;
  onNavigateToSettings?: () => void;
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

function getSignalQualityKey(rssi: number): string {
  if (rssi >= -50) return 'nodes.network.signal_excellent';
  if (rssi >= -60) return 'nodes.network.signal_good';
  if (rssi >= -70) return 'nodes.network.signal_fair';
  return 'nodes.network.signal_weak';
}

interface InfoRow {
  label: string;
  value: string;
  copyable?: boolean;
}

export function NodeDetailScreen({ nodeId, result, onBack, onNavigateToHome, onNavigateToSecurity, onNavigateToTools, onNavigateToSettings }: NodeDetailScreenProps) {
  const { t } = useTranslation();

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    notifications.success(t('dns_detail.ip_copied'));
  };

  const routerIp = nodeId === 'dns' ? result.router?.gateway_ip : null;

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
  }

  if (nodeId === 'network' && result.network) {
    if (result.network.ssid) {
      rows.push({ label: t('node_detail.network_name'), value: result.network.ssid });
    }
    if (result.network.rssi !== null) {
      const qualityText = t(getSignalQualityKey(result.network.rssi));
      const signalValue = `${qualityText} (${result.network.rssi} dBm)`;
      rows.push({ label: t('node_detail.signal'), value: signalValue });
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

  if (nodeId === 'internet' && result.internet) {
    if (result.internet.isp) {
      rows.push({ label: t('node_detail.isp'), value: cleanIspName(result.internet.isp) });
    }
    if (result.internet.city && result.internet.country) {
      rows.push({ label: t('node_detail.location'), value: `${result.internet.city}, ${result.internet.country}` });
    } else if (result.internet.country) {
      rows.push({ label: t('node_detail.location'), value: result.internet.country });
    } else if (result.internet.city) {
      rows.push({ label: t('node_detail.location'), value: result.internet.city });
    }
    if (result.internet.public_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.internet.public_ip, copyable: true });
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
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
        <div className="ps-12 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-sm text-muted-foreground">{row.label}</p>
              {row.copyable ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-cyan-600 dark:text-cyan-400 font-mono">{row.value}</span>
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
                <p className="text-sm text-foreground">{row.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex-1" />

        {routerIp && (
          <Button
            variant="outline"
            className="w-full text-sm font-medium"
            onClick={handleOpenRouter}
          >
            <ExternalLink className="w-4 h-4 me-2" />
            {t('node_detail.open_router')}
          </Button>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bg-background px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground" onClick={onNavigateToHome}>
            <NetokLogoIcon className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground" onClick={onNavigateToSecurity}>
            <ShieldIcon className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground" onClick={onNavigateToTools}>
            <ToolsIcon className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground" onClick={onNavigateToSettings}>
            <SettingsIcon className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
