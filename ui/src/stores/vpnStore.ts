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
  // Persisted
  configs: VpnConfig[];
  activeIndex: number | null;

  // Runtime (not persisted)
  connectionState: VpnConnectionState;
  lastAction: 'connect' | 'disconnect' | null;
  editingIndex: number | null;

  // Actions
  addConfig: (config: VpnConfig) => void;
  updateConfig: (index: number, config: VpnConfig) => void;
  removeConfig: (index: number) => void;
  setActiveIndex: (index: number | null) => void;
  setEditingIndex: (index: number | null) => void;
  hasDuplicateHost: (serverHost: string, excludeIndex?: number) => boolean;
  connectByIndex: (index: number) => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

export const useVpnStore = create<VpnState>()(
  persist(
    (set, get) => ({
      configs: [],
      activeIndex: null,
      connectionState: { type: 'disconnected' },
      lastAction: null,
      editingIndex: null,

      addConfig: (config) => {
        set((state) => ({ configs: [...state.configs, config] }));
      },

      updateConfig: (index, config) => {
        set((state) => {
          const configs = [...state.configs];
          configs[index] = config;
          return { configs };
        });
      },

      removeConfig: (index) => {
        const { activeIndex, connectionState } = get();
        const wasActive = activeIndex === index;

        // If removing the active and connected config, disconnect
        if (wasActive && (connectionState.type === 'connected' || connectionState.type === 'connecting')) {
          get().disconnect();
        }

        set((state) => {
          const configs = state.configs.filter((_, i) => i !== index);
          let newActiveIndex = state.activeIndex;
          if (wasActive) {
            newActiveIndex = null;
          } else if (newActiveIndex !== null && newActiveIndex > index) {
            newActiveIndex = newActiveIndex - 1;
          }
          return { configs, activeIndex: newActiveIndex };
        });
      },

      setActiveIndex: (index) => set({ activeIndex: index }),
      setEditingIndex: (index) => set({ editingIndex: index }),

      hasDuplicateHost: (serverHost, excludeIndex) => {
        const { configs } = get();
        return configs.some((c, i) => i !== excludeIndex && c.serverHost === serverHost);
      },

      connectByIndex: async (index) => {
        const config = get().configs[index];
        if (!config) return;
        set({ activeIndex: index, connectionState: { type: 'connecting' }, lastAction: 'connect' });
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

      connect: async () => {
        const { configs, activeIndex } = get();
        if (activeIndex === null || !configs[activeIndex]) return;
        const config = configs[activeIndex];
        set({ connectionState: { type: 'connecting' }, lastAction: 'connect' });
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
        set({ connectionState: { type: 'disconnecting' }, lastAction: 'disconnect' });
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
      version: 3,
      partialize: (state) => ({ configs: state.configs, activeIndex: state.activeIndex }),
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;

        // v1 → v2: add serverHost to existing config
        if (version < 2) {
          const config = state.config as VpnConfig | null;
          if (config && !config.serverHost) {
            config.serverHost = extractServerHost(config.rawKey) || '';
          }
          state.config = config;
        }

        // v2 → v3: single config → configs array
        if (version < 3) {
          const oldConfig = state.config as VpnConfig | null;
          state.configs = oldConfig ? [oldConfig] : [];
          state.activeIndex = null;
          delete state.config;
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

// Lazy GeoIP lookup: fill in missing location data for all configs
useVpnStore.persist.onFinishHydration((state) => {
  state.configs.forEach((config, index) => {
    if (config.serverHost && !config.country && !config.city) {
      lookupIpLocation(config.serverHost).then((location) => {
        const country = location.country ?? '';
        const city = location.city ?? '';
        if (country || city) {
          const current = useVpnStore.getState().configs[index];
          if (current && current.rawKey === config.rawKey) {
            const updatedConfigs = [...useVpnStore.getState().configs];
            updatedConfigs[index] = { ...current, country, city };
            useVpnStore.setState({ configs: updatedConfigs });
          }
        }
      }).catch(() => { /* ignore */ });
    }
  });
});
