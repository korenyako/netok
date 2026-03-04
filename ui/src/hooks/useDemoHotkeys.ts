import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDemoStore } from '../stores/demoStore';
import { useDiagnosticsStore } from '../stores/diagnosticsStore';
import { useSpeedTestStore, type SpeedTestScenario } from '../stores/speedTestStore';
import type { DiagnosticScenario } from '../api/tauri';

const DIAGNOSTIC_SCENARIOS: DiagnosticScenario[] = [
  'all_good', 'wifi_disabled', 'wifi_not_connected', 'weak_signal',
  'router_unreachable', 'no_internet', 'dns_failure', 'http_blocked',
];

const SPEED_SCENARIOS: SpeedTestScenario[] = ['fast', 'slow', 'high_latency', 'error'];

export function useDemoHotkeys() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handler = (e: KeyboardEvent) => {
      const demo = useDemoStore.getState();

      // Ctrl+Shift+D: toggle demo mode (always available in dev)
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        demo.toggleDemoMode();
        return;
      }

      // All other hotkeys require demo mode to be active
      if (!demo.isDemoMode) return;

      // Ctrl+Shift+R: reset all
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyR') {
        e.preventDefault();
        demo.resetAll();
        useDiagnosticsStore.getState().clearOverride(t);
        useSpeedTestStore.getState().reset();
        return;
      }

      // Ctrl+Shift+V: toggle VPN disconnected <-> connected
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyV') {
        e.preventDefault();
        const current = demo.vpnDemoScenario;
        const target = current === 'vpn_connected' ? 'vpn_disconnected' : 'vpn_connected';
        demo.animateVpnTransition(target).then(() => {
          // Re-apply current diagnostics scenario to update internet node
          const diagStore = useDiagnosticsStore.getState();
          if (diagStore.scenarioOverride) {
            diagStore.overrideScenario(diagStore.scenarioOverride, t);
          }
        });
        return;
      }

      // Ctrl+Shift+E: VPN error
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyE') {
        e.preventDefault();
        demo.setVpnDemoScenario('vpn_error');
        return;
      }

      // Ctrl+Shift+1..4: speed test scenarios (check before Ctrl+digit)
      if (e.ctrlKey && e.shiftKey) {
        const digitMatch = e.code.match(/^Digit([1-4])$/);
        if (digitMatch) {
          const index = parseInt(digitMatch[1]) - 1;
          if (index < SPEED_SCENARIOS.length) {
            e.preventDefault();
            useSpeedTestStore.getState().overrideScenario(SPEED_SCENARIOS[index]);
          }
          return;
        }
      }

      // Ctrl+1..8: diagnostics scenarios (progressive)
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const digitMatch = e.code.match(/^Digit([1-8])$/);
        if (digitMatch) {
          const index = parseInt(digitMatch[1]) - 1;
          if (index < DIAGNOSTIC_SCENARIOS.length) {
            e.preventDefault();
            useDiagnosticsStore.getState().overrideScenarioProgressive(DIAGNOSTIC_SCENARIOS[index], t);
          }
          return;
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [t]);
}
