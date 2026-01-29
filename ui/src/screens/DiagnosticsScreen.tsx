import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw, Loader2 } from 'lucide-react';
import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { runDiagnostics, type NodeResult, type DiagnosticScenario, type DiagnosticSeverity } from '../api/tauri';
import { notifications } from '../utils/notifications';

interface NodeDetail {
  text: string;
  isIp?: boolean;
}

interface NetworkNode {
  id: string;
  title: string;
  status: 'ok' | 'partial' | 'down' | 'loading';
  details: NodeDetail[];
}

interface DiagnosticsScreenProps {
  onBack: () => void;
  onRefresh: () => Promise<void>;
  onNavigateToSecurity?: () => void;
  onNavigateToTools?: () => void;
  onNavigateToSettings?: () => void;
}

// Derive diagnostic scenario from node statuses
function deriveScenario(nodes: NetworkNode[]): { scenario: DiagnosticScenario; severity: DiagnosticSeverity } | null {
  if (nodes.length === 0) return null;

  // Check if all nodes are OK
  const allOk = nodes.every(n => n.status === 'ok');
  if (allOk) {
    return { scenario: 'all_good', severity: 'success' };
  }

  // Find which node is failing
  const networkNode = nodes.find(n => n.id === 'network');
  const routerNode = nodes.find(n => n.id === 'dns'); // 'dns' is actually router in UI
  const internetNode = nodes.find(n => n.id === 'internet');

  // Check for network issues first (Wi-Fi)
  if (networkNode?.status === 'down') {
    return { scenario: 'wifi_not_connected', severity: 'error' };
  }

  // Check for weak signal (partial network status)
  if (networkNode?.status === 'partial') {
    return { scenario: 'weak_signal', severity: 'warning' };
  }

  // Check for router unreachable
  if (routerNode?.status === 'down') {
    return { scenario: 'router_unreachable', severity: 'error' };
  }

  // Check for internet issues
  if (internetNode?.status === 'down') {
    return { scenario: 'no_internet', severity: 'error' };
  }

  if (internetNode?.status === 'partial') {
    // Could be DNS failure or HTTP blocked
    return { scenario: 'dns_failure', severity: 'warning' };
  }

  // Default to all_good if we can't determine
  return { scenario: 'all_good', severity: 'success' };
}

