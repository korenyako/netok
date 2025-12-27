//! Domain types for network diagnostics.
//!
//! This module contains pure data structures with no external dependencies
//! or side effects. These types represent the core domain model of Netok.

use serde::{Deserialize, Serialize};

/// Identifies a diagnostic node in the network path.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum NodeId {
    Computer,
    Wifi,
    RouterUpnp,
    Dns,
    Internet,
}

/// Status of a diagnostic check.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Status {
    Ok,
    Warn,
    Fail,
    Unknown,
}

/// Information about a single diagnostic node.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct NodeInfo {
    pub id: NodeId,
    pub name_key: String,
    pub status: Status,
    pub latency_ms: Option<u32>,
    pub hint_key: Option<String>,
}

/// Information about the local computer.
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct ComputerInfo {
    pub hostname: Option<String>,
    pub model: Option<String>,
    pub adapter: Option<String>,
    pub local_ip: Option<String>,
}

/// Type of network connection.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum ConnectionType {
    Wifi,
    Ethernet,
    Usb,
    Mobile,
    #[default]
    Unknown,
}

/// Information about the network connection.
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NetworkInfo {
    pub connection_type: ConnectionType,
    pub ssid: Option<String>,
    pub rssi: Option<i32>,
    pub signal_quality: Option<String>,
    pub channel: Option<u8>,
    pub frequency: Option<String>,
}

/// Information about the router/gateway.
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct RouterInfo {
    pub gateway_ip: Option<String>,
    pub gateway_mac: Option<String>,
    pub vendor: Option<String>,
    pub model: Option<String>,
}

/// Information about internet connectivity.
#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct InternetInfo {
    pub public_ip: Option<String>,
    pub isp: Option<String>,
    pub country: Option<String>,
    pub city: Option<String>,
    pub dns_ok: bool,
    pub http_ok: bool,
    pub latency_ms: Option<u32>,
    pub speed_down_mbps: Option<f64>,
    pub speed_up_mbps: Option<f64>,
}

/// Complete snapshot of network diagnostics.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiagnosticsSnapshot {
    pub at_utc: String,
    pub nodes: Vec<NodeInfo>,
    pub summary_key: String,
    pub computer: ComputerInfo,
    pub network: NetworkInfo,
    pub router: RouterInfo,
    pub internet: InternetInfo,
}

/// Application settings.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Settings {
    pub language: String,
    pub test_timeout_ms: u32,
    pub dns_servers: Vec<String>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            language: "en".into(),
            test_timeout_ms: 2000,
            dns_servers: vec![],
        }
    }
}

/// Returns default application settings.
pub fn get_default_settings() -> Settings {
    Settings::default()
}

/// DNS provider configuration.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum DnsProvider {
    /// Use ISP/DHCP DNS
    Auto,
    // Cloudflare
    /// 1.1.1.1, 1.0.0.1 - Standard
    Cloudflare,
    /// 1.1.1.2, 1.0.0.2 - Malware Protection
    CloudflareMalware,
    /// 1.1.1.3, 1.0.0.3 - Adult + Malware
    CloudflareFamily,
    // Google
    /// 8.8.8.8, 8.8.4.4 - Public DNS
    Google,
    // AdGuard
    /// 94.140.14.14, 94.140.15.15 - Default Filtering
    AdGuard,
    /// 94.140.14.140, 94.140.14.141 - Non-filtering
    AdGuardNonFiltering,
    /// 94.140.14.15, 94.140.15.16 - Family Protection
    AdGuardFamily,
    // DNS4EU
    /// 86.54.11.1 - Protective
    Dns4EuProtective,
    /// 86.54.11.12 - Protective + Child
    Dns4EuProtectiveChild,
    /// 86.54.11.13 - Protective + Ad
    Dns4EuProtectiveAd,
    /// 86.54.11.11 - Protective + Child & Ads
    Dns4EuProtectiveChildAd,
    /// 86.54.11.100 - Unfiltered
    Dns4EuUnfiltered,
    // CleanBrowsing
    /// 185.228.168.168, 185.228.169.168 - Family Filter
    CleanBrowsingFamily,
    /// Adult Filter
    CleanBrowsingAdult,
    /// Security Filter
    CleanBrowsingSecurity,
    // Quad9
    /// 9.9.9.9, 149.112.112.112 - Recommended
    Quad9Recommended,
    /// 9.9.9.11, 149.112.112.11 - Secured w/ECS
    Quad9SecuredEcs,
    /// 9.9.9.10, 149.112.112.10 - Unsecured
    Quad9Unsecured,
    // OpenDNS
    /// 208.67.222.123, 208.67.220.123 - FamilyShield
    OpenDnsFamilyShield,
    /// 208.67.222.222, 208.67.220.220 - Home
    OpenDnsHome,
    /// Custom primary and secondary DNS
    Custom(String, String),
}

