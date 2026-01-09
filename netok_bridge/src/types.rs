//! Bridge types for Tauri IPC.
//!
//! This module re-exports common types from netok_core and defines
//! bridge-specific types that transform core data for the UI layer.

use serde::Serialize;

// Re-export common types from netok_core (no duplication)
pub use netok_core::{ComputerInfo, ConnectionType, InternetInfo, NetworkInfo, RouterInfo};

/// Overall status for UI display.
///
/// This is a simplified version of netok_core::Status:
/// - Ok -> Ok
/// - Warn, Unknown -> Partial
/// - Fail -> Down
#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Overall {
    Ok,
    Partial,
    Down,
}

/// Node identifier for UI display.
///
/// This is a simplified version of netok_core::NodeId:
/// - Computer -> Computer
/// - Wifi -> Network
/// - RouterUpnp, Dns -> Dns
/// - Internet -> Internet
#[derive(Debug, Serialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum NodeId {
    Computer,
    Network,
    Dns,
    Internet,
}

#[derive(Debug, Serialize)]
pub struct NodeResult {
    pub id: NodeId,
    pub label: String,
    pub status: Overall,
    pub latency_ms: Option<u64>,
    pub details: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Speed {
    pub down_mbps: Option<f64>,
    pub up_mbps: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub overall: Overall,
    pub nodes: Vec<NodeResult>,
    pub speed: Option<Speed>,
    pub computer: ComputerInfo,
    pub network: NetworkInfo,
    pub router: RouterInfo,
    pub internet: InternetInfo,
}
