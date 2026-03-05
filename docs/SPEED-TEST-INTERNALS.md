# Speed Test Internals

Technical reference for Netok's speed test implementation. Entirely frontend-side (React/TypeScript); the Rust backend has scaffolded fields but they are always `None`.

---

## Protocol: NDT7 over WebSocket (M-Lab)

**File:** `ui/src/utils/ndt7Client.ts`

- **Protocol:** NDT7 (Network Diagnostic Tool v7) by Measurement Lab (M-Lab)
- **Spec:** https://github.com/m-lab/ndt-server/blob/main/spec/ndt7-protocol.md
- **Server discovery:** `GET https://locate.measurementlab.net/v2/nearest/ndt/ndt7` — returns geographically nearest servers
- **WebSocket subprotocol:** `net.measurementlab.ndt.v7`
- **Endpoints:** `wss://<server>/ndt/v7/download` and `wss://<server>/ndt/v7/upload` (prefers `wss://`, falls back to `ws://`)

---

## Test Phases and Timing

1. **Server discovery** — HTTP fetch to locate API, 3 retries on 429 rate limiting. Results cached for 5 minutes.
2. **Ping + Download run in parallel:**
   - Ping: 3 WebSocket connect/close cycles, measures `performance.now()` delta, takes median. Timeout: 5 seconds per attempt.
   - Download: WebSocket kept open, server streams binary data. Client counts `ArrayBuffer.byteLength`, server sends JSON measurement frames. Duration: ~10 seconds (`TEST_DURATION_MS = 10_000`).
3. **Upload** — WebSocket kept open, client sends `Uint8Array(8192)` chunks (8 KB each) in a tight loop while `ws.bufferedAmount < 1_000_000`. Duration: ~10 seconds. Server sends back JSON with `AppInfo.NumBytes`.
4. **Progress callbacks** fire every 200ms (`onDataPoint`) and on every message (`onProgress`).
5. **Server fallback** — if a server fails (any error except abort), the next server from the discover list is tried. Cache is invalidated on complete failure.
6. **Cooldown:** 60 seconds between real tests (`COOLDOWN_SECONDS = 60`).

---

## Metrics

| Metric | Source | Unit |
|---|---|---|
| Download | Server's `AppInfo.NumBytes / AppInfo.ElapsedTime`, fallback to client-side byte count | Mbps |
| Upload | Server's `AppInfo.NumBytes / AppInfo.ElapsedTime`, fallback to client-side byte count | Mbps |
| Ping | WebSocket connect-time RTT (median of 3 samples via `performance.now()`) | ms |
| Latency | Mean of `TCPInfo.SmoothedRTT` samples from server during download phase | ms |
| Jitter | Mean absolute consecutive difference of `TCPInfo.SmoothedRTT` samples | ms |

Server-side measurements are preferred over client-side for accuracy — the server sends JSON messages containing `AppInfo` and `TCPInfo` over the same WebSocket channel.

---

## State Management

**File:** `ui/src/stores/speedTestStore.ts`

Zustand store managing all test state:

- **Phase:** `idle` → `download` → `upload` → `done` (or `error`)
- **Graph data:** Sampled every 200ms into `GraphPoint[]` arrays, starting after first 1 second of each phase
- **Latency throttle:** Live latency display updated at most every 200ms (`LATENCY_THROTTLE_MS`)
- **Run ID guard:** `runIdCounter` prevents stale callbacks from a cancelled run updating state

---

## Practical Task Assessment (`calculateTaskChecklist`)

Seven tasks evaluated from the final metrics. Failed tasks sort to the top.

| Task | Pass condition |
|---|---|
| 4K Video | download ≥ 25 Mbps |
| Online Gaming | ping ≤ 50 ms AND jitter ≤ 30 ms |
| Video Calls | download ≥ 3 Mbps AND ping ≤ 100 ms |
| HD Video | download ≥ 10 Mbps |
| Music / Podcasts | download ≥ 1 Mbps |
| Social / Web | download ≥ 3 Mbps |
| Email / Messengers | download ≥ 0.5 Mbps |

Gaming and video calls have multi-dimensional fail variants:
- Gaming: `_fail_ping`, `_fail_jitter`, `_fail_both`
- Video calls: `_fail_download`, `_fail_ping`, `_fail_both`

---

## Warnings (`analyzeWarnings`)

Three warning conditions checked after test completes:

1. **Bufferbloat** — `latency > ping × 3` (high latency under load). Reports the ratio.
2. **Low speed** — `download < 10 Mbps` OR `upload < 3 Mbps`.
3. **Unstable connection** — `jitter > 10 ms`.

---

## UI Components

**File:** `ui/src/screens/SpeedTestScreen.tsx`

- **`CircleProgress`** — SVG arc (`r = 118`, circumference-based `strokeDashoffset`). Blue during download, purple (`#a855f7`) during upload. Shows live Mbps inside the circle and a `PingBadge` at bottom when latency is available.
- **`SpeedGraph`** — Canvas element with quadratic-smoothed line chart. Download in primary color, upload in purple. Gradient fill beneath each line.
- **`SpeedMetrics`** — Download/upload in large monospace font with Gbps auto-formatting at ≥1000 Mbps. Ping/latency/jitter with colored dot indicators.
- **`TaskChecklistSection`** — Expandable accordion rows; each row shows pass (green dot) or fail (red dot) with expand-on-click description.
- **Auto-start:** Test starts automatically on mount if `phase === 'idle'`, `cooldownSecondsLeft === 0`, and internet is available (checked via `diagnosticsStore`).

---

## Debug / Scenario Mode

`overrideScenario(scenario)` in the store drives `runScenarioTest()` with preset values:

| Scenario | Download | Upload | Ping | Latency | Jitter |
|---|---|---|---|---|---|
| `fast` | 150 | 80 | 8 ms | 12 ms | 2 ms |
| `slow` | 5 | 1.5 | 85 ms | 200 ms | 25 ms |
| `high_latency` | 50 | 25 | 12 ms | 180 ms | 35 ms |
| `error` | — | — | — | — | — |

Mock mode: `VITE_MOCK_SPEED_TEST=true` runs `runMockSpeedTest()` with randomized values (~620 Mbps down, ~180 Mbps up, ~45 ms ping).

---

## Rust Backend (Scaffolded, Not Used)

The data model reserves fields that are never populated:

- `InternetInfo.speed_down_mbps: Option<f64>` / `speed_up_mbps: Option<f64>` in `netok_core/src/domain.rs`
- `Speed { down_mbps, up_mbps }` in `netok_bridge/src/types.rs`
- Always set to `None` in `run_diagnostics_struct()`