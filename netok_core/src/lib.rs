//! Netok Core Library
//!
//! This crate provides the core network diagnostics functionality for Netok.
//!
//! # Architecture
//!
//! The crate is organized into three main modules:
//!
//! - **domain**: Pure data types (structs, enums) with no side effects
//! - **infrastructure**: Platform-specific implementations (Wi-Fi, gateway, DNS)
//! - **diagnostics**: Orchestration logic that combines infrastructure to produce results
//!
//! # Public API
//!
//! All types and functions are re-exported at the crate root for backward compatibility.
//! Consumers can use `netok_core::*` without knowing the internal module structure.

mod brand_mapping;
mod diagnostics;
mod domain;
mod infrastructure;
mod oui_database;

// Re-export all domain types at crate root (backward compatibility)
pub use domain::{
    get_default_settings, ComputerInfo, ConnectionType, DeviceType, DiagnosticResult,
    DiagnosticScenario, DiagnosticSeverity, DiagnosticsSnapshot, DnsProvider, InternetInfo,
    NetworkDevice, NetworkInfo, NodeId, NodeInfo, RouterInfo, Settings, Status,
};

// Re-export diagnostics functions
pub use diagnostics::{
    check_computer, check_internet, check_network, check_router, detect_dns_provider,
    get_computer_info, get_internet_info, get_network_info, get_router_info, lookup_ip_location,
    run_diagnostics, scan_network_devices, scan_network_devices_with_progress, test_dns_server,
    IpInfoResponse,
};

// Re-export infrastructure functions used by bridge
pub use infrastructure::{check_wifi_security, get_current_dns, set_dns};

// Re-export security types
pub use infrastructure::security::{
    SecurityCheck, SecurityCheckType, SecurityStatus, WiFiSecurityReport,
};

// Re-export VPN types and functions
pub use infrastructure::vpn::{
    generate_singbox_config, parse_vpn_uri, ShadowsocksParams, TrojanParams, VlessParams,
    VmessParams, VpnProtocol, WireGuardParams,
};

#[cfg(test)]
mod tests {
    use super::*;

    // ==================== Domain Tests ====================

    #[test]
    fn test_computer_info_default() {
        let info = ComputerInfo::default();
        assert!(info.hostname.is_none());
        assert!(info.model.is_none());
        assert!(info.adapter.is_none());
        assert!(info.local_ip.is_none());
    }

    #[test]
    fn test_settings_default() {
        let settings = get_default_settings();
        let _ = serde_json::to_string(&settings).expect("Settings should be serializable");
    }

    #[test]
    fn test_node_id_serialization() {
        use NodeId::*;

        let ids = vec![Computer, Wifi, RouterUpnp, Dns, Internet];

        for id in ids {
            let json = serde_json::to_string(&id).expect("Should serialize");
            let deserialized: NodeId = serde_json::from_str(&json).expect("Should deserialize");
            assert_eq!(id, deserialized);
        }
    }

    // ==================== Diagnostics Tests ====================

    #[test]
    fn test_get_computer_info_does_not_panic() {
        let _info = get_computer_info();
    }