export function DiagnosticsScreen({ onBack, onRefresh, onNavigateToSecurity, onNavigateToTools, onNavigateToSettings }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Helper function to remove AS number from ISP string
  const cleanIspName = (isp: string): string => {
    // Remove "AS12345 " prefix if present
    return isp.replace(/^AS\d+\s+/, '');
  };

  // Helper function to copy IP address to clipboard
  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    notifications.success(t('dns_detail.ip_copied'));
  };

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const snapshot = await runDiagnostics();

        // Transform API data to UI format
        const transformedNodes: NetworkNode[] = snapshot.nodes.map((node: NodeResult) => {
          const details: NodeDetail[] = [];

          // Add computer-specific details (matching screenshot format)
          if (node.id === 'computer' && snapshot.computer) {
            // First: Adapter name
            if (snapshot.computer.adapter) {
              details.push({ text: snapshot.computer.adapter });
            }
            // Last: Local IP
            if (snapshot.computer.local_ip) {
              details.push({ text: snapshot.computer.local_ip, isIp: true });
            }
          }

          // Add network-specific details (matching screenshot format for Wi-Fi)
          if (node.id === 'network' && snapshot.network) {
            // First: SSID (for Wi-Fi) without prefix
            if (snapshot.network.ssid) {
              details.push({ text: snapshot.network.ssid });
            }

            // Second: Signal strength with quality description
            if (snapshot.network.rssi !== null) {
              const rssi = snapshot.network.rssi;
              let qualityKey = '';

              // Map RSSI to quality description
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

          // Add router-specific details (matching screenshot format)
          if (node.id === 'dns' && snapshot.router) {
            // First: Vendor/Model (MAC address hidden from user)
            if (snapshot.router.vendor) {
              details.push({ text: snapshot.router.vendor });
            }
            if (snapshot.router.model) {
              details.push({ text: snapshot.router.model });
            }
            // Last: Gateway IP (without "Gateway:" prefix to match screenshot)
            if (snapshot.router.gateway_ip) {
              details.push({ text: snapshot.router.gateway_ip, isIp: true });
            }
          }

          // Add internet-specific details (matching screenshot format)
          if (node.id === 'internet' && snapshot.internet) {
            // First: ISP/Provider (without AS number)
            if (snapshot.internet.isp) {
              details.push({ text: cleanIspName(snapshot.internet.isp) });
            }
            // Second: City, Country
            if (snapshot.internet.city && snapshot.internet.country) {
              details.push({ text: `${snapshot.internet.city}, ${snapshot.internet.country}` });
            } else if (snapshot.internet.country) {
              details.push({ text: snapshot.internet.country });
            } else if (snapshot.internet.city) {
              details.push({ text: snapshot.internet.city });
            }
            // Last: Public IP (without "IP:" prefix)
            if (snapshot.internet.public_ip) {
              details.push({ text: snapshot.internet.public_ip, isIp: true });
            }
          }

          // Note: latency_ms is intentionally not displayed in the UI

          return {
            id: node.id,
            title: node.label,
            status: node.status,
            details,
          };
        });

        setNodes(transformedNodes);
      } catch (err) {
        console.error('Failed to fetch diagnostics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagnostics();
  }, []);

  const getStatusIcon = (status: NetworkNode['status']) => {
    if (status === 'ok') {
      return (
        <div className="w-2 h-2 rounded-full bg-primary" />
      );
    }

    if (status === 'partial') {
      return (
        <div className="w-2 h-2 rounded-full bg-amber-500" />
      );
    }

    if (status === 'down') {
      return (
        <div className="w-2 h-2 rounded-full bg-destructive" />
      );
    }

    // Loading spinner
    return (
      <Loader2 className="w-2 h-2 text-muted-foreground animate-spin" />
    );
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onRefresh();

      // Re-fetch diagnostics to update UI
      const snapshot = await runDiagnostics();

      // Transform API data to UI format (same logic as in useEffect)
      const transformedNodes: NetworkNode[] = snapshot.nodes.map((node: NodeResult) => {
        const details: NodeDetail[] = [];

        if (node.id === 'computer' && snapshot.computer) {
          if (snapshot.computer.adapter) {
            details.push({ text: snapshot.computer.adapter });
          }
          if (snapshot.computer.local_ip) {
            details.push({ text: snapshot.computer.local_ip, isIp: true });
          }
        }

        if (node.id === 'network' && snapshot.network) {
          if (snapshot.network.ssid) {
            details.push({ text: snapshot.network.ssid });
          }

          if (snapshot.network.rssi !== null) {
            const rssi = snapshot.network.rssi;
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

        if (node.id === 'dns' && snapshot.router) {
          if (snapshot.router.vendor) {
            details.push({ text: snapshot.router.vendor });
          }
          if (snapshot.router.model) {
            details.push({ text: snapshot.router.model });
          }
          if (snapshot.router.gateway_ip) {
            details.push({ text: snapshot.router.gateway_ip, isIp: true });
          }
        }

        if (node.id === 'internet' && snapshot.internet) {
          if (snapshot.internet.isp) {
            details.push({ text: cleanIspName(snapshot.internet.isp) });
          }
          if (snapshot.internet.city && snapshot.internet.country) {
            details.push({ text: `${snapshot.internet.city}, ${snapshot.internet.country}` });
          } else if (snapshot.internet.country) {
            details.push({ text: snapshot.internet.country });
          } else if (snapshot.internet.city) {
            details.push({ text: snapshot.internet.city });
          }
          if (snapshot.internet.public_ip) {
            details.push({ text: snapshot.internet.public_ip, isIp: true });
          }
        }

        return {
          id: node.id,
          title: node.label,
          status: node.status,
          details,
        };
      });

      setNodes(transformedNodes);
    } catch (err) {
      console.error('Failed to refresh diagnostics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button, Title, and Refresh */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('diagnostics.title')}</h1>
        <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RotateCw className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-foreground mb-4">{t('errors.diagnostics')}</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {/* Node List */}
      {!isLoading && !error && (
        <ScrollArea className="flex-1 px-4">
          {/* Diagnostic Status Description */}
          {(() => {
            const result = deriveScenario(nodes);
            if (result) {
              return (
                <p className="text-xs text-muted-foreground mb-4">
                  {t(`diagnostic.scenario.${result.scenario}.message`)}
                </p>
              );
            }
            return null;
          })()}

          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="flex"
            >
              {/* Timeline column with bead and connecting line */}
              <div className="flex flex-col items-center mr-3">
                {/* Top segment: line from previous or spacer for first */}
                <div className={cn("w-px h-5", index > 0 ? "bg-border" : "")} />
                {/* Bead (status icon) */}
                <div className="flex-shrink-0">
                  {getStatusIcon(node.status)}
                </div>
                {/* Bottom segment: line to next or spacer for last */}
                <div className={cn("w-px flex-1", index < nodes.length - 1 ? "bg-border" : "")} />
              </div>

              {/* Node content */}
              <div className="flex-1 py-3">
                {/* Node Title */}
                <h3 className="text-base font-medium text-foreground leading-normal mb-1.5">
                  {t(node.title)}
                </h3>

                {/* Node Details */}
                <div className="space-y-1.5">
                  {node.details.map((detail) => (
                    detail.isIp ? (
                      <div key={detail.text}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer font-mono font-normal text-xs"
                          onClick={() => handleCopyIp(detail.text)}
                        >
                          {detail.text}
                        </Badge>
                      </div>
                    ) : (
                      <p
                        key={detail.text}
                        className="text-sm text-muted-foreground leading-normal"
                      >
                        {detail.text}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bg-background px-4 py-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-12 w-12 text-primary bg-accent" onClick={onBack}>
            <WaypointsIcon className="w-6 h-6" />
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
