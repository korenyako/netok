import { create } from 'zustand';
import {
  checkComputer,
  checkNetwork,
  checkRouter,
  checkInternet,
} from '../api/network';
import type { SingleNodeResult, NetworkInfo } from '../api/types';

interface NodeDetail {
  text: string;
}

export interface NetworkNode {
  id: string;
  title: string;
  status: 'ok' | 'partial' | 'down' | 'loading';
  ip?: string;
  details: NodeDetail[];
}

interface DiagnosticsState {
  nodes: NetworkNode[];
  isRunning: boolean;
  currentCheckIndex: number;
  lastUpdated: number | null;
  error: string | null;
  rawResults: Map<string, SingleNodeResult>;
  networkInfo: NetworkInfo | null;
}

interface DiagnosticsActions {
  runDiagnostics: (t: (key: string) => string) => Promise<void>;
  reset: () => void;
  getRawResult: (nodeId: string) => SingleNodeResult | undefined;
}

export type DiagnosticsStore = DiagnosticsState & DiagnosticsActions;

const initialState: DiagnosticsState = {
  nodes: [],
  isRunning: false,
  currentCheckIndex: -1,
  lastUpdated: null,
  error: null,
  rawResults: new Map(),
  networkInfo: null,
};

function cleanIspName(isp: string): string {
  return isp.replace(/^AS\d+\s+/, '');
}

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

function upsertNode(nodes: NetworkNode[], node: NetworkNode): NetworkNode[] {
  const idx = nodes.findIndex(n => n.id === node.id);
  if (idx >= 0) {
    const updated = [...nodes];
    updated[idx] = node;
    return updated;
  }
  return [...nodes, node];
}

let runIdCounter = 0;

export const useDiagnosticsStore = create<DiagnosticsStore>((set, get) => ({
  ...initialState,

  runDiagnostics: async (t: (key: string) => string) => {
    const thisRunId = ++runIdCounter;
    const stale = () => runIdCounter !== thisRunId;

    set({
      nodes: [],
      rawResults: new Map(),
      isRunning: true,
      currentCheckIndex: 0,
      error: null,
    });

    try {
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

      const adapter = computerResult.computer?.adapter ?? null;
      const networkResult = await checkNetwork(adapter);
      if (stale()) return;

      const networkNode = transformSingleNode(networkResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(networkResult.node.id, networkResult);
        return {
          nodes: upsertNode(state.nodes, networkNode),
          rawResults: newRawResults,
          currentCheckIndex: 2,
          networkInfo: networkResult.network,
        };
      });

      const routerResult = await checkRouter();
      if (stale()) return;

      const routerNode = transformSingleNode(routerResult, t);
      set((state) => {
        const newRawResults = new Map(state.rawResults);
        newRawResults.set(routerResult.node.id, routerResult);
        return {
          nodes: upsertNode(state.nodes, routerNode),
          rawResults: newRawResults,
          currentCheckIndex: 3,
        };
      });

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

  reset: () => {
    set(initialState);
  },

  getRawResult: (nodeId: string) => {
    return get().rawResults.get(nodeId);
  },
}));

export const shouldRefreshDiagnostics = (lastUpdated: number | null): boolean => {
  if (lastUpdated === null) return true;
  const thirtySecondsAgo = Date.now() - 30_000;
  return lastUpdated < thirtySecondsAgo;
};
