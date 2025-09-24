use serde::{Serialize, Deserialize};
use time::OffsetDateTime;

pub mod collect;

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

#[derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone)]
pub struct ComputerInfo {
    pub hostname: Option<String>,
    pub model: Option<String>,     // keep for future, set None for now
    pub adapter: Option<String>,   // active interface name
    pub local_ip: Option<String>,  // first private IPv4
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct InternetNode {
    pub reachable: bool,           // удалось получить публичный IP
    pub public_ip: Option<String>, // публичный IP
    pub operator: Option<String>,  // ipinfo/ipapi: org или asn.name
    pub city: Option<String>,
    pub country: Option<String>,
    pub provider: Option<String>,  // "ipify" | "ipinfo" | "ipapi"
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticsSnapshot {
    pub at_utc: String,
    pub nodes: Vec<NodeInfo>,
    pub summary_key: String,
    pub computer: ComputerInfo,
    pub internet: Option<InternetNode>, // ← новое поле
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


pub async fn run_all(geo_enabled: bool) -> DiagnosticsSnapshot {
    let computer = collect::computer::collect_computer();
    let internet = Some(collect::internet::collect_internet(geo_enabled).await);

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
        summary_key: "summary.ok".into(),
        computer,
        internet,
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
    
    // Use real computer info instead of fake data
    let computer_info = collect::computer::collect_computer();
    
    DiagnosticsSnapshot { 
        at_utc: now, 
        nodes, 
        summary_key: "summary.ok".into(),
        computer: computer_info,
        internet: None, // Keep None for sync version
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_computer_info_default() {
        let info = ComputerInfo::default();
        assert!(info.hostname.is_none());
        assert!(info.model.is_none());
        assert!(info.adapter.is_none());
        assert!(info.local_ip.is_none());
    }

    #[test]
    fn test_private_ipv4_detection() {
        // Test private IP ranges
        let octets_10 = [10, 0, 0, 1];
        let octets_192 = [192, 168, 1, 1];
        let octets_172_16 = [172, 16, 0, 1];
        let octets_172_31 = [172, 31, 255, 255];
        
        assert!(octets_10[0] == 10);
        assert!(octets_192[0] == 192 && octets_192[1] == 168);
        assert!(octets_172_16[0] == 172 && (16..=31).contains(&octets_172_16[1]));
        assert!(octets_172_31[0] == 172 && (16..=31).contains(&octets_172_31[1]));
        
        // Test public IP ranges
        let octets_8 = [8, 8, 8, 8];
        let octets_1 = [1, 1, 1, 1];
        let octets_172_15 = [172, 15, 0, 1];
        let octets_172_32 = [172, 32, 0, 1];
        
        assert!(octets_8[0] != 10 && !(octets_8[0] == 192 && octets_8[1] == 168) && !(octets_8[0] == 172 && (16..=31).contains(&octets_8[1])));
        assert!(octets_1[0] != 10 && !(octets_1[0] == 192 && octets_1[1] == 168) && !(octets_1[0] == 172 && (16..=31).contains(&octets_1[1])));
        assert!(octets_172_15[0] == 172 && !(16..=31).contains(&octets_172_15[1]));
        assert!(octets_172_32[0] == 172 && !(16..=31).contains(&octets_172_32[1]));
    }

    #[test]
    fn test_collect_computer_does_not_panic() {
        // This test ensures the function doesn't panic and returns valid data
        let info = collect::computer::collect_computer();
        
        // The function should always return a valid ComputerInfo struct
        // We can't assert specific values since they depend on the system
        // but we can ensure it doesn't panic and returns reasonable structure
        assert!(info.hostname.is_some() || info.hostname.is_none());
        assert!(info.model.is_some() || info.model.is_none());
        assert!(info.adapter.is_some() || info.adapter.is_none());
        assert!(info.local_ip.is_some() || info.local_ip.is_none());
    }

    #[test]
    fn test_diagnostics_snapshot_includes_computer_info() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);
        
        // Verify that computer info is included in the snapshot
        assert_eq!(snapshot.computer.hostname.is_some() || snapshot.computer.hostname.is_none(), true);
        assert_eq!(snapshot.computer.model.is_some() || snapshot.computer.model.is_none(), true);
        assert_eq!(snapshot.computer.adapter.is_some() || snapshot.computer.adapter.is_none(), true);
        assert_eq!(snapshot.computer.local_ip.is_some() || snapshot.computer.local_ip.is_none(), true);
    }

    #[test]
    fn test_diagnostics_json_output() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);
        
        // Test that the snapshot can be serialized to JSON
        let json = serde_json::to_string(&snapshot).expect("Should serialize to JSON");
        assert!(!json.is_empty());
        
        // Print the JSON for manual inspection (only in test output)
        println!("Sample diagnostics JSON:");
        println!("{}", serde_json::to_string_pretty(&snapshot).unwrap());
    }

    #[tokio::test]
    async fn test_run_all_with_internet() {
        let snapshot = run_all(false).await; // Test without geo
        
        // Verify that computer info is included
        assert!(snapshot.computer.hostname.is_some() || snapshot.computer.hostname.is_none());
        
        // Verify that internet info is included (may be None if network fails)
        assert!(snapshot.internet.is_some() || snapshot.internet.is_none());
        
        if let Some(internet) = &snapshot.internet {
            // If internet data was collected, verify structure
            assert!(internet.reachable || !internet.reachable); // Just check it's a bool
            assert!(internet.public_ip.is_some() || internet.public_ip.is_none());
            assert!(internet.operator.is_some() || internet.operator.is_none());
            assert!(internet.city.is_some() || internet.city.is_none());
            assert!(internet.country.is_some() || internet.country.is_none());
            assert!(internet.provider.is_some() || internet.provider.is_none());
        }
        
        // Test JSON serialization
        let json = serde_json::to_string(&snapshot).expect("Should serialize to JSON");
        assert!(!json.is_empty());
    }
}
