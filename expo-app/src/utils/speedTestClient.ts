// Cloudflare HTTP-based speed test client for React Native
//
// Uses Cloudflare's speed test CDN endpoints (same as speed.cloudflare.com):
//   - Latency: GET __down?bytes=0 (TTFB measurement)
//   - Download: GET __down?bytes=N (fetch, progress between requests)
//   - Upload: POST __up with string body (fetch, progress between requests)
//
// Both download and upload use fetch() with sequential requests.
// Progress is tracked between requests (not within a single request).
// This avoids RN XHR quirks and gives accurate byte counts.

const BASE_URL = 'https://speed.cloudflare.com';
const DOWNLOAD_URL = `${BASE_URL}/__down`;
const UPLOAD_URL = `${BASE_URL}/__up`;

// Download: many smaller requests for accurate measurement + more graph points
const DOWNLOAD_PHASES = [
  { bytes: 1_000_000, count: 4 },    // 1MB x4 — warm up
  { bytes: 5_000_000, count: 6 },    // 5MB x6 — main measurement
  { bytes: 10_000_000, count: 4 },   // 10MB x4 — fast connections
];

// Upload: smaller sizes (upload is usually slower)
const UPLOAD_PHASES = [
  { bytes: 500_000, count: 4 },      // 500KB x4 — warm up
  { bytes: 2_000_000, count: 6 },    // 2MB x6 — main measurement
  { bytes: 5_000_000, count: 4 },    // 5MB x4 — fast connections
];

const MAX_PHASE_DURATION = 10_000; // Max 10 seconds per phase
const LATENCY_SAMPLES = 5;

// --- Types ---

export interface SpeedTestCallbacks {
  onProgress: (phase: 'ping' | 'download' | 'upload', progress: number, currentValue: number) => void;
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

// --- Abort control ---

let cancelled = false;

export function abort() {
  cancelled = true;
}

// --- Main entry ---

export async function runSpeedTest(callbacks: SpeedTestCallbacks): Promise<SpeedTestResult> {
  cancelled = false;

  // 1. Latency
  const { pingMs, samples } = await measureLatency(callbacks);
  callbacks.onPhaseComplete('ping', pingMs);

  if (cancelled) throw new Error('Aborted');

  // 2. Download
  const downloadMbps = await measureDownload(callbacks);
  callbacks.onPhaseComplete('download', downloadMbps);

  if (cancelled) throw new Error('Aborted');

  // 3. Upload
  const uploadMbps = await measureUpload(callbacks);
  callbacks.onPhaseComplete('upload', uploadMbps);

  const jitterMs = calculateJitter(samples);

  return {
    downloadMbps: Math.round(downloadMbps * 100) / 100,
    uploadMbps: Math.round(uploadMbps * 100) / 100,
    pingMs: Math.round(pingMs),
    latencyMs: Math.round(pingMs), // Unloaded latency = ping
    jitterMs: Math.round(jitterMs * 10) / 10,
    serverName: 'Cloudflare',
  };
}

// --- Latency ---

async function measureLatency(
  callbacks: SpeedTestCallbacks,
): Promise<{ pingMs: number; samples: number[] }> {
  const samples: number[] = [];

  for (let i = 0; i < LATENCY_SAMPLES; i++) {
    if (cancelled) throw new Error('Aborted');

    const cacheBust = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const start = performance.now();
    await fetch(`${DOWNLOAD_URL}?bytes=0&_=${cacheBust}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'Accept-Encoding': 'identity',
      },
    });
    const rtt = performance.now() - start;

    samples.push(rtt);
    callbacks.onProgress('ping', ((i + 1) / LATENCY_SAMPLES) * 100, Math.round(rtt));
    callbacks.onLatencySample(rtt);
  }

  if (samples.length === 0) {
    throw new Error('Latency measurement failed');
  }

  // Median
  const sorted = [...samples].sort((a, b) => a - b);
  const pingMs = sorted[Math.floor(sorted.length / 2)];
  return { pingMs, samples };
}

// --- Download ---
//
// Uses fetch() to avoid RN XHR blob.size inflation (decompressed size vs wire size).
// Accept-Encoding: identity prevents gzip — we measure raw network throughput.
// Content-Length from the response gives exact wire bytes.

async function measureDownload(callbacks: SpeedTestCallbacks): Promise<number> {
  let totalBytes = 0;
  const startTime = performance.now();

  for (const phase of DOWNLOAD_PHASES) {
    for (let i = 0; i < phase.count; i++) {
      if (cancelled) throw new Error('Aborted');
      const elapsed = performance.now() - startTime;
      if (elapsed >= MAX_PHASE_DURATION) break;

      const received = await fetchDownload(phase.bytes);
      totalBytes += received;

      // Update progress after each completed request
      const now = performance.now();
      const totalElapsed = now - startTime;
      const mbps = (totalBytes * 8) / (totalElapsed / 1000) / 1_000_000;
      const progress = Math.min((totalElapsed / MAX_PHASE_DURATION) * 100, 100);

      callbacks.onProgress('download', progress, Math.round(mbps * 10) / 10);
      callbacks.onDataPoint('download', mbps);
    }
    if (performance.now() - startTime >= MAX_PHASE_DURATION) break;
  }

  const totalElapsed = performance.now() - startTime;
  if (totalBytes === 0 || totalElapsed === 0) {
    throw new Error('Download test failed');
  }

  return (totalBytes * 8) / (totalElapsed / 1000) / 1_000_000;
}

async function fetchDownload(bytes: number): Promise<number> {
  const cacheBust = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const resp = await fetch(`${DOWNLOAD_URL}?bytes=${bytes}&_=${cacheBust}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store',
      'Accept-Encoding': 'identity', // Prevent gzip — measure raw throughput
    },
  });

