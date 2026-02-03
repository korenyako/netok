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

/// Diagnostic scenario representing different network states.
///
/// Used for displaying appropriate error messages and for mock testing.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum DiagnosticScenario {
    /// Everything works normally
    AllGood,
    /// Wi-Fi adapter is disabled
    WifiDisabled,
    /// Wi-Fi is on but not connected to any network
    WifiNotConnected,
    /// Connected to Wi-Fi but router is not responding
    RouterUnreachable,
    /// Router works but no internet connection
    NoInternet,
    /// DNS resolution is failing
    DnsFailure,
    /// DNS works but HTTP requests are blocked
    HttpBlocked,
    /// Wi-Fi signal is weak
    WeakSignal,
}

impl DiagnosticScenario {
    /// Returns the i18n key for this scenario's title.
    pub fn title_key(&self) -> &'static str {
        match self {
            Self::AllGood => "diagnostic.scenario.all_good.title",
            Self::WifiDisabled => "diagnostic.scenario.wifi_disabled.title",
            Self::WifiNotConnected => "diagnostic.scenario.wifi_not_connected.title",
            Self::RouterUnreachable => "diagnostic.scenario.router_unreachable.title",
            Self::NoInternet => "diagnostic.scenario.no_internet.title",
            Self::DnsFailure => "diagnostic.scenario.dns_failure.title",
            Self::HttpBlocked => "diagnostic.scenario.http_blocked.title",
            Self::WeakSignal => "diagnostic.scenario.weak_signal.title",
        }
    }

    /// Returns the i18n key for this scenario's message.
    pub fn message_key(&self) -> &'static str {
        match self {
            Self::AllGood => "diagnostic.scenario.all_good.message",
            Self::WifiDisabled => "diagnostic.scenario.wifi_disabled.message",
            Self::WifiNotConnected => "diagnostic.scenario.wifi_not_connected.message",
            Self::RouterUnreachable => "diagnostic.scenario.router_unreachable.message",
            Self::NoInternet => "diagnostic.scenario.no_internet.message",
            Self::DnsFailure => "diagnostic.scenario.dns_failure.message",
            Self::HttpBlocked => "diagnostic.scenario.http_blocked.message",
            Self::WeakSignal => "diagnostic.scenario.weak_signal.message",
        }
    }

    /// Returns the severity level for UI display.
    pub fn severity(&self) -> DiagnosticSeverity {
        match self {
            Self::AllGood => DiagnosticSeverity::Success,
            Self::WeakSignal => DiagnosticSeverity::Warning,
            _ => DiagnosticSeverity::Error,
        }
    }

    /// Creates a scenario from a numeric ID (for mock testing).
    pub fn from_id(id: u8) -> Option<Self> {
        match id {
            0 => Some(Self::AllGood),
            1 => Some(Self::WifiDisabled),
            2 => Some(Self::WifiNotConnected),
            3 => Some(Self::RouterUnreachable),
            4 => Some(Self::NoInternet),
            5 => Some(Self::DnsFailure),
            6 => Some(Self::HttpBlocked),
            7 => Some(Self::WeakSignal),
            _ => None,
        }
    }

    /// Returns the numeric ID for this scenario.
    pub fn to_id(&self) -> u8 {
        match self {
            Self::AllGood => 0,
            Self::WifiDisabled => 1,
            Self::WifiNotConnected => 2,
            Self::RouterUnreachable => 3,
            Self::NoInternet => 4,
            Self::DnsFailure => 5,
            Self::HttpBlocked => 6,
            Self::WeakSignal => 7,
        }
    }

    /// Returns all scenarios for iteration.
    pub fn all() -> &'static [Self] {
        &[
            Self::AllGood,
            Self::WifiDisabled,
            Self::WifiNotConnected,
            Self::RouterUnreachable,
            Self::NoInternet,
            Self::DnsFailure,
            Self::HttpBlocked,
            Self::WeakSignal,
        ]
    }
}

/// Severity level for diagnostic scenarios.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum DiagnosticSeverity {
    Success,
    Warning,
    Error,
}

/// Result of a diagnostic check with scenario and optional details.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiagnosticResult {
    pub scenario: DiagnosticScenario,
    pub severity: DiagnosticSeverity,
    pub details: Option<String>,
}

impl DiagnosticResult {
    /// Creates a new diagnostic result from a scenario.
    pub fn new(scenario: DiagnosticScenario) -> Self {
        Self {
            severity: scenario.severity(),
            scenario,
            details: None,
        }
    }

