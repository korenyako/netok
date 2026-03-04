import { useVpnStore } from '../stores/vpnStore';
import { useDemoStore, getVpnDemoState, DEMO_VPN_CONFIG } from '../stores/demoStore';
import type { VpnConnectionState } from '../api/tauri';
import type { VpnConfig } from '../stores/vpnStore';

interface EffectiveVpnState {
  configs: VpnConfig[];
  activeIndex: number | null;
  connectionState: VpnConnectionState;
}

export function useVpnState(): EffectiveVpnState {
  const configs = useVpnStore((s) => s.configs);
  const activeIndex = useVpnStore((s) => s.activeIndex);
  const connectionState = useVpnStore((s) => s.connectionState);
  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const vpnDemoScenario = useDemoStore((s) => s.vpnDemoScenario);
  const transitioning = useDemoStore((s) => s.vpnDemoTransitioning);

  if (isDemoMode && vpnDemoScenario !== null) {
    return {
      configs: [DEMO_VPN_CONFIG],
      activeIndex: 0,
      connectionState: getVpnDemoState(vpnDemoScenario, transitioning),
    };
  }

  return { configs, activeIndex, connectionState };
}
