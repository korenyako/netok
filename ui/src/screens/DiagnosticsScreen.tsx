import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { NetokLogoIcon, ShieldIcon, WrenchIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  checkComputer,
  checkNetwork,
  checkRouter,
  checkInternet,
  type SingleNodeResult,
} from '../api/tauri';
import { notifications } from '../utils/notifications';

interface NodeDetail {
  text: string;
}

interface NetworkNode {
  id: string;
  title: string;
  status: 'ok' | 'partial' | 'down' | 'loading';
  ip?: string;
  details: NodeDetail[];
}

interface DiagnosticsScreenProps {
  onBack: () => void;
  onRefresh: () => Promise<void>;
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

/** Remove AS number prefix from ISP string */
function cleanIspName(isp: string): string {
  return isp.replace(/^AS\d+\s+/, '');
}

/** Transform a SingleNodeResult into a UI NetworkNode */
function transformSingleNode(result: SingleNodeResult, t: (key: string) => string): NetworkNode {
  const { node } = result;
  const details: NodeDetail[] = [];
  let ip: string | undefined;

  if (node.id === 'computer' && result.computer) {
    if (result.computer.adapter) {
      details.push({ text: result.computer.adapter });
    }
    ip = result.computer.local_ip ?? undefined;
  }

  if (node.id === 'network' && result.network) {
    if (result.network.ssid) {
      details.push({ text: result.network.ssid });
    }
    if (result.network.rssi !== null) {
      const rssi = result.network.rssi;
      let qualityKey = '';
      if (rssi >= -50) {
        qualityKey = 'nodes.network.signal_excellent';
      } else if (rssi >= -60) {
        qualityKey = 'nodes.network.signal_good';
      } else if (rssi >= -70) {
        qualityKey = 'nodes.network.signal_fair';
      } else {
        qualityKey = 'nodes.network.signal_weak';
      }
      details.push({ text: `${t('nodes.network.signal_field')} ${t(qualityKey)} (${rssi} dBm)` });
    }
  }

  if (node.id === 'dns' && result.router) {
    if (result.router.vendor) {
      details.push({ text: result.router.vendor });
    }
    if (result.router.model) {
      details.push({ text: result.router.model });
    }
    ip = result.router.gateway_ip ?? undefined;
  }

  if (node.id === 'internet' && result.internet) {
    if (result.internet.isp) {
      details.push({ text: cleanIspName(result.internet.isp) });
    }
    if (result.internet.city && result.internet.country) {
      details.push({ text: `${result.internet.city}, ${result.internet.country}` });
    } else if (result.internet.country) {
      details.push({ text: result.internet.country });
    } else if (result.internet.city) {
      details.push({ text: result.internet.city });
    }
    ip = result.internet.public_ip ?? undefined;
  }

  return {
    id: node.id,
    title: node.label,
    status: node.status,
    ip,
    details,
  };
}

export function DiagnosticsScreen({ onBack, onRefresh, onNavigateToSecurity, onNavigateToTools, onNavigateToSettings }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    notifications.success(t('dns_detail.ip_copied'));
  };

  const runProgressiveDiagnostics = useCallback(async () => {
    const thisRunId = ++runIdRef.current;
    const stale = () => runIdRef.current !== thisRunId;

    setNodes([]);
    setError(null);
    setIsRunning(true);
    setCurrentCheckIndex(0);

    try {
      // Step 0: Computer
      const computerResult = await checkComputer();
      if (stale()) return;
      const computerNode = transformSingleNode(computerResult, t);
      setNodes([computerNode]);
      setCurrentCheckIndex(1);

      // Step 1: Network (depends on computer's adapter)
      const adapter = computerResult.computer?.adapter ?? null;
      const networkResult = await checkNetwork(adapter);
      if (stale()) return;
      const networkNode = transformSingleNode(networkResult, t);
      setNodes(prev => [...prev, networkNode]);
      setCurrentCheckIndex(2);

      // Step 2: Router
      const routerResult = await checkRouter();
      if (stale()) return;
      const routerNode = transformSingleNode(routerResult, t);
      setNodes(prev => [...prev, routerNode]);
      setCurrentCheckIndex(3);

      // Step 3: Internet
      const internetResult = await checkInternet();
      if (stale()) return;
      const internetNode = transformSingleNode(internetResult, t);
      setNodes(prev => [...prev, internetNode]);
      setCurrentCheckIndex(4); // All done
    } catch (err) {
      if (stale()) return;
      console.error('Failed to run diagnostics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCurrentCheckIndex(4); // Stop the loading placeholder
    } finally {
      if (!stale()) {
        setIsRunning(false);
      }
    }
  }, [t]);

  useEffect(() => {
    runProgressiveDiagnostics();
  }, [runProgressiveDiagnostics]);

  const handleRefresh = async () => {
    try {
      await onRefresh();
    } catch {
      // ignore parent refresh errors
    }
    runProgressiveDiagnostics();
  };

  const getStatusIcon = (status: NetworkNode['status']) => {
    if (status === 'ok') {
      return <NodeOkIcon className="w-4 h-4 text-primary" />;
    }
    if (status === 'partial') {
      return <NodeWarningIcon className="w-4 h-4 text-warning" />;
    }
    if (status === 'down') {
      return <NodeErrorIcon className="w-4 h-4 text-destructive" />;
    }
    return <NodeLoadingIcon className="w-4 h-4 text-muted-foreground animate-spin" />;
  };

  const isActive = currentCheckIndex >= 0 && currentCheckIndex < 4;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('diagnostics.title')}</h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRunning}>
          <RotateCw className="w-5 h-5 text-muted-foreground" />
        </Button>
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

      {/* Node List — progressive */}
      {(nodes.length > 0 || isActive) && (
        <ScrollArea className="flex-1 px-4">
          {/* Error inline — shown after partial completion */}
          {error && nodes.length > 0 && (
            <div className="mb-4 text-sm text-destructive animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Completed nodes */}
          <div className="space-y-2">
            {nodes.map((node) => (
              <Card
                key={node.id}
                className="bg-transparent animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="shrink-0 mt-1">
                    {getStatusIcon(node.status)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <div className="text-base font-medium text-foreground leading-normal">
                        {t(node.title)}
                      </div>
                      {node.ip && (
                        <Badge
                          variant="secondary"
                          className="cursor-pointer font-mono font-normal text-xs bg-transparent radial-hover"
                          onClick={() => handleCopyIp(node.ip!)}
                        >
                          {node.ip}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      {node.details.map((detail) => (
                        <p
                          key={detail.text}
                          className="text-sm text-muted-foreground leading-normal"
                        >
                          {detail.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Loading placeholder for current check */}
            {isActive && (
              <Card className="bg-transparent animate-in fade-in duration-200">
                <CardContent className="flex items-start gap-3 p-4">
                  <span className="shrink-0 mt-1">
                    <NodeLoadingIcon className="w-4 h-4 text-muted-foreground animate-spin" />
                  </span>
                  <div className="flex-1">
                    <div className="text-base font-medium text-muted-foreground leading-normal mb-1">
                      {t(LOADING_LABELS[currentCheckIndex])}
                    </div>
                    <p className="text-sm text-muted-foreground/60 leading-normal">
                      {t('diagnostics.checking')}
                    </p>
                  </div>
                </CardContent>
              </Card>
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
            <WrenchIcon className="w-6 h-6" />
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground" onClick={onNavigateToSettings}>
            <SettingsIcon className="w-6 h-6" />
          </Button>
        </div>
      </nav>
    </div>
  );
}
