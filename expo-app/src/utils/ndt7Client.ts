// NDT7 WebSocket client for M-Lab speed testing (React Native)
// Protocol: https://github.com/m-lab/ndt-server/blob/main/spec/ndt7-protocol.md

const LOCATE_URL = 'https://locate.measurementlab.net/v2/nearest/ndt/ndt7';
const NDT7_SUBPROTOCOL = 'net.measurementlab.ndt.v7';
const TEST_DURATION_MS = 10_000;
const UPLOAD_CHUNK_SIZE = 8192; // 8KB per WebSocket message
const WS_CONNECT_TIMEOUT_MS = 5_000;

// --- Types ---

interface LocateResult {
  results: Array<{
    machine: string;
    urls: Record<string, string>;
  }>;
}

interface NDT7Measurement {
  AppInfo?: {
    ElapsedTime?: number; // microseconds
    NumBytes?: number;
  };
  TCPInfo?: {
    SmoothedRTT?: number; // microseconds
  };
}

export interface SpeedTestCallbacks {
  onProgress: (phase: 'ping' | 'download' | 'upload', progress: number, currentValue: number) => void;
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

let cancelled = false;

type Server = LocateResult['results'][0];

let cachedServers: Server[] | null = null;
let cachedServersTime = 0;
const SERVER_CACHE_TTL = 5 * 60 * 1000;

export function abort() {
  cancelled = true;
}

export async function runSpeedTest(callbacks: SpeedTestCallbacks): Promise<SpeedTestResult> {
  cancelled = false;

  const servers = await discoverServers();

  let lastError: Error | null = null;
  for (let i = 0; i < servers.length; i++) {
    const server = servers[i];
    if (cancelled) throw new Error('Aborted');

    try {
      return await runTestWithServer(server, callbacks);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message === 'Aborted') throw lastError;

      console.warn(
        `[ndt7] Server ${server.machine} failed (${i + 1}/${servers.length}):`,
        lastError.message,
      );

      if (i === servers.length - 1) {
        cachedServers = null;
      }
    }
  }

  throw lastError ?? new Error('All servers failed');
}

async function runTestWithServer(
  server: Server,
  callbacks: SpeedTestCallbacks,
): Promise<SpeedTestResult> {
  const serverName = server.machine;
  const downloadUrl = resolveUrl(server, 'download');
  const uploadUrl = resolveUrl(server, 'upload');

  // Ping
  const pingMs = await measurePing(downloadUrl, callbacks);
  callbacks.onPhaseComplete('ping', pingMs);

  // Download
  const { throughputMbps: downloadMbps, latencySamples } = await runDownloadTest(
    downloadUrl, callbacks,
  );
  callbacks.onPhaseComplete('download', downloadMbps);

  // Upload
  const uploadMbps = await runUploadTest(uploadUrl, callbacks);
  callbacks.onPhaseComplete('upload', uploadMbps);

  const latencyMs = latencySamples.length > 0
    ? latencySamples.reduce((a, b) => a + b, 0) / latencySamples.length
    : pingMs;
  const jitterMs = calculateJitter(latencySamples);

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    pingMs: Math.round(pingMs),
    latencyMs: Math.round(latencyMs),
    jitterMs: Math.round(jitterMs * 10) / 10,
    serverName,
  };
}

async function discoverServers(): Promise<Server[]> {
  if (cachedServers && Date.now() - cachedServersTime < SERVER_CACHE_TTL) {
    return cachedServers;
  }

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (cancelled) throw new Error('Aborted');

    const resp = await fetch(LOCATE_URL);
    if (resp.status === 429) {
      const delay = (attempt + 1) * 2000;
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

    cachedServers = data.results;
    cachedServersTime = Date.now();
    return data.results;
  }

  throw new Error('Server discovery failed: rate limited (429)');
}

function resolveUrl(server: Server, test: 'download' | 'upload'): string {
  const wssKey = `wss:///ndt/v7/${test}`;
  const wsKey = `ws:///ndt/v7/${test}`;
  const url = server.urls[wssKey] || server.urls[wsKey];
  if (url) return url;

  const hostname = (server as Record<string, unknown>).hostname || `ndt-${server.machine}`;
  return `wss://${hostname}/ndt/v7/${test}`;
}

async function measurePing(
  wsUrl: string,
  callbacks: SpeedTestCallbacks,
): Promise<number> {
  const samples: number[] = [];
  const attempts = 3;

  for (let i = 0; i < attempts; i++) {
    if (cancelled) throw new Error('Aborted');
    callbacks.onProgress('ping', ((i + 1) / attempts) * 100, 0);

    const rtt = await wsPing(wsUrl);
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

function wsPing(wsUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const start = performance.now();
    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);

    const timer = setTimeout(() => {
      ws.close();
      resolve(0);
    }, WS_CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      const rtt = performance.now() - start;
      clearTimeout(timer);
      ws.close();
      resolve(rtt);
    };
    ws.onerror = () => {
      clearTimeout(timer);
      resolve(0);
    };
  });
}

