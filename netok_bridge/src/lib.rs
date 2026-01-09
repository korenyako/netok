use netok_core::{get_default_settings, run_diagnostics, Settings};

mod types;
pub use types::{
    ComputerInfo, ConnectionType, DiagnosticResult, DiagnosticScenario, DiagnosticSeverity,
    InternetInfo, NetworkInfo, NodeId, NodeResult, Overall, RouterInfo, Snapshot, Speed,
};

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
    // Run blocking diagnostics in a separate thread to avoid blocking async runtime
    let core_snapshot = tokio::task::spawn_blocking(|| {
        let settings = get_default_settings();
        run_diagnostics(&settings)
    })
    .await?;

    // Convert netok_core types to bridge types
    let nodes: Vec<NodeResult> = core_snapshot
        .nodes
        .iter()
        .map(|node| {
            let id = match node.id {
                netok_core::NodeId::Computer => NodeId::Computer,
                netok_core::NodeId::Wifi => NodeId::Network,
                netok_core::NodeId::RouterUpnp => NodeId::Dns,
                netok_core::NodeId::Dns => NodeId::Dns,
                netok_core::NodeId::Internet => NodeId::Internet,
            };

            let status = match node.status {
                netok_core::Status::Ok => Overall::Ok,
                netok_core::Status::Warn => Overall::Partial,
                netok_core::Status::Fail => Overall::Down,
                netok_core::Status::Unknown => Overall::Partial,
            };

            NodeResult {
                id,
                label: match id {
                    NodeId::Computer => "diagnostics.computer".to_string(),
                    NodeId::Network => "diagnostics.wifi".to_string(),
                    NodeId::Dns => "diagnostics.router".to_string(),
                    NodeId::Internet => "diagnostics.internet".to_string(),
                },
                status,
                latency_ms: node.latency_ms.map(|ms| ms as u64),
                details: None,
            }
        })
        .collect();

    // Use core types directly (re-exported from types.rs)
    let computer = core_snapshot.computer;
    let network = core_snapshot.network;
    let router = core_snapshot.router;
    let internet = core_snapshot.internet;

    // Determine overall status
    let overall = if core_snapshot
        .nodes
        .iter()
        .all(|n| matches!(n.status, netok_core::Status::Ok))
    {
        Overall::Ok
    } else if core_snapshot
        .nodes
        .iter()
        .any(|n| matches!(n.status, netok_core::Status::Fail))
    {
        Overall::Down
    } else {
        Overall::Partial
    };

    Ok(Snapshot {
        overall,
        nodes,
        speed: None, // TODO: implement speed test
        computer,
        network,
        router,
        internet,
    })
}

