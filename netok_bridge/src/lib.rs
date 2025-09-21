use netok_core::{run_diagnostics, get_default_settings, Settings};

mod types;
pub use types::{Overall, NodeId, NodeResult, Speed, Snapshot, ComputerInfo};

#[derive(thiserror::Error, Debug)]
pub enum BridgeError {
    #[error("invalid json: {0}")]
    InvalidJson(String),
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

pub async fn run_diagnostics_struct() -> Result<Snapshot, anyhow::Error> {
    // TODO: собрать реальные данные из netok_core.
    // Временно вернём мок, чтобы сшить фронт.
    Ok(Snapshot {
        overall: Overall::Ok,
        nodes: vec![
            NodeResult { 
                id: NodeId::Computer, 
                label: "Компьютер".into(), 
                status: Overall::Ok, 
                latency_ms: Some(3), 
                details: None 
            },
            NodeResult { 
                id: NodeId::Network,  
                label: "Wi-Fi".into(),    
                status: Overall::Ok, 
                latency_ms: Some(12), 
                details: None 
            },
            NodeResult { 
                id: NodeId::Dns,      
                label: "DNS".into(),      
                status: Overall::Ok, 
                latency_ms: Some(28), 
                details: None 
            },
            NodeResult { 
                id: NodeId::Internet, 
                label: "Интернет".into(), 
                status: Overall::Ok, 
                latency_ms: Some(45), 
                details: None 
            },
        ],
        speed: Some(Speed { 
            down_mbps: Some(73.0), 
            up_mbps: Some(18.0) 
        }),
        computer: ComputerInfo {
            hostname: Some("DESKTOP-ABC123".to_string()),
            model: Some("Dell OptiPlex 7090".to_string()),
            adapter: Some("Intel Wi-Fi 6 AX201".to_string()),
            local_ip: Some("192.168.1.105".to_string()),
        },
    })
}
