// NDT7 WebSocket client for M-Lab speed testing
// Protocol: https://github.com/m-lab/ndt-server/blob/main/spec/ndt7-protocol.md

// Mock mode: set VITE_MOCK_SPEED_TEST=true in .env or run with env var
const MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_MOCK_SPEED_TEST === 'true';

const LOCATE_URL = 'https://locate.measurementlab.net/v2/nearest/ndt/ndt7';
const NDT7_SUBPROTOCOL = 'net.measurementlab.ndt.v7';
const TEST_DURATION_MS = 10_000; // Each phase runs ~10 seconds
const UPLOAD_CHUNK_SIZE = 8192; // 8KB per WebSocket message
const WS_CONNECT_TIMEOUT_MS = 5_000; // Timeout for WebSocket connection

// --- Types ---

interface LocateResult {
  results: Array<{
    machine: string;
    urls: Record<string, string>;
  }>;
}

/** Server-side measurement message sent during download/upload */
interface NDT7Measurement {
  AppInfo?: {
    ElapsedTime?: number; // microseconds
    NumBytes?: number;
  };
  TCPInfo?: {
    SmoothedRTT?: number; // microseconds
    MinRTT?: number; // microseconds
  };
}

export interface SpeedTestCallbacks {
  onProgress: (phase: 'ping' | 'download' | 'upload', progress: number, currentMbps: number) => void;
  onDataPoint: (phase: 'download' | 'upload', mbps: number) => void;
  onLatencySample: (rttMs: number) => void;
  onPhaseComplete: (phase: 'ping' | 'download' | 'upload', value: number) => void;
}

export interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  latencyMs: number;
  jitterMs: number;
  serverName: string;
}

// --- Client ---

let abortController: AbortController | null = null;

type Server = LocateResult['results'][0];

// Cache discovered servers for 5 minutes to avoid 429 rate limiting
let cachedServers: Server[] | null = null;
let cachedServersTime = 0;
const SERVER_CACHE_TTL = 5 * 60 * 1000;

export function abort() {
  abortController?.abort();
  abortController = null;
}

export async function runSpeedTest(callbacks: SpeedTestCallbacks): Promise<SpeedTestResult> {
  abortController = new AbortController();
  const { signal } = abortController;

  if (MOCK_ENABLED) {
    console.log('[ndt7] Mock mode enabled');
    return runMockSpeedTest(callbacks, signal);
  }

  // 1. Discover nearest servers (ordered by proximity)
  const servers = await discoverServers(signal);

  // 2. Try each server in order, fallback on connection failure
  let lastError: Error | null = null;
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    if (signal.aborted) throw new Error('Aborted');

    try {
      return await runTestWithServer(server, signal, callbacks);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Abort = user cancelled, don't try next server
      if (lastError.message === 'Aborted') throw lastError;

      console.warn(
        `[ndt7] Server ${server.machine} failed (${i + 1}/${servers.length}):`,
        lastError.message,
      );

      // Invalidate cache so next test re-discovers
      if (i === servers.length - 1) {
        cachedServers = null;
      }
    }
  }

  throw lastError ?? new Error('All servers failed');
}

async function runTestWithServer(
  server: Server,
  signal: AbortSignal,
  callbacks: SpeedTestCallbacks,
): Promise<SpeedTestResult> {
  const serverName = server.machine;

  const downloadUrl = resolveUrl(server, 'download');
  const uploadUrl = resolveUrl(server, 'upload');
  console.log('[ndt7] Trying server:', serverName);
  console.log('[ndt7] Download URL:', downloadUrl);
  console.log('[ndt7] Upload URL:', uploadUrl);

  // Ping test (also validates connectivity to this server)
  const pingMs = await measurePing(downloadUrl, signal, callbacks);
  callbacks.onPhaseComplete('ping', pingMs);

  // Download test
  const { throughputMbps: downloadMbps, latencySamples } = await runDownloadTest(
    downloadUrl, signal, callbacks,
  );
  callbacks.onPhaseComplete('download', downloadMbps);

  // Upload test
  const uploadMbps = await runUploadTest(uploadUrl, signal, callbacks);
  callbacks.onPhaseComplete('upload', uploadMbps);

  // Calculate latency & jitter from download phase RTT samples
  const latencyMs = latencySamples.length > 0
    ? latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length
    : pingMs;
  const jitterMs = calculateJitter(latencySamples);

  abortController = null;

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    pingMs: Math.round(pingMs),
    latencyMs: Math.round(latencyMs),
    jitterMs: Math.round(jitterMs * 10) / 10,
    serverName,
  };
}

