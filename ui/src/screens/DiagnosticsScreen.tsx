import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { NodeDetailScreen } from './NodeDetailScreen';
import { DiagnosticMessage } from '../components/DiagnosticMessage';
import { deriveScenario, type ScenarioContext } from '../utils/deriveScenario';
import { PingBadge } from '../components/PingBadge';
import { CloseButton } from '../components/WindowControls';
import { useDiagnosticsStore, type NetworkNode } from '../stores/diagnosticsStore';
import { useVpnStore } from '../stores/vpnStore';
import { useLivePing } from '../hooks/useLivePing';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useState, useCallback } from 'react';
import type { DiagnosticScenario } from '../api/tauri';

interface DiagnosticsScreenProps {
  onBack: () => void;
  onNavigateToDnsProviders?: () => void;
  onNavigateToVpn?: () => void;
}

const LOADING_LABELS = [
  'diagnostics.computer',
  'diagnostics.wifi',
  'diagnostics.router',
  'diagnostics.internet',
];

const BASE_SCENARIO_ACTIONS: Partial<Record<DiagnosticScenario, 'dns' | 'vpn' | 'wifi_settings'>> = {
  dns_failure: 'dns',
  wifi_disabled: 'wifi_settings',
  wifi_not_connected: 'wifi_settings',
};

