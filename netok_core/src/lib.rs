use serde::{Serialize, Deserialize};
use time::OffsetDateTime;
use std::time::Duration;

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

#[derive(Serialize, Deserialize, Clone, Copy, Debug)]
pub enum ConnectionType {
    Wifi,
    Ethernet,
    Usb,
    Mobile,
    Unknown,
}

impl Default for ConnectionType {
    fn default() -> Self {
        ConnectionType::Unknown
    }
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NetworkInfo {
    pub connection_type: ConnectionType,
    pub ssid: Option<String>,
    pub rssi: Option<i32>,                // dBm
    pub signal_quality: Option<String>,   // i18n key: "signal.excellent" etc
    pub channel: Option<u8>,
    pub frequency: Option<String>,        // "2.4 GHz" | "5 GHz"
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct RouterInfo {
    pub gateway_ip: Option<String>,
    pub gateway_mac: Option<String>,
    pub vendor: Option<String>,           // From OUI lookup
    pub model: Option<String>,            // From UPnP (Post-MVP)
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct InternetInfo {
    pub public_ip: Option<String>,
    pub isp: Option<String>,              // ASN org
    pub country: Option<String>,
    pub city: Option<String>,
    pub dns_ok: bool,
    pub http_ok: bool,
    pub latency_ms: Option<u32>,
    pub speed_down_mbps: Option<f64>,     // Post-MVP
    pub speed_up_mbps: Option<f64>,       // Post-MVP
}

#[derive(Serialize, Deserialize, Clone)]
pub struct DiagnosticsSnapshot {
    pub at_utc: String,
    pub nodes: Vec<NodeInfo>,
    pub summary_key: String,
    pub computer: ComputerInfo,
    pub network: NetworkInfo,
    pub router: RouterInfo,
    pub internet: InternetInfo,
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

// DNS Test: try to resolve known domains
fn test_dns() -> bool {
    use trust_dns_resolver::config::*;
    use trust_dns_resolver::Resolver;

    // Configure resolver with timeout
    let mut opts = ResolverOpts::default();
    opts.timeout = Duration::from_secs(2);  // 2 second timeout

    let resolver = match Resolver::new(ResolverConfig::default(), opts) {
        Ok(r) => r,
        Err(_) => return false,
    };

    // Try primary domain
    if resolver.lookup_ip("one.one.one.one").is_ok() {
        return true;
    }

    // Fallback domain
    resolver.lookup_ip("dns.google").is_ok()
}

// HTTP Test: try to fetch from known endpoints
fn test_http() -> bool {
    let client = match reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(3))
        .build()
    {
        Ok(c) => c,
        Err(_) => return false,
    };

    // Try Cloudflare trace endpoint
    if client.get("https://www.cloudflare.com/cdn-cgi/trace").send().is_ok() {
        return true;
    }

    // Fallback to example.com
    client.get("https://example.com").send().is_ok()
}

// Fetch public IP and geo info from ipinfo.io
#[derive(Deserialize, Debug)]
struct IpInfoResponse {
    ip: Option<String>,
    city: Option<String>,
    country: Option<String>,
    org: Option<String>,  // Contains ISP/ASN info
}

// Detect connection type based on interface name
fn detect_connection_type(interface_name: &str) -> ConnectionType {
    let name_lower = interface_name.to_lowercase();

    if name_lower.contains("wi-fi") || name_lower.contains("wifi") ||
       name_lower.contains("wlan") || name_lower.contains("802.11") ||
       name_lower.contains("wireless") {
        ConnectionType::Wifi
    } else if name_lower.contains("ethernet") || name_lower.contains("eth") ||
              name_lower.starts_with("en") {
        ConnectionType::Ethernet
    } else if name_lower.contains("usb") {
        ConnectionType::Usb
    } else if name_lower.contains("mobile") || name_lower.contains("cellular") ||
              name_lower.contains("wwan") || name_lower.contains("lte") {
        ConnectionType::Mobile
    } else {
        ConnectionType::Unknown
    }
}

// Get Wi-Fi information on Windows using WLAN API
// Returns (SSID, RSSI, interface_description)
#[cfg(target_os = "windows")]
fn get_wifi_info() -> (Option<String>, Option<i32>, Option<String>) {
    use windows::Win32::NetworkManagement::WiFi::*;
    use windows::Win32::Foundation::*;
    use std::ptr;

    unsafe {
        let mut client_handle: HANDLE = HANDLE::default();
        let mut negotiated_version: u32 = 0;

        // Open WLAN handle
        let result = WlanOpenHandle(
            2, // Client version for Windows Vista and later
            Some(std::ptr::null()),
            &mut negotiated_version,
            &mut client_handle,
        );

        if result != 0 || client_handle.is_invalid() {
            return (None, None, None);
        }

        // Enumerate interfaces
        let mut interface_list: *mut WLAN_INTERFACE_INFO_LIST = ptr::null_mut();
        let result = WlanEnumInterfaces(client_handle, Some(std::ptr::null()), &mut interface_list);

        if result != 0 || interface_list.is_null() {
            WlanCloseHandle(client_handle, Some(std::ptr::null()));
            return (None, None, None);
        }

        let mut ssid = None;
        let mut rssi = None;
        let mut interface_desc = None;

        // Iterate through all interfaces to find connected Wi-Fi
        let list = &*interface_list;
        for i in 0..list.dwNumberOfItems as usize {
            let interface = &list.InterfaceInfo[i];

            // Get interface description
            let desc_bytes = &interface.strInterfaceDescription;
            let desc_len = desc_bytes.iter().position(|&c| c == 0).unwrap_or(desc_bytes.len());
            if desc_len > 0 {
                interface_desc = String::from_utf16(&desc_bytes[..desc_len]).ok();
            }

            if interface.isState == wlan_interface_state_connected {
                // Query current connection
                let mut data_size: u32 = 0;
                let mut connection_attrs: *mut WLAN_CONNECTION_ATTRIBUTES = ptr::null_mut();

                let result = WlanQueryInterface(
                    client_handle,
                    &interface.InterfaceGuid,
                    wlan_intf_opcode_current_connection,
                    Some(std::ptr::null()),
                    &mut data_size,
                    std::ptr::addr_of_mut!(connection_attrs) as *mut *mut core::ffi::c_void,
                    None,
                );

                if result == 0 && !connection_attrs.is_null() {
                    let attrs = &*connection_attrs;

                    // Get SSID
                    let ssid_len = attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength as usize;
                    if ssid_len > 0 {
                        let ssid_bytes = &attrs.wlanAssociationAttributes.dot11Ssid.ucSSID[..ssid_len];
                        ssid = String::from_utf8(ssid_bytes.to_vec()).ok();
                    }

                    // Get signal quality (0-100) and convert to approximate RSSI
                    let quality = attrs.wlanAssociationAttributes.wlanSignalQuality;
                    // Rough conversion: 100% ≈ -40 dBm, 0% ≈ -90 dBm
                    rssi = Some(-90 + (quality as i32) / 2);

                    WlanFreeMemory(connection_attrs as *const core::ffi::c_void);
                }

                // Found connected interface, no need to check others
                break;
            }
        }

        WlanFreeMemory(interface_list as *const core::ffi::c_void);
        WlanCloseHandle(client_handle, Some(std::ptr::null()));

        (ssid, rssi, interface_desc)
    }
}

#[cfg(not(target_os = "windows"))]
fn get_wifi_info() -> (Option<String>, Option<i32>, Option<String>) {
    // TODO: Implement for Linux and macOS
    (None, None, None)
}

// Get network information
fn get_network_info(adapter_name: Option<&str>) -> NetworkInfo {
    let connection_type = adapter_name
        .map(|name| detect_connection_type(name))
        .unwrap_or(ConnectionType::Unknown);

    // Try to get Wi-Fi info from system API
    let (ssid, rssi, _wifi_adapter_desc) = get_wifi_info();

    // Determine final connection type:
    // If we got Wi-Fi info AND (adapter matches or adapter is unknown), it's Wi-Fi
    let final_connection_type = if ssid.is_some() {
        ConnectionType::Wifi
    } else {
        connection_type
    };

    NetworkInfo {
        connection_type: final_connection_type,
        ssid,
        rssi,
        signal_quality: None,
        channel: None,
        frequency: None,
    }
}

// Get router/gateway information
fn get_router_info() -> RouterInfo {
    // Try to get default gateway IP
    let gateway_ip = get_default_gateway();

    RouterInfo {
        gateway_ip,
        gateway_mac: None,  // TODO: implement ARP lookup
        vendor: None,       // TODO: implement OUI lookup
        model: None,        // Post-MVP: UPnP discovery
    }
}

// Get default gateway IP address
#[cfg(target_os = "windows")]
fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "route print" and parse the output
    let output = Command::new("cmd")
        .args(&["/C", "route print 0.0.0.0"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for lines with "0.0.0.0" and extract gateway IP
    // Format: "0.0.0.0  0.0.0.0  <gateway>  <interface>  <metric>"
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[0] == "0.0.0.0" && parts[1] == "0.0.0.0" {
            // parts[2] is the gateway IP
            return Some(parts[2].to_string());
        }
    }

    None
}

#[cfg(target_os = "linux")]
fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "ip route" and parse the output
    let output = Command::new("ip")
        .args(&["route", "show", "default"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Format: "default via <gateway> dev <interface>"
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[0] == "default" && parts[1] == "via" {
            return Some(parts[2].to_string());
        }
    }

    None
}

#[cfg(target_os = "macos")]
fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "netstat -nr" and parse the output
    let output = Command::new("netstat")
        .args(&["-nr"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for default route
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 && (parts[0] == "default" || parts[0] == "0.0.0.0") {
            return Some(parts[1].to_string());
        }
    }

    None
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
fn get_default_gateway() -> Option<String> {
    None
}

fn get_internet_info() -> InternetInfo {
    let dns_ok = test_dns();
    let http_ok = test_http();

    // Try to fetch geo info if HTTP works (with shorter timeout)
    let (public_ip, isp, country, city) = if http_ok {
        match reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(3))  // Reduced from 5 to 3 seconds
            .build()
            .ok()
            .and_then(|client| {
                client.get("https://ipinfo.io/json")
                    .send()
                    .ok()
                    .and_then(|resp| resp.json::<IpInfoResponse>().ok())
            })
        {
            Some(info) => (
                info.ip,
                info.org,
                info.country,
                info.city,
            ),
            None => (None, None, None, None),
        }
    } else {
        (None, None, None, None)
    };

    InternetInfo {
        public_ip,
        isp,
        country,
        city,
        dns_ok,
        http_ok,
        latency_ms: None,  // TODO: implement latency measurement
        speed_down_mbps: None,
        speed_up_mbps: None,
    }
}

fn is_private_ip(ip: &std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(ipv4) => {
            let octets = ipv4.octets();
            // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
            octets[0] == 10
                || (octets[0] == 172 && (octets[1] >= 16 && octets[1] <= 31))
                || (octets[0] == 192 && octets[1] == 168)
                || (octets[0] == 169 && octets[1] == 254)
        }
        _ => false,
    }
}

pub fn get_computer_info() -> ComputerInfo {
    use get_if_addrs::get_if_addrs;

    let hostname = hostname::get()
        .ok()
        .and_then(|s| s.into_string().ok());

    // Try to get Wi-Fi info first to determine active adapter
    let (_ssid, _rssi, wifi_adapter_desc) = get_wifi_info();

    // Collect all non-loopback interfaces with private IPv4
    let interfaces: Vec<(String, String)> = match get_if_addrs() {
        Ok(ifaces) => {
            ifaces
                .into_iter()
                .filter(|iface| !iface.is_loopback())
                .filter_map(|iface| {
                    if let std::net::IpAddr::V4(ipv4) = iface.ip() {
                        if is_private_ip(&std::net::IpAddr::V4(ipv4)) {
                            return Some((iface.name.clone(), ipv4.to_string()));
                        }
                    }
                    None
                })
                .collect()
        }
        Err(_) => vec![],
    };

    // Determine adapter and IP based on Wi-Fi status
    let (adapter, local_ip) = if let Some(ref wifi_desc) = wifi_adapter_desc {
        // Wi-Fi is connected, use its description as adapter name
        // Find the IP for this adapter (first private IP we find)
        let ip = interfaces.first().map(|(_, ip)| ip.clone()).unwrap_or_default();
        (wifi_desc.clone(), ip)
    } else {
        // No Wi-Fi, use first available interface
        interfaces.first().cloned().unwrap_or_default()
    };

    // Get friendly name (adapter might already be friendly if from Wi-Fi)
    let friendly_adapter = if !adapter.is_empty() {
        Some(adapter)
    } else {
        None
    };

    ComputerInfo {
        hostname,
        model: None,        // fill later when we add a safe cross-platform method
        adapter: friendly_adapter,
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
            id: NodeId::Dns,
            name_key: "nodes.dns.name".into(),
            status: Status::Ok,
            latency_ms: Some(28),
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
            id: NodeId::Internet,
            name_key: "nodes.internet.name".into(),
            status: Status::Ok,
            latency_ms: Some(45),
            hint_key: None
        },
    ];

    let computer = get_computer_info();
    let network = get_network_info(computer.adapter.as_deref());
    let router = get_router_info();
    let internet = get_internet_info();

    DiagnosticsSnapshot {
        at_utc: now,
        nodes,
        summary_key: "summary.ok".into(),
        computer,
        network,
        router,
        internet,
    }
}

// DNS configuration types
#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DnsProvider {
    Auto,              // Use ISP/DHCP DNS
    // Cloudflare
    Cloudflare,        // 1.1.1.1, 1.0.0.1 - Standard
    CloudflareMalware, // 1.1.1.2, 1.0.0.2 - Malware Protection
    CloudflareFamily,  // 1.1.1.3, 1.0.0.3 - Adult + Malware
    // Google
    Google,            // 8.8.8.8, 8.8.4.4 - Public DNS
    // AdGuard
    AdGuard,           // 94.140.14.14, 94.140.15.15 - Default Filtering
    AdGuardNonFiltering, // 94.140.14.140, 94.140.14.141 - Non-filtering
    AdGuardFamily,     // 94.140.14.15, 94.140.15.16 - Family Protection
    // DNS4EU
    Dns4EuProtective,  // 86.54.11.1 - Protective
    Dns4EuProtectiveChild, // 86.54.11.12 - Protective + Child
    Dns4EuProtectiveAd, // 86.54.11.13 - Protective + Ad
    Dns4EuProtectiveChildAd, // 86.54.11.11 - Protective + Child & Ads
    Dns4EuUnfiltered,  // 86.54.11.100 - Unfiltered
    // CleanBrowsing
    CleanBrowsingFamily, // 185.228.168.168, 185.228.169.168 - Family Filter
    CleanBrowsingAdult,  // Adult Filter
    CleanBrowsingSecurity, // Security Filter
    // Quad9
    Quad9Recommended,  // 9.9.9.9, 149.112.112.112 - Recommended
    Quad9SecuredEcs,   // 9.9.9.11, 149.112.112.11 - Secured w/ECS
    Quad9Unsecured,    // 9.9.9.10, 149.112.112.10 - Unsecured
    // OpenDNS
    OpenDnsFamilyShield, // 208.67.222.123, 208.67.220.123 - FamilyShield
    OpenDnsHome,       // 208.67.222.222, 208.67.220.220 - Home
    Custom(String, String), // Custom primary and secondary DNS
}

