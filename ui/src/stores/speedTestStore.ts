import { create } from 'zustand';
import { runSpeedTest, abort as abortNdt7, type SpeedTestResult } from '../utils/ndt7Client';

// --- Types ---

export type TestPhase = 'idle' | 'ping' | 'download' | 'upload' | 'done' | 'error';

export interface SpeedTestMetrics {
  download: number | null;
  upload: number | null;
  ping: number | null;
  latency: number | null;
  jitter: number | null;
}

export interface GraphPoint {
  value: number;
}

export interface SpeedTestWarning {
  titleKey: string;
  descKey: string;
  descParams: Record<string, string>;
}

export interface TaskCheckItem {
  nameKey: string;
  pass: boolean;
  descKey: string;
  descParams: Record<string, string>;
}

interface SpeedTestState {
  phase: TestPhase;
  progress: number;
  currentValue: number;
  currentUnit: string;
  metrics: SpeedTestMetrics;
  downloadData: GraphPoint[];
  uploadData: GraphPoint[];
  warnings: SpeedTestWarning[];
  taskChecklist: TaskCheckItem[];
  serverName: string | null;
  error: string | null;
  cooldownSecondsLeft: number;
}

interface SpeedTestActions {
  startTest: () => Promise<void>;
  cancelTest: () => void;
  reset: () => void;
  overrideScenario: (scenario: SpeedTestScenario) => void;
}

export type SpeedTestScenario = 'fast' | 'slow' | 'high_latency' | 'error';

export type SpeedTestStore = SpeedTestState & SpeedTestActions;

// --- Constants ---

const COOLDOWN_SECONDS = 60;

const initialState: SpeedTestState = {
  phase: 'idle',
  progress: 0,
  currentValue: 0,
  currentUnit: 'speed_test.unit_ms',
  metrics: { download: null, upload: null, ping: null, latency: null, jitter: null },
  downloadData: [],
  uploadData: [],
  warnings: [],
  taskChecklist: [],
  serverName: null,
  error: null,
  cooldownSecondsLeft: 0,
};

// --- Run ID for cancellation ---
let runIdCounter = 0;

// --- Cooldown timer ---
let cooldownInterval: ReturnType<typeof setInterval> | null = null;

function clearCooldown() {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
    cooldownInterval = null;
  }
}

// --- Store ---

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
        onProgress: (phase, progress, currentMbps) => {
          if (stale()) return;
          set({
            phase,
            progress,
            currentValue: Math.round(currentMbps),
            currentUnit: phase === 'ping' ? 'speed_test.unit_ms' : 'speed_test.unit_mbps',
          });
        },
        onDataPoint: (phase, mbps) => {
          if (stale()) return;
          if (phase === 'download') {
            set((s) => ({
              downloadData: [...s.downloadData, { value: mbps }],
            }));
          } else {
            set((s) => ({
              uploadData: [...s.uploadData, { value: mbps }],
            }));
          }
        },
        onLatencySample: () => {
          // Latency samples collected internally by ndt7Client
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

      const metrics: SpeedTestMetrics = {
        download: result.downloadMbps,
        upload: result.uploadMbps,
        ping: result.pingMs,
        latency: result.latencyMs,
        jitter: result.jitterMs,
      };

      const warnings = analyzeWarnings(metrics);
      const taskChecklist = calculateTaskChecklist(metrics);

      set({
        phase: 'done',
        progress: 100,
        metrics,
        warnings,
        taskChecklist,
        serverName: result.serverName,
        error: null,
      });
      startCooldown();
    } catch (err) {
      if (stale()) return;
      const message = err instanceof Error ? err.message : 'Unknown error';
      if (message === 'Aborted') return; // User cancelled — don't show error

      // Map to i18n keys
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

  reset: () => {
    clearCooldown();
    set({ ...initialState });
  },

  overrideScenario: (scenario: SpeedTestScenario) => {
    clearCooldown();
    runIdCounter++;

    const data = SPEED_SCENARIOS[scenario];
    if (scenario === 'error') {
      set({
        ...initialState,
        phase: 'error',
        error: data.errorKey ?? 'speed_test.error_test_failed',
      });
      return;
    }

    const metrics: SpeedTestMetrics = {
      download: data.download!,
      upload: data.upload!,
      ping: data.ping!,
      latency: data.latency!,
      jitter: data.jitter!,
    };

    set({
      ...initialState,
      phase: 'done',
      progress: 100,
      metrics,
      downloadData: generateSyntheticGraph(data.download!, 30),
      uploadData: generateSyntheticGraph(data.upload!, 30),
      warnings: analyzeWarnings(metrics),
      taskChecklist: calculateTaskChecklist(metrics),
      serverName: 'debug-server.example.com',
    });
  },
};
});

