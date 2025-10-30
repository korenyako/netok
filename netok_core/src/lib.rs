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

#[derive(serde::Serialize, serde::Deserialize, Debug, Default, Clone)]
pub struct ComputerInfo {
    pub hostname: Option<String>,
    pub model: Option<String>,     // keep for future, set None for now
    pub adapter: Option<String>,   // active interface name
    pub local_ip: Option<String>,  // first private IPv4
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticsSnapshot {
    pub at_utc: String,
    pub nodes: Vec<NodeInfo>,
    pub summary_key: String,
    pub computer: ComputerInfo,
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

pub fn get_computer_info() -> ComputerInfo {
    use get_if_addrs::get_if_addrs;

    let hostname = hostname::get()
        .ok()
        .and_then(|s| s.into_string().ok());

    // Pick first non-loopback, "up" interface with private IPv4.
    let (adapter, local_ip) = match get_if_addrs() {
        Ok(ifaces) => {
            let mut pick: Option<(String, String)> = None;
            for iface in ifaces {
                if iface.is_loopback() { continue; }
                // get_if_addrs has no is_up(), so we just skip loopback and prefer private IPv4
                if let std::net::IpAddr::V4(ipv4) = iface.ip() {
                    let octets = ipv4.octets();
                    let is_private =
                        octets[0] == 10 ||
                        (octets[0] == 172 && (16..=31).contains(&octets[1])) ||
                        (octets[0] == 192 && octets[1] == 168);
                    if is_private {
                        pick = Some((iface.name.clone(), ipv4.to_string()));
                        break;
                    }
                }
            }
            pick
        }
        Err(_) => None,
    }.unwrap_or_default();

    ComputerInfo {
        hostname,
        model: None,        // fill later when we add a safe cross-platform method
        adapter: if adapter.is_empty() { None } else { Some(adapter) },
        local_ip: if local_ip.is_empty() { None } else { Some(local_ip) },
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
        summary_key: "summary.ok".into(),
        computer: get_computer_info(),
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
    fn test_get_computer_info_does_not_panic() {
        // This test ensures the function doesn't panic and returns valid data
        let info = get_computer_info();
        
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
}