    #[test]
    fn test_diagnostics_snapshot_includes_computer_info() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let _ = &snapshot.computer.hostname;
        let _ = &snapshot.computer.model;
        let _ = &snapshot.computer.adapter;
        let _ = &snapshot.computer.local_ip;
    }

    #[test]
    fn test_diagnostics_json_output() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let json = serde_json::to_string(&snapshot).expect("Should serialize to JSON");
        assert!(!json.is_empty());
    }

    #[test]
    fn test_real_latency_measurements() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        for node in &snapshot.nodes {
            assert!(
                node.latency_ms.is_some(),
                "Node {:?} should have latency measurement",
                node.id
            );

            let latency = node.latency_ms.unwrap();
            let max_latency = match node.id {
                NodeId::Internet => 60000,
                _ => 10000,
            };

            assert!(
                latency < max_latency,
                "Node {:?} latency suspiciously high: {} ms",
                node.id,
                latency
            );
        }
    }

    #[test]
    fn test_diagnostics_status_logic() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let has_fail = snapshot
            .nodes
            .iter()
            .any(|n| matches!(n.status, Status::Fail));
        let all_ok = snapshot
            .nodes
            .iter()
            .all(|n| matches!(n.status, Status::Ok));

        if all_ok {
            assert_eq!(snapshot.summary_key, "summary.ok");
        } else if has_fail {
            assert_eq!(snapshot.summary_key, "summary.fail");
        } else {
            assert_eq!(snapshot.summary_key, "summary.warn");
        }
    }

    #[test]
    fn test_diagnostics_performance() {
        use std::time::Instant;

        let settings = get_default_settings();
        let start = Instant::now();
        let _snapshot = run_diagnostics(&settings);
        let duration = start.elapsed();

        assert!(
            duration.as_secs() < 60,
            "Diagnostics took too long: {:?}",
            duration
        );
    }

    // ==================== DNS Provider Tests ====================

    #[test]
    fn test_dns_provider_cloudflare_standard() {
        let provider = detect_dns_provider(&["1.1.1.1".to_string(), "1.0.0.1".to_string()]);
        assert!(matches!(provider, DnsProvider::Cloudflare));
    }

    #[test]
    fn test_dns_provider_cloudflare_malware() {
        let provider = detect_dns_provider(&["1.1.1.2".to_string(), "1.0.0.2".to_string()]);
        assert!(matches!(provider, DnsProvider::CloudflareMalware));
    }

    #[test]
    fn test_dns_provider_cloudflare_family() {
        let provider = detect_dns_provider(&["1.1.1.3".to_string(), "1.0.0.3".to_string()]);
        assert!(matches!(provider, DnsProvider::CloudflareFamily));
    }

    #[test]
    fn test_dns_provider_google() {
        let provider = detect_dns_provider(&["8.8.8.8".to_string(), "8.8.4.4".to_string()]);
        assert!(matches!(provider, DnsProvider::Google));
    }

    #[test]
    fn test_dns_provider_adguard_variants() {
        let provider =
            detect_dns_provider(&["94.140.14.14".to_string(), "94.140.15.15".to_string()]);
        assert!(matches!(provider, DnsProvider::AdGuard));

        let provider_nf =
            detect_dns_provider(&["94.140.14.140".to_string(), "94.140.14.141".to_string()]);
        assert!(matches!(provider_nf, DnsProvider::AdGuardNonFiltering));

        let provider_family =
            detect_dns_provider(&["94.140.14.15".to_string(), "94.140.15.16".to_string()]);
        assert!(matches!(provider_family, DnsProvider::AdGuardFamily));
    }

    #[test]
    fn test_dns_provider_quad9_variants() {
        let provider = detect_dns_provider(&["9.9.9.9".to_string(), "149.112.112.112".to_string()]);
        assert!(matches!(provider, DnsProvider::Quad9Recommended));

        let provider_ecs =
            detect_dns_provider(&["9.9.9.11".to_string(), "149.112.112.11".to_string()]);
        assert!(matches!(provider_ecs, DnsProvider::Quad9SecuredEcs));

        let provider_unsec =
            detect_dns_provider(&["9.9.9.10".to_string(), "149.112.112.10".to_string()]);
        assert!(matches!(provider_unsec, DnsProvider::Quad9Unsecured));
    }

    #[test]
    fn test_dns_provider_opendns_variants() {
        let provider =
            detect_dns_provider(&["208.67.222.123".to_string(), "208.67.220.123".to_string()]);
        assert!(matches!(provider, DnsProvider::OpenDnsFamilyShield));

        let provider_home =
            detect_dns_provider(&["208.67.222.222".to_string(), "208.67.220.220".to_string()]);
        assert!(matches!(provider_home, DnsProvider::OpenDnsHome));
    }

    #[test]
    fn test_dns_provider_dns4eu_variants() {
        let provider_protective = detect_dns_provider(&["86.54.11.1".to_string()]);
        assert!(matches!(provider_protective, DnsProvider::Dns4EuProtective));

        let provider_child = detect_dns_provider(&["86.54.11.12".to_string()]);
        assert!(matches!(provider_child, DnsProvider::Dns4EuProtectiveChild));

        let provider_ad = detect_dns_provider(&["86.54.11.13".to_string()]);
        assert!(matches!(provider_ad, DnsProvider::Dns4EuProtectiveAd));

        let provider_child_ad = detect_dns_provider(&["86.54.11.11".to_string()]);
        assert!(matches!(
            provider_child_ad,
            DnsProvider::Dns4EuProtectiveChildAd
        ));

        let provider_unfiltered = detect_dns_provider(&["86.54.11.100".to_string()]);
        assert!(matches!(provider_unfiltered, DnsProvider::Dns4EuUnfiltered));
    }

    #[test]
    fn test_dns_provider_custom() {
        let provider = detect_dns_provider(&["1.2.3.4".to_string(), "5.6.7.8".to_string()]);
        match provider {
            DnsProvider::Custom(primary, secondary, _, _) => {
                assert_eq!(primary, "1.2.3.4");
                assert_eq!(secondary, "5.6.7.8");
            }
            _ => panic!("Expected Custom provider"),
        }
    }

    #[test]
    fn test_dns_provider_auto() {
        let provider = detect_dns_provider(&[]);
        assert!(matches!(provider, DnsProvider::Auto));
    }

    // ==================== Network Info Tests ====================

    #[test]
    fn test_network_info_structure() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let _ = &snapshot.network.connection_type;
        let _ = &snapshot.network.ssid;
        let _ = &snapshot.network.rssi;
    }

    #[test]
    fn test_internet_info_structure() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let _ = &snapshot.internet.public_ip;
        let _ = &snapshot.internet.isp;
        let _ = &snapshot.internet.dns_ok;
        let _ = &snapshot.internet.http_ok;
    }

    #[test]
    fn test_node_count_and_ids() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        assert!(
            snapshot.nodes.len() >= 4,
            "Should have at least 4 diagnostic nodes"
        );

        let node_ids: Vec<NodeId> = snapshot.nodes.iter().map(|n| n.id).collect();
        assert!(node_ids.contains(&NodeId::Computer));
        assert!(node_ids.contains(&NodeId::Internet));
    }

    #[test]
    fn test_snapshot_has_summary_key() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        assert!(
            snapshot.summary_key == "summary.ok"
                || snapshot.summary_key == "summary.warn"
                || snapshot.summary_key == "summary.fail"
        );
    }

    #[test]
    fn test_snapshot_timestamp_format() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        assert!(snapshot.at_utc.contains('T'));
        assert!(snapshot.at_utc.contains('Z') || snapshot.at_utc.contains('+'));
    }

    // ==================== Router Info Tests ====================

    #[test]
    fn test_router_info_structure() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        if let Some(mac) = &snapshot.router.gateway_mac {
            assert_eq!(mac.len(), 17, "MAC should be XX:XX:XX:XX:XX:XX format");
            assert_eq!(mac.matches(':').count(), 5, "MAC should have 5 colons");
        }
    }

    // ==================== Connection Type Tests ====================

    #[test]
    fn test_detect_connection_type_wifi() {
        use infrastructure::detect_connection_type;

        assert!(matches!(
            detect_connection_type("wifi"),
            ConnectionType::Wifi
        ));
        assert!(matches!(
            detect_connection_type("wlan0"),
            ConnectionType::Wifi
        ));
    }

    #[test]
    fn test_detect_connection_type_ethernet() {
        use infrastructure::detect_connection_type;

        assert!(matches!(
            detect_connection_type("ethernet"),
            ConnectionType::Ethernet
        ));
        assert!(matches!(
            detect_connection_type("eth0"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_unknown() {
        use infrastructure::detect_connection_type;

        assert!(matches!(
            detect_connection_type(""),
            ConnectionType::Unknown
        ));
    }

    // ==================== Settings Tests ====================

    #[test]
    fn test_settings_with_multiple_dns() {
        let settings = Settings {
            language: "en".to_string(),
            test_timeout_ms: 3000,
            dns_servers: vec!["1.1.1.1".to_string(), "8.8.8.8".to_string()],
        };

        let json = serde_json::to_string(&settings).unwrap();
        let deserialized: Settings = serde_json::from_str(&json).unwrap();

        assert_eq!(deserialized.dns_servers.len(), 2);
    }

    // ==================== OUI Database Tests ====================

    #[test]
    #[allow(clippy::const_is_empty)]
    fn test_oui_database_not_empty() {
        use oui_database::OUI_DATABASE;

        assert!(
            !OUI_DATABASE.is_empty(),
            "OUI database should contain vendor entries"
        );
        assert!(
            OUI_DATABASE.len() > 30000,
            "OUI database should have 30,000+ entries"
        );
    }

    #[test]
    fn test_vendor_lookup() {
        use diagnostics::lookup_vendor_by_mac;

        // TP-Link
        let vendor = lookup_vendor_by_mac("40:ED:00:11:22:33");
        assert!(vendor.is_some());

        // Invalid
        let vendor_invalid = lookup_vendor_by_mac("invalid");
        assert!(vendor_invalid.is_none());
    }
}
