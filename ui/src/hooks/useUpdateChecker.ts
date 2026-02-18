import { create } from 'zustand';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'downloading' | 'up-to-date' | 'error';

interface UpdateState {
  status: UpdateStatus;
  updateVersion: string | null;
  updateDate: string | null;
  progress: number;
  _update: Update | null;
}

interface UpdateActions {
  checkForUpdates: () => Promise<Update | null>;
  downloadAndInstall: () => Promise<void>;
  reset: () => void;
}

export type UpdateStore = UpdateState & UpdateActions;

const initialState: UpdateState = {
  status: 'idle',
  updateVersion: null,
  updateDate: null,
  progress: 0,
  _update: null,
};

export const useUpdateChecker = create<UpdateStore>((set, get) => ({
  ...initialState,

  checkForUpdates: async () => {
    set({ status: 'checking', updateVersion: null, updateDate: null, _update: null });
    try {
      const update = await check();
      if (update) {
        set({
          status: 'available',
          updateVersion: update.version,
          updateDate: update.date ?? null,
          _update: update,
        });
        return update;
      } else {
        set({ status: 'up-to-date' });
        return null;
      }
    } catch {
      set({ status: 'error' });
      return null;
    }
  },

  downloadAndInstall: async () => {
    const update = get()._update;
    if (!update) return;

    set({ status: 'downloading', progress: 0 });
    try {
      let totalLength = 0;
      let downloaded = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === 'Started' && event.data.contentLength) {
          totalLength = event.data.contentLength;
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          if (totalLength > 0) {
            set({ progress: Math.round((downloaded / totalLength) * 100) });
          }
        }
      });

      await relaunch();
    } catch {
      set({ status: 'error' });
    }
  },

  reset: () => set(initialState),
}));
