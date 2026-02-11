import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { connectVpn, disconnectVpn, getVpnStatus, lookupIpLocation, type VpnConnectionState } from '../api/tauri';
import { listen } from '@tauri-apps/api/event';
import { extractServerHost } from '../utils/vpnUri';

export interface VpnConfig {
  protocol: string;
  serverHost: string;
  country: string;
  city: string;
  ping: number;
  rawKey: string;
}

interface VpnState {
  config: VpnConfig | null;
  connectionState: VpnConnectionState;
  setConfig: (config: VpnConfig | null) => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useVpnStore = create<VpnState>()(
  persist(
    (set, get) => ({
      config: null,
      connectionState: { type: 'disconnected' },
      setConfig: (config: VpnConfig | null) => set({ config }),
      connect: async () => {
        const { config } = get();
        if (!config) return;
        set({ connectionState: { type: 'connecting' } });
        try {
          await connectVpn(config.rawKey);
          const status = await getVpnStatus();
          set({ connectionState: status.state });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          if (message.includes('elevation') || message.includes('cancelled')) {
            set({ connectionState: { type: 'elevation_denied' } });
          } else {
            set({ connectionState: { type: 'error', message } });
          }
        }
      },
      disconnect: async () => {
        set({ connectionState: { type: 'disconnecting' } });
        try {
          await disconnectVpn();
          set({ connectionState: { type: 'disconnected' } });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          set({ connectionState: { type: 'error', message } });
        }
      },
      refreshStatus: async () => {
        try {
          const status = await getVpnStatus();
          set({ connectionState: status.state });
        } catch {
          // Ignore refresh errors
        }
      },
    }),
    {
      name: 'vpn-storage',
      version: 2,
      partialize: (state) => ({ config: state.config }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as { config: VpnConfig | null };
        if (version < 2 && state.config && !state.config.serverHost) {
          state.config.serverHost = extractServerHost(state.config.rawKey) || '';
        }
        return state;
      },
    }
  )
);

// Listen for VPN state changes from backend (process crash detection)
listen<VpnConnectionState>('vpn-state-changed', (event) => {
  useVpnStore.setState({ connectionState: event.payload });
});

// Lazy GeoIP lookup: if config has serverHost but no location, fill it in
useVpnStore.persist.onFinishHydration((state) => {
  const { config } = state;
  if (config?.serverHost && !config.country && !config.city) {
    lookupIpLocation(config.serverHost).then((location) => {
      const country = location.country ?? '';
      const city = location.city ?? '';
      if (country || city) {
        const current = useVpnStore.getState().config;
        if (current && current.rawKey === config.rawKey) {
          useVpnStore.setState({ config: { ...current, country, city } });
        }
      }
    }).catch(() => { /* ignore */ });
  }
});
