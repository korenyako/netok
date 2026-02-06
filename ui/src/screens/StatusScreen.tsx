import { useTranslation } from 'react-i18next';
import type { DiagnosticsSnapshot } from '../api/tauri';
import { useDnsStore } from '../stores/useDnsStore';
import { deriveScenario } from '../utils/deriveScenario';
import { CloseButton } from '../components/WindowControls';
import { MenuCard } from '@/components/MenuCard';
import { cn } from '@/lib/utils';

interface StatusScreenProps {
  onOpenDiagnostics: () => void;
  onNavigateToDnsProviders: () => void;
  diagnostics: DiagnosticsSnapshot | null;
}

// Known providers that count as "protection enabled"
const KNOWN_PROVIDERS = ['Cloudflare', 'Google', 'AdGuard', 'Dns4Eu', 'CleanBrowsing', 'Quad9', 'OpenDns'];

// Get display name for DNS provider
function getProviderDisplayName(type: string): string {
  const names: Record<string, string> = {
    'Cloudflare': 'Cloudflare',
    'Google': 'Google',
    'AdGuard': 'AdGuard',
    'Dns4Eu': 'DNS4EU',
    'CleanBrowsing': 'CleanBrowsing',
    'Quad9': 'Quad9',
    'OpenDns': 'OpenDNS',
  };
  return names[type] || type;
}

// SVG circle constants
const CIRCLE_SIZE = 192;
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
  success: 'status-circle-success',
  warning: 'status-circle-warning',
  error: '',
};

const GLOW_CLASSES: Record<VisualState, string> = {
  loading: '',
  success: 'status-glow-success',
  warning: 'status-glow-warning',
  error: 'status-glow-error',
};

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, diagnostics }: StatusScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider } = useDnsStore();

  // Determine if DNS protection is enabled (only known providers count as enabled)
  // Auto and Custom are treated as "protection disabled"
  const isDnsProtectionEnabled = dnsProvider !== null && KNOWN_PROVIDERS.includes(dnsProvider.type);
  const providerName = isDnsProtectionEnabled ? getProviderDisplayName(dnsProvider.type) : null;

  // Derive diagnostic scenario from nodes
  const isLoading = diagnostics === null;
  const scenarioResult = diagnostics ? deriveScenario(diagnostics.nodes) : null;
  const visualState: VisualState = isLoading
    ? 'loading'
    : (scenarioResult?.severity ?? 'success') as VisualState;

  const strokeColor = STROKE_COLORS[visualState];
  const circleClass = CIRCLE_CLASSES[visualState];
  const glowClass = GLOW_CLASSES[visualState];

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
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background">
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
        <div className="relative w-48 h-48 mb-4">
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
            {/* Glow ring (wide blurred stroke, breathing for success/warning) */}
            {glowClass && (
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={8}
                style={{ stroke: strokeColor, filter: 'blur(4px)' }}
                className={glowClass}
                fill="none"
              />
            )}
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
          <div className="absolute inset-0 flex items-center justify-center px-10">
            <span className={cn(
              "text-lg font-medium text-center leading-snug",
              isLoading ? "text-muted-foreground" : "text-foreground"
            )}>
              {circleTitle}
            </span>
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

          {/* Network Info */}
          {showNetworkInfo && diagnostics && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
              <span>
                {diagnostics.network.connection_type === 'Wifi' && 'Wi-Fi'}
                {diagnostics.network.connection_type === 'Ethernet' && 'Ethernet'}
                {diagnostics.network.connection_type === 'Usb' && 'USB'}
                {diagnostics.network.connection_type === 'Mobile' && 'Mobile'}
                {diagnostics.network.connection_type === 'Unknown' && t('network.unknown')}
              </span>
              {diagnostics.network.ssid && (
                <>
                  <span>·</span>
                  <span>{diagnostics.network.ssid}</span>
                </>
              )}
            </div>
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
            ? providerName ?? undefined
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