impl DnsProvider {
    /// Returns the primary DNS server IP address.
    pub fn primary(&self) -> Option<String> {
        match self {
            DnsProvider::Auto => None,
            // Cloudflare
            DnsProvider::Cloudflare => Some("1.1.1.1".to_string()),
            DnsProvider::CloudflareMalware => Some("1.1.1.2".to_string()),
            DnsProvider::CloudflareFamily => Some("1.1.1.3".to_string()),
            // Google
            DnsProvider::Google => Some("8.8.8.8".to_string()),
            // AdGuard
            DnsProvider::AdGuard => Some("94.140.14.14".to_string()),
            DnsProvider::AdGuardNonFiltering => Some("94.140.14.140".to_string()),
            DnsProvider::AdGuardFamily => Some("94.140.14.15".to_string()),
            // DNS4EU
            DnsProvider::Dns4EuProtective => Some("86.54.11.1".to_string()),
            DnsProvider::Dns4EuProtectiveChild => Some("86.54.11.12".to_string()),
            DnsProvider::Dns4EuProtectiveAd => Some("86.54.11.13".to_string()),
            DnsProvider::Dns4EuProtectiveChildAd => Some("86.54.11.11".to_string()),
            DnsProvider::Dns4EuUnfiltered => Some("86.54.11.100".to_string()),
            // CleanBrowsing
            DnsProvider::CleanBrowsingFamily => Some("185.228.168.168".to_string()),
            DnsProvider::CleanBrowsingAdult => Some("185.228.168.10".to_string()),
            DnsProvider::CleanBrowsingSecurity => Some("185.228.168.9".to_string()),
            // Quad9
            DnsProvider::Quad9Recommended => Some("9.9.9.9".to_string()),
            DnsProvider::Quad9SecuredEcs => Some("9.9.9.11".to_string()),
            DnsProvider::Quad9Unsecured => Some("9.9.9.10".to_string()),
            // OpenDNS
            DnsProvider::OpenDnsFamilyShield => Some("208.67.222.123".to_string()),
            DnsProvider::OpenDnsHome => Some("208.67.222.222".to_string()),
            DnsProvider::Custom(primary, _) => Some(primary.clone()),
        }
    }

    /// Returns the secondary DNS server IP address.
    pub fn secondary(&self) -> Option<String> {
        match self {
            DnsProvider::Auto => None,
            // Cloudflare
            DnsProvider::Cloudflare => Some("1.0.0.1".to_string()),
            DnsProvider::CloudflareMalware => Some("1.0.0.2".to_string()),
            DnsProvider::CloudflareFamily => Some("1.0.0.3".to_string()),
            // Google
            DnsProvider::Google => Some("8.8.4.4".to_string()),
            // AdGuard
            DnsProvider::AdGuard => Some("94.140.15.15".to_string()),
            DnsProvider::AdGuardNonFiltering => Some("94.140.14.141".to_string()),
            DnsProvider::AdGuardFamily => Some("94.140.15.16".to_string()),
            // DNS4EU - single IP providers
            DnsProvider::Dns4EuProtective => None,
            DnsProvider::Dns4EuProtectiveChild => None,
            DnsProvider::Dns4EuProtectiveAd => None,
            DnsProvider::Dns4EuProtectiveChildAd => None,
            DnsProvider::Dns4EuUnfiltered => None,
            // CleanBrowsing
            DnsProvider::CleanBrowsingFamily => Some("185.228.169.168".to_string()),
            DnsProvider::CleanBrowsingAdult => Some("185.228.169.11".to_string()),
            DnsProvider::CleanBrowsingSecurity => Some("185.228.169.9".to_string()),
            // Quad9
            DnsProvider::Quad9Recommended => Some("149.112.112.112".to_string()),
            DnsProvider::Quad9SecuredEcs => Some("149.112.112.11".to_string()),
            DnsProvider::Quad9Unsecured => Some("149.112.112.10".to_string()),
            // OpenDNS
            DnsProvider::OpenDnsFamilyShield => Some("208.67.220.123".to_string()),
            DnsProvider::OpenDnsHome => Some("208.67.220.220".to_string()),
            DnsProvider::Custom(_, secondary) => Some(secondary.clone()),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_settings() {
        let settings = get_default_settings();
        assert_eq!(settings.language, "en");
        assert_eq!(settings.test_timeout_ms, 2000);
        assert!(settings.dns_servers.is_empty());
    }

    #[test]
    fn test_dns_provider_cloudflare() {
        assert_eq!(DnsProvider::Cloudflare.primary(), Some("1.1.1.1".to_string()));
        assert_eq!(DnsProvider::Cloudflare.secondary(), Some("1.0.0.1".to_string()));
    }

    #[test]
    fn test_dns_provider_auto() {
        assert_eq!(DnsProvider::Auto.primary(), None);
        assert_eq!(DnsProvider::Auto.secondary(), None);
    }

    #[test]
    fn test_dns_provider_custom() {
        let custom = DnsProvider::Custom("1.2.3.4".to_string(), "5.6.7.8".to_string());
        assert_eq!(custom.primary(), Some("1.2.3.4".to_string()));
        assert_eq!(custom.secondary(), Some("5.6.7.8".to_string()));
    }

    #[test]
    fn test_computer_info_default() {
        let info = ComputerInfo::default();
        assert!(info.hostname.is_none());
        assert!(info.model.is_none());
        assert!(info.adapter.is_none());
        assert!(info.local_ip.is_none());
    }

    #[test]
    fn test_status_equality() {
        assert_eq!(Status::Ok, Status::Ok);
        assert_ne!(Status::Ok, Status::Fail);
    }

    #[test]
    fn test_node_id_serialization() {
        let ids = vec![
            NodeId::Computer,
            NodeId::Wifi,
            NodeId::RouterUpnp,
            NodeId::Dns,
            NodeId::Internet,
        ];

        for id in ids {
            let json = serde_json::to_string(&id).expect("Should serialize");
            let deserialized: NodeId = serde_json::from_str(&json).expect("Should deserialize");
            assert_eq!(id, deserialized);
        }
    }

    #[test]
    fn test_connection_type_default() {
        assert_eq!(ConnectionType::default(), ConnectionType::Unknown);
    }
}
