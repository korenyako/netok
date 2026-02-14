import { create } from 'zustand';
import { listen } from '@tauri-apps/api/event';
import { scanNetworkDevices, type NetworkDevice } from '../api/tauri';

interface DeviceScanState {
  devices: NetworkDevice[];
  lastUpdated: number | null;
  isScanning: boolean;
  scanStage: string | null;
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

export const useDeviceScanStore = create<DeviceScanStore>((set, get) => {
  // Initialize the event listener
  initProgressListener((stage) => set({ scanStage: stage }));

  return {
    devices: [],
    lastUpdated: null,
    isScanning: false,
    scanStage: null,
    error: null,

    runScan: async () => {
      if (get().isScanning) return;
      set({ isScanning: true, error: null, scanStage: null });
      try {
        const result = await scanNetworkDevices();
        set({ devices: result, lastUpdated: Date.now() });
      } catch (e) {
        set({ error: String(e) });
      } finally {
        set({ isScanning: false, scanStage: null });
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