    /// Creates a new diagnostic result with details.
    pub fn with_details(scenario: DiagnosticScenario, details: impl Into<String>) -> Self {
        Self {
            severity: scenario.severity(),
            scenario,
            details: Some(details.into()),
        }
    }
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
    /// Custom DNS: (ipv4_primary, ipv4_secondary, ipv6_primary, ipv6_secondary)
    Custom(String, String, Option<String>, Option<String>),
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
            DnsProvider::Custom(primary, _, _, _) => Some(primary.clone()),
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
            DnsProvider::Custom(_, secondary, _, _) => Some(secondary.clone()),
        }
    }

    /// Returns the primary IPv6 DNS server address.
    pub fn primary_ipv6(&self) -> Option<String> {
        match self {
            DnsProvider::Auto => None,
            // Cloudflare
            DnsProvider::Cloudflare => Some("2606:4700:4700::1111".to_string()),
            DnsProvider::CloudflareMalware => Some("2606:4700:4700::1112".to_string()),
            DnsProvider::CloudflareFamily => Some("2606:4700:4700::1113".to_string()),
            // Google
            DnsProvider::Google => Some("2001:4860:4860::8888".to_string()),
            // AdGuard
            DnsProvider::AdGuard => Some("2a10:50c0::ad1:ff".to_string()),
            DnsProvider::AdGuardNonFiltering => Some("2a10:50c0::1:ff".to_string()),
            DnsProvider::AdGuardFamily => Some("2a10:50c0::bad1:ff".to_string()),
            // DNS4EU - no IPv6 published
            DnsProvider::Dns4EuProtective => None,
            DnsProvider::Dns4EuProtectiveChild => None,
            DnsProvider::Dns4EuProtectiveAd => None,
            DnsProvider::Dns4EuProtectiveChildAd => None,
            DnsProvider::Dns4EuUnfiltered => None,
            // CleanBrowsing
            DnsProvider::CleanBrowsingFamily => Some("2a0d:2a00:1::".to_string()),
            DnsProvider::CleanBrowsingAdult => Some("2a0d:2a00:1::1".to_string()),
            DnsProvider::CleanBrowsingSecurity => Some("2a0d:2a00:2::".to_string()),
            // Quad9
            DnsProvider::Quad9Recommended => Some("2620:fe::fe".to_string()),
            DnsProvider::Quad9SecuredEcs => Some("2620:fe::11".to_string()),
            DnsProvider::Quad9Unsecured => Some("2620:fe::10".to_string()),
            // OpenDNS
            DnsProvider::OpenDnsFamilyShield => Some("2620:119:35::123".to_string()),
            DnsProvider::OpenDnsHome => Some("2620:119:35::35".to_string()),
            // Custom IPv6
            DnsProvider::Custom(_, _, ipv6_primary, _) => ipv6_primary.clone(),
        }
    }

    /// Returns the secondary IPv6 DNS server address.
    pub fn secondary_ipv6(&self) -> Option<String> {
        match self {
            DnsProvider::Auto => None,
            // Cloudflare
            DnsProvider::Cloudflare => Some("2606:4700:4700::1001".to_string()),
            DnsProvider::CloudflareMalware => Some("2606:4700:4700::1002".to_string()),
            DnsProvider::CloudflareFamily => Some("2606:4700:4700::1003".to_string()),
            // Google
            DnsProvider::Google => Some("2001:4860:4860::8844".to_string()),
            // AdGuard
            DnsProvider::AdGuard => Some("2a10:50c0::ad2:ff".to_string()),
            DnsProvider::AdGuardNonFiltering => Some("2a10:50c0::2:ff".to_string()),
            DnsProvider::AdGuardFamily => Some("2a10:50c0::bad2:ff".to_string()),
            // DNS4EU - no IPv6 published
            DnsProvider::Dns4EuProtective => None,
            DnsProvider::Dns4EuProtectiveChild => None,
            DnsProvider::Dns4EuProtectiveAd => None,
            DnsProvider::Dns4EuProtectiveChildAd => None,
            DnsProvider::Dns4EuUnfiltered => None,
            // CleanBrowsing
            DnsProvider::CleanBrowsingFamily => Some("2a0d:2a00:2::".to_string()),
            DnsProvider::CleanBrowsingAdult => Some("2a0d:2a00:2::1".to_string()),
            DnsProvider::CleanBrowsingSecurity => Some("2a0d:2a00:1::".to_string()),
            // Quad9
            DnsProvider::Quad9Recommended => Some("2620:fe::9".to_string()),
            DnsProvider::Quad9SecuredEcs => Some("2620:fe::fe:11".to_string()),
            DnsProvider::Quad9Unsecured => Some("2620:fe::fe:10".to_string()),
            // OpenDNS
            DnsProvider::OpenDnsFamilyShield => Some("2620:119:53::123".to_string()),
            DnsProvider::OpenDnsHome => Some("2620:119:53::53".to_string()),
            // Custom IPv6
            DnsProvider::Custom(_, _, _, ipv6_secondary) => ipv6_secondary.clone(),
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
        let custom = DnsProvider::Custom(
            "1.2.3.4".to_string(),
            "5.6.7.8".to_string(),
            Some("2001:db8::1".to_string()),
            Some("2001:db8::2".to_string()),
        );
        assert_eq!(custom.primary(), Some("1.2.3.4".to_string()));
        assert_eq!(custom.secondary(), Some("5.6.7.8".to_string()));
        assert_eq!(custom.primary_ipv6(), Some("2001:db8::1".to_string()));
        assert_eq!(custom.secondary_ipv6(), Some("2001:db8::2".to_string()));
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

    // ==================== DiagnosticScenario Tests ====================

    #[test]
    fn test_diagnostic_scenario_from_id() {
        assert_eq!(DiagnosticScenario::from_id(0), Some(DiagnosticScenario::AllGood));
        assert_eq!(DiagnosticScenario::from_id(1), Some(DiagnosticScenario::WifiDisabled));
        assert_eq!(DiagnosticScenario::from_id(7), Some(DiagnosticScenario::WeakSignal));
        assert_eq!(DiagnosticScenario::from_id(8), None);
        assert_eq!(DiagnosticScenario::from_id(255), None);
    }

    #[test]
    fn test_diagnostic_scenario_to_id_roundtrip() {
        for scenario in DiagnosticScenario::all() {
            let id = scenario.to_id();
            let restored = DiagnosticScenario::from_id(id);
            assert_eq!(restored, Some(*scenario));
        }
    }

    #[test]
    fn test_diagnostic_scenario_all_count() {
        assert_eq!(DiagnosticScenario::all().len(), 8);
    }

    #[test]
    fn test_diagnostic_scenario_severity() {
        assert_eq!(DiagnosticScenario::AllGood.severity(), DiagnosticSeverity::Success);
        assert_eq!(DiagnosticScenario::WeakSignal.severity(), DiagnosticSeverity::Warning);
        assert_eq!(DiagnosticScenario::WifiDisabled.severity(), DiagnosticSeverity::Error);
        assert_eq!(DiagnosticScenario::DnsFailure.severity(), DiagnosticSeverity::Error);
    }

    #[test]
    fn test_diagnostic_scenario_keys() {
        let scenario = DiagnosticScenario::WifiDisabled;
        assert_eq!(scenario.title_key(), "diagnostic.scenario.wifi_disabled.title");
        assert_eq!(scenario.message_key(), "diagnostic.scenario.wifi_disabled.message");
    }

    #[test]
    fn test_diagnostic_scenario_serialization() {
        for scenario in DiagnosticScenario::all() {
            let json = serde_json::to_string(scenario).expect("Should serialize");
            let deserialized: DiagnosticScenario =
                serde_json::from_str(&json).expect("Should deserialize");
            assert_eq!(*scenario, deserialized);
        }
    }

    #[test]
    fn test_diagnostic_result_new() {
        let result = DiagnosticResult::new(DiagnosticScenario::AllGood);
        assert_eq!(result.scenario, DiagnosticScenario::AllGood);
        assert_eq!(result.severity, DiagnosticSeverity::Success);
        assert!(result.details.is_none());
    }

    #[test]
    fn test_diagnostic_result_with_details() {
        let result = DiagnosticResult::with_details(
            DiagnosticScenario::WifiDisabled,
            "Adapter: Intel Wi-Fi 6",
        );
        assert_eq!(result.scenario, DiagnosticScenario::WifiDisabled);
        assert_eq!(result.severity, DiagnosticSeverity::Error);
        assert_eq!(result.details, Some("Adapter: Intel Wi-Fi 6".to_string()));
    }

    #[test]
    fn test_diagnostic_result_serialization() {
        let result = DiagnosticResult::with_details(DiagnosticScenario::NoInternet, "Test");
        let json = serde_json::to_string(&result).expect("Should serialize");
        let deserialized: DiagnosticResult =
            serde_json::from_str(&json).expect("Should deserialize");
        assert_eq!(deserialized.scenario, result.scenario);
        assert_eq!(deserialized.details, result.details);
    }
}
