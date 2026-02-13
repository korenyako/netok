use netok_core::{get_default_settings, run_diagnostics, Settings};

mod types;
pub use types::{
    ComputerInfo, ConnectionType, InternetInfo, NetworkInfo, NodeId, NodeResult, Overall,
    RouterInfo, SingleNodeResult, Snapshot, Speed,
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

/// Convert a core NodeInfo to a bridge NodeResult.
fn convert_node(node: &netok_core::NodeInfo) -> NodeResult {
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
}

pub async fn run_diagnostics_struct() -> Result<Snapshot, anyhow::Error> {
    let core_snapshot = tokio::task::spawn_blocking(|| {
        let settings = get_default_settings();
        run_diagnostics(&settings)
    })
    .await?;

    let nodes: Vec<NodeResult> = core_snapshot.nodes.iter().map(convert_node).collect();

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
        at_utc: core_snapshot.at_utc,
        overall,
        summary_key: core_snapshot.summary_key,
        nodes,
        speed: None,
        computer: core_snapshot.computer,
        network: core_snapshot.network,
        router: core_snapshot.router,
        internet: core_snapshot.internet,
    })
}

// ==================== Progressive Diagnostics Commands ====================

pub async fn check_computer_node() -> Result<SingleNodeResult, anyhow::Error> {
    let (node_info, computer) =
        tokio::task::spawn_blocking(netok_core::check_computer).await?;
    Ok(SingleNodeResult {
        node: convert_node(&node_info),
        computer: Some(computer),
        network: None,
        router: None,
        internet: None,
    })
}

pub async fn check_network_node(adapter: Option<String>) -> Result<SingleNodeResult, anyhow::Error> {
    let (node_info, network) =
        tokio::task::spawn_blocking(move || netok_core::check_network(adapter.as_deref()))
            .await?;
    Ok(SingleNodeResult {
        node: convert_node(&node_info),
        computer: None,
        network: Some(network),
        router: None,
        internet: None,
    })
}

pub async fn check_router_node() -> Result<SingleNodeResult, anyhow::Error> {
    let (node_info, router) =
        tokio::task::spawn_blocking(netok_core::check_router).await?;
    Ok(SingleNodeResult {
        node: convert_node(&node_info),
        computer: None,
        network: None,
        router: Some(router),
        internet: None,
    })
}

pub async fn check_internet_node() -> Result<SingleNodeResult, anyhow::Error> {
    let (node_info, internet) =
        tokio::task::spawn_blocking(netok_core::check_internet).await?;
    Ok(SingleNodeResult {
        node: convert_node(&node_info),
        computer: None,
        network: None,
        router: None,
        internet: Some(internet),
    })
}

// Re-export IpInfoResponse for Tauri commands
pub use netok_core::IpInfoResponse;

// IP geolocation lookup (async wrapper)
pub async fn lookup_ip_location(ip: String) -> Result<IpInfoResponse, String> {
    tokio::task::spawn_blocking(move || netok_core::lookup_ip_location(&ip))
        .await
        .map_err(|e| format!("Failed to run IP location lookup task: {}", e))?
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
    Quad9 { variant: Quad9Variant },
    OpenDns { variant: OpenDnsVariant },
    #[serde(rename_all = "camelCase")]
    Custom {
        primary: String,
        secondary: String,
        primary_ipv6: Option<String>,
        secondary_ipv6: Option<String>,
    },
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
        DnsProviderType::Quad9 { variant } => match variant {
            Quad9Variant::Recommended => netok_core::DnsProvider::Quad9Recommended,
            Quad9Variant::SecuredEcs => netok_core::DnsProvider::Quad9SecuredEcs,
            Quad9Variant::Unsecured => netok_core::DnsProvider::Quad9Unsecured,
        },
        DnsProviderType::OpenDns { variant } => match variant {
            OpenDnsVariant::FamilyShield => netok_core::DnsProvider::OpenDnsFamilyShield,
            OpenDnsVariant::Home => netok_core::DnsProvider::OpenDnsHome,
        },
        DnsProviderType::Custom {
            primary,
            secondary,
            primary_ipv6,
            secondary_ipv6,
        } => netok_core::DnsProvider::Custom(primary, secondary, primary_ipv6, secondary_ipv6),
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
        netok_core::DnsProvider::Custom(primary, secondary, primary_ipv6, secondary_ipv6) => {
            DnsProviderType::Custom {
                primary,
                secondary,
                primary_ipv6,
                secondary_ipv6,
            }
        }
    }
}

// Set DNS provider (async wrapper)
pub async fn set_dns_provider(provider: DnsProviderType) -> Result<(), String> {
    eprintln!("[DNS] Setting provider: {:?}", provider);
    let core_provider = dns_provider_to_core(provider.clone());

    // Run blocking DNS configuration in a separate thread
    let result = tokio::task::spawn_blocking(move || netok_core::set_dns(core_provider))
        .await
        .map_err(|e| format!("Failed to run DNS configuration task: {}", e))?;

    match &result {
        Ok(()) => eprintln!("[DNS] Provider set successfully: {:?}", provider),
        Err(e) => eprintln!("[DNS] Failed to set provider: {}", e),
    }

    result
}

