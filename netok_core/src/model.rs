#[derive(Debug, Clone, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConnectionType { 
    Wifi, 
    Ethernet, 
    UsbModem, 
    Tethering, 
    Vpn, 
    Unknown 
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum NodeId { 
    Computer, 
    Wifi, 
    RouterUpnp, 
    Dns, 
    Internet 
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Status { 
    Ok, 
    Warn, 
    Fail, 
    Unknown 
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct NodeInfo {
    pub id: NodeId,
    pub name_key: String,
    pub status: Status,
    pub latency_ms: Option<u32>,
    pub hint_key: Option<String>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ComputerNode {
    pub hostname: Option<String>,
    pub model: Option<String>,

    pub interface_name: Option<String>,           // en0 / wlan0 / Ethernet
    pub adapter_friendly: Option<String>,         // Windows: "Беспроводная сеть"
    pub adapter_model: Option<String>,            // Windows: "Realtek 8822CE ...", иначе best-effort
    pub connection_type: ConnectionType,          // для узла "Сеть"
    pub local_ip: Option<String>,
    pub rssi_dbm: Option<i32>,                   // Signal strength for Wi-Fi
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct RouterNode {
    pub local_ip: Option<String>, // default gateway
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct InternetNode {
    pub reachable: bool,
    pub public_ip: Option<String>,
    pub operator: Option<String>,
    pub city: Option<String>,
    pub country: Option<String>,
    pub provider: Option<String>,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct Snapshot {
    pub computer: ComputerNode,
    pub router: Option<RouterNode>,
    pub internet: Option<InternetNode>,
    pub version: u32, // schema version
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct Settings {
    pub language: String,
    pub test_timeout_ms: u32,
    pub dns_servers: Vec<String>,
}

pub fn get_default_settings() -> Settings {
    Settings { 
        language: "en".into(), 
        test_timeout_ms: 2000, 
        dns_servers: vec![] 
    }
}
