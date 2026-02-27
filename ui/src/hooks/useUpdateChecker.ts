import { create } from 'zustand';
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';

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
    } catch (err) {
      console.error('[Updater] Check failed:', err);
      set({ status: 'error' });
      return null;
    }
  },

  downloadAndInstall: async () => {
    const update = get()._update;
    if (!update) return;

    set({ status: 'downloading', progress: 0 });
    try {
      // Stop VPN before update — NSIS can't overwrite sing-box.exe while it's running
      await invoke('disconnect_vpn').catch(() => {});

      let totalLength = 0;
      let downloaded = 0;

      console.log('[Updater] Starting download...');
      await update.downloadAndInstall((event) => {
        if (event.event === 'Started') {
          totalLength = event.data.contentLength ?? 0;
          console.log('[Updater] Download started, contentLength:', totalLength);
        } else if (event.event === 'Progress') {
          downloaded += event.data.chunkLength;
          if (totalLength > 0) {
            set({ progress: Math.round((downloaded / totalLength) * 100) });
          } else {
            // No content-length from server — show downloaded MB as progress hint
            console.log('[Updater] Downloaded:', (downloaded / 1024 / 1024).toFixed(1), 'MB');
            // Estimate based on typical installer size (~16 MB)
            const estimated = Math.min(95, Math.round((downloaded / 16_800_000) * 100));
            set({ progress: estimated });
          }
        } else if (event.event === 'Finished') {
          console.log('[Updater] Download finished');
          set({ progress: 100 });
        }
      });

      console.log('[Updater] Installing and relaunching...');
      await relaunch();
    } catch (err) {
      console.error('[Updater] Download/install failed:', err);
      set({ status: 'error' });
    }
  },

  reset: () => set(initialState),
}));
