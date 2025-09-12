use netok_core::{run_diagnostics, get_default_settings, Settings, NodeId, Status};
use serde::{Deserialize, Serialize};

#[derive(thiserror::Error, Debug)]
pub enum BridgeError {
    #[error("invalid json: {0}")]
    InvalidJson(String),
}

#[derive(Serialize, Deserialize)]
pub struct NodeResult {
    pub id: String,
    pub label: String,
    pub status: String,
    pub latency_ms: Option<u32>,
    pub details: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct Snapshot {
    pub overall: String,
    pub nodes: Vec<NodeResult>,
    pub speed: Option<SpeedInfo>,
}

#[derive(Serialize, Deserialize)]
pub struct SpeedInfo {
    pub down_mbps: Option<f64>,
    pub up_mbps: Option<f64>,
}

pub fn get_settings_json() -> String {
    serde_json::to_string(&get_default_settings()).unwrap()
}

pub fn set_settings_json(json: &str) -> Result<Settings, BridgeError> {
    serde_json::from_str::<Settings>(json).map_err(|e| BridgeError::InvalidJson(e.to_string()))
}

pub fn run_diagnostics_json(settings_json: Option<&str>) -> Result<String, BridgeError> {
    let settings = match settings_json {
        Some(s) => set_settings_json(s)?,
        None => get_default_settings(),
    };
    let snapshot = run_diagnostics(&settings);
    Ok(serde_json::to_string(&snapshot).unwrap())
}

pub async fn run_diagnostics_struct() -> Result<Snapshot, BridgeError> {
    let settings = get_default_settings();
    let diagnostics = run_diagnostics(&settings);
    
    // Convert from DiagnosticsSnapshot to Snapshot
    let nodes: Vec<NodeResult> = diagnostics.nodes.into_iter().map(|node| {
        let id = match node.id {
            NodeId::Computer => "computer",
            NodeId::Wifi => "network", 
            NodeId::RouterUpnp => "router",
            NodeId::Dns => "dns",
            NodeId::Internet => "internet",
        }.to_string();
        
        let label = match node.id {
            NodeId::Computer => "Компьютер",
            NodeId::Wifi => "Wi-Fi",
            NodeId::RouterUpnp => "Роутер",
            NodeId::Dns => "DNS",
            NodeId::Internet => "Интернет",
        }.to_string();
        
        let status = match node.status {
            Status::Ok => "ok",
            Status::Warn => "partial",
            Status::Fail => "down",
            Status::Unknown => "unknown",
        }.to_string();
        
        NodeResult {
            id,
            label,
            status,
            latency_ms: node.latency_ms,
            details: node.hint_key,
        }
    }).collect();
    
    let overall = match diagnostics.summary_key.as_str() {
        "summary.ok" => "ok",
        "summary.partial" => "partial", 
        "summary.down" => "down",
        _ => "unknown",
    }.to_string();
    
    Ok(Snapshot {
        overall,
        nodes,
        speed: None, // TODO: add speed info if needed
    })
}