  if (!resp.ok) {
    throw new Error(`Download failed: ${resp.status}`);
  }

  // Read the full body to ensure data is actually transferred
  await resp.arrayBuffer();

  // Use Content-Length for accurate wire byte count
  const cl = resp.headers.get('content-length');
  return cl ? parseInt(cl, 10) : bytes;
}

// --- Upload ---
//
// Uses fetch() — RN's XHR polyfill has unreliable upload support.
// Progress is tracked between requests.

// Pre-generate reusable upload payloads (avoid re-allocating each time)
const uploadPayloadCache = new Map<number, string>();

function getUploadPayload(bytes: number): string {
  let payload = uploadPayloadCache.get(bytes);
  if (!payload) {
    payload = 'x'.repeat(bytes);
    uploadPayloadCache.set(bytes, payload);
  }
  return payload;
}

async function measureUpload(callbacks: SpeedTestCallbacks): Promise<number> {
  let totalBytes = 0;
  const startTime = performance.now();

  for (const phase of UPLOAD_PHASES) {
    for (let i = 0; i < phase.count; i++) {
      if (cancelled) throw new Error('Aborted');
      const elapsed = performance.now() - startTime;
      if (elapsed >= MAX_PHASE_DURATION) break;

      await fetchUpload(phase.bytes);
      totalBytes += phase.bytes;

      // Update progress after each completed request
      const now = performance.now();
      const totalElapsed = now - startTime;
      const mbps = (totalBytes * 8) / (totalElapsed / 1000) / 1_000_000;
      const progress = Math.min((totalElapsed / MAX_PHASE_DURATION) * 100, 100);

      callbacks.onProgress('upload', progress, Math.round(mbps * 10) / 10);
      callbacks.onDataPoint('upload', mbps);
    }
    if (performance.now() - startTime >= MAX_PHASE_DURATION) break;
  }

  const totalElapsed = performance.now() - startTime;
  if (totalBytes === 0 || totalElapsed === 0) {
    throw new Error('Upload test failed');
  }

  return (totalBytes * 8) / (totalElapsed / 1000) / 1_000_000;
}

async function fetchUpload(bytes: number): Promise<void> {
  const payload = getUploadPayload(bytes);
  const resp = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  if (!resp.ok) {
    throw new Error(`Upload failed: ${resp.status}`);
  }
}

// --- Helpers ---

function calculateJitter(samples: number[]): number {
  if (samples.length < 2) return 0;
  let sumDiff = 0;
  for (let i = 1; i < samples.length; i++) {
    sumDiff += Math.abs(samples[i] - samples[i - 1]);
  }
  return sumDiff / (samples.length - 1);
}