async function runDownloadTest(
  wsUrl: string,
  callbacks: SpeedTestCallbacks,
): Promise<{ throughputMbps: number; latencySamples: number[] }> {
  return new Promise((resolve, reject) => {
    if (cancelled) { reject(new Error('Aborted')); return; }

    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);

    let totalBytes = 0;
    let startTime = 0;
    let lastMbps = 0;
    const latencySamples: number[] = [];

    const checkCancel = setInterval(() => {
      if (cancelled) { ws.close(); reject(new Error('Aborted')); }
    }, 500);

    ws.onopen = () => {
      startTime = performance.now();
    };

    ws.onmessage = (event: WebSocketMessageEvent) => {
      const now = performance.now();
      const elapsed = now - startTime;

      if (typeof event.data === 'string') {
        try {
          const msg: NDT7Measurement = JSON.parse(event.data);
          if (msg.TCPInfo?.SmoothedRTT) {
            const rttMs = msg.TCPInfo.SmoothedRTT / 1000;
            latencySamples.push(rttMs);
          }
          if (msg.AppInfo?.NumBytes) {
            const serverMbps = (msg.AppInfo.NumBytes * 8) /
              ((msg.AppInfo.ElapsedTime || 1) / 1_000_000) / 1_000_000;
            lastMbps = serverMbps;
          }
        } catch {
          totalBytes += event.data.length;
        }
      } else if (event.data instanceof ArrayBuffer) {
        totalBytes += event.data.byteLength;
      } else if (typeof event.data === 'object' && event.data !== null) {
        // React Native may deliver binary as Blob or base64
        const size = (event.data as { size?: number }).size;
        totalBytes += size ?? 0;
      }

      if (elapsed > 0) {
        const clientMbps = (totalBytes * 8) / (elapsed / 1000) / 1_000_000;
        const reportMbps = lastMbps > 0 ? lastMbps : clientMbps;
        const progress = Math.min((elapsed / TEST_DURATION_MS) * 100, 100);
        callbacks.onProgress('download', progress, Math.round(reportMbps * 10) / 10);
      }
    };

    ws.onclose = () => {
      clearInterval(checkCancel);
      const elapsed = performance.now() - startTime;
      const clientMbps = elapsed > 0
        ? (totalBytes * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      const throughputMbps = lastMbps > 0 ? lastMbps : clientMbps;
      resolve({ throughputMbps, latencySamples });
    };

    ws.onerror = () => {
      clearInterval(checkCancel);
      reject(new Error('Download test WebSocket error'));
    };
  });
}

async function runUploadTest(
  wsUrl: string,
  callbacks: SpeedTestCallbacks,
): Promise<number> {
  return new Promise((resolve, reject) => {
    if (cancelled) { reject(new Error('Aborted')); return; }

    const ws = new WebSocket(wsUrl, NDT7_SUBPROTOCOL);

    let startTime = 0;
    let totalBytesSent = 0;
    let lastServerMbps = 0;
    let sending = false;
    const uploadData = new ArrayBuffer(UPLOAD_CHUNK_SIZE);

    const checkCancel = setInterval(() => {
      if (cancelled) { sending = false; ws.close(); reject(new Error('Aborted')); }
    }, 500);

    ws.onopen = () => {
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

      // Send a batch of data
      // React Native WebSocket may not support bufferedAmount reliably,
      // so we send a fixed batch per tick
      const batchCount = 10;
      for (let i = 0; i < batchCount && sending; i++) {
        try {
          ws.send(uploadData);
          totalBytesSent += UPLOAD_CHUNK_SIZE;
        } catch {
          // Socket may be closing
          break;
        }
      }

      const clientMbps = elapsed > 0
        ? (totalBytesSent * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      const reportMbps = lastServerMbps > 0 ? lastServerMbps : clientMbps;
      const progress = Math.min((elapsed / TEST_DURATION_MS) * 100, 100);
      callbacks.onProgress('upload', progress, Math.round(reportMbps * 10) / 10);

      setTimeout(sendData, 25);
    }

    ws.onmessage = (event: WebSocketMessageEvent) => {
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
      clearInterval(checkCancel);
      sending = false;
      const elapsed = performance.now() - startTime;
      const clientMbps = elapsed > 0
        ? (totalBytesSent * 8) / (elapsed / 1000) / 1_000_000
        : 0;
      resolve(lastServerMbps > 0 ? lastServerMbps : clientMbps);
    };

    ws.onerror = () => {
      clearInterval(checkCancel);
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
