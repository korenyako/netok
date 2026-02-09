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

export type RatingLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface ExperienceRating {
  nameKey: string;
  fillPercent: number;
  level: RatingLevel;
  color: string;
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
  experienceRatings: ExperienceRating[];
  serverName: string | null;
  error: string | null;
}

interface SpeedTestActions {
  startTest: () => Promise<void>;
  cancelTest: () => void;
  reset: () => void;
}

export type SpeedTestStore = SpeedTestState & SpeedTestActions;

// --- Constants ---

const RATING_COLORS: Record<RatingLevel, string> = {
  excellent: 'hsl(var(--primary))',
  good: 'hsl(var(--primary))',
  fair: '#eab308',
  poor: '#ef4444',
};

const initialState: SpeedTestState = {
  phase: 'idle',
  progress: 0,
  currentValue: 0,
  currentUnit: 'ms',
  metrics: { download: null, upload: null, ping: null, latency: null, jitter: null },
  downloadData: [],
  uploadData: [],
  warnings: [],
  experienceRatings: [],
  serverName: null,
  error: null,
};

// --- Run ID for cancellation ---
let runIdCounter = 0;

// --- Store ---

export const useSpeedTestStore = create<SpeedTestStore>((set) => ({
  ...initialState,

  startTest: async () => {
    const thisRunId = ++runIdCounter;
    const stale = () => runIdCounter !== thisRunId;

    set({
      ...initialState,
      phase: 'ping',
      progress: 0,
      currentUnit: 'ms',
    });

    try {
      const result: SpeedTestResult = await runSpeedTest({
        onProgress: (phase, progress, currentMbps) => {
          if (stale()) return;
          set({
            phase,
            progress,
            currentValue: Math.round(currentMbps),
            currentUnit: phase === 'ping' ? 'ms' : 'Mbps',
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
      const experienceRatings = calculateRatings(metrics);

      set({
        phase: 'done',
        progress: 100,
        metrics,
        warnings,
        experienceRatings,
        serverName: result.serverName,
        error: null,
      });
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
    }
  },

  cancelTest: () => {
    runIdCounter++;
    abortNdt7();
    set({ ...initialState });
  },

  reset: () => {
    set({ ...initialState });
  },
}));

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

function rateLevel(score: number): { level: RatingLevel; fillPercent: number } {
  if (score >= 3) return { level: 'excellent', fillPercent: 100 };
  if (score >= 2) return { level: 'good', fillPercent: 75 };
  if (score >= 1) return { level: 'fair', fillPercent: 50 };
  return { level: 'poor', fillPercent: 25 };
}

function calculateRatings(m: SpeedTestMetrics): ExperienceRating[] {
  const dl = m.download ?? 0;
  const ul = m.upload ?? 0;
  const ping = m.ping ?? 999;
  const jitter = m.jitter ?? 999;

  // Video calls: needs dl≥5, ul≥3, ping≤50, jitter≤10 for excellent
  const videoScore =
    (dl >= 5 ? 1 : dl >= 3 ? 0.6 : dl >= 1.5 ? 0.3 : 0) +
    (ul >= 3 ? 1 : ul >= 2 ? 0.6 : ul >= 1 ? 0.3 : 0) +
    (ping <= 50 ? 1 : ping <= 100 ? 0.6 : ping <= 200 ? 0.3 : 0);
  const video = rateLevel(videoScore);

  // Streaming: mainly needs download bandwidth
  const streamScore =
    dl >= 25 ? 3 : dl >= 10 ? 2 : dl >= 5 ? 1 : 0;
  const stream = rateLevel(streamScore);

  // Gaming: needs low ping and low jitter
  const gameScore =
    (ping <= 30 ? 1.5 : ping <= 50 ? 1 : ping <= 100 ? 0.5 : 0) +
    (jitter <= 5 ? 1.5 : jitter <= 15 ? 1 : jitter <= 30 ? 0.5 : 0);
  const game = rateLevel(gameScore);

  // Work from home: balanced needs
  const wfhScore =
    (dl >= 10 ? 1 : dl >= 5 ? 0.6 : dl >= 2 ? 0.3 : 0) +
    (ul >= 5 ? 1 : ul >= 2 ? 0.6 : ul >= 1 ? 0.3 : 0) +
    (ping <= 50 ? 1 : ping <= 100 ? 0.6 : ping <= 200 ? 0.3 : 0);
  const wfh = rateLevel(wfhScore);

  return [
    { nameKey: 'speed_test.rating_video_calls', ...video, color: RATING_COLORS[video.level] },
    { nameKey: 'speed_test.rating_streaming', ...stream, color: RATING_COLORS[stream.level] },
    { nameKey: 'speed_test.rating_gaming', ...game, color: RATING_COLORS[game.level] },
    { nameKey: 'speed_test.rating_work_from_home', ...wfh, color: RATING_COLORS[wfh.level] },
  ];
}
