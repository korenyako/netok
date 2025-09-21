use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Overall {
    Ok,
    Partial,
    Down,
}

#[derive(Debug, Serialize)]
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
    pub status: Overall,            // keep consistent with UI
    pub latency_ms: Option<u64>,
    pub details: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Speed {
    pub down_mbps: Option<f64>,
    pub up_mbps:   Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct ComputerInfo {
    pub hostname: Option<String>,
    pub model: Option<String>,
    pub adapter: Option<String>,
    pub local_ip: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub overall: Overall,
    pub nodes:   Vec<NodeResult>,
    pub speed:   Option<Speed>,
    pub computer: ComputerInfo,
}