// --- Speed test debug scenarios ---

interface SpeedScenarioData {
  download?: number;
  upload?: number;
  ping?: number;
  latency?: number;
  jitter?: number;
  errorKey?: string;
}

const SPEED_SCENARIOS: Record<SpeedTestScenario, SpeedScenarioData> = {
  fast: { download: 150, upload: 80, ping: 8, latency: 12, jitter: 2 },
  slow: { download: 5, upload: 1.5, ping: 85, latency: 200, jitter: 25 },
  high_latency: { download: 50, upload: 25, ping: 12, latency: 180, jitter: 35 },
  error: { errorKey: 'speed_test.error_test_failed' },
};

function generateSyntheticGraph(target: number, count: number): GraphPoint[] {
  const points: GraphPoint[] = [];
  for (let i = 0; i < count; i++) {
    const ramp = Math.min(i / 5, 1);
    const noise = (Math.random() - 0.5) * target * 0.15;
    points.push({ value: Math.max(0, target * ramp + noise) });
  }
  return points;
}

// --- Analysis helpers ---

function analyzeWarnings(m: SpeedTestMetrics): SpeedTestWarning[] {
  const warnings: SpeedTestWarning[] = [];

  // High latency under load
  if (m.ping && m.latency && m.latency > m.ping * 3) {
    const ratio = Math.round(m.latency / m.ping);
    warnings.push({
      titleKey: 'speed_test.warning_high_latency',
      descKey: 'speed_test.warning_high_latency_desc',
      descParams: {
        latency: String(m.latency),
        ping: String(m.ping),
        ratio: String(ratio),
      },
    });
  }

  // Low speed
  if ((m.download !== null && m.download < 10) || (m.upload !== null && m.upload < 3)) {
    warnings.push({
      titleKey: 'speed_test.warning_low_speed',
      descKey: 'speed_test.warning_low_speed_desc',
      descParams: {
        download: String(m.download ?? 0),
        upload: String(m.upload ?? 0),
      },
    });
  }

  // Unstable connection
  if (m.jitter !== null && m.jitter > 10) {
    warnings.push({
      titleKey: 'speed_test.warning_unstable',
      descKey: 'speed_test.warning_unstable_desc',
      descParams: { jitter: String(m.jitter) },
    });
  }

  return warnings;
}

function taskItem(nameKey: string, pass: boolean, params: Record<string, string>): TaskCheckItem {
  const suffix = pass ? '_pass' : '_fail';
  return { nameKey, pass, descKey: nameKey + suffix, descParams: params };
}

function calculateTaskChecklist(m: SpeedTestMetrics): TaskCheckItem[] {
  const dl = m.download ?? 0;
  const ul = m.upload ?? 0;
  const ping = m.ping ?? 999;
  const jitter = m.jitter ?? 999;

  const p = {
    download: String(Math.round(dl)),
    upload: String(Math.round(ul)),
    ping: String(Math.round(ping)),
    jitter: String(Math.round(jitter)),
  };

  const tasks: TaskCheckItem[] = [
    taskItem('speed_test.task_4k_video',        dl >= 25,                              p),
    taskItem('speed_test.task_online_gaming',    ping <= 50 && jitter <= 30,            p),
    taskItem('speed_test.task_video_calls',      dl >= 5 && ul >= 3 && ping <= 100,     p),
    taskItem('speed_test.task_hd_video',         dl >= 10,                              p),
    taskItem('speed_test.task_music_podcasts',   dl >= 1,                               p),
    taskItem('speed_test.task_social_web',       dl >= 3,                               p),
    taskItem('speed_test.task_email_messengers', dl >= 0.5,                             p),
  ];

  // Sort: failed first, then passed
  tasks.sort((a, b) => Number(a.pass) - Number(b.pass));

  return tasks;
}
