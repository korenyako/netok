import { useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiagnosticsStore, shouldRefreshDiagnostics, getNetworkAvailability } from '../stores/diagnosticsStore';
import { useDnsStore } from '../stores/useDnsStore';
import { useVpnStore } from '../stores/vpnStore';
import { deriveScenario, type ScenarioContext } from '../utils/deriveScenario';
import { CloseButton } from '../components/WindowControls';
import { Globe, Lock, LockOpen, Wifi } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { useWifiSecurityStore } from '../stores/wifiSecurityStore';
import { openUrl } from '@tauri-apps/plugin-opener';
import { cn } from '@/lib/utils';
import type { DiagnosticScenario } from '../api/tauri';

// DNS logging helper
const logDns = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().slice(11, 23);
  if (data !== undefined) {
    console.log(`[DNS][UI][StatusScreen][${timestamp}] ${message}`, data);
  } else {
    console.log(`[DNS][UI][StatusScreen][${timestamp}] ${message}`);
  }
};

interface StatusScreenProps {
  onOpenDiagnostics: () => void;
  onNavigateToDnsProviders: () => void;
  onNavigateToVpn: () => void;
  onNavigateToWifiSecurity: () => void;
}

// Known providers that count as "protection enabled"
const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'Quad9', 'OpenDns', 'Custom'];

// Get display name for DNS provider (brand names stay as-is)
const PROVIDER_DISPLAY: Record<string, string> = {
  'Cloudflare': 'Cloudflare',
  'Google': 'Google',
  'AdGuard': 'AdGuard',
  'Dns4Eu': 'DNS4EU',
  'Quad9': 'Quad9',
  'OpenDns': 'OpenDNS',
};

// Well-known DNS IPs → provider name (for custom DNS display)
const KNOWN_DNS_IPS: Record<string, string> = {
  '1.1.1.1': 'Cloudflare', '1.0.0.1': 'Cloudflare',
  '8.8.8.8': 'Google', '8.8.4.4': 'Google',
  '94.140.14.14': 'AdGuard', '94.140.15.15': 'AdGuard',
  '9.9.9.9': 'Quad9', '149.112.112.112': 'Quad9',
  '208.67.222.222': 'OpenDNS', '208.67.220.220': 'OpenDNS',
};

const formatCustomDns = (ip: string) => {
  const name = KNOWN_DNS_IPS[ip];
  return name ? `${ip} (${name})` : ip;
};

// Map backend connection_type values to i18n keys
const CONNECTION_TYPE_KEYS: Record<string, string> = {
  Wifi: 'nodes.network.type_wifi',
  Ethernet: 'nodes.network.type_cable',
  Usb: 'nodes.network.type_usb_modem',
  Mobile: 'nodes.network.type_mobile',
  Unknown: 'network.unknown',
};

// SVG circle constants
const CIRCLE_SIZE = 240;
const STROKE_WIDTH = 2;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;

type VisualState = 'loading' | 'success' | 'warning' | 'error';

const STROKE_COLORS: Record<VisualState, string> = {
  loading: 'hsl(var(--muted-foreground))',
  success: 'hsl(var(--primary))',
  warning: 'hsl(var(--warning))',
  error: 'hsl(var(--destructive))',
};