async function discoverServers(signal: AbortSignal): Promise<Server[]> {
  // Return cached servers if still fresh
  if (cachedServers && Date.now() - cachedServersTime < SERVER_CACHE_TTL) {
    console.log('[ndt7] Using cached servers:', cachedServers.map((s) => s.machine));
    return cachedServers;
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (signal.aborted) throw new Error('Aborted');

    const resp = await fetch(LOCATE_URL, { signal });
    if (resp.status === 429) {
      // Rate limited — wait and retry
      const delay = (attempt + 1) * 2000;
      console.warn(`[ndt7] Rate limited (429), retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    if (!resp.ok) {
      throw new Error(`Server discovery failed: ${resp.status}`);
    }
    const data: LocateResult = await resp.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No test servers available');
    }

    console.log(
      '[ndt7] Discovered servers:',
      data.results.map((s) => s.machine),
    );

    // Cache all servers
    cachedServers = data.results;
    cachedServersTime = Date.now();
    return data.results;
  }

  throw new Error('Server discovery failed: rate limited (429)');
}

/** Resolve a wss:// URL from the locate response, with fallback */
function resolveUrl(server: LocateResult['results'][0], test: 'download' | 'upload'): string {
  // Try wss:// first, fall back to ws://
  const wssKey = `wss:///ndt/v7/${test}`;
  const wsKey = `ws:///ndt/v7/${test}`;
  const url = server.urls[wssKey] || server.urls[wsKey];
  if (url) return url;

  // Fallback: build URL from hostname or machine
  const hostname = (server as Record<string, unknown>).hostname || `ndt-${server.machine}`;
  return `wss://${hostname}/ndt/v7/${test}`;
}

async function measurePing(
  wsUrl: string,
  signal: AbortSignal,
  callbacks: SpeedTestCallbacks,
): Promise<number> {
  // Measure RTT via short-lived WebSocket connections (avoids CORS issues)
  const samples: number[] = [];
  const attempts = 3;

  for (let i = 0; i < attempts; i++) {
    if (signal.aborted) throw new Error('Aborted');
    callbacks.onProgress('ping', ((i + 1) / attempts) * 100, 0);

    const rtt = await wsPing(wsUrl, signal);
    if (rtt > 0) {
      samples.push(rtt);
      callbacks.onProgress('ping', ((i + 1) / attempts) * 100, Math.round(rtt));
    }
  }

  if (samples.length === 0) {
    throw new Error('Server unreachable: all ping attempts failed');
  }

  samples.sort((a, b) => a - b);
  return samples[Math.floor(samples.length / 2)];
}

/** Open a WebSocket, measure time to connect, then close immediately */
function wsPing(wsUrl: string, signal: AbortSignal): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);

    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
    };

    const onAbort = () => { cleanup(); ws.close(); resolve(0); };
    signal.addEventListener('abort', onAbort, { once: true });

    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      ws.close();
      resolve(0); // timeout → treat as failed ping
    }, WS_CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      const rtt = performance.now() - start;
      cleanup();
      ws.close();
      resolve(rtt);
    };
    ws.onerror = () => {
      cleanup();
      resolve(0);
    };
  });
}

