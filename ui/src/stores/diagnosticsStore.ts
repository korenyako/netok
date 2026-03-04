import { create } from 'zustand';
import {
  checkComputer,
  checkNetwork,
  checkRouter,
  checkInternet,
  lookupIpLocation,
  type SingleNodeResult,
  type NetworkInfo,
  type ComputerInfo,
  type RouterInfo,
  type InternetInfo,
  type DiagnosticScenario,
  type NodeStatus,
  type ConnectionType,
} from '../api/tauri';
import { useDemoStore } from './demoStore';

// Node detail for display
interface NodeDetail {
  text: string;
  isStatus?: boolean;
}

// UI representation of a network node
export interface NetworkNode {
  id: string;
  title: string;
  status: 'ok' | 'partial' | 'down' | 'loading';
  ip?: string;
  details: NodeDetail[];
}

// Store state
interface DiagnosticsState {
  // State
  nodes: NetworkNode[];
  isRunning: boolean;
  currentCheckIndex: number;
  lastUpdated: number | null;
  error: string | null;

  // Raw results for detail screens
  rawResults: Map<string, SingleNodeResult>;

  // Network info for StatusScreen
  networkInfo: NetworkInfo | null;

  // Debug scenario override (null = real diagnostics)
  scenarioOverride: DiagnosticScenario | null;
}

// Store actions
interface DiagnosticsActions {
  runDiagnostics: (t: (key: string) => string) => Promise<void>;
  updateNode: (node: NetworkNode) => void;
  reset: () => void;
  getRawResult: (nodeId: string) => SingleNodeResult | undefined;
  overrideScenario: (scenario: DiagnosticScenario, t: (key: string) => string) => void;
  overrideScenarioProgressive: (scenario: DiagnosticScenario, t: (key: string) => string) => Promise<void>;
  clearOverride: (t: (key: string) => string) => void;
  setLegacyWifi: (value: boolean) => void;
}

export type DiagnosticsStore = DiagnosticsState & DiagnosticsActions;

// Initial state
const initialState: DiagnosticsState = {
  nodes: [],
  isRunning: false,
  currentCheckIndex: -1,
  lastUpdated: null,
  error: null,
  rawResults: new Map(),
  networkInfo: null,
  scenarioOverride: null,
};

// Remove AS number prefix from ISP string
function cleanIspName(isp: string): string {
  return isp.replace(/^AS\d+\s+/, '');
}