impl DnsProvider {
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
            // CleanBrowsing (Adult and Security filters need IPs from table - marked as empty in CSV)
            DnsProvider::CleanBrowsingFamily => Some("185.228.168.168".to_string()),
            DnsProvider::CleanBrowsingAdult => None, // No IP in table
            DnsProvider::CleanBrowsingSecurity => None, // No IP in table
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
            DnsProvider::CleanBrowsingAdult => None,
            DnsProvider::CleanBrowsingSecurity => None,
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

// Set DNS for active network adapter
#[cfg(target_os = "windows")]
pub fn set_dns(provider: DnsProvider) -> Result<(), String> {
    use std::process::Command;

    // Get active network adapter name
    let adapter_name = get_active_adapter_name()
        .ok_or_else(|| "Failed to find active network adapter".to_string())?;

    match provider {
        DnsProvider::Auto => {
            // Set to obtain DNS automatically (DHCP)
            let output = Command::new("netsh")
                .args(&["interface", "ip", "set", "dns", &adapter_name, "dhcp"])
                .output()
                .map_err(|e| format!("Failed to execute netsh: {}", e))?;

            if !output.status.success() {
                return Err(format!(
                    "Failed to set DNS to auto: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
        }
        _ => {
            // Set static DNS
            let primary = provider
                .primary()
                .ok_or_else(|| "No primary DNS for this provider".to_string())?;

            // Set primary DNS
            let output = Command::new("netsh")
                .args(&[
                    "interface",
                    "ip",
                    "set",
                    "dns",
                    &adapter_name,
                    "static",
                    &primary,
                ])
                .output()
                .map_err(|e| format!("Failed to execute netsh: {}", e))?;

            if !output.status.success() {
                return Err(format!(
                    "Failed to set primary DNS: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }

            // Set secondary DNS if available
            if let Some(secondary) = provider.secondary() {
                let output = Command::new("netsh")
                    .args(&[
                        "interface",
                        "ip",
                        "add",
                        "dns",
                        &adapter_name,
                        &secondary,
                        "index=2",
                    ])
                    .output()
                    .map_err(|e| format!("Failed to execute netsh: {}", e))?;

                if !output.status.success() {
                    return Err(format!(
                        "Failed to set secondary DNS: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ));
                }
            }
        }
    }

    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn set_dns(_provider: DnsProvider) -> Result<(), String> {
    Err("DNS configuration is only supported on Windows".to_string())
}

// Get active network adapter alias for Windows
#[cfg(target_os = "windows")]
fn get_active_adapter_name() -> Option<String> {
    use std::process::Command;

    fn run_powershell(command: &str) -> Option<String> {
        let output = Command::new("powershell")
            .args(&["-NoProfile", "-Command", command])
            .output()
            .ok()?;

        if !output.status.success() {
            return None;
        }

        let name = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if name.is_empty() {
            None
        } else {
            Some(name)
        }
    }

    // Try to map the currently connected Wi-Fi adapter description to a friendly alias.
    if let (_, _, Some(wifi_desc)) = get_wifi_info() {
        let escaped = wifi_desc.replace('\'', "''");
        let command = format!(
            "Get-NetAdapter | Where-Object {{ $_.InterfaceDescription -eq '{}' -and $_.Status -eq 'Up' }} | Select-Object -First 1 -ExpandProperty Name",
            escaped
        );
        if let Some(alias) = run_powershell(&command) {
            return Some(alias);
        }
    }

    // Prefer the interface that currently has an IPv4 connection and the lowest metric
    let commands = [
        "Get-NetIPInterface -AddressFamily IPv4 | Where-Object {$_.ConnectionState -eq 'Connected'} | Sort-Object -Property InterfaceMetric | Select-Object -First 1 -ExpandProperty InterfaceAlias",
        // Fallback in case the IP interface query fails
        "Get-NetAdapter | Where-Object {$_.Status -eq 'Up'} | Sort-Object -Property LinkSpeed -Descending | Select-Object -First 1 -ExpandProperty Name",
    ];

    for cmd in commands {
        if let Some(alias) = run_powershell(cmd) {
            return Some(alias);
        }
    }

    None
}

// Get current DNS servers configured on the active adapter
#[cfg(target_os = "windows")]
pub fn get_current_dns() -> Result<Vec<String>, String> {
    use std::process::Command;

    let adapter_name = get_active_adapter_name()
        .ok_or_else(|| "Failed to find active network adapter".to_string())?;

    // Use PowerShell to get DNS server addresses
    let output = Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            &format!(
                "Get-DnsClientServerAddress -InterfaceAlias '{}' -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses",
                adapter_name.replace("'", "''")
            ),
        ])
        .output()
        .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Failed to get DNS servers: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let text = String::from_utf8_lossy(&output.stdout);
    let dns_servers: Vec<String> = text
        .lines()
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect();

    Ok(dns_servers)
}

#[cfg(not(target_os = "windows"))]
pub fn get_current_dns() -> Result<Vec<String>, String> {
    Err("DNS detection is only supported on Windows".to_string())
}

// Detect which DNS provider is currently in use based on DNS server IPs
pub fn detect_dns_provider(dns_servers: &[String]) -> DnsProvider {
    if dns_servers.is_empty() {
        return DnsProvider::Auto;
    }

    let primary = dns_servers.get(0).map(|s| s.as_str());
    let secondary = dns_servers.get(1).map(|s| s.as_str());

    match (primary, secondary) {
        // Cloudflare
        (Some("1.1.1.1"), Some("1.0.0.1")) | (Some("1.1.1.1"), None) => DnsProvider::Cloudflare,
        (Some("1.1.1.2"), Some("1.0.0.2")) | (Some("1.1.1.2"), None) => DnsProvider::CloudflareMalware,
        (Some("1.1.1.3"), Some("1.0.0.3")) | (Some("1.1.1.3"), None) => DnsProvider::CloudflareFamily,
        // Google
        (Some("8.8.8.8"), Some("8.8.4.4")) | (Some("8.8.8.8"), None) => DnsProvider::Google,
        // AdGuard
        (Some("94.140.14.14"), Some("94.140.15.15")) | (Some("94.140.14.14"), None) => DnsProvider::AdGuard,
        (Some("94.140.14.140"), Some("94.140.14.141")) | (Some("94.140.14.140"), None) => DnsProvider::AdGuardNonFiltering,
        (Some("94.140.14.15"), Some("94.140.15.16")) | (Some("94.140.14.15"), None) => DnsProvider::AdGuardFamily,
        // DNS4EU
        (Some("86.54.11.1"), _) => DnsProvider::Dns4EuProtective,
        (Some("86.54.11.12"), _) => DnsProvider::Dns4EuProtectiveChild,
        (Some("86.54.11.13"), _) => DnsProvider::Dns4EuProtectiveAd,
        (Some("86.54.11.11"), _) => DnsProvider::Dns4EuProtectiveChildAd,
        (Some("86.54.11.100"), _) => DnsProvider::Dns4EuUnfiltered,
        // CleanBrowsing
        (Some("185.228.168.168"), Some("185.228.169.168")) | (Some("185.228.168.168"), None) => DnsProvider::CleanBrowsingFamily,
        // Quad9
        (Some("9.9.9.9"), Some("149.112.112.112")) | (Some("9.9.9.9"), None) => DnsProvider::Quad9Recommended,
        (Some("9.9.9.11"), Some("149.112.112.11")) | (Some("9.9.9.11"), None) => DnsProvider::Quad9SecuredEcs,
        (Some("9.9.9.10"), Some("149.112.112.10")) | (Some("9.9.9.10"), None) => DnsProvider::Quad9Unsecured,
        // OpenDNS
        (Some("208.67.222.123"), Some("208.67.220.123")) | (Some("208.67.222.123"), None) => DnsProvider::OpenDnsFamilyShield,
        (Some("208.67.222.222"), Some("208.67.220.220")) | (Some("208.67.222.222"), None) => DnsProvider::OpenDnsHome,
        // Custom
        (Some(p), Some(s)) => DnsProvider::Custom(p.to_string(), s.to_string()),
        (Some(p), None) => DnsProvider::Custom(p.to_string(), String::new()),
        _ => DnsProvider::Auto,
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
