use serde::{Serialize, Deserialize};
use time::OffsetDateTime;

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum NodeId { 
    Computer, 
    Wifi, 
    RouterUpnp, 
    Dns, 
    Internet 
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum Status { 
    Ok, 
    Warn, 
    Fail, 
    Unknown 
}

#[derive(Serialize, Deserialize, Clone)]
pub struct NodeInfo {
    pub id: NodeId,
    pub name_key: String,
    pub status: Status,
    pub latency_ms: Option<u32>,
    pub hint_key: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticsSnapshot {
    pub at_utc: String,
    pub nodes: Vec<NodeInfo>,
    pub summary_key: String,
}

#[derive(Serialize, Deserialize, Clone)]
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

pub fn run_diagnostics(_settings: &Settings) -> DiagnosticsSnapshot {
    let now = OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap();
    let nodes = vec![
        NodeInfo { 
            id: NodeId::Computer, 
            name_key: "nodes.computer.name".into(), 
            status: Status::Ok, 
            latency_ms: Some(3), 
            hint_key: None 
        },
        NodeInfo { 
            id: NodeId::Wifi, 
            name_key: "nodes.wifi.name".into(), 
            status: Status::Ok, 
            latency_ms: Some(12), 
            hint_key: None 
        },
        NodeInfo { 
            id: NodeId::Dns, 
            name_key: "nodes.dns.name".into(), 
            status: Status::Ok, 
            latency_ms: Some(28), 
            hint_key: None 
        },
        NodeInfo { 
            id: NodeId::Internet, 
            name_key: "nodes.internet.name".into(), 
            status: Status::Ok, 
            latency_ms: Some(45), 
            hint_key: None 
        },
    ];
    DiagnosticsSnapshot { 
        at_utc: now, 
        nodes, 
        summary_key: "summary.ok".into() 
    }
}
