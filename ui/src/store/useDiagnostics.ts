import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Snapshot } from "../types/diagnostics";

export type OverallStatus = 'ok' | 'partial' | 'down' | 'checking';

export interface NetworkInfo {
  type: 'wifi' | 'cable' | 'usb_modem' | 'bt' | 'mobile';
  signal?: {
    level: 'excellent' | 'good' | 'fair' | 'weak';
    dbm: number;
  };
  link?: boolean;
}

export interface ComputerInfo {
  hostname?: string;
  model?: string;
  adapter?: string;
  local_ip?: string;
}

export interface RouterInfo {
  model?: string;
  brand?: string;
  localIp: string;
}

export interface InternetInfo {
  provider?: string;
  publicIp: string;
  country?: string;
  city?: string;
}

export interface SpeedInfo {
  down: number;
  up: number;
}

export interface DiagnosticsData {
  overall: OverallStatus;
  computer: ComputerInfo | null;
  network: NetworkInfo;
  router: RouterInfo;
  internet: InternetInfo;
  speed?: SpeedInfo;
  vpnDetected: boolean;
  geoConsent: boolean;
  updatedAt: number;
}

// Alias for clarity
export type DiagnosticsSnapshot = DiagnosticsData;

interface DiagnosticsStore {
  snapshot: DiagnosticsSnapshot | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

// Convert Rust Snapshot to DiagnosticsData format
const convertSnapshot = (rustSnapshot: Snapshot): DiagnosticsData => {
  return {
    overall: 'ok', // TODO: Parse from Rust snapshot when available
    computer: rustSnapshot.computer ? {
      hostname: rustSnapshot.computer.hostname || undefined,
      model: rustSnapshot.computer.model || undefined,
      adapter: rustSnapshot.computer.adapter || undefined,
      local_ip: rustSnapshot.computer.localIp || undefined,
    } : null,
    network: {
      type: 'wifi', // TODO: Parse from Rust snapshot when available
      signal: {
        level: 'excellent',
        dbm: -45
      }
    },
    router: {
      model: rustSnapshot.router?.model ?? "",
      brand: rustSnapshot.router?.brand ?? "",
      localIp: rustSnapshot.router?.localIp ?? ""
    },
    internet: {
      provider: rustSnapshot.internet?.operator ?? "",
      publicIp: rustSnapshot.internet?.publicIp ?? "",
      country: rustSnapshot.internet?.geolocation?.country || undefined,
      city: rustSnapshot.internet?.geolocation?.city || undefined
    },
    speed: {
      down: 999,
      up: 999
    },
    vpnDetected: false,
    geoConsent: true,
    updatedAt: Date.now()
  };
};

export const useDiagnostics = create<DiagnosticsStore>((set, get) => ({
  snapshot: null,
  lastUpdated: null,
  isLoading: false,
  error: undefined,

  refresh: async () => {
    console.log('[refresh] start');

    if (get().isLoading) {
      console.log('[refresh] already loading, skipping');
      return;
    }

    set({ isLoading: true, error: undefined });

    try {
      // Check if mock mode is enabled
      const useMock = import.meta.env.VITE_USE_MOCK === "1";
      
      // Get snapshot data (mock or real)
      const rustSnapshot = useMock
        ? (await import("../mocks/snapshot.json")).default as Snapshot
        : await invoke<Snapshot>("get_snapshot");
      
      // Convert Rust format to expected UI format
      const diagnosticsData = convertSnapshot(rustSnapshot);

      set({
        snapshot: diagnosticsData,
        lastUpdated: new Date(),
      });

      console.log('[refresh] success');
    } catch (e: any) {
      console.error('[refresh] failed', e);
      set({ error: String(e) });
      // keep previous snapshot and lastUpdated on error
    } finally {
      set({ isLoading: false });
      console.log('[refresh] end');
    }
  },
}));