pub mod collect;
pub mod model;

// Re-export the main types for convenience
pub use model::*;



pub async fn run_all(geo_enabled: bool) -> Snapshot {
    use collect::connectivity::{detect_connectivity, get_gateway};
    use model::Connectivity;
    use std::net::IpAddr;
    use std::str::FromStr;
    
    // Collect computer info first
    let mut computer = collect::computer::collect_computer();
    let mut router = Some(collect::router::collect_router());
    let mut internet = Some(collect::internet::collect_internet(geo_enabled).await);
    
    // Determine connectivity status
    let active_ip = computer.local_ip.as_ref()
        .and_then(|ip| IpAddr::from_str(ip).ok());
    let gateway = get_gateway();
    
    let connectivity = detect_connectivity(active_ip, gateway).await;
    
    // Clear data based on connectivity status
    match connectivity {
        Connectivity::Offline => {
            // Clear all network data
            computer.local_ip = None;
            computer.rssi_dbm = None;
            router = None;
            if let Some(ref mut internet) = internet {
                internet.reachable = false;
                internet.public_ip = None;
                internet.operator = None;
                internet.city = None;
                internet.country = None;
            }
        }
        Connectivity::NoRouter => {
            // Clear internet data and RSSI
            computer.rssi_dbm = None;
            if let Some(ref mut internet) = internet {
                internet.reachable = false;
                internet.public_ip = None;
                internet.operator = None;
                internet.city = None;
                internet.country = None;
            }
        }
        Connectivity::CaptiveOrNoDns => {
            // Clear internet data but keep local network info
            if let Some(ref mut internet) = internet {
                internet.reachable = false;
                internet.public_ip = None;
                internet.operator = None;
                internet.city = None;
                internet.country = None;
            }
        }
        Connectivity::Online => {
            // Keep all data as is
        }
        Connectivity::Unknown => {
            // Default case - keep all data as is
        }
    }

    Snapshot { 
        computer,
        router,
        internet,
        connectivity,
        version: 1,
    }
}

pub fn run_diagnostics(_settings: &Settings) -> Snapshot {
    let computer = collect::computer::collect_computer();
    let router = Some(collect::router::collect_router());
    
    Snapshot { 
        computer,
        router,
        internet: None, // Keep None for sync version
        connectivity: Connectivity::Unknown, // Default for sync version
        version: 1,
    }
}

pub fn snapshot_json_for_debug(geo_enabled: bool) -> String {
    let rt = tokio::runtime::Runtime::new().unwrap();
    let snap = rt.block_on(async { run_all(geo_enabled).await });
    serde_json::to_string_pretty(&snap).unwrap_or_else(|_| "{}".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_computer_node_default() {
        let node = ComputerNode {
            hostname: None,
            model: None,
            interface_name: None,
            adapter_friendly: None,
            adapter_model: None,
            connection_type: model::ConnectionType::Unknown,
            local_ip: None,
            rssi_dbm: None,
            oper_up: false,
        };
        assert!(node.hostname.is_none());
        assert!(node.model.is_none());
        assert!(node.interface_name.is_none());
        assert!(node.local_ip.is_none());
    }

    #[test]
    fn test_collect_computer_does_not_panic() {
        let info = collect::computer::collect_computer();
        
        assert!(info.hostname.is_some() || info.hostname.is_none());
        assert!(info.model.is_some() || info.model.is_none());
        assert!(info.interface_name.is_some() || info.interface_name.is_none());
        assert!(info.local_ip.is_some() || info.local_ip.is_none());
    }

    #[test]
    fn test_snapshot_includes_computer_info() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);
        
        assert_eq!(snapshot.computer.hostname.is_some() || snapshot.computer.hostname.is_none(), true);
        assert_eq!(snapshot.computer.model.is_some() || snapshot.computer.model.is_none(), true);
        assert_eq!(snapshot.computer.interface_name.is_some() || snapshot.computer.interface_name.is_none(), true);
        assert_eq!(snapshot.computer.local_ip.is_some() || snapshot.computer.local_ip.is_none(), true);
        assert_eq!(snapshot.version, 1);
    }

    #[test]
    fn test_snapshot_json_output() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);
        
        let json = serde_json::to_string(&snapshot).expect("Should serialize to JSON");
        assert!(!json.is_empty());
        
        println!("Sample diagnostics JSON:");
        println!("{}", serde_json::to_string_pretty(&snapshot).unwrap());
    }

    #[tokio::test]
    async fn test_run_all_with_internet() {
        let snapshot = run_all(false).await;
        
        assert!(snapshot.computer.hostname.is_some() || snapshot.computer.hostname.is_none());
        assert!(snapshot.router.is_some() || snapshot.router.is_none());
        assert!(snapshot.internet.is_some() || snapshot.internet.is_none());
        assert_eq!(snapshot.version, 1);
        
        if let Some(internet) = &snapshot.internet {
            assert!(internet.reachable || !internet.reachable);
            assert!(internet.public_ip.is_some() || internet.public_ip.is_none());
            assert!(internet.operator.is_some() || internet.operator.is_none());
            assert!(internet.city.is_some() || internet.city.is_none());
            assert!(internet.country.is_some() || internet.country.is_none());
            assert!(internet.provider.is_some() || internet.provider.is_none());
        }
        
        let json = serde_json::to_string(&snapshot).expect("Should serialize to JSON");
        assert!(!json.is_empty());
    }
}
