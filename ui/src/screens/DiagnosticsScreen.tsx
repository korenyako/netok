import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from '../components/icons/NavigationIcons';
import { runDiagnostics, type NodeResult } from '../api/tauri';

interface NetworkNode {
  id: string;
  title: string;
  status: 'ok' | 'partial' | 'down' | 'loading';
  details: string[];
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

  // Helper function to remove AS number from ISP string
  const cleanIspName = (isp: string): string => {
    // Remove "AS12345 " prefix if present
    return isp.replace(/^AS\d+\s+/, '');
  };

  useEffect(() => {
    const fetchDiagnostics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const snapshot = await runDiagnostics();

        // Transform API data to UI format
        const transformedNodes: NetworkNode[] = snapshot.nodes.map((node: NodeResult) => {
          const details: string[] = [];

          // Add computer-specific details (matching screenshot format)
          if (node.id === 'computer' && snapshot.computer) {
            // First: Local IP
            if (snapshot.computer.local_ip) details.push(snapshot.computer.local_ip);
            // Second: Adapter name
            if (snapshot.computer.adapter) details.push(snapshot.computer.adapter);
          }

          // Add network-specific details (matching screenshot format for Wi-Fi)
          if (node.id === 'network' && snapshot.network) {
            // First: SSID (for Wi-Fi) without prefix
            if (snapshot.network.ssid) {
              details.push(snapshot.network.ssid);
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

              details.push(`${t('nodes.network.signal_field')} ${t(qualityKey)} (${rssi} dBm)`);
            }
          }

          // Add router-specific details (matching screenshot format)
          if (node.id === 'dns' && snapshot.router) {
            // First: Gateway IP (without "Gateway:" prefix to match screenshot)
            if (snapshot.router.gateway_ip) details.push(snapshot.router.gateway_ip);
            // Second: Vendor/Model
            if (snapshot.router.vendor) details.push(snapshot.router.vendor);
            if (snapshot.router.model) details.push(snapshot.router.model);
          }

          // Add internet-specific details (matching screenshot format)
          if (node.id === 'internet' && snapshot.internet) {
            // First: Public IP (without "IP:" prefix)
            if (snapshot.internet.public_ip) details.push(snapshot.internet.public_ip);
            // Second: ISP/Provider (without AS number)
            if (snapshot.internet.isp) details.push(cleanIspName(snapshot.internet.isp));
            // Third: City, Country
            if (snapshot.internet.city && snapshot.internet.country) {
              details.push(`${snapshot.internet.city}, ${snapshot.internet.country}`);
            } else if (snapshot.internet.country) {
              details.push(snapshot.internet.country);
            } else if (snapshot.internet.city) {
              details.push(snapshot.internet.city);
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
        const details: string[] = [];

        if (node.id === 'computer' && snapshot.computer) {
          if (snapshot.computer.local_ip) details.push(snapshot.computer.local_ip);
          if (snapshot.computer.adapter) details.push(snapshot.computer.adapter);
        }

        if (node.id === 'network' && snapshot.network) {
          if (snapshot.network.ssid) {
            details.push(snapshot.network.ssid);
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

            details.push(`${t('nodes.network.signal_field')} ${t(qualityKey)} (${rssi} dBm)`);
          }
        }

        if (node.id === 'dns' && snapshot.router) {
          if (snapshot.router.gateway_ip) details.push(snapshot.router.gateway_ip);
          if (snapshot.router.vendor) details.push(snapshot.router.vendor);
          if (snapshot.router.model) details.push(snapshot.router.model);
        }

        if (node.id === 'internet' && snapshot.internet) {
          if (snapshot.internet.public_ip) details.push(snapshot.internet.public_ip);
          if (snapshot.internet.isp) details.push(cleanIspName(snapshot.internet.isp));
          if (snapshot.internet.city && snapshot.internet.country) {
            details.push(`${snapshot.internet.city}, ${snapshot.internet.country}`);
          } else if (snapshot.internet.country) {
            details.push(snapshot.internet.country);
          } else if (snapshot.internet.city) {
            details.push(snapshot.internet.city);
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
            className={`w-5 h-5 text-foreground-tertiary ${isLoading ? 'animate-spin' : ''}`}
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
        <div className="flex-1 overflow-auto px-4 space-y-0">
          {nodes.map((node, index) => (
            <div
              key={node.id}
              className={`rounded-[12px] p-4 hover:bg-background-hover transition-colors cursor-pointer ${index < nodes.length - 1 ? 'mb-0' : ''}`}
            >
              {/* Node Title with Icon */}
              <div className="flex items-center gap-2 mb-[6px]">
                {getStatusIcon(node.status)}
                <h3 className="text-base font-medium text-foreground leading-[22.4px]">
                  {t(node.title)}
                </h3>
              </div>

              {/* Node Details */}
              <div className="pl-4 space-y-[6px]">
                {node.details.map((detail, detailIndex) => (
                  <p key={detailIndex} className="text-sm text-foreground-secondary leading-[19.6px]">
                    {detail}
                  </p>
                ))}
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
