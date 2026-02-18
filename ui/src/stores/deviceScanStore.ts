import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import { scanNetworkDevices, type NetworkDevice } from '../api/tauri';

interface DeviceScanState {
  devices: NetworkDevice[];
  lastUpdated: number | null;
  isScanning: boolean;
  scanStage: string | null;
  scanProgress: number;
  error: string | null;
}

interface DeviceScanActions {
  runScan: () => Promise<void>;
}

export type DeviceScanStore = DeviceScanState & DeviceScanActions;

// Listen for scan progress events from backend (singleton)
let progressListenerInitialized = false;

function initProgressListener(setScanStage: (stage: string | null) => void) {
  if (progressListenerInitialized) return;
  progressListenerInitialized = true;
  listen<string>('scan-progress', (event) => {
    setScanStage(event.payload);
  });
}

// Simulated progress timer handle
let progressTimer: ReturnType<typeof setInterval> | null = null;

function clearProgressTimer() {
  if (progressTimer !== null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

/**
 * Simulated progress that eases toward a ceiling.
 * "scanning" stage: 0 → 55%
 * "identifying" stage: 55 → 90%
 * Completion: jump to 100%
 */
function startProgressSimulation(
  get: () => DeviceScanState,
  set: (partial: Partial<DeviceScanState>) => void,
) {
  clearProgressTimer();

  const TICK_MS = 150;

  progressTimer = setInterval(() => {
    const { scanStage, scanProgress, isScanning } = get();

    if (!isScanning) {
      clearProgressTimer();
      return;
    }

    // Determine ceiling based on current stage
    const ceiling = scanStage === 'identifying' ? 90 : 55;

    if (scanProgress < ceiling) {
      // Ease toward ceiling: the closer we get, the slower we move
      const remaining = ceiling - scanProgress;
      const step = Math.max(0.3, remaining * 0.06);
      set({ scanProgress: Math.min(ceiling, scanProgress + step) });
    }
  }, TICK_MS);
}

export const useDeviceScanStore = create<DeviceScanStore>((set, get) => {
  // Initialize the event listener — also bump progress on stage change
  initProgressListener((stage) => {
    const current = get().scanProgress;
    // When "identifying" starts, ensure we're at least at 55%
    if (stage === 'identifying' && current < 55) {
      set({ scanStage: stage, scanProgress: 55 });
    } else {
      set({ scanStage: stage });
    }
  });

  return {
    devices: [],
    lastUpdated: null,
    isScanning: false,
    scanStage: null,
    scanProgress: 0,
    error: null,

    runScan: async () => {
      if (get().isScanning) return;
      set({ isScanning: true, error: null, scanStage: null, scanProgress: 0, devices: [], lastUpdated: null });

      // Start simulated progress timer
      startProgressSimulation(get, set);

      try {
        const result = await scanNetworkDevices();
        clearProgressTimer();
        set({ scanProgress: 100 });
        // Brief pause at 100% before showing results
        await new Promise((r) => setTimeout(r, 400));
        set({ devices: result, lastUpdated: Date.now() });
      } catch (e) {
        clearProgressTimer();
        set({ error: String(e) });
      } finally {
        set({ isScanning: false, scanStage: null, scanProgress: 0 });
      }
    },
  };
});

/** Human-readable relative time string. */
export function formatTimeAgo(timestamp: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t('device_scan.updated_just_now');
  const minutes = Math.floor(seconds / 60);
  return t('device_scan.updated_ago', { count: minutes });
}