export function DiagnosticsScreen({ onBack, onNavigateToDnsProviders, onNavigateToVpn }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const {
    nodes,
    isRunning,
    currentCheckIndex,
    error,
    runDiagnostics,
    getRawResult,
    scenarioOverride,
    networkInfo,
  } = useDiagnosticsStore();

  const { configs: vpnConfigs, connectionState } = useVpnStore();

  // Live ping for Router and Internet nodes
  const routerGatewayIp = getRawResult('dns')?.router?.gateway_ip ?? null;
  const routerNodeDown = nodes.find(n => n.id === 'dns')?.status === 'down';
  const internetNodeDown = nodes.find(n => n.id === 'internet')?.status === 'down';
  const hasInternetNode = nodes.some(n => n.id === 'internet');

  const vpnActive = connectionState.type === 'connected';

  const routerPing = useLivePing(
    routerGatewayIp,
    !isRunning && selectedNode === null && !routerNodeDown && !!routerGatewayIp && !vpnActive,
  );
  const internetPing = useLivePing(
    '1.1.1.1',
    !isRunning && selectedNode === null && !internetNodeDown && hasInternetNode,
  );

  // Auto-run diagnostics on mount (skip when debug override is active)
  useEffect(() => {
    if (!scenarioOverride) {
      runDiagnostics(t);
    }
  }, [runDiagnostics, t, scenarioOverride]);

  const handleRefresh = () => {
    if (scenarioOverride) {
      useDiagnosticsStore.getState().clearOverride(t);
    } else {
      runDiagnostics(t);
    }
  };

  const getStatusIcon = (status: NetworkNode['status']) => {
    if (status === 'ok') {
      return <NodeOkIcon className="w-5 h-5 text-primary" />;
    }
    if (status === 'partial') {
      return <NodeWarningIcon className="w-5 h-5 text-warning" />;
    }
    if (status === 'down') {
      return <NodeErrorIcon className="w-5 h-5 text-destructive" />;
    }
    return <NodeLoadingIcon className="w-5 h-5 text-muted-foreground animate-spin" />;
  };

  const isActive = currentCheckIndex >= 0 && currentCheckIndex < 4;

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

  const scenarioResult = !isRunning && nodes.length > 0 ? deriveScenario(nodes, scenarioContext) : null;
  const showScenarioCard = scenarioResult !== null && scenarioResult.scenario !== 'all_good';

  const hasLoadingPlaceholder = isActive && currentCheckIndex >= nodes.length;
  const vpnConnected = connectionState.type === 'connected';

  const SCENARIO_ACTIONS: Partial<Record<DiagnosticScenario, 'dns' | 'vpn' | 'wifi_settings'>> = {
    ...BASE_SCENARIO_ACTIONS,
    ...(vpnConfigs.length > 0 ? { http_blocked: 'vpn' as const } : {}),
  };
  const scenarioAction = scenarioResult ? SCENARIO_ACTIONS[scenarioResult.scenario] : undefined;
  const actionButtonText = scenarioAction && scenarioResult
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.button`)
    : undefined;

  const handleScenarioAction = useCallback(() => {
    if (!scenarioAction) return;
    if (scenarioAction === 'dns') onNavigateToDnsProviders?.();
    else if (scenarioAction === 'vpn') onNavigateToVpn?.();
    else if (scenarioAction === 'wifi_settings') openUrl('ms-settings:network-wifi');
  }, [scenarioAction, onNavigateToDnsProviders, onNavigateToVpn]);

  const selectedResult = selectedNode ? getRawResult(selectedNode) : undefined;
  if (selectedNode && selectedResult) {
    return (
      <NodeDetailScreen
        nodeId={selectedNode}
        result={selectedResult}
        onBack={() => setSelectedNode(null)}
        onNavigateToDnsProviders={onNavigateToDnsProviders}
        onNavigateToVpn={onNavigateToVpn}
      />
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('diagnostics.title')}</h1>
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRunning}>
            <RotateCw className="w-5 h-5 text-muted-foreground" />
          </Button>
          <CloseButton />
        </div>
      </div>

      {/* Error State */}
      {error && nodes.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-foreground mb-4">{t('errors.diagnostics')}</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Scrollable content: message + nodes */}
      {(nodes.length > 0 || isActive) && (
        <div className="flex-1 px-4 overflow-y-auto pb-4">
          {/* Scenario Message Card */}
          {showScenarioCard && (
            <div className="pb-3 animate-in fade-in duration-300">
              <DiagnosticMessage
                scenario={scenarioResult.scenario}
                severity={scenarioResult.severity}
                onAction={scenarioAction ? handleScenarioAction : undefined}
                actionLabel={actionButtonText}
              />
            </div>
          )}

          {/* Error inline — shown after partial completion */}
          {error && nodes.length > 0 && (
            <div className="mb-4 text-sm text-destructive animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Nodes */}
          <div>
            <div className="space-y-2">
              {/* Completed nodes */}
              {nodes.map((node) => {
                const isDown = node.status === 'down';
                const showPing = !isDown && !isRunning && (
                  node.id === 'internet' || (node.id === 'dns' && !vpnActive)
                );
                const pingValue = node.id === 'dns' ? routerPing : node.id === 'internet' ? internetPing : undefined;

                return (
                  <MenuCard
                    key={node.id}
                    variant={isDown ? 'static' : 'ghost'}
                    icon={getStatusIcon(node.status)}
                    title={t(node.title)}
                    badge={node.id === 'internet' && vpnConnected ? t('diagnostics.via_vpn') : undefined}
                    subtitle={<>
                      {node.details.map((detail) => (
                        <div key={detail.text} className="flex"><span className="min-w-0 truncate" dir="ltr">{detail.text}</span></div>
                      ))}
                      {showPing && (
                        <div className="mt-0.5 -ms-4">
                          <PingBadge value={pingValue} />
                        </div>
                      )}
                    </>}
                    trailing={isDown ? undefined : 'chevron'}
                    onClick={isDown ? undefined : () => setSelectedNode(node.id)}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  />
                );
              })}

              {/* Loading placeholder for current check */}
              {hasLoadingPlaceholder && (
                <MenuCard
                  variant="static"
                  icon={<NodeLoadingIcon className="w-5 h-5 text-muted-foreground animate-spin" />}
                  title={t(LOADING_LABELS[currentCheckIndex])}
                  subtitle={<span className="text-muted-foreground">{t('diagnostics.checking')}</span>}
                  muted
                  className="animate-in fade-in duration-200"
                />
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
