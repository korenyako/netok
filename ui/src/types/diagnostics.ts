// TypeScript types for diagnostics data structure
// Maps to Rust netok_core::DiagnosticsSnapshot and related types

export type LinkQuality =
  | { kind: "wifi"; rssiDbm: number }
  | { kind: "ethernet"; link: "up" | "down" }
  | { kind: "other"; note?: string };

export interface Snapshot {
  computer: {
    hostname?: string | null;
    model?: string | null;
    adapter?: string | null;
    localIp?: string | null;  // Maps to Rust ComputerInfo.local_ip
  };
  network: {
    kind: "wifi" | "ethernet" | "usb_modem" | "bt" | "cellular" | "unknown";
    metric?: LinkQuality | null;
  };
  router: {
    brand?: string | null;
    model?: string | null;
    localIp?: string | null;
  };
  internet: {
    operator?: string | null;
    publicIp?: string | null;
    geolocation?: { city?: string | null; country?: string | null } | null;
    reachable: "full" | "partial" | "down";
    speed?: { downMbps?: number | null; upMbps?: number | null } | null;
  };
  updatedAtIso?: string;  // Maps to Rust DiagnosticsSnapshot.at_utc
}

// Mapping notes for Rust -> TypeScript:
// 
// Current Rust structure (DiagnosticsSnapshot):
// - at_utc: String -> updatedAtIso?: string
// - nodes: Vec<NodeInfo> -> (not directly mapped, contains Computer/Wifi/Router/Dns/Internet nodes)
// - summary_key: String -> (not directly mapped, used for overall status)
// - computer: ComputerInfo -> computer: {...}
//   - hostname: Option<String> -> hostname?: string | null
//   - model: Option<String> -> model?: string | null  
//   - adapter: Option<String> -> adapter?: string | null
//   - local_ip: Option<String> -> localIp?: string | null
//
// TODO: The current Rust implementation only provides computer data.
// Network, router, and internet data will be added in future iterations.
// For now, these fields are optional to prevent UI crashes.