// Get current DNS provider (async wrapper)
pub async fn get_dns_provider() -> Result<DnsProviderType, String> {
    eprintln!("[DNS] Getting current provider...");

    // Run blocking DNS detection in a separate thread
    let result = tokio::task::spawn_blocking(|| {
        let dns_servers = netok_core::get_current_dns()?;
        eprintln!("[DNS] Detected DNS servers: {:?}", dns_servers);
        let core_provider = netok_core::detect_dns_provider(&dns_servers);
        eprintln!("[DNS] Detected core provider: {:?}", core_provider);
        Ok(dns_provider_from_core(core_provider))
    })
    .await
    .map_err(|e| format!("Failed to run DNS detection task: {}", e))?;

    match &result {
        Ok(provider) => eprintln!("[DNS] Returning provider: {:?}", provider),
        Err(e) => eprintln!("[DNS] Failed to get provider: {}", e),
    }

    result
}

// Get raw DNS server IPs currently configured on the system
pub async fn get_dns_servers() -> Result<Vec<String>, String> {
    tokio::task::spawn_blocking(|| {
        netok_core::get_current_dns()
    })
    .await
    .map_err(|e| format!("Failed to run DNS servers task: {}", e))?
}

// Test if a DNS server is reachable (async wrapper)
pub async fn test_dns_server_reachable(server_ip: String) -> Result<bool, String> {
    tokio::task::spawn_blocking(move || {
        netok_core::test_dns_server(&server_ip, 5) // 5 second timeout
    })
    .await
    .map_err(|e| format!("Failed to run DNS server test task: {}", e))?
}

// ==================== VPN Validation ====================

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VpnKeyValidation {
    pub valid: bool,
    pub reachable: bool,
    pub protocol: String,
    pub server: String,
    pub port: u16,
    pub error: Option<String>,
}

/// Validate a VPN URI: parse it and check if the server is reachable via TCP.
pub async fn validate_vpn_key(raw_uri: String) -> Result<VpnKeyValidation, String> {
    tokio::task::spawn_blocking(move || {
        // Step 1: Parse URI
        let protocol = match netok_core::parse_vpn_uri(&raw_uri) {
            Ok(p) => p,
            Err(e) => {
                return Ok(VpnKeyValidation {
                    valid: false,
                    reachable: false,
                    protocol: String::new(),
                    server: String::new(),
                    port: 0,
                    error: Some(e),
                });
            }
        };

        // Step 2: Extract server + port
        let (server, port, proto_name) = match &protocol {
            netok_core::VpnProtocol::Vless(p) => (p.server.clone(), p.port, "VLESS"),
            netok_core::VpnProtocol::Vmess(p) => (p.server.clone(), p.port, "VMess"),
            netok_core::VpnProtocol::Shadowsocks(p) => (p.server.clone(), p.port, "Shadowsocks"),
            netok_core::VpnProtocol::Trojan(p) => (p.server.clone(), p.port, "Trojan"),
            netok_core::VpnProtocol::WireGuard(p) => (p.server.clone(), p.port, "WireGuard"),
        };

        // Step 3: TCP connect to server:port (3s timeout)
        let addr = format!("{}:{}", server, port);
        let reachable = match addr.parse::<std::net::SocketAddr>() {
            Ok(sock_addr) => {
                std::net::TcpStream::connect_timeout(
                    &sock_addr,
                    std::time::Duration::from_secs(3),
                )
                .is_ok()
            }
            Err(_) => {
                // Hostname — try resolving + connecting
                use std::net::ToSocketAddrs;
                match addr.to_socket_addrs() {
                    Ok(mut addrs) => addrs.any(|a| {
                        std::net::TcpStream::connect_timeout(
                            &a,
                            std::time::Duration::from_secs(3),
                        )
                        .is_ok()
                    }),
                    Err(_) => false,
                }
            }
        };

        Ok(VpnKeyValidation {
            valid: true,
            reachable,
            protocol: proto_name.to_string(),
            server,
            port,
            error: None,
        })
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

// ==================== VPN Types ====================

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum VpnConnectionState {
    Disconnected,
    Connecting,
    Connected {
        original_ip: Option<String>,
        vpn_ip: Option<String>,
    },
    Disconnecting,
    Error {
        message: String,
    },
    ElevationDenied,
}

impl Default for VpnConnectionState {
    fn default() -> Self {
        Self::Disconnected
    }
}

#[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
pub struct VpnStatus {
    pub state: VpnConnectionState,
}

// ==================== VPN Commands ====================

/// Parse and validate a VPN URI, generate sing-box config JSON.
/// Pure logic — no process management.
pub fn generate_vpn_config(raw_uri: &str) -> Result<String, String> {
    let protocol = netok_core::parse_vpn_uri(raw_uri)?;
    let config = netok_core::generate_singbox_config(&protocol)?;
    serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))
}

/// Verify VPN connection by checking current public IP.
pub async fn verify_vpn_ip() -> Result<Option<String>, String> {
    tokio::task::spawn_blocking(|| {
        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .build()
            .map_err(|e| format!("HTTP client error: {}", e))?;

        let resp = client
            .get("https://ipinfo.io/json")
            .send()
            .map_err(|e| format!("IP check failed: {}", e))?;

        let info: netok_core::IpInfoResponse = resp
            .json()
            .map_err(|e| format!("Failed to parse IP response: {}", e))?;

        Ok(info.ip)
    })
    .await
    .map_err(|e| format!("Task join error: {}", e))?
}

// Re-export device scan types
pub use netok_core::{DeviceType, NetworkDevice};

/// Scan the local network for devices using the ARP table.
pub async fn scan_network_devices() -> Result<Vec<NetworkDevice>, String> {
    tokio::task::spawn_blocking(netok_core::scan_network_devices)
        .await
        .map_err(|e| format!("Failed to run network scan task: {}", e))
}

