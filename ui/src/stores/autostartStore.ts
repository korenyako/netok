import { create } from 'zustand';
import { getAutostartEnabled, setAutostartEnabled as setAutostartApi } from '../api/tauri';

interface AutostartState {
  enabled: boolean | null;
  setEnabled: (enabled: boolean) => Promise<void>;
  fetch: () => Promise<void>;
}

export const useAutostartStore = create<AutostartState>()((set, get) => ({
  enabled: null,
  setEnabled: async (enabled: boolean) => {
    const prev = get().enabled;
    set({ enabled });
    try {
      await setAutostartApi(enabled);
    } catch {
      set({ enabled: prev });
    }
  },
  fetch: async () => {
    try {
      const enabled = await getAutostartEnabled();
      set({ enabled });
    } catch {
      // ignore — will show fallback subtitle
    }
  },
}));
