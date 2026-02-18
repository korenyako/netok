import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiagnosticsStore, shouldRefreshDiagnostics } from '../stores/diagnosticsStore';
import { useDnsStore } from '../stores/useDnsStore';
import { useVpnStore } from '../stores/vpnStore';
import { deriveScenario } from '../utils/deriveScenario';
import { CloseButton } from '../components/WindowControls';
import { Globe, Lock, LockOpen } from '../components/icons/UIIcons';
import { cn } from '@/lib/utils';

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

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, onNavigateToVpn }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
  const { configs, activeIndex, connectionState } = useVpnStore();
  const vpnConfig = activeIndex !== null ? configs[activeIndex] : null;
  const mountedRef = useRef(false);

  // Get diagnostics data from store
  const { nodes, isRunning, lastUpdated, networkInfo, runDiagnostics } = useDiagnosticsStore();

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

  // Auto-refresh diagnostics on mount if stale or never run
  useEffect(() => {
    if (shouldRefreshDiagnostics(lastUpdated) && !isRunning) {
      runDiagnostics(t);
    }
  }, [lastUpdated, isRunning, runDiagnostics, t]);

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
  const scenarioResult = nodes.length > 0 ? deriveScenario(nodes) : null;
  const visualState: VisualState = isLoading
    ? 'loading'
    : (scenarioResult?.severity ?? 'success') as VisualState;

  const strokeColor = STROKE_COLORS[visualState];
  const circleClass = CIRCLE_CLASSES[visualState];

  // Title inside circle
  const circleTitle = scenarioResult
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.title`)
    : t('status.waiting');

  // Message below circle (only for non-all_good scenarios)
  const showMessage = scenarioResult && scenarioResult.scenario !== 'all_good';
  const messageText = showMessage
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.message`)
    : null;

  // Network info shown only for success or warning
  const showNetworkInfo = !isLoading && (visualState === 'success' || visualState === 'warning');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Drag region with close button */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3 flex items-center justify-end shrink-0">
        <div className="pointer-events-auto">
          <CloseButton />
        </div>
      </div>

      {/* Main Content - Clickable Area */}
      <button
        onClick={onOpenDiagnostics}
        className="flex-1 flex flex-col items-center px-4 focus:outline-none"
      >
        <div className="flex-1" />
        {/* Status Circle */}
        <div className="relative w-60 h-60 mb-4">
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
        </div>

        {/* Info area below circle */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Scenario message */}
          {messageText && (
            <p className={cn(
              "text-sm text-center leading-relaxed max-w-[240px]",
              visualState === 'error' && "text-destructive/75",
              visualState === 'warning' && "text-warning/75",
            )}>
              {messageText}
            </p>
          )}
        </div>
        <div className="flex-1" />
      </button>

      {/* Status Indicators */}
      <div className="shrink-0 flex flex-col items-center gap-0.5 pb-4">
        <button
          onClick={onNavigateToDnsProviders}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <Globe className={cn("w-4 h-4", isDnsProtectionEnabled && "text-primary")} />
          <span>{isDnsProtectionEnabled && dnsSubtitle ? `DNS ${dnsSubtitle}` : t('status.dns_protection_disabled')}</span>
        </button>
        <button
          onClick={onNavigateToVpn}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          {connectionState.type === 'connected'
            ? <Lock className="w-4 h-4 text-primary" />
            : <LockOpen className="w-4 h-4" />
          }
          <span>{connectionState.type === 'connected' && vpnCompact ? `VPN ${vpnCompact}` : t('status.vpn_disabled')}</span>
        </button>
      </div>
    </div>
  );
}
