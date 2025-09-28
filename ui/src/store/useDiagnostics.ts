import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Snapshot } from "../types/diagnostics";
import { useSettings } from "./useSettings";

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
  interface_name?: string;
  adapter_friendly?: string;
  adapter_model?: string;
  connection_type: 'wifi' | 'ethernet' | 'usb_modem' | 'tethering' | 'vpn' | 'unknown';
  local_ip?: string;
  rssi_dbm?: number;
  wifi_ssid?: string;
  wifi_bssid?: string;
  oper_up: boolean;
}

export interface RouterInfo {
  local_ip?: string;
}

export interface InternetInfo {
  provider?: string;
  public_ip?: string;
  operator?: string;
  country?: string;
  city?: string;
  reachable?: boolean;
}

export interface SpeedInfo {
  down: number;
  up: number;
}

export interface DiagnosticsData {
  overall: OverallStatus;
  computer: ComputerInfo | null;
  network: NetworkInfo;
  router: RouterInfo | null;
  internet: InternetInfo | null;
  speed?: SpeedInfo;
  vpnDetected: boolean;
  geoConsent: boolean;
  updatedAt: number;
  rawSnapshot?: string; // For debug display
  connectivity: 'offline' | 'no_router' | 'captive_or_no_dns' | 'online' | 'unknown';
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
      interface_name: rustSnapshot.computer.interface_name || undefined,
      adapter_friendly: rustSnapshot.computer.adapter_friendly || undefined,
      adapter_model: rustSnapshot.computer.adapter_model || undefined,
      connection_type: rustSnapshot.computer.connection_type || 'unknown',
      local_ip: rustSnapshot.computer.local_ip || undefined,
      rssi_dbm: rustSnapshot.computer.rssi_dbm || undefined,
      wifi_ssid: rustSnapshot.computer.wifi_ssid || undefined,
      wifi_bssid: rustSnapshot.computer.wifi_bssid || undefined,
      oper_up: rustSnapshot.computer.oper_up || false,
    } : null,
    network: {
      type: rustSnapshot.computer.connection_type === 'wifi' ? 'wifi' : 'cable',
      signal: rustSnapshot.computer.connection_type === 'wifi' && rustSnapshot.computer.rssi_dbm ? {
        level: 'excellent', // TODO: Calculate based on RSSI
        dbm: rustSnapshot.computer.rssi_dbm
      } : undefined,
      link: rustSnapshot.computer.oper_up
    },
    router: rustSnapshot.router ? {
      local_ip: rustSnapshot.router.local_ip || undefined,
    } : null,
    internet: rustSnapshot.internet ? {
      provider: rustSnapshot.internet.provider || undefined,
      public_ip: rustSnapshot.internet.public_ip || undefined,
      operator: rustSnapshot.internet.operator || undefined,
      country: rustSnapshot.internet.country || undefined,
      city: rustSnapshot.internet.city || undefined,
      reachable: rustSnapshot.internet.reachable,
    } : null,
    speed: undefined, // TODO: Implement speed test
    vpnDetected: false, // TODO: Implement VPN detection
    geoConsent: true,
    updatedAt: Date.now(),
    connectivity: rustSnapshot.connectivity || 'unknown',
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
      
      let rustSnapshot: Snapshot;
      let rawSnapshot: string;
      
      if (useMock) {
        rustSnapshot = (await import("../mocks/snapshot.json")).default as Snapshot;
        rawSnapshot = JSON.stringify(rustSnapshot, null, 2);
      } else {
        // Get current geo setting from store
        const geoEnabled = useSettings.getState().geoEnabled;
        
        // Get raw JSON for debug
        rawSnapshot = await invoke<string>("get_snapshot_json_debug", { geoEnabled });
        console.log("[Netok] Snapshot:", rawSnapshot);
        
        // Parse the JSON
        rustSnapshot = JSON.parse(rawSnapshot);
      }
      
      // Convert Rust format to expected UI format
      const diagnosticsData = convertSnapshot(rustSnapshot);
      diagnosticsData.rawSnapshot = rawSnapshot;

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