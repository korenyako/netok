use serde::{Deserialize, Serialize};

// Re-export common types from netok_core (no duplication)
pub use netok_core::{
    ComputerInfo, ConnectionType, DiagnosticResult, DiagnosticScenario, DiagnosticSeverity,
    InternetInfo, NetworkInfo, RouterInfo,
};

/// Overall status for UI display.
///
/// This is a simplified version of netok_core::Status:
/// - Ok -> Ok
/// - Warn, Unknown -> Partial
/// - Fail -> Down
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Overall {
    Ok,
    Partial,
    Down,
}

impl Overall {
    pub fn as_str(&self) -> &'static str {
        match self {
            Overall::Ok => "ok",
            Overall::Partial => "partial",
            Overall::Down => "down",
        }
    }
}

impl std::fmt::Display for Overall {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Node identifier for UI display.
///
/// This is a simplified version of netok_core::NodeId:
/// - Computer -> Computer
/// - Wifi -> Network
/// - RouterUpnp, Dns -> Dns
/// - Internet -> Internet
#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum NodeId {
    Computer,
    Network,
    Dns,
    Internet,
}

impl NodeId {
    pub fn as_str(&self) -> &'static str {
        match self {
            NodeId::Computer => "computer",
            NodeId::Network => "network",
            NodeId::Dns => "dns",
            NodeId::Internet => "internet",
        }
    }
}

impl std::fmt::Display for NodeId {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NodeResult {
    pub id: NodeId,
    pub label: String,
    pub status: Overall,
    pub latency_ms: Option<u64>,
    pub details: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Speed {
    pub down_mbps: Option<f64>,
    pub up_mbps: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Snapshot {
    pub at_utc: String,
    pub overall: Overall,
    pub summary_key: String,
    pub nodes: Vec<NodeResult>,
    pub speed: Option<Speed>,
    pub computer: ComputerInfo,
    pub network: NetworkInfo,
    pub router: RouterInfo,
    pub internet: InternetInfo,
}
