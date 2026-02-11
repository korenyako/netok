import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { NetokLogoIcon, ShieldIcon, ToolsIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MenuCard } from '@/components/MenuCard';
import { NodeDetailScreen } from './NodeDetailScreen';
import { DiagnosticMessage } from '../components/DiagnosticMessage';
import { deriveScenario } from '../utils/deriveScenario';
import { CloseButton } from '../components/WindowControls';
import { useDiagnosticsStore, type NetworkNode } from '../stores/diagnosticsStore';
import { useState } from 'react';

interface DiagnosticsScreenProps {
  onBack: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToTools?: () => void;
  onNavigateToSettings?: () => void;
}

const LOADING_LABELS = [
  'diagnostics.computer',
  'diagnostics.wifi',
  'diagnostics.router',
  'diagnostics.internet',
];

export function DiagnosticsScreen({ onBack, onNavigateToSecurity, onNavigateToTools, onNavigateToSettings }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Get state and actions from store
  const {
    nodes,
    isRunning,
    currentCheckIndex,
    error,
    runDiagnostics,
    getRawResult,
  } = useDiagnosticsStore();

  // Run diagnostics on mount
  useEffect(() => {
    runDiagnostics(t);
  }, [runDiagnostics, t]);

  const handleRefresh = () => {
    runDiagnostics(t);
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
  const scenarioResult = !isRunning && nodes.length > 0 ? deriveScenario(nodes) : null;
  const showScenarioCard = scenarioResult !== null && scenarioResult.scenario !== 'all_good';

  const selectedResult = selectedNode ? getRawResult(selectedNode) : undefined;
  if (selectedNode && selectedResult) {
    return (
      <NodeDetailScreen
        nodeId={selectedNode}
        result={selectedResult}
        onBack={() => setSelectedNode(null)}
        onNavigateToHome={onBack}
        onNavigateToSecurity={onNavigateToSecurity}
        onNavigateToTools={onNavigateToTools}
        onNavigateToSettings={onNavigateToSettings}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('diagnostics.title')}</h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRunning}>
          <RotateCw className="w-5 h-5 text-muted-foreground" />
        </Button>
        <CloseButton />
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
        <ScrollArea className="flex-1 px-4">
          {/* Scenario Message Card */}
          {showScenarioCard && (
            <div className="pb-3 animate-in fade-in duration-300">
              <DiagnosticMessage
                scenario={scenarioResult.scenario}
                severity={scenarioResult.severity}
              />
            </div>
          )}

          {/* Error inline — shown after partial completion */}
          {error && nodes.length > 0 && (
            <div className="mb-4 text-sm text-destructive animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Completed nodes */}
          <div className="space-y-2">
            {nodes.map((node) => (
              <MenuCard
                key={node.id}
                variant="ghost"
                icon={getStatusIcon(node.status)}
                title={t(node.title)}
                subtitle={node.details.map((detail) => (
                  <p key={detail.text}>{detail.text}</p>
                ))}
                trailing="chevron"
                onClick={() => setSelectedNode(node.id)}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              />
            ))}

            {/* Loading placeholder for current check (only if no existing node at this position) */}
            {isActive && currentCheckIndex >= nodes.length && (
              <MenuCard
                variant="static"
                icon={<NodeLoadingIcon className="w-5 h-5 text-muted-foreground animate-spin" />}
                title={t(LOADING_LABELS[currentCheckIndex])}
                subtitle={<span className="text-muted-foreground/60">{t('diagnostics.checking')}</span>}
                muted
                className="animate-in fade-in duration-200"
              />
            )}
          </div>
        </ScrollArea>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bg-background px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-12 w-12 text-foreground bg-accent" onClick={onBack}>
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
