export type NodeStatus = 'ok' | 'partial' | 'down';

export interface NodeResult {
  id: 'computer' | 'network' | 'dns' | 'internet';
  label: string;
  status: NodeStatus;
  latency_ms: number | null;
  details: string | null;
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
  rssi: number | null;
  signal_quality: string | null;
  channel: number | null;
  frequency: string | null;
}

export interface RouterInfo {
  gateway_ip: string | null;
  gateway_mac: string | null;
  vendor: string | null;
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

export interface SingleNodeResult {
  node: NodeResult;
  computer: ComputerInfo | null;
  network: NetworkInfo | null;
  router: RouterInfo | null;
  internet: InternetInfo | null;
}

export type DiagnosticScenario =
  | 'all_good'
  | 'wifi_disabled'
  | 'wifi_not_connected'
  | 'router_unreachable'
  | 'no_internet'
  | 'dns_failure'
  | 'http_blocked'
  | 'weak_signal';

export type DiagnosticSeverity = 'success' | 'warning' | 'error';

export type CloudflareVariant = 'Standard' | 'Malware' | 'Family';
export type AdGuardVariant = 'Standard' | 'NonFiltering' | 'Family';
export type Quad9Variant = 'Recommended' | 'SecuredEcs' | 'Unsecured';

export type DnsProvider =
  | { type: 'Auto' }
  | { type: 'Cloudflare'; variant: CloudflareVariant }
  | { type: 'Google' }
  | { type: 'AdGuard'; variant: AdGuardVariant }
  | { type: 'Quad9'; variant: Quad9Variant }
  | { type: 'Custom'; primary: string; secondary: string; primaryIpv6: string | null; secondaryIpv6: string | null };

export type SecurityStatus = 'safe' | 'warning' | 'danger';
export type SecurityCheckType = 'encryption' | 'evil_twin' | 'arp_spoofing' | 'dns_hijacking';

export interface SecurityCheck {
  check_type: SecurityCheckType;
  status: SecurityStatus;
  details: string | null;
}

export interface WiFiSecurityReport {
  checks: SecurityCheck[];
  overall_status: SecurityStatus;
  network_ssid: string | null;
  timestamp: number;
}

export type DeviceType = 'Router' | 'Phone' | 'Computer' | 'Tablet' | 'Printer' | 'SmartTv' | 'GameConsole' | 'IoT' | 'Unknown';

export interface NetworkDevice {
  ip: string;
  mac: string;
  vendor: string | null;
  hostname: string | null;
  device_type: DeviceType;
  is_gateway: boolean;
  is_self: boolean;
  is_randomized: boolean;
}
