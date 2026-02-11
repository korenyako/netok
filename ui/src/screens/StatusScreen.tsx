import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDiagnosticsStore, shouldRefreshDiagnostics } from '../stores/diagnosticsStore';
import { useDnsStore } from '../stores/useDnsStore';
import { deriveScenario } from '../utils/deriveScenario';
import { CloseButton } from '../components/WindowControls';
import { MenuCard } from '@/components/MenuCard';
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
}

// Known providers that count as "protection enabled"
const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'Quad9', 'OpenDns', 'Custom'];

// Get display name for DNS provider (brand names stay as-is, Custom is localised)
const PROVIDER_DISPLAY: Record<string, string> = {
  'Cloudflare': 'Cloudflare',
  'Google': 'Google',
  'AdGuard': 'AdGuard',
  'Dns4Eu': 'DNS4EU',
  'Quad9': 'Quad9',
  'OpenDns': 'OpenDNS',
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

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
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
    ? (dnsProvider.type === 'Custom' ? t('dns_providers.custom_display') : PROVIDER_DISPLAY[dnsProvider.type] || dnsProvider.type)
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
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Drag region with close button */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center justify-end shrink-0">
        <CloseButton />
      </div>

      {/* Main Content - Clickable Area */}
      <button
        onClick={onOpenDiagnostics}
        className="flex-1 flex flex-col items-center justify-center px-4 focus:outline-none"
      >
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
                {networkInfo.connection_type === 'Wifi' && 'Wi-Fi'}
                {networkInfo.connection_type === 'Ethernet' && 'Ethernet'}
                {networkInfo.connection_type === 'Usb' && 'USB'}
                {networkInfo.connection_type === 'Mobile' && 'Mobile'}
                {networkInfo.connection_type === 'Unknown' && t('network.unknown')}
                {networkInfo.ssid && ` ${networkInfo.ssid}`}
              </div>
            )}
          </div>
        </div>

        {/* Info area below circle */}
        <div className="min-h-[48px] flex flex-col items-center gap-1.5">
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
      </button>

      {/* DNS Protection Status */}
      <div className="px-4 pb-4">
        <MenuCard
          variant={isDnsProtectionEnabled ? 'highlighted' : 'filled'}
          title={isDnsProtectionEnabled
            ? t('status.dns_protection_with_provider')
            : t('status.dns_protection_disabled')
          }
          subtitle={isDnsProtectionEnabled
            ? dnsSubtitle ?? undefined
            : t('status.dns_protection_disabled_desc')
          }
          trailing={isDnsProtectionEnabled ? 'check' : undefined}
          muted={!isDnsProtectionEnabled}
          onClick={onNavigateToDnsProviders}
        />
      </div>
    </div>
  );
}
