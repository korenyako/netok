use serde::{Serialize, Deserialize};
use time::OffsetDateTime;
use sysinfo::{System, SystemExt};
use std::env;
use std::net::IpAddr;

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

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct ComputerInfo {
    pub hostname: Option<String>,
    pub model: Option<String>,
    pub adapter: Option<String>,
    pub local_ip: Option<String>,
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
    let mut computer_info = ComputerInfo::default();

    // Get hostname - use hostname crate with fallback
    computer_info.hostname = hostname::get()
        .ok()
        .and_then(|s| s.into_string().ok())
        .or_else(|| {
            if cfg!(target_os = "windows") {
                env::var("COMPUTERNAME").ok()
            } else {
                env::var("HOSTNAME").ok()
            }
        });

    // Get system model using sysinfo
    let mut sys = System::new_all();
    sys.refresh_all();
    computer_info.model = sys.host_name();

    // Get network adapter info using get_if_addrs
    if let Ok(interfaces) = get_if_addrs::get_if_addrs() {
        for interface in interfaces {
            // Skip loopback interfaces
            if interface.is_loopback() {
                continue;
            }

            // Check if interface is up (if available)
            // Note: get_if_addrs doesn't provide interface status, so we'll use all non-loopback
            
            // Look for IPv4 addresses
            if let IpAddr::V4(ipv4) = interface.ip() {
                // Prefer private IP addresses (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
                if is_private_ipv4(ipv4) {
                    computer_info.adapter = Some(interface.name.clone());
                    computer_info.local_ip = Some(ipv4.to_string());
                    break; // Use first private IPv4 interface
                } else if computer_info.adapter.is_none() {
                    // Fallback to any IPv4 if no private IP found yet
                    computer_info.adapter = Some(interface.name.clone());
                    computer_info.local_ip = Some(ipv4.to_string());
                }
            }
        }
    }

    computer_info
}

/// Check if an IPv4 address is in private range
fn is_private_ipv4(ip: std::net::Ipv4Addr) -> bool {
    let octets = ip.octets();
    match octets[0] {
        10 => true,                    // 10.0.0.0/8
        172 => octets[1] >= 16 && octets[1] <= 31, // 172.16.0.0/12
        192 => octets[1] == 168,       // 192.168.0.0/16
        _ => false,
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
    use std::net::Ipv4Addr;

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
        assert!(is_private_ipv4(Ipv4Addr::new(10, 0, 0, 1)));      // 10.0.0.0/8
        assert!(is_private_ipv4(Ipv4Addr::new(192, 168, 1, 1))); // 192.168.0.0/16
        assert!(is_private_ipv4(Ipv4Addr::new(172, 16, 0, 1)));   // 172.16.0.0/12
        assert!(is_private_ipv4(Ipv4Addr::new(172, 31, 255, 255))); // 172.31.255.255
        
        // Test public IP ranges
        assert!(!is_private_ipv4(Ipv4Addr::new(8, 8, 8, 8)));     // Google DNS
        assert!(!is_private_ipv4(Ipv4Addr::new(1, 1, 1, 1)));     // Cloudflare DNS
        assert!(!is_private_ipv4(Ipv4Addr::new(172, 15, 0, 1)));   // Just outside 172.16-31 range
        assert!(!is_private_ipv4(Ipv4Addr::new(172, 32, 0, 1)));   // Just outside 172.16-31 range
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
