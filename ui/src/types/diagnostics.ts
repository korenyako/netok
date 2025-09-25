// TypeScript types for diagnostics data structure
// Maps to Rust netok_core::Snapshot and related types

export type LinkQuality =
  | { kind: "wifi"; rssiDbm: number }
  | { kind: "ethernet"; link: "up" | "down" }
  | { kind: "other"; note?: string };

export interface ComputerNode {
  hostname?: string | null;
  model?: string | null;
  primary_adapter?: string | null;
  local_ip?: string | null;
}

export interface RouterNode {
  local_ip?: string | null;
}

export interface InternetNode {
  reachable: boolean;
  public_ip?: string | null;
  operator?: string | null;
  city?: string | null;
  country?: string | null;
  provider?: string | null;
  timestamp: string;
}

export interface Snapshot {
  computer: ComputerNode;
  router?: RouterNode | null;
  internet?: InternetNode | null;
  version: number;
}