// DNS Provider types for Tauri
#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(tag = "type")]
pub enum DnsProviderType {
    Auto,
    Cloudflare { variant: CloudflareVariant },
    Google,
    AdGuard { variant: AdGuardVariant },
    Dns4Eu { variant: Dns4EuVariant },
    CleanBrowsing { variant: CleanBrowsingVariant },
    Quad9 { variant: Quad9Variant },
    OpenDns { variant: OpenDnsVariant },
    Custom { primary: String, secondary: String },
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum CloudflareVariant {
    Standard, // 1.1.1.1
    Malware,  // 1.1.1.2
    Family,   // 1.1.1.3
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum AdGuardVariant {
    Standard,     // 94.140.14.14
    NonFiltering, // 94.140.14.140
    Family,       // 94.140.14.15
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum Dns4EuVariant {
    Protective,        // 86.54.11.1
    ProtectiveChild,   // 86.54.11.12
    ProtectiveAd,      // 86.54.11.13
    ProtectiveChildAd, // 86.54.11.11
    Unfiltered,        // 86.54.11.100
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum CleanBrowsingVariant {
    Family,   // 185.228.168.168
    Adult,    // TBD
    Security, // TBD
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum Quad9Variant {
    Recommended, // 9.9.9.9
    SecuredEcs,  // 9.9.9.11
    Unsecured,   // 9.9.9.10
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub enum OpenDnsVariant {
    FamilyShield, // 208.67.222.123
    Home,         // 208.67.222.222
}

// Convert bridge type to core type
fn dns_provider_to_core(provider: DnsProviderType) -> netok_core::DnsProvider {
    match provider {
        DnsProviderType::Auto => netok_core::DnsProvider::Auto,
        DnsProviderType::Cloudflare { variant } => match variant {
            CloudflareVariant::Standard => netok_core::DnsProvider::Cloudflare,
            CloudflareVariant::Malware => netok_core::DnsProvider::CloudflareMalware,
            CloudflareVariant::Family => netok_core::DnsProvider::CloudflareFamily,
        },
        DnsProviderType::Google => netok_core::DnsProvider::Google,
        DnsProviderType::AdGuard { variant } => match variant {
            AdGuardVariant::Standard => netok_core::DnsProvider::AdGuard,
            AdGuardVariant::NonFiltering => netok_core::DnsProvider::AdGuardNonFiltering,
            AdGuardVariant::Family => netok_core::DnsProvider::AdGuardFamily,
        },
        DnsProviderType::Dns4Eu { variant } => match variant {
            Dns4EuVariant::Protective => netok_core::DnsProvider::Dns4EuProtective,
            Dns4EuVariant::ProtectiveChild => netok_core::DnsProvider::Dns4EuProtectiveChild,
            Dns4EuVariant::ProtectiveAd => netok_core::DnsProvider::Dns4EuProtectiveAd,
            Dns4EuVariant::ProtectiveChildAd => netok_core::DnsProvider::Dns4EuProtectiveChildAd,
            Dns4EuVariant::Unfiltered => netok_core::DnsProvider::Dns4EuUnfiltered,
        },
        DnsProviderType::CleanBrowsing { variant } => match variant {
            CleanBrowsingVariant::Family => netok_core::DnsProvider::CleanBrowsingFamily,
            CleanBrowsingVariant::Adult => netok_core::DnsProvider::CleanBrowsingAdult,
            CleanBrowsingVariant::Security => netok_core::DnsProvider::CleanBrowsingSecurity,
        },
        DnsProviderType::Quad9 { variant } => match variant {
            Quad9Variant::Recommended => netok_core::DnsProvider::Quad9Recommended,
            Quad9Variant::SecuredEcs => netok_core::DnsProvider::Quad9SecuredEcs,
            Quad9Variant::Unsecured => netok_core::DnsProvider::Quad9Unsecured,
        },
        DnsProviderType::OpenDns { variant } => match variant {
            OpenDnsVariant::FamilyShield => netok_core::DnsProvider::OpenDnsFamilyShield,
            OpenDnsVariant::Home => netok_core::DnsProvider::OpenDnsHome,
        },
        DnsProviderType::Custom { primary, secondary } => {
            netok_core::DnsProvider::Custom(primary, secondary)
        }
    }
}

// Convert core DNS provider to bridge type
fn dns_provider_from_core(provider: netok_core::DnsProvider) -> DnsProviderType {
    match provider {
        netok_core::DnsProvider::Auto => DnsProviderType::Auto,
        // Cloudflare
        netok_core::DnsProvider::Cloudflare => DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Standard,
        },
        netok_core::DnsProvider::CloudflareMalware => DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Malware,
        },
        netok_core::DnsProvider::CloudflareFamily => DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Family,
        },
        // Google
        netok_core::DnsProvider::Google => DnsProviderType::Google,
        // AdGuard
        netok_core::DnsProvider::AdGuard => DnsProviderType::AdGuard {
            variant: AdGuardVariant::Standard,
        },
        netok_core::DnsProvider::AdGuardNonFiltering => DnsProviderType::AdGuard {
            variant: AdGuardVariant::NonFiltering,
        },
        netok_core::DnsProvider::AdGuardFamily => DnsProviderType::AdGuard {
            variant: AdGuardVariant::Family,
        },
        // DNS4EU
        netok_core::DnsProvider::Dns4EuProtective => DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::Protective,
        },
        netok_core::DnsProvider::Dns4EuProtectiveChild => DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::ProtectiveChild,
        },
        netok_core::DnsProvider::Dns4EuProtectiveAd => DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::ProtectiveAd,
        },
        netok_core::DnsProvider::Dns4EuProtectiveChildAd => DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::ProtectiveChildAd,
        },
        netok_core::DnsProvider::Dns4EuUnfiltered => DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::Unfiltered,
        },
        // CleanBrowsing
        netok_core::DnsProvider::CleanBrowsingFamily => DnsProviderType::CleanBrowsing {
            variant: CleanBrowsingVariant::Family,
        },
        netok_core::DnsProvider::CleanBrowsingAdult => DnsProviderType::CleanBrowsing {
            variant: CleanBrowsingVariant::Adult,
        },
        netok_core::DnsProvider::CleanBrowsingSecurity => DnsProviderType::CleanBrowsing {
            variant: CleanBrowsingVariant::Security,
        },
        // Quad9
        netok_core::DnsProvider::Quad9Recommended => DnsProviderType::Quad9 {
            variant: Quad9Variant::Recommended,
        },
        netok_core::DnsProvider::Quad9SecuredEcs => DnsProviderType::Quad9 {
            variant: Quad9Variant::SecuredEcs,
        },
        netok_core::DnsProvider::Quad9Unsecured => DnsProviderType::Quad9 {
            variant: Quad9Variant::Unsecured,
        },
        // OpenDNS
        netok_core::DnsProvider::OpenDnsFamilyShield => DnsProviderType::OpenDns {
            variant: OpenDnsVariant::FamilyShield,
        },
        netok_core::DnsProvider::OpenDnsHome => DnsProviderType::OpenDns {
            variant: OpenDnsVariant::Home,
        },
        // Custom
        netok_core::DnsProvider::Custom(primary, secondary) => {
            DnsProviderType::Custom { primary, secondary }
        }
    }
}

