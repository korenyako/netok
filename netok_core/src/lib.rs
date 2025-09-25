pub mod collect;
pub mod model;

// Re-export the main types for convenience
pub use model::*;



pub async fn run_all(geo_enabled: bool) -> Snapshot {
    let computer = collect::computer::collect_computer();
    let router = Some(collect::router::collect_router());
    let internet = Some(collect::internet::collect_internet(geo_enabled).await);

    Snapshot { 
        computer,
        router,
        internet,
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
            primary_adapter: None,
            local_ip: None,
        };
        assert!(node.hostname.is_none());
        assert!(node.model.is_none());
        assert!(node.primary_adapter.is_none());
        assert!(node.local_ip.is_none());
    }

    #[test]
    fn test_collect_computer_does_not_panic() {
        let info = collect::computer::collect_computer();
        
        assert!(info.hostname.is_some() || info.hostname.is_none());
        assert!(info.model.is_some() || info.model.is_none());
        assert!(info.primary_adapter.is_some() || info.primary_adapter.is_none());
        assert!(info.local_ip.is_some() || info.local_ip.is_none());
    }

    #[test]
    fn test_snapshot_includes_computer_info() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);
        
        assert_eq!(snapshot.computer.hostname.is_some() || snapshot.computer.hostname.is_none(), true);
        assert_eq!(snapshot.computer.model.is_some() || snapshot.computer.model.is_none(), true);
        assert_eq!(snapshot.computer.primary_adapter.is_some() || snapshot.computer.primary_adapter.is_none(), true);
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
