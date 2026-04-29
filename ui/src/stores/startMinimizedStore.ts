import { create } from 'zustand';
import { getStartMinimized, setStartMinimized as setStartMinimizedApi } from '../api/tauri';

interface StartMinimizedState {
  /** User's explicit choice; null means unset — UI should fall back to autostart-derived default. */
  override: boolean | null;
  /** True after the first successful fetch — used to avoid flashing the default before we know the real value. */
  loaded: boolean;
  setOverride: (enabled: boolean) => Promise<void>;
  fetch: () => Promise<void>;
}

export const useStartMinimizedStore = create<StartMinimizedState>()((set, get) => ({
  override: null,
  loaded: false,
  setOverride: async (enabled: boolean) => {
    const prev = get().override;
    set({ override: enabled });
    try {
      await setStartMinimizedApi(enabled);
    } catch {
      set({ override: prev });
    }
  },
  fetch: async () => {
    try {
      const value = await getStartMinimized();
      set({ override: value, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));