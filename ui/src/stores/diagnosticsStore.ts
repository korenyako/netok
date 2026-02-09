import { create } from 'zustand';
import {
  checkComputer,
  checkNetwork,
  checkRouter,
  checkInternet,
  type SingleNodeResult,
  type NetworkInfo,
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
}

// Store actions
interface DiagnosticsActions {
  runDiagnostics: (t: (key: string) => string) => Promise<void>;
  updateNode: (node: NetworkNode) => void;
  reset: () => void;
  getRawResult: (nodeId: string) => SingleNodeResult | undefined;
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

// Run ID for cancellation
let runIdCounter = 0;

export const useDiagnosticsStore = create<DiagnosticsStore>((set, get) => ({
  ...initialState,

  runDiagnostics: async (t: (key: string) => string) => {
    const thisRunId = ++runIdCounter;
    const stale = () => runIdCounter !== thisRunId;

    // Start running - preserve previous nodes/networkInfo until new data arrives
    set({
      isRunning: true,
      currentCheckIndex: 0,
      error: null,
    });

    try {
      // Step 0: Computer
      const computerResult = await checkComputer();
      if (stale()) return;

      const computerNode = transformSingleNode(computerResult, t);
      set(() => {
        // Clear old data when first new result arrives
        const newRawResults = new Map<string, SingleNodeResult>();
        newRawResults.set(computerResult.node.id, computerResult);
        return {
          nodes: [computerNode],
          rawResults: newRawResults,
          networkInfo: null,
          currentCheckIndex: 1,
        };
      });

      // Step 1: Network (depends on computer's adapter)
      const adapter = computerResult.computer?.adapter ?? null;
      const networkResult = await checkNetwork(adapter);
      if (stale()) return;

      const networkNode = transformSingleNode(networkResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(networkResult.node.id, networkResult);
        return {
          nodes: [...state.nodes, networkNode],
          rawResults: newRawResults,
          currentCheckIndex: 2,
          networkInfo: networkResult.network,
        };
      });

      // Step 2: Router
      const routerResult = await checkRouter();
      if (stale()) return;

      const routerNode = transformSingleNode(routerResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(routerResult.node.id, routerResult);
        return {
          nodes: [...state.nodes, routerNode],
          rawResults: newRawResults,
          currentCheckIndex: 3,
        };
      });

      // Step 3: Internet
      const internetResult = await checkInternet();
      if (stale()) return;

      const internetNode = transformSingleNode(internetResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(internetResult.node.id, internetResult);
        return {
          nodes: [...state.nodes, internetNode],
          rawResults: newRawResults,
          currentCheckIndex: 4,
          isRunning: false,
          lastUpdated: Date.now(),
        };
      });
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
}));

// Selector for checking if diagnostics should auto-refresh
export const shouldRefreshDiagnostics = (lastUpdated: number | null): boolean => {
  if (lastUpdated === null) return true;
  const thirtySecondsAgo = Date.now() - 30_000;
  return lastUpdated < thirtySecondsAgo;
};