// Transform a SingleNodeResult into a UI NetworkNode
function transformSingleNode(
  result: SingleNodeResult,
  t: (key: string) => string
): NetworkNode {
  const { node } = result;
  const details: NodeDetail[] = [];
  let ip: string | undefined;

  if (node.id === 'computer' && result.computer) {
    if (result.computer.adapter) {
      details.push({ text: result.computer.adapter });
    }
    ip = result.computer.local_ip ?? undefined;
  }

  if (node.id === 'network') {
    if (result.network) {
      if (result.network.ssid) {
        details.push({ text: result.network.ssid });
      }
      if (result.network.rssi !== null) {
        const rssi = result.network.rssi;
        let labelKey = '';
        if (rssi >= -50) {
          labelKey = 'nodes.network.signal_label_excellent';
        } else if (rssi >= -60) {
          labelKey = 'nodes.network.signal_label_good';
        } else if (rssi >= -70) {
          labelKey = 'nodes.network.signal_label_fair';
        } else {
          labelKey = 'nodes.network.signal_label_weak';
        }
        details.push({ text: t(labelKey) });
      }
    }
    if (details.length === 0 && node.status === 'down') {
      const ct = result.network?.connection_type;
      if (ct === 'Disabled') {
        details.push({ text: t('diagnostics.status_disabled'), isStatus: true });
      } else {
        details.push({ text: t('diagnostics.status_not_connected'), isStatus: true });
      }
    }
  }

  if (node.id === 'dns') {
    if (result.router) {
      if (result.router.vendor) {
        details.push({ text: result.router.vendor });
      }
      if (result.router.model) {
        details.push({ text: result.router.model });
      }
      ip = result.router.gateway_ip ?? undefined;
    }
    if (details.length === 0 && node.status === 'down') {
      if (result.router?.gateway_ip) {
        details.push({ text: t('diagnostics.status_unreachable'), isStatus: true });
      } else {
        details.push({ text: t('diagnostics.status_no_data'), isStatus: true });
      }
    }
  }

  if (node.id === 'internet') {
    if (result.internet) {
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
    if (details.length === 0 && node.status === 'down') {
      details.push({ text: t('diagnostics.status_no_connection'), isStatus: true });
    }
  }

  return {
    id: node.id,
    title: node.label,
    status: node.status,
    ip,
    details,
  };
}

// Update node in-place by id, or append if not found
function upsertNode(nodes: NetworkNode[], node: NetworkNode): NetworkNode[] {
  const idx = nodes.findIndex(n => n.id === node.id);
  if (idx >= 0) {
    const updated = [...nodes];
    updated[idx] = node;
    return updated;
  }
  return [...nodes, node];
}

// Node status map per scenario for synthetic data generation
const SCENARIO_NODE_STATUSES: Record<DiagnosticScenario, Record<string, NodeStatus>> = {
  all_good:           { computer: 'ok', network: 'ok', dns: 'ok', internet: 'ok' },
  wifi_disabled:      { computer: 'ok', network: 'down', dns: 'down', internet: 'down' },
  wifi_not_connected: { computer: 'ok', network: 'down', dns: 'down', internet: 'down' },
  weak_signal:        { computer: 'ok', network: 'partial', dns: 'ok', internet: 'ok' },
  router_unreachable: { computer: 'ok', network: 'ok', dns: 'down', internet: 'down' },
  no_internet:        { computer: 'ok', network: 'ok', dns: 'ok', internet: 'down' },
  dns_failure:        { computer: 'ok', network: 'ok', dns: 'ok', internet: 'partial' },
  http_blocked:       { computer: 'ok', network: 'ok', dns: 'ok', internet: 'partial' },
};

// Connection type for network node per scenario
const SCENARIO_CONNECTION_TYPE: Partial<Record<DiagnosticScenario, ConnectionType>> = {
  wifi_disabled: 'Disabled',
  wifi_not_connected: 'Disconnected',
};

// Build synthetic diagnostics data for a given scenario
function buildSyntheticResults(
  scenario: DiagnosticScenario,
  t: (key: string) => string,
): { nodes: NetworkNode[]; rawResults: Map<string, SingleNodeResult>; networkInfo: NetworkInfo | null } {
  const statuses = SCENARIO_NODE_STATUSES[scenario];
  const connectionType = SCENARIO_CONNECTION_TYPE[scenario] ?? 'Wifi';

  const nodeIds: Array<{ id: 'computer' | 'network' | 'dns' | 'internet'; labelKey: string }> = [
    { id: 'computer', labelKey: 'diagnostics.computer' },
    { id: 'network', labelKey: 'diagnostics.wifi' },
    { id: 'dns', labelKey: 'diagnostics.router' },
    { id: 'internet', labelKey: 'diagnostics.internet' },
  ];

  const nodes: NetworkNode[] = [];
  const rawResults = new Map<string, SingleNodeResult>();

  for (const { id, labelKey } of nodeIds) {
    const status = statuses[id];
    const label = t(labelKey);

    // Build minimal SingleNodeResult for ScenarioContext
    const raw: SingleNodeResult = {
      node: { id, label, status, latency_ms: status === 'ok' ? 12 : null, details: null },
      computer: id === 'computer' ? { hostname: 'Debug', model: null, adapter: 'Debug Adapter', local_ip: '192.168.1.100' } : null,
      network: id === 'network' ? {
        connection_type: connectionType,
        ssid: connectionType === 'Wifi' ? 'DebugNetwork' : null,
        rssi: status === 'partial' ? -78 : status === 'ok' ? -45 : null,
        signal_quality: null,
        channel: null,
        frequency: null,
        encryption: connectionType === 'Wifi' ? 'WPA2' : null,
        link_speed_mbps: null,
        wifi_standard: null,
        is_legacy_wifi: false,
      } : null,
      router: id === 'dns' ? { gateway_ip: statuses['network'] === 'down' ? null : '192.168.1.1', gateway_mac: null, vendor: null, model: null } : null,
      internet: id === 'internet' ? {
        public_ip: null, isp: null, country: null, city: null,
        dns_ok: scenario === 'http_blocked' ? true : status === 'ok',
        http_ok: status === 'ok',
        latency_ms: status === 'ok' ? 25 : null,
        speed_down_mbps: null,
        speed_up_mbps: null,
      } : null,
    };

    // Re-transform to pick up details (signal labels, etc.)
    nodes.push(transformSingleNode(raw, t));
    rawResults.set(id, raw);
  }

  const networkInfo: NetworkInfo | null = rawResults.get('network')?.network ?? null;
  return { nodes, rawResults, networkInfo };
}

// Build realistic demo diagnostics data for video/GIF recording
function buildDemoResults(
  scenario: DiagnosticScenario,
  t: (key: string) => string,
): { nodes: NetworkNode[]; rawResults: Map<string, SingleNodeResult>; networkInfo: NetworkInfo | null } {
  const statuses = SCENARIO_NODE_STATUSES[scenario];
  const connectionType = SCENARIO_CONNECTION_TYPE[scenario] ?? 'Wifi';
  const vpnConnected = useDemoStore.getState().vpnDemoScenario === 'vpn_connected';
  const networkDown = connectionType === 'Disabled' || connectionType === 'Disconnected';

  const computerInfo: ComputerInfo = {
    hostname: 'HONOR-LAPTOP',
    model: 'HONOR MagicBook X16',
    adapter: 'Intel Wi-Fi 6 AX201 160MHz',
    local_ip: '192.168.1.42',
  };

  const networkInfo: NetworkInfo = networkDown
    ? {
        connection_type: connectionType,
        ssid: null, rssi: null, signal_quality: null, channel: null,
        frequency: null, encryption: null, link_speed_mbps: null,
        wifi_standard: null, is_legacy_wifi: false,
      }
    : {
        connection_type: connectionType,
        ssid: 'Home_WiFi_5G',
        rssi: scenario === 'weak_signal' ? -78 : -35,
        signal_quality: scenario === 'weak_signal' ? 'Poor' : 'Excellent',
        channel: 36,
        frequency: '5 GHz',
        encryption: 'WPA2-Personal',
        link_speed_mbps: scenario === 'weak_signal' ? 54 : 866,
        wifi_standard: 'Wi-Fi 6 (802.11ax)',
        is_legacy_wifi: false,
      };

  const routerInfo: RouterInfo = networkDown
    ? { gateway_ip: null, gateway_mac: null, vendor: null, model: null }
    : { gateway_ip: '192.168.1.1', gateway_mac: 'B0:BE:76:A3:4F:12', vendor: 'TP-Link', model: 'Archer AX55' };

  const internetOk = statuses['internet'] === 'ok';
  const internetInfo: InternetInfo = (() => {
    if (scenario === 'no_internet' || networkDown) {
      return {
        public_ip: null, isp: null, country: null, city: null,
        dns_ok: false, http_ok: false, latency_ms: null,
        speed_down_mbps: null, speed_up_mbps: null,
      };
    }
    if (scenario === 'dns_failure') {
      return {
        public_ip: null, isp: null, country: null, city: null,
        dns_ok: false, http_ok: false, latency_ms: null,
        speed_down_mbps: null, speed_up_mbps: null,
      };
    }
    if (scenario === 'http_blocked') {
      return {
        public_ip: null, isp: null, country: null, city: null,
        dns_ok: true, http_ok: false, latency_ms: null,
        speed_down_mbps: null, speed_up_mbps: null,
      };
    }
    if (scenario === 'router_unreachable') {
      return {
        public_ip: null, isp: null, country: null, city: null,
        dns_ok: false, http_ok: false, latency_ms: null,
        speed_down_mbps: null, speed_up_mbps: null,
      };
    }
    // Internet is ok
    return {
      public_ip: vpnConnected ? '162.55.41.88' : '79.56.184.23',
      isp: vpnConnected ? 'Hetzner Online GmbH' : 'TIM S.p.A.',
      country: vpnConnected ? 'Germany' : 'Italy',
      city: vpnConnected ? 'Frankfurt' : 'Turin',
      dns_ok: true,
      http_ok: true,
      latency_ms: vpnConnected ? 24 : 14,
      speed_down_mbps: null,
      speed_up_mbps: null,
    };
  })();

  const nodeIds: Array<{ id: 'computer' | 'network' | 'dns' | 'internet'; labelKey: string }> = [
    { id: 'computer', labelKey: 'diagnostics.computer' },
    { id: 'network', labelKey: 'diagnostics.wifi' },
    { id: 'dns', labelKey: 'diagnostics.router' },
    { id: 'internet', labelKey: 'diagnostics.internet' },
  ];

  const nodes: NetworkNode[] = [];
  const rawResults = new Map<string, SingleNodeResult>();

  for (const { id, labelKey } of nodeIds) {
    const status = statuses[id];
    const label = t(labelKey);

    const raw: SingleNodeResult = {
      node: { id, label, status, latency_ms: internetOk && id === 'internet' ? (vpnConnected ? 24 : 14) : (status === 'ok' ? 12 : null), details: null },
      computer: id === 'computer' ? computerInfo : null,
      network: id === 'network' ? networkInfo : null,
      router: id === 'dns' ? routerInfo : null,
      internet: id === 'internet' ? internetInfo : null,
    };

    nodes.push(transformSingleNode(raw, t));
    rawResults.set(id, raw);
  }

  return { nodes, rawResults, networkInfo: rawResults.get('network')?.network ?? null };
}

// Run ID for cancellation
let runIdCounter = 0;

// Progressive override run ID (separate counter to avoid conflicts with real diagnostics)
let progressiveRunId = 0;

export const useDiagnosticsStore = create<DiagnosticsStore>((set, get) => ({
  ...initialState,

  runDiagnostics: async (t: (key: string) => string) => {
    const thisRunId = ++runIdCounter;
    const stale = () => runIdCounter !== thisRunId;

    // Start running - clear nodes so they appear one by one
    set({
      nodes: [],
      rawResults: new Map(),
      isRunning: true,
      currentCheckIndex: 0,
      error: null,
    });

    try {
      // Step 0: Computer (must run first — adapter needed by Network)
      const computerResult = await checkComputer();
      if (stale()) return;

      const computerNode = transformSingleNode(computerResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(computerResult.node.id, computerResult);
        return {
          nodes: upsertNode(state.nodes, computerNode),
          rawResults: newRawResults,
          currentCheckIndex: 1,
        };
      });

      // Step 1+2: Network and Router in parallel (both depend only on adapter)
      const adapter = computerResult.computer?.adapter ?? null;
      const [networkResult, routerResult] = await Promise.all([
        checkNetwork(adapter),
        checkRouter(),
      ]);
      if (stale()) return;

      const networkNode = transformSingleNode(networkResult, t);
      const routerNode = transformSingleNode(routerResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(networkResult.node.id, networkResult);
        newRawResults.set(routerResult.node.id, routerResult);
        // Enrich computer rawResult with network info (for bandwidth on detail screen)
        const computerRaw = newRawResults.get('computer');
        if (computerRaw && networkResult.network) {
          newRawResults.set('computer', { ...computerRaw, network: networkResult.network });
        }
        let nodes = upsertNode(state.nodes, networkNode);
        nodes = upsertNode(nodes, routerNode);
        return {
          nodes,
          rawResults: newRawResults,
          currentCheckIndex: 3,
          networkInfo: networkResult.network,
        };
      });

      // Step 3: Internet (DNS + HTTP, no geo — fast)
      const internetResult = await checkInternet();
      if (stale()) return;

      const internetNode = transformSingleNode(internetResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(internetResult.node.id, internetResult);
        return {
          nodes: upsertNode(state.nodes, internetNode),
          rawResults: newRawResults,
          currentCheckIndex: 4,
          isRunning: false,
          lastUpdated: Date.now(),
        };
      });

      // Background: fetch geo-info (ISP, city, public IP) without blocking status
      if (internetResult.internet?.http_ok) {
        // Fire-and-forget — enriches the internet node card when data arrives
        lookupIpLocation('').then((geo) => {
          if (stale()) return;
          set((state) => {
            const raw = state.rawResults.get('internet');
            if (!raw?.internet) return state;
            // Enrich the raw result with geo data
            const enrichedInternet = {
              ...raw.internet,
              public_ip: geo.ip ?? raw.internet.public_ip,
              isp: geo.org ?? raw.internet.isp,
              country: geo.country ?? raw.internet.country,
              city: geo.city ?? raw.internet.city,
            };
            const enrichedResult: SingleNodeResult = {
              ...raw,
              internet: enrichedInternet,
            };
            const enrichedNode = transformSingleNode(enrichedResult, t);
            const newRawResults = new Map(state.rawResults);
            newRawResults.set('internet', enrichedResult);
            return {
              nodes: upsertNode(state.nodes, enrichedNode),
              rawResults: newRawResults,
            };
          });
        }).catch(() => { /* geo-lookup failure is non-critical */ });
      }
    } catch (err) {
      if (stale()) return;
      console.error('Failed to run diagnostics:', err);
      set({
        error: err instanceof Error ? err.message : 'Unknown error',
        currentCheckIndex: 4,
        isRunning: false,
        lastUpdated: Date.now(),
      });
    }
  },

  updateNode: (node: NetworkNode) => {
    set((state) => {
      const existingIndex = state.nodes.findIndex((n) => n.id === node.id);
      if (existingIndex >= 0) {
        const newNodes = [...state.nodes];
        newNodes[existingIndex] = node;
        return { nodes: newNodes };
      }
      return { nodes: [...state.nodes, node] };
    });
  },

  reset: () => {
    set(initialState);
  },

  getRawResult: (nodeId: string) => {
    return get().rawResults.get(nodeId);
  },

  overrideScenario: (scenario: DiagnosticScenario, t: (key: string) => string) => {
    const builder = useDemoStore.getState().isDemoMode ? buildDemoResults : buildSyntheticResults;
    const { nodes, rawResults, networkInfo } = builder(scenario, t);
    set({
      scenarioOverride: scenario,
      nodes,
      rawResults,
      networkInfo,
      isRunning: false,
      currentCheckIndex: 4,
      lastUpdated: Date.now(),
      error: null,
    });
  },

  overrideScenarioProgressive: async (scenario: DiagnosticScenario, t: (key: string) => string) => {
    const thisRunId = ++progressiveRunId;
    const stale = () => progressiveRunId !== thisRunId;

    const builder = useDemoStore.getState().isDemoMode ? buildDemoResults : buildSyntheticResults;
    const { nodes: finalNodes, rawResults: finalRawResults, networkInfo } = builder(scenario, t);

    // Start: clear everything, show loading
    set({
      scenarioOverride: scenario,
      nodes: [],
      rawResults: new Map(),
      isRunning: true,
      currentCheckIndex: 0,
      error: null,
      networkInfo: null,
    });

    const delays = [300, 500, 400, 600]; // computer, network, dns, internet
    const nodeIds = ['computer', 'network', 'dns', 'internet'];

    for (let i = 0; i < nodeIds.length; i++) {
      await new Promise((r) => setTimeout(r, delays[i]));
      if (stale()) return;

      const nodeId = nodeIds[i];
      const node = finalNodes.find((n) => n.id === nodeId);
      const raw = finalRawResults.get(nodeId);
      if (node && raw) {
        const isLast = i === nodeIds.length - 1;
        set((state) => {
          const newRawResults = new Map(state.rawResults);
          newRawResults.set(nodeId, raw);
          return {
            nodes: upsertNode(state.nodes, node),
            rawResults: newRawResults,
            currentCheckIndex: i + 1,
            ...(isLast ? { isRunning: false, lastUpdated: Date.now(), networkInfo } : {}),
          };
        });
      }
    }
  },

  clearOverride: (t: (key: string) => string) => {
    set({ scenarioOverride: null });
    get().runDiagnostics(t);
  },

  setLegacyWifi: (value: boolean) => {
    const info = get().networkInfo;
    if (info) {
      set({ networkInfo: { ...info, is_legacy_wifi: value } });
    }
  },
}));