async function runDownloadTest(
  wsUrl: string,
  signal: AbortSignal,
  callbacks: SpeedTestCallbacks,
): Promise<{ throughputMbps: number; latencySamples: number[] }> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('Aborted')); return; }

    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);
    ws.binaryType = 'arraybuffer';

    let totalBytes = 0;
    let startTime = 0;
    let lastMbps = 0;
    let lastDataPointTime = 0;
    const latencySamples: number[] = [];

    const onAbort = () => { ws.close(); reject(new Error('Aborted')); };
    signal.addEventListener('abort', onAbort, { once: true });

    ws.onopen = () => {
      console.log('[ndt7] Download WebSocket connected');
      startTime = performance.now();
    };

    ws.onmessage = (event: MessageEvent) => {
      const now = performance.now();
      const elapsed = now - startTime;

      if (typeof event.data === 'string') {
        // Server measurement message (JSON)
        try {
          const msg: NDT7Measurement = JSON.parse(event.data);
          if (msg.TCPInfo?.SmoothedRTT) {
            const rttMs = msg.TCPInfo.SmoothedRTT / 1000; // μs → ms
            latencySamples.push(rttMs);
            callbacks.onLatencySample(rttMs);
          }
          if (msg.AppInfo?.NumBytes) {
            const serverMbps = (msg.AppInfo.NumBytes * 8) /
              ((msg.AppInfo.ElapsedTime || 1) / 1_000_000) / 1_000_000;
            lastMbps = serverMbps;
          }
        } catch {
          // Not JSON, count as data
          totalBytes += event.data.length;
        }
      } else {
        // Binary data — count bytes
        totalBytes += (event.data as ArrayBuffer).byteLength;
      }

      // Calculate client-side throughput
      if (elapsed > 0) {
        const clientMbps = (totalBytes * 8) / (elapsed / 1000) / 1_000_000;
        const reportMbps = lastMbps > 0 ? lastMbps : clientMbps;
        const progress = Math.min((elapsed / TEST_DURATION_MS) * 100, 100);
        callbacks.onProgress('download', progress, Math.round(reportMbps * 10) / 10);
        if (elapsed > 1000 && now - lastDataPointTime >= 200) {
          lastDataPointTime = now;
          callbacks.onDataPoint('download', reportMbps);
        }
      }
    };

    ws.onclose = () => {
      signal.removeEventListener('abort', onAbort);
      const elapsed = performance.now() - startTime;
      const clientMbps = elapsed > 0
        ? (totalBytes * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      const throughputMbps = lastMbps > 0 ? lastMbps : clientMbps;
      resolve({ throughputMbps, latencySamples });
    };

    ws.onerror = (ev) => {
      console.error('[ndt7] Download WebSocket error:', ev);
      signal.removeEventListener('abort', onAbort);
      reject(new Error('Download test WebSocket error'));
    };
  });
}

async function runUploadTest(
  wsUrl: string,
  signal: AbortSignal,
  callbacks: SpeedTestCallbacks,
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new Error('Aborted')); return; }

    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);
    ws.binaryType = 'arraybuffer';

    let startTime = 0;
    let totalBytesSent = 0;
    let lastServerMbps = 0;
    let sending = false;
    let lastDataPointTime = 0;
    const uploadData = new Uint8Array(UPLOAD_CHUNK_SIZE);

    const onAbort = () => { sending = false; ws.close(); reject(new Error('Aborted')); };
    signal.addEventListener('abort', onAbort, { once: true });

    ws.onopen = () => {
      console.log('[ndt7] Upload WebSocket connected');
      startTime = performance.now();
      sending = true;
      sendData();
    };

    function sendData() {
      if (!sending) return;
      const elapsed = performance.now() - startTime;

      if (elapsed >= TEST_DURATION_MS) {
        sending = false;
        ws.close();
        return;
      }

      // Send data as fast as possible while keeping buffer manageable
      while (ws.bufferedAmount < 1_000_000 && sending) {
        ws.send(uploadData);
        totalBytesSent += UPLOAD_CHUNK_SIZE;
      }

      // Schedule next send batch
      setTimeout(sendData, 10);

      // Report progress
      const now = performance.now();
      const clientMbps = elapsed > 0
        ? (totalBytesSent * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      const reportMbps = lastServerMbps > 0 ? lastServerMbps : clientMbps;
      const progress = Math.min((elapsed / TEST_DURATION_MS) * 100, 100);
      callbacks.onProgress('upload', progress, Math.round(reportMbps * 10) / 10);
      if (elapsed > 1000 && now - lastDataPointTime >= 200) {
        lastDataPointTime = now;
        callbacks.onDataPoint('upload', reportMbps);
      }
    }

    ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const msg: NDT7Measurement = JSON.parse(event.data);
          if (msg.AppInfo?.NumBytes && msg.AppInfo?.ElapsedTime) {
            lastServerMbps = (msg.AppInfo.NumBytes * 8) /
              (msg.AppInfo.ElapsedTime / 1_000_000) / 1_000_000;
          }
        } catch {
          // ignore
        }
      }
    };

    ws.onclose = () => {
      signal.removeEventListener('abort', onAbort);
      sending = false;
      const elapsed = performance.now() - startTime;
      const clientMbps = elapsed > 0
        ? (totalBytesSent * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      resolve(lastServerMbps > 0 ? lastServerMbps : clientMbps);
    };

    ws.onerror = (ev) => {
      console.error('[ndt7] Upload WebSocket error:', ev);
      signal.removeEventListener('abort', onAbort);
      sending = false;
      reject(new Error('Upload test WebSocket error'));
    };
  });
}

