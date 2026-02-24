import { create } from 'zustand';
import {
  checkComputer,
  checkNetwork,
  checkRouter,
  checkInternet,
  lookupIpLocation,
  type SingleNodeResult,
  type NetworkInfo,
  type DiagnosticScenario,
  type NodeStatus,
  type ConnectionType,
} from '../api/tauri';

// Node detail for display
interface NodeDetail {
  text: string;
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
  clearOverride: (t: (key: string) => string) => void;
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

  if (node.id === 'network' && result.network) {
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
      } : null,
      router: id === 'dns' ? { gateway_ip: '192.168.1.1', gateway_mac: null, vendor: null, model: null } : null,
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

// Run ID for cancellation
let runIdCounter = 0;

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
    const { nodes, rawResults, networkInfo } = buildSyntheticResults(scenario, t);
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

  clearOverride: (t: (key: string) => string) => {
    set({ scenarioOverride: null });
    get().runDiagnostics(t);
  },
}));

// Selector for checking if diagnostics should auto-refresh
export const shouldRefreshDiagnostics = (lastUpdated: number | null): boolean => {
  if (lastUpdated === null) return true;
  const thirtySecondsAgo = Date.now() - 30_000;
  return lastUpdated < thirtySecondsAgo;
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
