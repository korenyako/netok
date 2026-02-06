import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VpnConfig {
  protocol: string;
  country: string;
  city: string;
  ping: number;
  rawKey: string;
}

interface VpnState {
  config: VpnConfig | null;
  isEnabled: boolean;
  isConnecting: boolean;
  setConfig: (config: VpnConfig | null) => void;
  setEnabled: (enabled: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  removeConfig: () => void;
}

export const useVpnStore = create<VpnState>()(
  persist(
    (set) => ({
      config: null,
      isEnabled: false,
      isConnecting: false,
      setConfig: (config: VpnConfig | null) => set({ config }),
      setEnabled: (isEnabled: boolean) => set({ isEnabled }),
      setConnecting: (isConnecting: boolean) => set({ isConnecting }),
      removeConfig: () => set({ config: null, isEnabled: false, isConnecting: false }),
    }),
    {
      name: 'vpn-storage',
      partialize: (state) => ({ config: state.config }),
    }
  )
);
