import { invoke } from '@tauri-apps/api/core';

export type NodeStatus = 'ok' | 'partial' | 'down';

export interface NodeResult {
  id: 'computer' | 'network' | 'dns' | 'internet';
  label: string;
  status: NodeStatus;
  latency_ms: number | null;
  details: string | null;
}

export interface Speed {
  down_mbps: number | null;
  up_mbps: number | null;
}

export interface ComputerInfo {
  hostname: string | null;
  model: string | null;
  adapter: string | null;
  local_ip: string | null;
}

export type ConnectionType = 'Wifi' | 'Ethernet' | 'Usb' | 'Mobile' | 'Unknown';

export interface NetworkInfo {
  connection_type: ConnectionType;
  ssid: string | null;
  rssi: number | null;  // dBm
  signal_quality: string | null;  // i18n key
  channel: number | null;
  frequency: string | null;  // "2.4 GHz" | "5 GHz"
}

export interface RouterInfo {
  gateway_ip: string | null;
  gateway_mac: string | null;
  vendor: string | null;  // From OUI lookup
  model: string | null;
}

export interface InternetInfo {
  public_ip: string | null;
  isp: string | null;
  country: string | null;
  city: string | null;
  dns_ok: boolean;
  http_ok: boolean;
  latency_ms: number | null;
  speed_down_mbps: number | null;
  speed_up_mbps: number | null;
}

export interface DiagnosticsSnapshot {
  at_utc: string;
  nodes: NodeResult[];
  summary_key: string;
  computer: ComputerInfo;
  network: NetworkInfo;
  router: RouterInfo;
  internet: InternetInfo;
}

export async function runDiagnostics(): Promise<DiagnosticsSnapshot> {
  return await invoke<DiagnosticsSnapshot>('run_diagnostics');
}

export async function getSettings(): Promise<string> {
  return await invoke<string>('get_settings');
}

export async function setSettings(json: string): Promise<void> {
  return await invoke('set_settings', { json });
}

// DNS Provider types
export type CloudflareVariant = 'Standard' | 'Malware' | 'Family';
export type AdGuardVariant = 'Standard' | 'NonFiltering' | 'Family';
export type Dns4EuVariant = 'Protective' | 'ProtectiveChild' | 'ProtectiveAd' | 'ProtectiveChildAd' | 'Unfiltered';
export type CleanBrowsingVariant = 'Family' | 'Adult' | 'Security';
export type Quad9Variant = 'Recommended' | 'SecuredEcs' | 'Unsecured';
export type OpenDnsVariant = 'FamilyShield' | 'Home';

export type DnsProvider =
  | { type: 'Auto' }
  | { type: 'Cloudflare'; variant: CloudflareVariant }
  | { type: 'Google' }
  | { type: 'AdGuard'; variant: AdGuardVariant }
  | { type: 'Dns4Eu'; variant: Dns4EuVariant }
  | { type: 'CleanBrowsing'; variant: CleanBrowsingVariant }
  | { type: 'Quad9'; variant: Quad9Variant }
  | { type: 'OpenDns'; variant: OpenDnsVariant }
  | { type: 'Custom'; primary: string; secondary: string };

export async function setDns(provider: DnsProvider): Promise<void> {
  return await invoke('set_dns', { provider });
}

export async function getDnsProvider(): Promise<DnsProvider> {
  return await invoke<DnsProvider>('get_dns_provider');
}
