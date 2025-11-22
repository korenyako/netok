import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { runDiagnostics, type NodeResult } from '../api/tauri';
import { DNS_IP_TEXT_CLASS } from '../constants/dnsVariantStyles';

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

export function DiagnosticsScreen({ onBack, onRefresh, onNavigateToSecurity, onNavigateToTools, onNavigateToSettings }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Helper function to remove AS number from ISP string
  const cleanIspName = (isp: string): string => {
    // Remove "AS12345 " prefix if present
    return isp.replace(/^AS\d+\s+/, '');
  };

  // Helper function to copy IP address to clipboard
  const handleCopyIp = async (ip: string) => {
    try {
      await navigator.clipboard.writeText(ip);
      setCopiedIp(ip);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopiedIp(null), 2000);
    } catch (err) {
      console.error('Failed to copy IP:', err);
    }
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
        <svg className="w-2 h-2" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="4" fill="#3CB57F" />
        </svg>
      );
    }

    if (status === 'partial') {
      return (
        <svg className="w-2 h-2" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="4" fill="#FFA500" />
        </svg>
      );
    }

    if (status === 'down') {
      return (
        <svg className="w-2 h-2" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="4" fill="#FF4444" />
        </svg>
      );
    }

    // Loading spinner
    return (
      <svg className="w-2 h-2 text-foreground-tertiary animate-spin" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.25" />
        <path d="M4 1 A3 3 0 0 1 7 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
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
      {/* Header with Back and Refresh Buttons */}
      <div className="px-4 py-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-foreground-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="w-6 h-6 flex items-center justify-center focus:outline-none disabled:opacity-50"
        >
          <svg
            className="w-5 h-5 text-foreground-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
          </svg>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-foreground mb-4">{t('errors.diagnostics')}</p>
            <p className="text-foreground-tertiary text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="flex-1 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Node List */}
      {!isLoading && !error && (
        <div className="flex-1 overflow-auto px-4">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className="flex"
            >
              {/* Timeline column with bead and connecting line */}
              <div className="flex flex-col items-center mr-3 pt-[18px]">
                {/* Bead (status icon) */}
                <div className="flex-shrink-0">
                  {getStatusIcon(node.status)}
                </div>
                {/* Connecting line to next node */}
                {index < nodes.length - 1 && (
                  <div className="w-px flex-1 bg-neutral-300 dark:bg-neutral-600 mt-2 min-h-[24px]"></div>
                )}
              </div>

              {/* Node content */}
              <div className="flex-1 py-3">
                {/* Node Title */}
                <h3 className="text-base font-medium text-foreground leading-[22.4px] mb-[6px]">
                  {t(node.title)}
                </h3>

                {/* Node Details */}
                <div className="space-y-[6px]">
                  {node.details.map((detail, detailIndex) => (
                    detail.isIp ? (
                      <div
                        key={detailIndex}
                        onClick={() => handleCopyIp(detail.text)}
                        className={`${DNS_IP_TEXT_CLASS} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2`}
                      >
                        <span>{detail.text}</span>
                        {copiedIp === detail.text && (
                          <svg className="w-4 h-4 text-primary" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <p
                        key={detailIndex}
                        className="text-sm text-foreground-secondary leading-[19.6px]"
                      >
                        {detail.text}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="bg-background px-4 py-4 border-t border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <WaypointsIcon className="w-6 h-6" color="#3CB57F" />
          </button>

          <button
            onClick={onNavigateToSecurity}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <ShieldIcon className="w-6 h-6" color="#ADADAD" />
          </button>

          <button
            onClick={onNavigateToTools}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <WrenchIcon className="w-6 h-6" color="#ADADAD" />
          </button>

          <button
            onClick={onNavigateToSettings}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <SettingsIcon className="w-6 h-6" color="#ADADAD" />
          </button>
        </div>
      </nav>
    </div>
  );
}
