import { create } from 'zustand';
import { runSpeedTest, abort as abortNdt7, type SpeedTestResult } from '../utils/ndt7Client';

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error';

export interface SpeedTestMetrics {
  download: number | null;
  upload: number | null;
  ping: number | null;
  latency: number | null;
  jitter: number | null;
}

interface SpeedTestState {
  phase: TestPhase;
  progress: number;
  currentValue: number;
  currentUnit: string;
  metrics: SpeedTestMetrics;
  error: string | null;
  cooldownSecondsLeft: number;
}

interface SpeedTestActions {
  startTest: () => Promise<void>;
  cancelTest: () => void;
}

export type SpeedTestStore = SpeedTestState & SpeedTestActions;

const COOLDOWN_SECONDS = 60;

const initialState: SpeedTestState = {
  phase: 'idle',
  progress: 0,
  currentValue: 0,
  currentUnit: 'speed_test.unit_ms',
  metrics: { download: null, upload: null, ping: null, latency: null, jitter: null },
  error: null,
  cooldownSecondsLeft: 0,
};

let runIdCounter = 0;
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

function clearCooldown() {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
}

export const useSpeedTestStore = create<SpeedTestStore>((set) => {
  function startCooldown() {
    clearCooldown();
    set({ cooldownSecondsLeft: COOLDOWN_SECONDS });
    cooldownInterval = setInterval(() => {
      const current = useSpeedTestStore.getState().cooldownSecondsLeft;
      if (current <= 1) {
        clearCooldown();
        set({ cooldownSecondsLeft: 0 });
      } else {
        set({ cooldownSecondsLeft: current - 1 });
      }
    }, 1000);
  }

  return {
    ...initialState,

    startTest: async () => {
      const thisRunId = ++runIdCounter;
      const stale = () => runIdCounter !== thisRunId;

      set({
        ...initialState,
        phase: 'ping',
        progress: 0,
        currentUnit: 'speed_test.unit_ms',
      });

      try {
        const result: SpeedTestResult = await runSpeedTest({
          onProgress: (phase, progress, currentValue) => {
            if (stale()) return;
            set({
              phase,
              progress,
              currentValue: Math.round(currentValue),
              currentUnit: phase === 'ping' ? 'speed_test.unit_ms' : 'speed_test.unit_mbps',
            });
          },
          onPhaseComplete: (phase, value) => {
            if (stale()) return;
            set((s) => ({
              metrics: {
                ...s.metrics,
                ...(phase === 'ping' ? { ping: Math.round(value) } : {}),
                ...(phase === 'download' ? { download: Math.round(value * 100) / 100 } : {}),
                ...(phase === 'upload' ? { upload: Math.round(value * 100) / 100 } : {}),
              },
            }));
          },
        });

        if (stale()) return;

        set({
          phase: 'done',
          progress: 100,
          metrics: {
            download: result.downloadMbps,
            upload: result.uploadMbps,
            ping: result.pingMs,
            latency: result.latencyMs,
            jitter: result.jitterMs,
          },
          error: null,
        });
        startCooldown();
      } catch (err) {
        if (stale()) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        if (message === 'Aborted') return;

        let errorKey = 'speed_test.error_test_failed';
        if (message.includes('429') || message.includes('rate limit')) {
          errorKey = 'speed_test.error_rate_limited';
        } else if (message.includes('No test servers')) {
          errorKey = 'speed_test.error_no_server';
        } else if (message.includes('fetch') || message.includes('Failed') || message.includes('NetworkError')) {
          errorKey = 'speed_test.error_connection';
        }

        set({
          phase: 'error',
          error: errorKey,
        });
        startCooldown();
      }
    },

    cancelTest: () => {
      runIdCounter++;
      abortNdt7();
      clearCooldown();
      set({ ...initialState });
    },
  };
});
