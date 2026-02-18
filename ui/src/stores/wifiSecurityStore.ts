import { create } from 'zustand';
import {
  checkWifiSecurity,
  type WiFiSecurityReport,
} from '../api/tauri';

// Store state
interface WifiSecurityState {
  /** Last completed scan report (persists across navigation) */
  report: WiFiSecurityReport | null;
  /** Whether a scan is currently running */
  isRunning: boolean;
  /** Error from the last scan attempt */
  error: string | null;
  /** Number of revealed results (0–4, for staggered animation) */
  revealedCount: number;
  /** Index of the check currently being "loaded" (-1 = none) */
  currentCheckIndex: number;
}

// Store actions
interface WifiSecurityActions {
  /** Run a full WiFi security scan */
  runScan: () => Promise<void>;
  /** Run a quiet background scan (no animation state changes, just fetch report) */
  runQuietScan: () => Promise<void>;
  /** Reset animation state for re-entering the results screen */
  resetReveal: () => void;
  /** Update revealed count (called by animation timer) */
  setRevealedCount: (count: number) => void;
  /** Update current check index (called by animation timer) */
  setCurrentCheckIndex: (index: number) => void;
  /** Mark scan as finished (called after reveal completes) */
  setRunningDone: () => void;
}

export type WifiSecurityStore = WifiSecurityState & WifiSecurityActions;

// Check order (must match WiFiSecurityScreen)
const CHECK_ORDER: string[] = ['encryption', 'evil_twin', 'arp_spoofing', 'dns_hijacking'];

const initialState: WifiSecurityState = {
  report: null,
  isRunning: false,
  error: null,
  revealedCount: 0,
  currentCheckIndex: -1,
};

export const useWifiSecurityStore = create<WifiSecurityStore>((set, get) => ({
  ...initialState,

  runScan: async () => {
    set({
      isRunning: true,
      error: null,
      report: null,
      revealedCount: 0,
      currentCheckIndex: 0,
    });

    try {
      const result = await checkWifiSecurity();
      set({ report: result });
    } catch (e) {
      set({
        error: String(e),
        isRunning: false,
        currentCheckIndex: -1,
      });
    }
  },

  runQuietScan: async () => {
    const { isRunning } = get();
    if (isRunning) return;
    try {
      const result = await checkWifiSecurity();
      const count = CHECK_ORDER.filter(type =>
        result.checks.some(c => c.check_type === type),
      ).length;
      set({ report: result, revealedCount: count, currentCheckIndex: -1, isRunning: false, error: null });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  resetReveal: () => {
    const { report } = get();
    if (report) {
      // If we already have a report, show all results instantly
      const count = CHECK_ORDER.filter(type =>
        report.checks.some(c => c.check_type === type),
      ).length;
      set({ revealedCount: count, currentCheckIndex: -1, isRunning: false });
    }
  },

  setRevealedCount: (count: number) => set({ revealedCount: count }),
  setCurrentCheckIndex: (index: number) => set({ currentCheckIndex: index }),
  setRunningDone: () => set({ isRunning: false, currentCheckIndex: -1 }),
}));