const CIRCLE_CLASSES: Record<VisualState, string> = {
  loading: 'status-circle-loading',
  success: '',
  warning: '',
  error: '',
};

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, onNavigateToVpn, onNavigateToWifiSecurity }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
  const { configs, activeIndex, connectionState } = useVpnStore();
  const wifiReport = useWifiSecurityStore(s => s.report);
  const wifiIsRunning = useWifiSecurityStore(s => s.isRunning);
  const runQuietWifiScan = useWifiSecurityStore(s => s.runQuietScan);
  const vpnConfig = activeIndex !== null ? configs[activeIndex] : null;
  const mountedRef = useRef(false);

  // Get diagnostics data from store
  const { nodes, isRunning, lastUpdated, networkInfo, runDiagnostics, getRawResult, scenarioOverride } = useDiagnosticsStore();

  // Log on mount
  useEffect(() => {
    logDns('Screen MOUNTED', { dnsProvider, isDnsLoading });
    mountedRef.current = true;

    return () => {
      logDns('Screen UNMOUNTED');
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty - only log on actual mount/unmount

  // Log when DNS provider changes
  useEffect(() => {
    // Skip first render (mount already logged)
    if (!mountedRef.current) return;

    logDns('Provider state changed', {
      provider: dnsProvider?.type ?? null,
      isLoading: isDnsLoading
    });
  }, [dnsProvider, isDnsLoading]);

  // Auto-refresh diagnostics on mount if stale or never run (skip when debug override is active)
  useEffect(() => {
    if (!scenarioOverride && shouldRefreshDiagnostics(lastUpdated) && !isRunning) {
      runDiagnostics(t);
    }
  }, [lastUpdated, isRunning, runDiagnostics, t, scenarioOverride]);

  // Derived network availability from diagnostic nodes
  const availability = getNetworkAvailability(nodes);

  // Auto-run WiFi security check on mount if never run (skip when no network)
  useEffect(() => {
    if (availability !== 'no_network' && !wifiReport && !wifiIsRunning) {
      runQuietWifiScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine if DNS protection is enabled (only known providers count as enabled)
  // Only Auto is treated as "protection disabled"
  const isDnsProtectionEnabled = dnsProvider !== null && KNOWN_PROVIDERS.includes(dnsProvider.type);

  const dnsSubtitle = isDnsProtectionEnabled && dnsProvider
    ? (dnsProvider.type === 'Custom' ? formatCustomDns(dnsProvider.primary) : PROVIDER_DISPLAY[dnsProvider.type] || dnsProvider.type)
    : null;

  const vpnCompact = vpnConfig
    ? [vpnConfig.city, vpnConfig.country].filter(Boolean).join(', ') || null
    : null;

  // Derive diagnostic scenario from nodes
  // Only show loading spinner when we have NO previous data at all
  const isLoading = isRunning && nodes.length === 0;

  // Build context for more precise scenario derivation
  const scenarioContext: ScenarioContext | undefined = (() => {
    const networkRaw = getRawResult('network');
    const internetRaw = getRawResult('internet');
    if (!networkRaw && !internetRaw) return undefined;
    return {
      connectionType: networkRaw?.network?.connection_type,
      internetInfo: internetRaw?.internet ?? undefined,
    };
  })();

  const scenarioResult = nodes.length > 0 ? deriveScenario(nodes, scenarioContext) : null;
  const visualState: VisualState = isLoading
    ? 'loading'
    : (scenarioResult?.severity ?? 'success') as VisualState;

  const strokeColor = STROKE_COLORS[visualState];
  const circleClass = CIRCLE_CLASSES[visualState];

  // Title inside circle
  const circleTitle = scenarioResult
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.title`)
    : t('status.waiting');

  // Message & action below circle (only for non-all_good scenarios)
  const showAction = scenarioResult && scenarioResult.scenario !== 'all_good';
  const messageText = showAction
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.message`)
    : null;
  const actionText = showAction
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.action`)
    : null;

  // Network info shown only for success or warning
  const showNetworkInfo = !isLoading && (visualState === 'success' || visualState === 'warning');

  // Hide widgets when there are problems (error/warning) — only show on success
  const showWidgets = visualState === 'success';

  // Scenario action button — only for scenarios where the app can help
  const SCENARIO_ACTIONS: Partial<Record<DiagnosticScenario, 'dns' | 'vpn' | 'wifi_settings'>> = {
    dns_failure: 'dns',
    ...(configs.length > 0 ? { http_blocked: 'vpn' as const } : {}),
    wifi_disabled: 'wifi_settings',
    wifi_not_connected: 'wifi_settings',
  };

  const scenarioAction = scenarioResult ? SCENARIO_ACTIONS[scenarioResult.scenario] : undefined;
  const actionButtonText = scenarioAction && scenarioResult
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.button`)
    : null;

  const handleScenarioAction = useCallback(() => {
    if (!scenarioAction) return;
    if (scenarioAction === 'dns') onNavigateToDnsProviders();
    else if (scenarioAction === 'vpn') onNavigateToVpn();
    else if (scenarioAction === 'wifi_settings') openUrl('ms-settings:network-wifi');
  }, [scenarioAction, onNavigateToDnsProviders, onNavigateToVpn]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Drag region with close button */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3 flex items-center justify-end shrink-0">
        <div className="pointer-events-auto">
          <CloseButton />
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col items-center px-4"
      >
        <div className="h-4 shrink-0" />
        {/* Status Circle - Clickable */}
        <button
          onClick={onOpenDiagnostics}
          className="relative w-60 h-60 shrink-0 rounded-full focus:outline-none cursor-pointer"
        >
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
            fill="none"
          >
            {/* Background ring (dim) */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              style={{ stroke: strokeColor }}
              opacity="0.12"
            />
            {/* Main ring */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              style={{ stroke: strokeColor }}
              className={circleClass}
            />
          </svg>

          {/* Text inside circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
            <span className={cn(
              "text-lg font-medium text-center leading-snug",
              isLoading ? "text-muted-foreground" : "text-foreground"
            )}>
              {circleTitle}
            </span>

            {/* Network Info inside circle */}
            {showNetworkInfo && networkInfo && (
              <div className="text-xs font-mono text-muted-foreground/60 mt-2">
                {networkInfo.connection_type && t(CONNECTION_TYPE_KEYS[networkInfo.connection_type] ?? 'network.unknown')}
                {networkInfo.ssid && ` ${networkInfo.ssid}`}
              </div>
            )}
          </div>
        </button>

        {/* Message + action block — centered in remaining bottom space */}
        <div className="flex-[3] flex flex-col items-center justify-center gap-2">
          {messageText && (
            <p className="text-sm text-center leading-normal max-w-[240px] text-foreground font-medium">
              {messageText}
            </p>
          )}
          {actionText && (
            <p className="text-sm text-center leading-normal max-w-[240px] text-muted-foreground">
              {actionText}
            </p>
          )}
          {actionButtonText && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={handleScenarioAction}
            >
              {actionButtonText}
            </Button>
          )}
        </div>
      </div>

      {/* Status Indicators — hidden during error/warning */}
      {showWidgets && <div className="shrink-0 flex flex-col items-center gap-0.5 pb-4">
        <button
          onClick={onNavigateToDnsProviders}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Globe className={cn("w-4 h-4", isDnsProtectionEnabled && "text-primary")} />
          <span>{isDnsProtectionEnabled && dnsSubtitle ? `DNS ${dnsSubtitle}` : t('status.dns_protection_disabled')}</span>
        </button>
        <button
          onClick={onNavigateToVpn}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {connectionState.type === 'connected'
            ? <Lock className="w-4 h-4 text-primary" />
            : <LockOpen className="w-4 h-4" />
          }
          <span>{connectionState.type === 'connected' && vpnCompact ? `VPN ${vpnCompact}` : t('status.vpn_disabled')}</span>
        </button>
        <button
          onClick={onNavigateToWifiSecurity}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Wifi className={cn("w-4 h-4",
            availability !== 'no_network' && wifiReport && wifiReport.overall_status === 'safe' && "text-primary",
            availability !== 'no_network' && wifiReport && wifiReport.overall_status === 'warning' && "text-warning",
            availability !== 'no_network' && wifiReport && wifiReport.overall_status === 'danger' && "text-destructive",
          )} />
          <span>
            {availability === 'no_network'
              ? t('network.unavailable')
              : wifiIsRunning
                ? t('wifi_security.checking')
                : wifiReport
                  ? wifiReport.overall_status === 'safe'
                    ? t('protection.no_threats')
                    : t('protection.threats_detected')
                  : t('protection.check_security')
            }
          </span>
        </button>
      </div>}
    </div>
  );
}