function calculateJitter(samples: number[]): number {
  if (samples.length < 2) return 0;
  let sumDiff = 0;
  for (let i = 1; i < samples.length; i++) {
    sumDiff += Math.abs(samples[i] - samples[i - 1]);
  }
  return sumDiff / (samples.length - 1);
}

// --- Mock speed test for development ---

const MOCK_PHASE_MS = 3_000; // Each mock phase runs 3 seconds
const MOCK_TICK_MS = 100;

function noise(base: number, spread: number): number {
  return base + (Math.random() - 0.5) * spread;
}

async function runMockSpeedTest(
  callbacks: SpeedTestCallbacks,
  signal: AbortSignal,
): Promise<SpeedTestResult> {
  const mockPing = noise(45, 8);
  const mockDownload = noise(620, 150);
  const mockUpload = noise(180, 60);
  const mockLatency = noise(58, 10);
  const mockJitter = noise(12, 4);

  // Ping phase
  for (let i = 1; i <= 3; i++) {
    if (signal.aborted) throw new Error('Aborted');
    await sleep(300);
    callbacks.onProgress('ping', (i / 3) * 100, Math.round(noise(mockPing, 4)));
  }
  callbacks.onPhaseComplete('ping', Math.round(mockPing));

  // Download phase
  const dlSteps = MOCK_PHASE_MS / MOCK_TICK_MS;
  for (let i = 1; i <= dlSteps; i++) {
    if (signal.aborted) throw new Error('Aborted');
    await sleep(MOCK_TICK_MS);
    const progress = (i / dlSteps) * 100;
    const currentMbps = noise(mockDownload, 200) * Math.min(i / 5, 1); // ramp up
    callbacks.onProgress('download', progress, Math.round(currentMbps * 10) / 10);
    if (i > 5 && i % 2 === 0) {
      callbacks.onDataPoint('download', currentMbps);
      callbacks.onLatencySample(noise(mockLatency, 4));
    }
  }
  callbacks.onPhaseComplete('download', mockDownload);

  // Upload phase
  const ulSteps = MOCK_PHASE_MS / MOCK_TICK_MS;
  for (let i = 1; i <= ulSteps; i++) {
    if (signal.aborted) throw new Error('Aborted');
    await sleep(MOCK_TICK_MS);
    const progress = (i / ulSteps) * 100;
    const currentMbps = noise(mockUpload, 100) * Math.min(i / 5, 1);
    callbacks.onProgress('upload', progress, Math.round(currentMbps * 10) / 10);
    if (i > 5 && i % 2 === 0) {
      callbacks.onDataPoint('upload', currentMbps);
    }
  }
  callbacks.onPhaseComplete('upload', mockUpload);

  abortController = null;

  return {
    downloadMbps: Math.round(mockDownload * 100) / 100,
    uploadMbps: Math.round(mockUpload * 100) / 100,
    pingMs: Math.round(mockPing),
    latencyMs: Math.round(mockLatency),
    jitterMs: Math.round(mockJitter * 10) / 10,
    serverName: 'mock-server.local',
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