// Selector for checking if diagnostics should auto-refresh
export const shouldRefreshDiagnostics = (lastUpdated: number | null): boolean => {
  if (lastUpdated === null) return true;
  const thirtySecondsAgo = Date.now() - 30_000;
  return lastUpdated < thirtySecondsAgo;
};

// Derive overall status color from diagnostic nodes
export type StatusColor = 'success' | 'warning' | 'error' | 'loading';

export function getStatusColor(nodes: { status: string }[], _isRunning: boolean): StatusColor {
  if (nodes.length === 0) return 'loading';
  if (nodes.some(n => n.status === 'down')) return 'error';
  if (nodes.some(n => n.status === 'partial')) return 'warning';
  return 'success';
}

export const STATUS_TEXT_CLASS: Record<StatusColor, string> = {
  loading: 'text-foreground hover:text-foreground',
  success: 'text-primary hover:text-primary',
  warning: 'text-warning hover:text-warning',
  error: 'text-destructive hover:text-destructive',
};

// Derive network availability level from current diagnostic nodes
export type NetworkAvailability = 'full' | 'local_only' | 'no_network';

export function getNetworkAvailability(nodes: NetworkNode[]): NetworkAvailability {
  if (nodes.length === 0) return 'full'; // Not yet diagnosed — don't block

  const network = nodes.find(n => n.id === 'network');
  const router = nodes.find(n => n.id === 'dns');
  const internet = nodes.find(n => n.id === 'internet');

  if (network?.status === 'down' || router?.status === 'down') {
    return 'no_network';
  }
  if (internet?.status === 'down' || internet?.status === 'partial') {
    return 'local_only';
  }
  return 'full';
}
