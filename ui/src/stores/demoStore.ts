import { create } from 'zustand';
import type { VpnConnectionState } from '../api/tauri';
import type { VpnConfig } from './vpnStore';

export type VpnDemoScenario = 'vpn_disconnected' | 'vpn_connected' | 'vpn_error';

interface DemoState {
  isDemoMode: boolean;
  vpnDemoScenario: VpnDemoScenario | null;
  vpnDemoTransitioning: 'connecting' | 'disconnecting' | null;
}

interface DemoActions {
  toggleDemoMode: () => void;
  setVpnDemoScenario: (scenario: VpnDemoScenario | null) => void;
  animateVpnTransition: (target: VpnDemoScenario) => Promise<void>;
  resetAll: () => void;
}

// Demo VPN server config (constant)
export const DEMO_VPN_CONFIG: VpnConfig = {
  protocol: 'VLESS',
  serverHost: 'fra1.example-vpn.net',
  country: 'Germany',
  city: 'Frankfurt',
  ping: 24,
  rawKey: 'vless://demo-uuid-1234-5678@fra1.example-vpn.net:443?encryption=none&security=tls&type=ws#Frankfurt',
};

// Map VPN demo state to VpnConnectionState
export function getVpnDemoState(
  scenario: VpnDemoScenario | null,
  transitioning: 'connecting' | 'disconnecting' | null,
): VpnConnectionState {
  if (transitioning === 'connecting') return { type: 'connecting' };
  if (transitioning === 'disconnecting') return { type: 'disconnecting' };
  switch (scenario) {
    case 'vpn_connected':
      return { type: 'connected', original_ip: '79.56.184.23', vpn_ip: '162.55.41.88' };
    case 'vpn_error':
      return { type: 'error', message: 'Connection timed out' };
    case 'vpn_disconnected':
    default:
      return { type: 'disconnected' };
  }
}

export const useDemoStore = create<DemoState & DemoActions>((set) => ({
  isDemoMode: false,
  vpnDemoScenario: null,
  vpnDemoTransitioning: null,

  toggleDemoMode: () => set((s) => ({
    isDemoMode: !s.isDemoMode,
    vpnDemoScenario: !s.isDemoMode ? s.vpnDemoScenario : null,
    vpnDemoTransitioning: null,
  })),

  setVpnDemoScenario: (scenario) => set({ vpnDemoScenario: scenario, vpnDemoTransitioning: null }),

  animateVpnTransition: async (target) => {
    const current = useDemoStore.getState().vpnDemoScenario;

    if (target === 'vpn_connected' && current !== 'vpn_connected') {
      set({ vpnDemoTransitioning: 'connecting' });
      await new Promise((r) => setTimeout(r, 1500));
      set({ vpnDemoScenario: 'vpn_connected', vpnDemoTransitioning: null });
    } else if (target === 'vpn_disconnected' && current === 'vpn_connected') {
      set({ vpnDemoTransitioning: 'disconnecting' });
      await new Promise((r) => setTimeout(r, 800));
      set({ vpnDemoScenario: 'vpn_disconnected', vpnDemoTransitioning: null });
    } else {
      set({ vpnDemoScenario: target, vpnDemoTransitioning: null });
    }
  },

  resetAll: () => set({ isDemoMode: false, vpnDemoScenario: null, vpnDemoTransitioning: null }),
}));
