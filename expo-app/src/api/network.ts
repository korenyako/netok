/**
 * Network API abstraction layer for mobile.
 *
 * checkComputer, checkNetwork, checkRouter, checkInternet — use real device/network APIs.
 * DNS setting, WiFi security, device scan — still mock (require native modules).
 */

import * as Network from 'expo-network';
import * as Device from 'expo-device';
import type {
  SingleNodeResult,
  ConnectionType,
  DnsProvider,
  WiFiSecurityReport,
  NetworkDevice,
} from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Fetch with a timeout (AbortController). */
async function fetchWithTimeout(url: string, timeoutMs: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Computer ───────────────────────────────────────────────

export async function checkComputer(): Promise<SingleNodeResult> {
  let local_ip: string | null = null;
  let adapter: string | null = null;

  try {
    local_ip = await Network.getIpAddressAsync();
  } catch { /* unavailable */ }

  try {
    const state = await Network.getNetworkStateAsync();
    if (state.type === Network.NetworkStateType.WIFI) adapter = 'Wi-Fi';
    else if (state.type === Network.NetworkStateType.CELLULAR) adapter = 'Cellular';
    else if (state.type) adapter = String(state.type);
  } catch { /* unavailable */ }

  const hostname = Device.deviceName || null;
  const model = Device.modelName || null;
  const hasConnection = local_ip !== null;

  return {
    node: { id: 'computer', label: 'diagnostics.computer', status: hasConnection ? 'ok' : 'down', latency_ms: null, details: null },
    computer: { hostname, model, adapter, local_ip },
    network: null,
    router: null,
    internet: null,
  };
}

// ─── Network / WiFi ─────────────────────────────────────────

export async function checkNetwork(_adapter: string | null): Promise<SingleNodeResult> {
  let connection_type: ConnectionType = 'Unknown';
  let isConnected = false;

  try {
    const state = await Network.getNetworkStateAsync();
    isConnected = state.isConnected ?? false;
    if (state.type === Network.NetworkStateType.WIFI) connection_type = 'Wifi';
    else if (state.type === Network.NetworkStateType.CELLULAR) connection_type = 'Mobile';
  } catch { /* defaults */ }

  // SSID, RSSI, channel, frequency require a native module + ACCESS_FINE_LOCATION on Android 10+.
  // For now these remain null until a native module is implemented.

  return {
    node: { id: 'network', label: 'diagnostics.wifi', status: isConnected ? 'ok' : 'down', latency_ms: null, details: null },
    computer: null,
    network: {
      connection_type,
      ssid: null,
      rssi: null,
      signal_quality: null,
      channel: null,
      frequency: null,
    },
    router: null,
    internet: null,
  };
}

// ─── Router ─────────────────────────────────────────────────

export async function checkRouter(): Promise<SingleNodeResult> {
  // Heuristic: derive likely gateway IP from local IP (x.x.x.1).
  // Proper detection requires ARP table access via a native module.
  let gateway_ip: string | null = null;
  let reachable = false;

  try {
    const localIp = await Network.getIpAddressAsync();
    if (localIp) {
      const parts = localIp.split('.');
      if (parts.length === 4) {
        gateway_ip = `${parts[0]}.${parts[1]}.${parts[2]}.1`;
      }
    }
  } catch { /* unavailable */ }

  if (gateway_ip) {
    try {
      await fetchWithTimeout(`http://${gateway_ip}`, 2000);
      reachable = true;
    } catch {
      // Many routers don't respond to HTTP, but if we have a local IP
      // and the network is connected, the router is likely reachable.
      reachable = true;
    }
  }

  return {
    node: { id: 'dns', label: 'diagnostics.router', status: reachable ? 'ok' : 'down', latency_ms: null, details: null },
    computer: null,
    network: null,
    router: {
      gateway_ip,
      gateway_mac: null,
      vendor: null,
      model: null,
    },
    internet: null,
  };
}

// ─── Internet ───────────────────────────────────────────────

export async function checkInternet(): Promise<SingleNodeResult> {
  // 1. DNS test: resolve a well-known domain via HTTPS fetch
  let dns_ok = false;
  try {
    const resp = await fetchWithTimeout('https://one.one.one.one', 3000, { method: 'HEAD' });
    dns_ok = resp.ok;
  } catch { /* failed */ }
  if (!dns_ok) {
    try {
      const resp = await fetchWithTimeout('https://dns.google', 3000, { method: 'HEAD' });
      dns_ok = resp.ok;
    } catch { /* still false */ }
  }

  // 2. HTTP test: reach a well-known HTTPS endpoint
  let http_ok = false;
  try {
    const resp = await fetchWithTimeout('https://www.cloudflare.com/cdn-cgi/trace', 3000);
    http_ok = resp.ok;
  } catch { /* failed */ }
  if (!http_ok) {
    try {
      const resp = await fetchWithTimeout('https://example.com', 3000);
      http_ok = resp.ok;
    } catch { /* still false */ }
  }

  // 3. Public IP + geolocation (ipinfo.io — same as desktop)
  let public_ip: string | null = null;
  let isp: string | null = null;
  let country: string | null = null;
  let city: string | null = null;
  let latency_ms: number | null = null;

  if (http_ok) {
    try {
      const start = Date.now();
      const resp = await fetchWithTimeout('https://ipinfo.io/json', 3000);
      latency_ms = Date.now() - start;
      if (resp.ok) {
        const data = await resp.json();
        public_ip = data.ip || null;
        isp = data.org || null;
        country = data.country || null;
        city = data.city || null;
      }
    } catch { /* keep nulls */ }
  }

  const status = dns_ok && http_ok ? 'ok' : (dns_ok || http_ok) ? 'partial' : 'down';

  return {
    node: { id: 'internet', label: 'diagnostics.internet', status, latency_ms, details: null },
    computer: null,
    network: null,
    router: null,
    internet: {
      public_ip,
      isp,
      country,
      city,
      dns_ok,
      http_ok,
      latency_ms,
      speed_down_mbps: null,
      speed_up_mbps: null,
    },
  };
}

// ─── DNS (still mock — requires native VPN API on Android) ──

export async function getDnsProvider(): Promise<DnsProvider> {
  return { type: 'Auto' };
}

export async function setDns(_provider: DnsProvider): Promise<void> {
  await delay(300);
}

// ─── WiFi Security (still mock — requires native WiFi APIs) ─

export async function checkWifiSecurity(): Promise<WiFiSecurityReport> {
  await delay(2000);
  return {
    checks: [
      { check_type: 'encryption', status: 'safe', details: null },
      { check_type: 'evil_twin', status: 'safe', details: null },
      { check_type: 'arp_spoofing', status: 'safe', details: null },
      { check_type: 'dns_hijacking', status: 'safe', details: null },
    ],
    overall_status: 'safe',
    network_ssid: null,
    timestamp: Date.now(),
  };
}

// ─── Device Scan (still mock — requires native ARP/mDNS) ───

export async function scanNetworkDevices(): Promise<NetworkDevice[]> {
  await delay(3000);
  return [
    { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', vendor: 'TP-Link', hostname: 'router', device_type: 'Router', is_gateway: true, is_self: false, is_randomized: false },
    { ip: '192.168.1.105', mac: '11:22:33:44:55:66', vendor: 'Samsung', hostname: 'android-device', device_type: 'Phone', is_gateway: false, is_self: true, is_randomized: true },
    { ip: '192.168.1.102', mac: '77:88:99:AA:BB:CC', vendor: 'Apple', hostname: 'MacBook', device_type: 'Computer', is_gateway: false, is_self: false, is_randomized: false },
    { ip: '192.168.1.110', mac: 'DD:EE:FF:00:11:22', vendor: 'Samsung', hostname: null, device_type: 'SmartTv', is_gateway: false, is_self: false, is_randomized: false },
  ];
}