// Set DNS provider (async wrapper)
pub async fn set_dns_provider(provider: DnsProviderType) -> Result<(), String> {
    let core_provider = dns_provider_to_core(provider);

    // Run blocking DNS configuration in a separate thread
    tokio::task::spawn_blocking(move || netok_core::set_dns(core_provider))
        .await
        .map_err(|e| format!("Failed to run DNS configuration task: {}", e))?
}

// Get current DNS provider (async wrapper)
pub async fn get_dns_provider() -> Result<DnsProviderType, String> {
    // Run blocking DNS detection in a separate thread
    tokio::task::spawn_blocking(|| {
        let dns_servers = netok_core::get_current_dns()?;
        let core_provider = netok_core::detect_dns_provider(&dns_servers);
        Ok(dns_provider_from_core(core_provider))
    })
    .await
    .map_err(|e| format!("Failed to run DNS detection task: {}", e))?
}

// ==================== Mock Scenario API ====================

/// Get a mock diagnostic result for UI testing.
///
/// # Arguments
/// * `scenario_id` - Numeric ID of the scenario (0-7)
///
/// # Returns
/// * `Ok(DiagnosticResult)` - The mock result for the given scenario
/// * `Err(String)` - If the scenario ID is invalid
pub fn get_mock_scenario(scenario_id: u8) -> Result<DiagnosticResult, String> {
    DiagnosticScenario::from_id(scenario_id)
        .map(DiagnosticResult::new)
        .ok_or_else(|| format!("Invalid scenario ID: {}. Valid range: 0-7", scenario_id))
}

/// Get all available diagnostic scenarios for UI dropdown.
///
/// Returns a list of (id, scenario_key) pairs for building UI selectors.
pub fn get_all_scenarios() -> Vec<(u8, &'static str)> {
    DiagnosticScenario::all()
        .iter()
        .map(|s| {
            let key = match s {
                DiagnosticScenario::AllGood => "all_good",
                DiagnosticScenario::WifiDisabled => "wifi_disabled",
                DiagnosticScenario::WifiNotConnected => "wifi_not_connected",
                DiagnosticScenario::RouterUnreachable => "router_unreachable",
                DiagnosticScenario::NoInternet => "no_internet",
                DiagnosticScenario::DnsFailure => "dns_failure",
                DiagnosticScenario::HttpBlocked => "http_blocked",
                DiagnosticScenario::WeakSignal => "weak_signal",
            };
            (s.to_id(), key)
        })
        .collect()
}
