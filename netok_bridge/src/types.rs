use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Overall {
    Ok,
    Partial,
    Down,
}

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
pub enum ConnectionType {
    Wifi,
    Ethernet,
    Usb,
    Mobile,
    Unknown,
}

#[derive(Debug, Serialize)]
pub struct NetworkInfo {
    pub connection_type: ConnectionType,
    pub ssid: Option<String>,
    pub rssi: Option<i32>,
    pub signal_quality: Option<String>,
    pub channel: Option<u8>,
    pub frequency: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct RouterInfo {
    pub gateway_ip: Option<String>,
    pub gateway_mac: Option<String>,
    pub vendor: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct InternetInfo {
    pub public_ip: Option<String>,
    pub isp: Option<String>,
    pub country: Option<String>,
    pub city: Option<String>,
    pub dns_ok: bool,
    pub http_ok: bool,
    pub latency_ms: Option<u32>,
    pub speed_down_mbps: Option<f64>,
    pub speed_up_mbps: Option<f64>,
}

#[derive(Debug, Serialize)]
pub struct Snapshot {
    pub overall: Overall,
    pub nodes:   Vec<NodeResult>,
    pub speed:   Option<Speed>,
    pub computer: ComputerInfo,
    pub network: NetworkInfo,
    pub router: RouterInfo,
    pub internet: InternetInfo,
}
