/**
 * Network API abstraction layer for mobile.
 *
 * Currently uses mock data for demonstration.
 * In production, these would be replaced with native module calls
 * (e.g., via expo-modules or react-native bridge to native network APIs).
 */

import type {
  SingleNodeResult,
  DnsProvider,
  WiFiSecurityReport,
  NetworkDevice,
} from './types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function checkComputer(): Promise<SingleNodeResult> {
  await delay(400);
  return {
    node: { id: 'computer', label: 'diagnostics.computer', status: 'ok', latency_ms: null, details: null },
    computer: {
      hostname: 'Android Device',
      model: 'Smartphone',
      adapter: 'Wi-Fi',
      local_ip: '192.168.1.105',
    },
    network: null,
    router: null,
    internet: null,
  };
}

export async function checkNetwork(_adapter: string | null): Promise<SingleNodeResult> {
  await delay(600);
  return {
    node: { id: 'network', label: 'diagnostics.wifi', status: 'ok', latency_ms: null, details: null },
    computer: null,
    network: {
      connection_type: 'Wifi',
      ssid: 'Home Wi-Fi',
      rssi: -45,
      signal_quality: 'nodes.network.signal_label_excellent',
      channel: 6,
      frequency: '5 GHz',
    },
    router: null,
    internet: null,
  };
}

export async function checkRouter(): Promise<SingleNodeResult> {
  await delay(500);
  return {
    node: { id: 'dns', label: 'diagnostics.router', status: 'ok', latency_ms: 2, details: null },
    computer: null,
    network: null,
    router: {
      gateway_ip: '192.168.1.1',
      gateway_mac: 'AA:BB:CC:DD:EE:FF',
      vendor: 'TP-Link',
      model: 'Archer AX55',
    },
    internet: null,
  };
}

export async function checkInternet(): Promise<SingleNodeResult> {
  await delay(800);
  return {
    node: { id: 'internet', label: 'diagnostics.internet', status: 'ok', latency_ms: 15, details: null },
    computer: null,
    network: null,
    router: null,
    internet: {
      public_ip: '203.0.113.42',
      isp: 'Example ISP',
      country: 'Russia',
      city: 'Moscow',
      dns_ok: true,
      http_ok: true,
      latency_ms: 15,
      speed_down_mbps: 95.4,
      speed_up_mbps: 48.2,
    },
  };
}

export async function getDnsProvider(): Promise<DnsProvider> {
  return { type: 'Auto' };
}

export async function setDns(_provider: DnsProvider): Promise<void> {
  await delay(300);
}

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
    network_ssid: 'Home Wi-Fi',
    timestamp: Date.now(),
  };
}

export async function scanNetworkDevices(): Promise<NetworkDevice[]> {
  await delay(3000);
  return [
    { ip: '192.168.1.1', mac: 'AA:BB:CC:DD:EE:FF', vendor: 'TP-Link', hostname: 'router', device_type: 'Router', is_gateway: true, is_self: false, is_randomized: false },
    { ip: '192.168.1.105', mac: '11:22:33:44:55:66', vendor: 'Samsung', hostname: 'android-device', device_type: 'Phone', is_gateway: false, is_self: true, is_randomized: true },
    { ip: '192.168.1.102', mac: '77:88:99:AA:BB:CC', vendor: 'Apple', hostname: 'MacBook', device_type: 'Computer', is_gateway: false, is_self: false, is_randomized: false },
    { ip: '192.168.1.110', mac: 'DD:EE:FF:00:11:22', vendor: 'Samsung', hostname: null, device_type: 'SmartTv', is_gateway: false, is_self: false, is_randomized: false },
  ];
}
