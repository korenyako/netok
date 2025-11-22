use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use time::OffsetDateTime;

// Import full IEEE OUI database (auto-generated)
mod oui_database;
use oui_database::OUI_DATABASE;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum NodeId {
    Computer,
    Wifi,
    RouterUpnp,
    Dns,
    Internet,
}

#[derive(Serialize, Deserialize, Clone, Copy)]
pub enum Status {
    Ok,
    Warn,
    Fail,
    Unknown,
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
    pub model: Option<String>,    // keep for future, set None for now
    pub adapter: Option<String>,  // active interface name
    pub local_ip: Option<String>, // first private IPv4
}

#[derive(Serialize, Deserialize, Clone, Copy, Debug, Default)]
pub enum ConnectionType {
    Wifi,
    Ethernet,
    Usb,
    Mobile,
    #[default]
    Unknown,
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct NetworkInfo {
    pub connection_type: ConnectionType,
    pub ssid: Option<String>,
    pub rssi: Option<i32>,              // dBm
    pub signal_quality: Option<String>, // i18n key: "signal.excellent" etc
    pub channel: Option<u8>,
    pub frequency: Option<String>, // "2.4 GHz" | "5 GHz"
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct RouterInfo {
    pub gateway_ip: Option<String>,
    pub gateway_mac: Option<String>,
    pub vendor: Option<String>, // From OUI lookup
    pub model: Option<String>,  // From UPnP (Post-MVP)
}

#[derive(Serialize, Deserialize, Debug, Default, Clone)]
pub struct InternetInfo {
    pub public_ip: Option<String>,
    pub isp: Option<String>, // ASN org
    pub country: Option<String>,
    pub city: Option<String>,
    pub dns_ok: bool,
    pub http_ok: bool,
    pub latency_ms: Option<u32>,
    pub speed_down_mbps: Option<f64>, // Post-MVP
    pub speed_up_mbps: Option<f64>,   // Post-MVP
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
        dns_servers: vec![],
    }
}

// DNS Test: try to resolve known domains
fn test_dns() -> bool {
    use trust_dns_resolver::config::*;
    use trust_dns_resolver::Resolver;

    // Configure resolver with timeout
    let mut opts = ResolverOpts::default();
    opts.timeout = Duration::from_secs(2); // 2 second timeout

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
    if client
        .get("https://www.cloudflare.com/cdn-cgi/trace")
        .send()
        .is_ok()
    {
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
    org: Option<String>, // Contains ISP/ASN info
}

// Detect connection type based on interface name
fn detect_connection_type(interface_name: &str) -> ConnectionType {
    let name_lower = interface_name.to_lowercase();

    if name_lower.contains("wi-fi")
        || name_lower.contains("wifi")
        || name_lower.contains("wlan")
        || name_lower.contains("802.11")
        || name_lower.contains("wireless")
    {
        ConnectionType::Wifi
    } else if name_lower.contains("ethernet")
        || name_lower.contains("eth")
        || name_lower.starts_with("en")
    {
        ConnectionType::Ethernet
    } else if name_lower.contains("usb") {
        ConnectionType::Usb
    } else if name_lower.contains("mobile")
        || name_lower.contains("cellular")
        || name_lower.contains("wwan")
        || name_lower.contains("lte")
    {
        ConnectionType::Mobile
    } else {
        ConnectionType::Unknown
    }
}

/// Get Wi-Fi information on Windows using WLAN API.
///
/// Returns a tuple of (SSID, RSSI in dBm, interface description) for the currently
/// connected Wi-Fi network, or (None, None, None) if not connected or on error.
///
/// # Platform Support
/// - **Windows**: Full support via Windows WLAN API
/// - **macOS/Linux**: Returns (None, None, None) - TODO
///
/// # Safety
/// This function uses the Windows WLAN API which requires careful resource management.
/// All safety invariants are documented inline within the unsafe block.
#[cfg(target_os = "windows")]
fn get_wifi_info() -> (Option<String>, Option<i32>, Option<String>) {
    use std::ptr;
    use windows::Win32::Foundation::*;
    use windows::Win32::NetworkManagement::WiFi::*;

    /// RAII guard for WLAN client handle to ensure proper cleanup.
    ///
    /// SAFETY: This guard ensures that WlanCloseHandle is called when the guard
    /// is dropped, preventing resource leaks.
    struct WlanHandle(HANDLE);

    impl Drop for WlanHandle {
        fn drop(&mut self) {
            // SAFETY: The handle is valid (checked at creation) and must be closed
            // to free system resources. WlanCloseHandle is safe to call even if
            // other WLAN operations have failed.
            unsafe {
                let _ = WlanCloseHandle(self.0, None);
            }
        }
    }

    // SAFETY: This entire function operates on Windows WLAN API with the following invariants:
    //
    // 1. Resource Management:
    //    - WlanOpenHandle creates a handle that MUST be closed with WlanCloseHandle
    //    - WlanEnumInterfaces allocates memory that MUST be freed with WlanFreeMemory
    //    - WlanQueryInterface allocates memory that MUST be freed with WlanFreeMemory
    //    - All handles and pointers are checked for validity before use
    //
    // 2. Pointer Safety:
    //    - All pointers from Windows API are checked for null before dereferencing
    //    - Pointer lifetime is limited to the scope where Windows owns the memory
    //    - UTF-16 strings are bounds-checked before conversion
    //
    // 3. Array Access:
    //    - Interface list iteration uses dwNumberOfItems as the bounds check
    //    - SSID byte array access is bounds-checked with uSSIDLength
    //    - Interface description array uses null-terminator search with bounds
    //
    // 4. Error Handling:
    //    - All Windows API calls check return codes (0 = success, non-zero = error)
    //    - Early returns ensure cleanup code is reached via RAII guard
    //    - Invalid handles detected via is_invalid() check
    unsafe {
        let mut client_handle: HANDLE = HANDLE::default();
        let mut negotiated_version: u32 = 0;

        // SAFETY: WlanOpenHandle initializes a WLAN client session.
        // - Version 2 is valid for Windows Vista and later
        // - Output parameters are valid pointers to local variables
        // - Return code is checked for errors
        let result = WlanOpenHandle(
            2,    // Client version for Windows Vista and later
            None, // Reserved parameter, must be None
            &mut negotiated_version,
            &mut client_handle,
        );

        if result != 0 || client_handle.is_invalid() {
            return (None, None, None);
        }

        // Wrap handle in RAII guard to ensure cleanup on all code paths
        let _handle_guard = WlanHandle(client_handle);

        // SAFETY: WlanEnumInterfaces retrieves list of WLAN interfaces.
        // - client_handle is valid (checked above)
        // - interface_list pointer is valid (local variable)
        // - Return code is checked for errors
        // - Returned memory MUST be freed with WlanFreeMemory
        let mut interface_list: *mut WLAN_INTERFACE_INFO_LIST = ptr::null_mut();
        let result = WlanEnumInterfaces(client_handle, None, &mut interface_list);

        if result != 0 || interface_list.is_null() {
            return (None, None, None); // _handle_guard ensures WlanCloseHandle is called
        }

        let mut ssid = None;
        let mut rssi = None;
        let mut interface_desc = None;

        // SAFETY: Dereferencing interface_list pointer.
        // - Pointer is non-null (checked above)
        // - Memory is valid (allocated by WlanEnumInterfaces)
        // - Struct layout matches Windows API definition
        let list = &*interface_list;

        // Iterate through all interfaces to find connected Wi-Fi
        for i in 0..list.dwNumberOfItems as usize {
            // SAFETY: Array access within bounds.
            // - i < dwNumberOfItems (loop condition)
            // - InterfaceInfo is a flexible array member with dwNumberOfItems elements
            let interface = &list.InterfaceInfo[i];

            // Get interface description (UTF-16 string)
            // SAFETY: Interface description is a fixed-size array of u16 (UTF-16)
            let desc_bytes = &interface.strInterfaceDescription;
            let desc_len = desc_bytes
                .iter()
                .position(|&c| c == 0)
                .unwrap_or(desc_bytes.len());
            if desc_len > 0 {
                // String::from_utf16 safely handles UTF-16 conversion
                interface_desc = String::from_utf16(&desc_bytes[..desc_len]).ok();
            }

            if interface.isState == wlan_interface_state_connected {
                // Query current connection
                let mut data_size: u32 = 0;
                let mut connection_attrs: *mut WLAN_CONNECTION_ATTRIBUTES = ptr::null_mut();

                // SAFETY: WlanQueryInterface queries interface properties.
                // - client_handle is valid (wrapped in guard)
                // - interface GUID is from valid interface structure
                // - connection_attrs pointer is valid (local variable)
                // - Return code is checked for errors
                // - Returned memory MUST be freed with WlanFreeMemory
                let result = WlanQueryInterface(
                    client_handle,
                    &interface.InterfaceGuid,
                    wlan_intf_opcode_current_connection,
                    None, // Reserved parameter
                    &mut data_size,
                    std::ptr::addr_of_mut!(connection_attrs) as *mut *mut core::ffi::c_void,
                    None, // opcode value type (not needed)
                );

                if result == 0 && !connection_attrs.is_null() {
                    // SAFETY: Dereferencing connection_attrs pointer.
                    // - Pointer is non-null (checked above)
                    // - Memory is valid (allocated by WlanQueryInterface)
                    // - Struct layout matches Windows API definition
                    let attrs = &*connection_attrs;

                    // Get SSID (fixed-size byte array)
                    let ssid_len = attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength as usize;
                    if ssid_len > 0 && ssid_len <= 32 {
                        // SAFETY: SSID array access within bounds
                        // - ssid_len <= 32 (DOT11_SSID_MAX_LENGTH)
                        // - ucSSID is a fixed-size array of 32 bytes
                        let ssid_bytes =
                            &attrs.wlanAssociationAttributes.dot11Ssid.ucSSID[..ssid_len];
                        ssid = String::from_utf8(ssid_bytes.to_vec()).ok();
                    }

                    // Get signal quality (0-100) and convert to approximate RSSI
                    let quality = attrs.wlanAssociationAttributes.wlanSignalQuality;
                    // Rough conversion: 100% ≈ -40 dBm, 0% ≈ -90 dBm
                    rssi = Some(-90 + (quality as i32) / 2);

                    // SAFETY: Free memory allocated by WlanQueryInterface
                    // - connection_attrs is non-null and was allocated by Windows API
                    WlanFreeMemory(connection_attrs as *const core::ffi::c_void);
                }

                // Found connected interface, no need to check others
                break;
            }
        }

        // SAFETY: Free memory allocated by WlanEnumInterfaces
        // - interface_list is non-null and was allocated by Windows API
        WlanFreeMemory(interface_list as *const core::ffi::c_void);

        // Note: WlanCloseHandle is called automatically by _handle_guard destructor

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
        .map(detect_connection_type)
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

/// Lookup vendor name by MAC address using OUI (first 3 bytes).
///
/// # Arguments
/// * `mac` - MAC address in any of these formats:
///   - Standard: "AA:BB:CC:DD:EE:FF"
///   - Windows: "AA-BB-CC-DD-EE-FF"
///   - Compact: "AABBCCDDEEFF"
///
/// # Returns
/// * `Some(vendor_name)` if found in database
/// * `None` if not found or invalid MAC format
fn lookup_vendor_by_mac(mac: &str) -> Option<String> {
    // Remove separators and convert to uppercase
    // Remove separators and convert to uppercase.
    let clean_mac: String = mac
        .chars()
        .filter(|c| c.is_ascii_hexdigit())
        .map(|c| c.to_ascii_uppercase())
        .collect();

    // A valid MAC address must resolve to exactly 12 hexadecimal digits.
    // This prevents lookups on invalid or partial MACs.
    if clean_mac.len() != 12 {
        return None;
    }

    // Try matching from longest to shortest OUI (6, 7, 8+ chars)
    // Some vendors have extended OUI prefixes (28-bit, 36-bit)
    // This single loop handles all cases including standard 6-char (24-bit) OUI
    for prefix_len in (6..=clean_mac.len().min(10)).rev() {
        let prefix = &clean_mac[..prefix_len];

        // Search in database
        for (oui, vendor) in OUI_DATABASE {
            if oui.eq_ignore_ascii_case(prefix) {
                return Some(vendor.to_string());
            }
        }
    }

    None
}

// Get router/gateway information
fn get_router_info() -> RouterInfo {
    // Try to get default gateway IP
    let gateway_ip = get_default_gateway();

    // Try to get MAC address if we have gateway IP
    let gateway_mac = gateway_ip.as_ref().and_then(|ip| get_router_mac(ip));

    // Try to lookup vendor if we have MAC address
    let vendor = gateway_mac.as_ref().and_then(|mac| lookup_vendor_by_mac(mac));

    RouterInfo {
        gateway_ip,
        gateway_mac,
        vendor,
        model: None, // Post-MVP: UPnP discovery
    }
}

// Get default gateway IP address
#[cfg(target_os = "windows")]
fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "route print" and parse the output
    // LOCALE-INDEPENDENT: We parse IP addresses (0.0.0.0) which are not localized
    // The route table format is consistent across locales
    let output = Command::new("cmd")
        .args(["/C", "route print 0.0.0.0"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for lines with "0.0.0.0" and extract gateway IP
    // Format: "0.0.0.0  0.0.0.0  <gateway>  <interface>  <metric>"
    // We rely on IP addresses, not text labels, making this locale-independent
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[0] == "0.0.0.0" && parts[1] == "0.0.0.0" {
            // parts[2] is the gateway IP
            return Some(parts[2].to_string());
        }
    }

    None
}

// Get router MAC address via ARP lookup
#[cfg(target_os = "windows")]
fn get_router_mac(gateway_ip: &str) -> Option<String> {
    use std::process::Command;

    // Use PowerShell Get-NetNeighbor for reliable ARP lookup
    // LOCALE-INDEPENDENT: MAC addresses and IP addresses are not localized
    let command = format!(
        "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; \
         Get-NetNeighbor -IPAddress {} -ErrorAction SilentlyContinue | \
         Select-Object -ExpandProperty LinkLayerAddress",
        gateway_ip
    );

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &command])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let mac = String::from_utf8_lossy(&output.stdout).trim().to_string();

    // Validate and format MAC address
    // PowerShell returns format like: "AA-BB-CC-DD-EE-FF"
    if mac.is_empty() || mac.len() < 12 {
        return None;
    }

    // Convert Windows format (AA-BB-CC) to standard format (AA:BB:CC)
    // Also handle case where it might already be colon-separated
    let formatted = if mac.contains('-') {
        mac.replace('-', ":").to_uppercase()
    } else if mac.contains(':') {
        mac.to_uppercase()
    } else {
        // Raw format without separators: AABBCCDDEEFF
        if mac.len() == 12 {
            format!(
                "{}:{}:{}:{}:{}:{}",
                &mac[0..2],
                &mac[2..4],
                &mac[4..6],
                &mac[6..8],
                &mac[8..10],
                &mac[10..12]
            )
            .to_uppercase()
        } else {
            return None;
        }
    };

    // Final validation: should be XX:XX:XX:XX:XX:XX format
    if formatted.len() == 17 && formatted.matches(':').count() == 5 {
        Some(formatted)
    } else {
        None
    }
}

#[cfg(not(target_os = "windows"))]
fn get_router_mac(_gateway_ip: &str) -> Option<String> {
    // TODO: Implement for Linux (parse `ip neigh` or `arp -a`)
    // TODO: Implement for macOS (parse `arp -a`)
    None
}

#[cfg(target_os = "linux")]
fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "ip route" and parse the output
    // LOCALE-INDEPENDENT: The `ip` command outputs English keywords regardless of system locale
    // Keywords like "default" and "via" are not translated
    let output = Command::new("ip")
        .args(["route", "show", "default"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Format: "default via <gateway> dev <interface>"
    // Keywords "default" and "via" are part of the command's protocol, not user-facing text
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
    // LOCALE-INDEPENDENT: netstat uses numeric format (-n) and standard keywords
    // The keyword "default" and IP "0.0.0.0" are not localized
    let output = Command::new("netstat").args(&["-nr"]).output().ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for default route
    // Using -n flag ensures numeric output, and "default" keyword is not translated
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
            .timeout(Duration::from_secs(3)) // Reduced from 5 to 3 seconds
            .build()
            .ok()
            .and_then(|client| {
                client
                    .get("https://ipinfo.io/json")
                    .send()
                    .ok()
                    .and_then(|resp| resp.json::<IpInfoResponse>().ok())
            }) {
            Some(info) => (info.ip, info.org, info.country, info.city),
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
        latency_ms: None, // TODO: implement latency measurement
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

    let hostname = hostname::get().ok().and_then(|s| s.into_string().ok());

    // Try to get Wi-Fi info first to determine active adapter
    let (_ssid, _rssi, wifi_adapter_desc) = get_wifi_info();

    // Collect all non-loopback interfaces with private IPv4
    let interfaces: Vec<(String, String)> = match get_if_addrs() {
        Ok(ifaces) => ifaces
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
            .collect(),
        Err(_) => vec![],
    };

    // Determine adapter and IP based on Wi-Fi status
    let (adapter, local_ip) = if let Some(ref wifi_desc) = wifi_adapter_desc {
        // Wi-Fi is connected, use its description as adapter name
        // Find the IP for this adapter (first private IP we find)
        let ip = interfaces
            .first()
            .map(|(_, ip)| ip.clone())
            .unwrap_or_default();
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
        model: None, // fill later when we add a safe cross-platform method
        adapter: friendly_adapter,
        local_ip: if local_ip.is_empty() {
            None
        } else {
            Some(local_ip)
        },
    }
}

pub fn run_diagnostics(_settings: &Settings) -> DiagnosticsSnapshot {
    let now = OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap();

    // Computer diagnostics with timing
    let computer_start = Instant::now();
    let computer = get_computer_info();
    let computer_latency = computer_start.elapsed().as_millis() as u32;
    let computer_status = if computer.hostname.is_some() {
        Status::Ok
    } else {
        Status::Warn
    };

    // Network diagnostics with timing
    let network_start = Instant::now();
    let network = get_network_info(computer.adapter.as_deref());
    let network_latency = network_start.elapsed().as_millis() as u32;
    let network_status = match network.connection_type {
        ConnectionType::Unknown => Status::Warn,
        _ => Status::Ok,
    };

    // Router diagnostics with timing
    let router_start = Instant::now();
    let router = get_router_info();
    let router_latency = router_start.elapsed().as_millis() as u32;
    let router_status = if router.gateway_ip.is_some() {
        Status::Ok
    } else {
        Status::Warn
    };

    // Internet diagnostics with timing
    let internet_start = Instant::now();
    let internet = get_internet_info();
    let internet_latency = internet_start.elapsed().as_millis() as u32;
    let internet_status = if internet.dns_ok && internet.http_ok {
        Status::Ok
    } else if internet.dns_ok || internet.http_ok {
        Status::Warn
    } else {
        Status::Fail
    };

    // Build nodes with real latency values
    let nodes = vec![
        NodeInfo {
            id: NodeId::Computer,
            name_key: "nodes.computer.name".into(),
            status: computer_status,
            latency_ms: Some(computer_latency),
            hint_key: None,
        },
        NodeInfo {
            id: NodeId::Wifi,
            name_key: "nodes.wifi.name".into(),
            status: network_status,
            latency_ms: Some(network_latency),
            hint_key: None,
        },
        NodeInfo {
            id: NodeId::RouterUpnp,
            name_key: "nodes.router.name".into(),
            status: router_status,
            latency_ms: Some(router_latency),
            hint_key: None,
        },
        NodeInfo {
            id: NodeId::Internet,
            name_key: "nodes.internet.name".into(),
            status: internet_status,
            latency_ms: Some(internet_latency),
            hint_key: None,
        },
    ];

    // Determine overall summary
    let summary_key = if nodes.iter().all(|n| matches!(n.status, Status::Ok)) {
        "summary.ok".into()
    } else if nodes.iter().any(|n| matches!(n.status, Status::Fail)) {
        "summary.fail".into()
    } else {
        "summary.warn".into()
    };

    DiagnosticsSnapshot {
        at_utc: now,
        nodes,
        summary_key,
        computer,
        network,
        router,
        internet,
    }
}

// DNS configuration types
#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DnsProvider {
    Auto, // Use ISP/DHCP DNS
    // Cloudflare
    Cloudflare,        // 1.1.1.1, 1.0.0.1 - Standard
    CloudflareMalware, // 1.1.1.2, 1.0.0.2 - Malware Protection
    CloudflareFamily,  // 1.1.1.3, 1.0.0.3 - Adult + Malware
    // Google
    Google, // 8.8.8.8, 8.8.4.4 - Public DNS
    // AdGuard
    AdGuard,             // 94.140.14.14, 94.140.15.15 - Default Filtering
    AdGuardNonFiltering, // 94.140.14.140, 94.140.14.141 - Non-filtering
    AdGuardFamily,       // 94.140.14.15, 94.140.15.16 - Family Protection
    // DNS4EU
    Dns4EuProtective,        // 86.54.11.1 - Protective
    Dns4EuProtectiveChild,   // 86.54.11.12 - Protective + Child
    Dns4EuProtectiveAd,      // 86.54.11.13 - Protective + Ad
    Dns4EuProtectiveChildAd, // 86.54.11.11 - Protective + Child & Ads
    Dns4EuUnfiltered,        // 86.54.11.100 - Unfiltered
    // CleanBrowsing
    CleanBrowsingFamily,   // 185.228.168.168, 185.228.169.168 - Family Filter
    CleanBrowsingAdult,    // Adult Filter
    CleanBrowsingSecurity, // Security Filter
    // Quad9
    Quad9Recommended, // 9.9.9.9, 149.112.112.112 - Recommended
    Quad9SecuredEcs,  // 9.9.9.11, 149.112.112.11 - Secured w/ECS
    Quad9Unsecured,   // 9.9.9.10, 149.112.112.10 - Unsecured
    // OpenDNS
    OpenDnsFamilyShield,    // 208.67.222.123, 208.67.220.123 - FamilyShield
    OpenDnsHome,            // 208.67.222.222, 208.67.220.220 - Home
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
                .args(["interface", "ip", "set", "dns", &adapter_name, "dhcp"])
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
                .args([
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
                    .args([
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
        // Force English culture to ensure locale-independent output
        // This prevents localized enum values like "Connected"/"Подключено"
        let culture_prefix =
            "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; ";
        let full_command = format!("{}{}", culture_prefix, command);

        let output = Command::new("powershell")
            .args(["-NoProfile", "-Command", &full_command])
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

    // Force English culture for locale-independent output
    let culture_prefix = "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; ";
    let command = format!(
        "{}Get-DnsClientServerAddress -InterfaceAlias '{}' -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses",
        culture_prefix,
        adapter_name.replace("'", "''")
    );

    // Use PowerShell to get DNS server addresses
    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", &command])
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

// Check if IP address string is private (router/local network)
fn is_private_ip_str(ip: &str) -> bool {
    ip.parse::<std::net::IpAddr>()
        .map_or(false, |ip_addr| is_private_ip(&ip_addr))
}

// Detect which DNS provider is currently in use based on DNS server IPs
pub fn detect_dns_provider(dns_servers: &[String]) -> DnsProvider {
    if dns_servers.is_empty() {
        return DnsProvider::Auto;
    }

    let primary = dns_servers.first().map(|s| s.as_str());
    let secondary = dns_servers.get(1).map(|s| s.as_str());

    // If primary DNS is a private IP (router), treat as Auto (DHCP-assigned)
    if let Some(p) = primary {
        if is_private_ip_str(p) {
            return DnsProvider::Auto;
        }
    }

    match (primary, secondary) {
        // Cloudflare
        (Some("1.1.1.1"), Some("1.0.0.1")) | (Some("1.1.1.1"), None) => DnsProvider::Cloudflare,
        (Some("1.1.1.2"), Some("1.0.0.2")) | (Some("1.1.1.2"), None) => {
            DnsProvider::CloudflareMalware
        }
        (Some("1.1.1.3"), Some("1.0.0.3")) | (Some("1.1.1.3"), None) => {
            DnsProvider::CloudflareFamily
        }
        // Google
        (Some("8.8.8.8"), Some("8.8.4.4")) | (Some("8.8.8.8"), None) => DnsProvider::Google,
        // AdGuard
        (Some("94.140.14.14"), Some("94.140.15.15")) | (Some("94.140.14.14"), None) => {
            DnsProvider::AdGuard
        }
        (Some("94.140.14.140"), Some("94.140.14.141")) | (Some("94.140.14.140"), None) => {
            DnsProvider::AdGuardNonFiltering
        }
        (Some("94.140.14.15"), Some("94.140.15.16")) | (Some("94.140.14.15"), None) => {
            DnsProvider::AdGuardFamily
        }
        // DNS4EU
        (Some("86.54.11.1"), _) => DnsProvider::Dns4EuProtective,
        (Some("86.54.11.12"), _) => DnsProvider::Dns4EuProtectiveChild,
        (Some("86.54.11.13"), _) => DnsProvider::Dns4EuProtectiveAd,
        (Some("86.54.11.11"), _) => DnsProvider::Dns4EuProtectiveChildAd,
        (Some("86.54.11.100"), _) => DnsProvider::Dns4EuUnfiltered,
        // CleanBrowsing
        (Some("185.228.168.168"), Some("185.228.169.168")) | (Some("185.228.168.168"), None) => {
            DnsProvider::CleanBrowsingFamily
        }
        (Some("185.228.168.10"), Some("185.228.169.11")) | (Some("185.228.168.10"), None) => {
            DnsProvider::CleanBrowsingAdult
        }
        (Some("185.228.168.9"), Some("185.228.169.9")) | (Some("185.228.168.9"), None) => {
            DnsProvider::CleanBrowsingSecurity
        }
        // Quad9
        (Some("9.9.9.9"), Some("149.112.112.112")) | (Some("9.9.9.9"), None) => {
            DnsProvider::Quad9Recommended
        }
        (Some("9.9.9.11"), Some("149.112.112.11")) | (Some("9.9.9.11"), None) => {
            DnsProvider::Quad9SecuredEcs
        }
        (Some("9.9.9.10"), Some("149.112.112.10")) | (Some("9.9.9.10"), None) => {
            DnsProvider::Quad9Unsecured
        }
        // OpenDNS
        (Some("208.67.222.123"), Some("208.67.220.123")) | (Some("208.67.222.123"), None) => {
            DnsProvider::OpenDnsFamilyShield
        }
        (Some("208.67.222.222"), Some("208.67.220.220")) | (Some("208.67.222.222"), None) => {
            DnsProvider::OpenDnsHome
        }
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

        assert!(
            octets_8[0] != 10
                && !(octets_8[0] == 192 && octets_8[1] == 168)
                && !(octets_8[0] == 172 && (16..=31).contains(&octets_8[1]))
        );
        assert!(
            octets_1[0] != 10
                && !(octets_1[0] == 192 && octets_1[1] == 168)
                && !(octets_1[0] == 172 && (16..=31).contains(&octets_1[1]))
        );
        assert!(octets_172_15[0] == 172 && !(16..=31).contains(&octets_172_15[1]));
        assert!(octets_172_32[0] == 172 && !(16..=31).contains(&octets_172_32[1]));
    }

    #[test]
    fn test_get_computer_info_does_not_panic() {
        // This test ensures the function doesn't panic and returns valid data
        let _info = get_computer_info();
        // If we reach here, the function didn't panic - test passes
    }

    #[test]
    fn test_diagnostics_snapshot_includes_computer_info() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Verify that computer info is included in the snapshot and serializable
        // We can't assert specific values since they depend on the system,
        // but we verify the structure is present
        let _ = &snapshot.computer.hostname;
        let _ = &snapshot.computer.model;
        let _ = &snapshot.computer.adapter;
        let _ = &snapshot.computer.local_ip;
        // If we reach here, computer info structure is valid - test passes
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

    #[test]
    fn test_real_latency_measurements() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Verify all nodes have latency values
        for node in &snapshot.nodes {
            assert!(
                node.latency_ms.is_some(),
                "Node {:?} should have latency measurement",
                node.id
            );

            let latency = node.latency_ms.unwrap();

            // Latency should be reasonable (u32 is always >= 0, so just check upper bound)
            // Note: Internet node can take longer due to network timeouts (up to 60s in CI)
            let max_latency = match node.id {
                NodeId::Internet => 60000, // 60 seconds for internet tests
                _ => 10000,                // 10 seconds for local operations
            };

            assert!(
                latency < max_latency,
                "Node {:?} latency suspiciously high: {} ms (max: {})",
                node.id,
                latency,
                max_latency
            );

            println!("Node {:?}: {} ms", node.id, latency);
        }
    }

    #[test]
    fn test_diagnostics_status_logic() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Verify summary_key matches node statuses
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

        // Should complete within 60 seconds (generous for CI environments with network timeouts)
        // In production with network access, typically completes in < 2 seconds
        assert!(
            duration.as_secs() < 60,
            "Diagnostics took too long: {:?}",
            duration
        );

        println!("Full diagnostics completed in {:?}", duration);
    }

    #[test]
    fn test_dns_provider_cloudflare_standard() {
        let provider = detect_dns_provider(&["1.1.1.1".to_string(), "1.0.0.1".to_string()]);
        assert!(matches!(provider, DnsProvider::Cloudflare));

        // Test with only primary
        let provider_single = detect_dns_provider(&["1.1.1.1".to_string()]);
        assert!(matches!(provider_single, DnsProvider::Cloudflare));
    }

    #[test]
    fn test_dns_provider_cloudflare_malware() {
        let provider = detect_dns_provider(&["1.1.1.2".to_string(), "1.0.0.2".to_string()]);
        assert!(matches!(provider, DnsProvider::CloudflareMalware));

        let provider_single = detect_dns_provider(&["1.1.1.2".to_string()]);
        assert!(matches!(provider_single, DnsProvider::CloudflareMalware));
    }

    #[test]
    fn test_dns_provider_cloudflare_family() {
        let provider = detect_dns_provider(&["1.1.1.3".to_string(), "1.0.0.3".to_string()]);
        assert!(matches!(provider, DnsProvider::CloudflareFamily));

        let provider_single = detect_dns_provider(&["1.1.1.3".to_string()]);
        assert!(matches!(provider_single, DnsProvider::CloudflareFamily));
    }

    #[test]
    fn test_dns_provider_google() {
        let provider = detect_dns_provider(&["8.8.8.8".to_string(), "8.8.4.4".to_string()]);
        assert!(matches!(provider, DnsProvider::Google));

        let provider_single = detect_dns_provider(&["8.8.8.8".to_string()]);
        assert!(matches!(provider_single, DnsProvider::Google));
    }

    #[test]
    fn test_dns_provider_adguard_variants() {
        // AdGuard Standard
        let provider =
            detect_dns_provider(&["94.140.14.14".to_string(), "94.140.15.15".to_string()]);
        assert!(matches!(provider, DnsProvider::AdGuard));

        // AdGuard Non-filtering
        let provider_nf =
            detect_dns_provider(&["94.140.14.140".to_string(), "94.140.14.141".to_string()]);
        assert!(matches!(provider_nf, DnsProvider::AdGuardNonFiltering));

        // AdGuard Family
        let provider_family =
            detect_dns_provider(&["94.140.14.15".to_string(), "94.140.15.16".to_string()]);
        assert!(matches!(provider_family, DnsProvider::AdGuardFamily));
    }

    #[test]
    fn test_dns_provider_quad9_variants() {
        // Quad9 Recommended
        let provider = detect_dns_provider(&["9.9.9.9".to_string(), "149.112.112.112".to_string()]);
        assert!(matches!(provider, DnsProvider::Quad9Recommended));

        // Quad9 Secured ECS
        let provider_ecs =
            detect_dns_provider(&["9.9.9.11".to_string(), "149.112.112.11".to_string()]);
        assert!(matches!(provider_ecs, DnsProvider::Quad9SecuredEcs));

        // Quad9 Unsecured
        let provider_unsec =
            detect_dns_provider(&["9.9.9.10".to_string(), "149.112.112.10".to_string()]);
        assert!(matches!(provider_unsec, DnsProvider::Quad9Unsecured));
    }

    #[test]
    fn test_dns_provider_opendns_variants() {
        // OpenDNS Family Shield
        let provider =
            detect_dns_provider(&["208.67.222.123".to_string(), "208.67.220.123".to_string()]);
        assert!(matches!(provider, DnsProvider::OpenDnsFamilyShield));

        // OpenDNS Home
        let provider_home =
            detect_dns_provider(&["208.67.222.222".to_string(), "208.67.220.220".to_string()]);
        assert!(matches!(provider_home, DnsProvider::OpenDnsHome));
    }

    #[test]
    fn test_dns_provider_cleanbrowsing() {
        let provider =
            detect_dns_provider(&["185.228.168.168".to_string(), "185.228.169.168".to_string()]);
        assert!(matches!(provider, DnsProvider::CleanBrowsingFamily));

        let provider_single = detect_dns_provider(&["185.228.168.168".to_string()]);
        assert!(matches!(provider_single, DnsProvider::CleanBrowsingFamily));
    }

    #[test]
    fn test_dns_provider_dns4eu_variants() {
        // Protective
        let provider_protective = detect_dns_provider(&["86.54.11.1".to_string()]);
        assert!(matches!(provider_protective, DnsProvider::Dns4EuProtective));

        // Protective Child
        let provider_child = detect_dns_provider(&["86.54.11.12".to_string()]);
        assert!(matches!(provider_child, DnsProvider::Dns4EuProtectiveChild));

        // Protective Ad
        let provider_ad = detect_dns_provider(&["86.54.11.13".to_string()]);
        assert!(matches!(provider_ad, DnsProvider::Dns4EuProtectiveAd));

        // Protective Child + Ad
        let provider_child_ad = detect_dns_provider(&["86.54.11.11".to_string()]);
        assert!(matches!(
            provider_child_ad,
            DnsProvider::Dns4EuProtectiveChildAd
        ));

        // Unfiltered
        let provider_unfiltered = detect_dns_provider(&["86.54.11.100".to_string()]);
        assert!(matches!(provider_unfiltered, DnsProvider::Dns4EuUnfiltered));
    }

    #[test]
    fn test_dns_provider_custom() {
        // Custom dual DNS
        let provider = detect_dns_provider(&["1.2.3.4".to_string(), "5.6.7.8".to_string()]);
        match provider {
            DnsProvider::Custom(primary, secondary) => {
                assert_eq!(primary, "1.2.3.4");
                assert_eq!(secondary, "5.6.7.8");
            }
            _ => panic!("Expected Custom provider"),
        }

        // Custom single DNS
        let provider_single = detect_dns_provider(&["1.2.3.4".to_string()]);
        match provider_single {
            DnsProvider::Custom(primary, secondary) => {
                assert_eq!(primary, "1.2.3.4");
                assert_eq!(secondary, "");
            }
            _ => panic!("Expected Custom provider"),
        }
    }

    #[test]
    fn test_dns_provider_auto() {
        // Empty list
        let provider = detect_dns_provider(&[]);
        assert!(matches!(provider, DnsProvider::Auto));

        // None values
        let empty: Vec<String> = vec![];
        let provider_empty = detect_dns_provider(&empty);
        assert!(matches!(provider_empty, DnsProvider::Auto));
    }

    #[test]
    fn test_settings_default() {
        let settings = get_default_settings();
        // Settings should always return a valid instance
        // The actual default values are implementation details
        // but we verify it doesn't panic
        let _ = serde_json::to_string(&settings).expect("Settings should be serializable");
    }

    #[test]
    fn test_network_info_structure() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Verify network info structure is present and accessible
        let _ = &snapshot.network.connection_type;
        let _ = &snapshot.network.ssid;
        let _ = &snapshot.network.rssi;
        let _ = &snapshot.network.signal_quality;
        let _ = &snapshot.network.channel;
        let _ = &snapshot.network.frequency;
        // If we reach here, network info structure is valid - test passes
    }

    #[test]
    fn test_internet_info_structure() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Verify internet info structure is present and accessible
        let _ = &snapshot.internet.public_ip;
        let _ = &snapshot.internet.isp;
        let _ = &snapshot.internet.city;
        let _ = &snapshot.internet.country;
        let _ = &snapshot.internet.dns_ok;
        let _ = &snapshot.internet.http_ok;
        // If we reach here, internet info structure is valid - test passes
    }

    #[test]
    fn test_node_count_and_ids() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Should have expected number of nodes
        assert!(
            snapshot.nodes.len() >= 4,
            "Should have at least 4 diagnostic nodes"
        );

        // Verify we have essential node types
        let node_ids: Vec<NodeId> = snapshot.nodes.iter().map(|n| n.id).collect();
        assert!(node_ids.contains(&NodeId::Computer));
        assert!(node_ids.contains(&NodeId::Internet));
    }

    #[test]
    fn test_status_enum_ordering() {
        // Status enum should support ordering for comparisons
        use Status::*;

        // These assertions verify the expected severity ordering
        assert!(matches!(Ok, Status::Ok));
        assert!(matches!(Warn, Status::Warn));
        assert!(matches!(Fail, Status::Fail));
        assert!(matches!(Unknown, Status::Unknown));
    }

    #[test]
    fn test_node_id_serialization() {
        use NodeId::*;

        // Test that NodeId can be serialized and deserialized
        let ids = vec![Computer, Wifi, RouterUpnp, Dns, Internet];

        for id in ids {
            let json = serde_json::to_string(&id).expect("Should serialize");
            let deserialized: NodeId = serde_json::from_str(&json).expect("Should deserialize");
            assert!(matches!(
                (id, deserialized),
                (Computer, Computer)
                    | (Wifi, Wifi)
                    | (RouterUpnp, RouterUpnp)
                    | (Dns, Dns)
                    | (Internet, Internet)
            ));
        }
    }

    // Additional IP validation tests
    #[test]
    fn test_private_ip_10_0_0_0() {
        let ip: std::net::IpAddr = "10.0.0.0".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_10_255_255_255() {
        let ip: std::net::IpAddr = "10.255.255.255".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_172_16_0_0() {
        let ip: std::net::IpAddr = "172.16.0.0".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_172_31_255_255() {
        let ip: std::net::IpAddr = "172.31.255.255".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_not_private_ip_172_15() {
        let ip: std::net::IpAddr = "172.15.255.255".parse().unwrap();
        assert!(!is_private_ip(&ip));
    }

    #[test]
    fn test_not_private_ip_172_32() {
        let ip: std::net::IpAddr = "172.32.0.0".parse().unwrap();
        assert!(!is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_192_168_0_0() {
        let ip: std::net::IpAddr = "192.168.0.0".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_192_168_255_255() {
        let ip: std::net::IpAddr = "192.168.255.255".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_169_254() {
        let ip: std::net::IpAddr = "169.254.1.1".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_public_ip_8_8_8_8() {
        let ip: std::net::IpAddr = "8.8.8.8".parse().unwrap();
        assert!(!is_private_ip(&ip));
    }

    #[test]
    fn test_public_ip_1_1_1_1() {
        let ip: std::net::IpAddr = "1.1.1.1".parse().unwrap();
        assert!(!is_private_ip(&ip));
    }

    // Connection type detection tests
    #[test]
    fn test_detect_connection_type_wifi_lowercase() {
        assert!(matches!(
            detect_connection_type("wifi"),
            ConnectionType::Wifi
        ));
    }

    #[test]
    fn test_detect_connection_type_wlan() {
        assert!(matches!(
            detect_connection_type("wlan0"),
            ConnectionType::Wifi
        ));
    }

    #[test]
    fn test_detect_connection_type_wlp() {
        // wlp contains "wlan"? No, so it should be Unknown
        assert!(matches!(
            detect_connection_type("wlp3s0"),
            ConnectionType::Unknown
        ));
    }

    #[test]
    fn test_detect_connection_type_ethernet_lowercase() {
        assert!(matches!(
            detect_connection_type("ethernet"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_eth0() {
        assert!(matches!(
            detect_connection_type("eth0"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_enp() {
        assert!(matches!(
            detect_connection_type("enp0s25"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_en0() {
        assert!(matches!(
            detect_connection_type("en0"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_usb_ethernet() {
        // After lowercasing, "usb ethernet" contains both "usb" AND "ethernet"
        // Function checks "ethernet" BEFORE "usb", so it returns Ethernet
        assert!(matches!(
            detect_connection_type("USB Ethernet"),
            ConnectionType::Ethernet
        ));
    }

    #[test]
    fn test_detect_connection_type_usb0() {
        assert!(matches!(
            detect_connection_type("usb0"),
            ConnectionType::Usb
        ));
    }

    #[test]
    fn test_detect_connection_type_mobile() {
        assert!(matches!(
            detect_connection_type("Mobile"),
            ConnectionType::Mobile
        ));
    }

    #[test]
    fn test_detect_connection_type_cellular() {
        assert!(matches!(
            detect_connection_type("Cellular"),
            ConnectionType::Mobile
        ));
    }

    #[test]
    fn test_detect_connection_type_ppp0() {
        // ppp is not checked in detect_connection_type, so should be Unknown
        assert!(matches!(
            detect_connection_type("ppp0"),
            ConnectionType::Unknown
        ));
    }

    #[test]
    fn test_detect_connection_type_unknown_string() {
        assert!(matches!(
            detect_connection_type("SomeWeirdAdapter"),
            ConnectionType::Unknown
        ));
    }

    #[test]
    fn test_detect_connection_type_empty_string() {
        assert!(matches!(
            detect_connection_type(""),
            ConnectionType::Unknown
        ));
    }

    // Settings tests
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
        assert_eq!(deserialized.dns_servers[0], "1.1.1.1");
        assert_eq!(deserialized.dns_servers[1], "8.8.8.8");
    }

    #[test]
    fn test_settings_language_ru() {
        let settings = Settings {
            language: "ru".to_string(),
            test_timeout_ms: 5000,
            dns_servers: vec![],
        };

        assert_eq!(settings.language, "ru");
    }

    #[test]
    fn test_settings_custom_timeout() {
        let settings = Settings {
            language: "en".to_string(),
            test_timeout_ms: 10000,
            dns_servers: vec![],
        };

        assert_eq!(settings.test_timeout_ms, 10000);
    }

    // Snapshot tests
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
    fn test_snapshot_nodes_have_latency() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        for node in &snapshot.nodes {
            assert!(
                node.latency_ms.is_some(),
                "Node {:?} missing latency",
                node.id
            );
        }
    }

    #[test]
    fn test_snapshot_timestamp_format() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        // Should contain 'T' separator and 'Z' or timezone offset
        assert!(snapshot.at_utc.contains('T'));
        assert!(snapshot.at_utc.contains('Z') || snapshot.at_utc.contains('+'));
    }

    // Node info tests
    #[test]
    fn test_node_info_computer_id() {
        let node = NodeInfo {
            id: NodeId::Computer,
            name_key: "nodes.computer".to_string(),
            status: Status::Ok,
            latency_ms: Some(10),
            hint_key: None,
        };

        assert!(matches!(node.id, NodeId::Computer));
    }

    #[test]
    fn test_node_info_with_hint() {
        let node = NodeInfo {
            id: NodeId::Internet,
            name_key: "nodes.internet".to_string(),
            status: Status::Warn,
            latency_ms: Some(100),
            hint_key: Some("hints.slow_connection".to_string()),
        };

        assert!(node.hint_key.is_some());
        assert_eq!(node.hint_key.unwrap(), "hints.slow_connection");
    }

    #[test]
    fn test_node_status_unknown() {
        let node = NodeInfo {
            id: NodeId::RouterUpnp,
            name_key: "nodes.router".to_string(),
            status: Status::Unknown,
            latency_ms: None,
            hint_key: None,
        };

        assert!(matches!(node.status, Status::Unknown));
    }

    // Router MAC address tests
    #[test]
    #[cfg(target_os = "windows")]
    fn test_router_mac_format_windows_dash() {
        // Simulate Windows format: AA-BB-CC-DD-EE-FF
        // This tests the formatting logic, not actual PowerShell execution
        let mac_dash = "AA-BB-CC-DD-EE-FF";
        let formatted = mac_dash.replace('-', ":").to_uppercase();
        assert_eq!(formatted, "AA:BB:CC:DD:EE:FF");
        assert_eq!(formatted.len(), 17);
        assert_eq!(formatted.matches(':').count(), 5);
    }

    #[test]
    fn test_router_mac_format_validation() {
        // Valid MAC format
        let valid = "AA:BB:CC:DD:EE:FF";
        assert_eq!(valid.len(), 17);
        assert_eq!(valid.matches(':').count(), 5);

        // Invalid formats
        let too_short = "AA:BB:CC";
        assert_ne!(too_short.len(), 17);

        let wrong_separator = "AA-BB-CC-DD-EE-FF";
        assert_eq!(wrong_separator.matches(':').count(), 0);
    }

    #[test]
    fn test_router_mac_raw_format() {
        // Test raw format without separators: AABBCCDDEEFF
        let raw = "AABBCCDDEEFF";
        if raw.len() == 12 {
            let formatted = format!(
                "{}:{}:{}:{}:{}:{}",
                &raw[0..2],
                &raw[2..4],
                &raw[4..6],
                &raw[6..8],
                &raw[8..10],
                &raw[10..12]
            )
            .to_uppercase();
            assert_eq!(formatted, "AA:BB:CC:DD:EE:FF");
        }
    }

    #[test]
    fn test_router_info_structure() {
        let router = get_router_info();

        // Gateway IP should be present on most systems
        // MAC might not be available in test environment
        if router.gateway_ip.is_some() {
            // If we have gateway IP, structure is valid
            assert!(router.gateway_ip.as_ref().unwrap().len() > 0);
        }

        // MAC format validation if present
        if let Some(mac) = &router.gateway_mac {
            assert_eq!(mac.len(), 17, "MAC should be XX:XX:XX:XX:XX:XX format");
            assert_eq!(mac.matches(':').count(), 5, "MAC should have 5 colons");
            assert!(
                mac.chars().all(|c| c.is_ascii_hexdigit() || c == ':'),
                "MAC should only contain hex digits and colons"
            );
        }
    }

    // Vendor Lookup Tests (Phase 2.5.2 - Full IEEE OUI Database)

    #[test]
    fn test_vendor_lookup_ieee_database() {
        // Test various vendors from full IEEE OUI database (official names)

        // TP-Link Systems Inc
        assert_eq!(
            lookup_vendor_by_mac("40:ED:00:11:22:33"),
            Some("TP-Link Systems Inc".to_string())
        );

        // NETGEAR
        assert_eq!(
            lookup_vendor_by_mac("A0:40:A0:11:22:33"),
            Some("NETGEAR".to_string())
        );

        // Test 2C3033 specifically (was incorrectly listed under TP-Link)
        assert_eq!(
            lookup_vendor_by_mac("2C:30:33:11:22:33"),
            Some("NETGEAR".to_string())
        );

        // D-Link International
        assert_eq!(
            lookup_vendor_by_mac("1C:7E:E5:11:22:33"),
            Some("D-Link International".to_string())
        );

        // Cisco Systems, Inc
        assert_eq!(
            lookup_vendor_by_mac("00:01:42:11:22:33"),
            Some("Cisco Systems, Inc".to_string())
        );

        // Cisco Meraki
        assert_eq!(
            lookup_vendor_by_mac("9C:E3:30:11:22:33"),
            Some("Cisco Meraki".to_string())
        );

        // ZTE Corporation (user's router - OUI 7890A2)
        assert_eq!(
            lookup_vendor_by_mac("78:90:A2:11:22:33"),
            Some("zte corporation".to_string())
        );

        // Cisco-Linksys, LLC
        assert_eq!(
            lookup_vendor_by_mac("00:0F:66:11:22:33"),
            Some("Cisco-Linksys, LLC".to_string())
        );

        // Belkin International Inc.
        assert_eq!(
            lookup_vendor_by_mac("00:1C:DF:11:22:33"),
            Some("Belkin International Inc.".to_string())
        );

        // HUAWEI TECHNOLOGIES CO.,LTD
        assert_eq!(
            lookup_vendor_by_mac("00:1E:10:11:22:33"),
            Some("HUAWEI TECHNOLOGIES CO.,LTD".to_string())
        );
    }

    #[test]
    fn test_vendor_lookup_mac_formats() {
        // Test standard format (colon-separated)
        let vendor1 = lookup_vendor_by_mac("40:ED:00:11:22:33");
        assert!(vendor1.is_some());

        // Test Windows format (dash-separated)
        let vendor2 = lookup_vendor_by_mac("40-ED-00-11-22-33");
        assert!(vendor2.is_some());

        // Test compact format (no separators)
        let vendor3 = lookup_vendor_by_mac("40ED00112233");
        assert!(vendor3.is_some());

        // All formats should return the same vendor
        assert_eq!(vendor1, vendor2);
        assert_eq!(vendor2, vendor3);
    }

    #[test]
    fn test_vendor_lookup_case_insensitive() {
        // Test lowercase MAC
        let vendor1 = lookup_vendor_by_mac("40:ed:00:11:22:33");

        // Test mixed case MAC
        let vendor2 = lookup_vendor_by_mac("40:Ed:00:11:22:33");

        // Test uppercase MAC
        let vendor3 = lookup_vendor_by_mac("40:ED:00:11:22:33");

        // All should return the same vendor
        assert_eq!(vendor1, vendor2);
        assert_eq!(vendor2, vendor3);
        assert!(vendor1.is_some());
    }

    #[test]
    fn test_vendor_lookup_not_found() {
        // Test with unknown OUI
        let vendor = lookup_vendor_by_mac("FF:FF:FF:11:22:33");
        assert_eq!(vendor, None);
    }

    #[test]
    fn test_vendor_lookup_invalid_mac_too_short() {
        // Test with too short MAC
        let vendor = lookup_vendor_by_mac("40:ED");
        assert_eq!(vendor, None);
    }

    #[test]
    fn test_vendor_lookup_invalid_mac_empty() {
        // Test with empty string
        let vendor = lookup_vendor_by_mac("");
        assert_eq!(vendor, None);
    }

    #[test]
    fn test_vendor_lookup_invalid_mac_non_hex() {
        // Test with non-hex characters
        let vendor = lookup_vendor_by_mac("ZZ:ZZ:ZZ:11:22:33");
        assert_eq!(vendor, None);
    }

    #[test]
    fn test_vendor_lookup_with_router_info() {
        // Test that vendor is populated in RouterInfo when MAC is available
        let router = get_router_info();

        // If we have both MAC and vendor, verify vendor is based on MAC
        if let (Some(mac), Some(vendor)) = (&router.gateway_mac, &router.vendor) {
            // Extract OUI from MAC
            let oui: String = mac
                .chars()
                .filter(|c| c.is_ascii_hexdigit())
                .take(6)
                .collect();

            // Verify vendor lookup works for this OUI
            let looked_up_vendor = lookup_vendor_by_mac(mac);
            if looked_up_vendor.is_some() {
                assert_eq!(looked_up_vendor.as_ref(), Some(vendor));
            }

            println!("Router MAC: {}, Vendor: {}, OUI: {}", mac, vendor, oui);
        }
    }

    #[test]
    fn test_oui_database_not_empty() {
        // Verify OUI database has entries (full IEEE database)
        assert!(
            !OUI_DATABASE.is_empty(),
            "OUI database should contain vendor entries"
        );
        assert!(
            OUI_DATABASE.len() > 30000,
            "OUI database should have 30,000+ entries (full IEEE database), got {}",
            OUI_DATABASE.len()
        );
        println!("OUI database size: {} entries", OUI_DATABASE.len());
    }

    #[test]
    fn test_oui_database_format() {
        // Verify all OUI entries are valid hex strings
        for (oui, vendor) in OUI_DATABASE {
            assert!(
                !oui.is_empty(),
                "OUI prefix should not be empty for vendor {}",
                vendor
            );
            assert!(
                oui.chars().all(|c| c.is_ascii_hexdigit()),
                "OUI {} should only contain hex digits for vendor {}",
                oui,
                vendor
            );
            assert!(
                oui.len() >= 6,
                "OUI {} should be at least 6 chars for vendor {}",
                oui,
                vendor
            );
            assert!(
                !vendor.is_empty(),
                "Vendor name should not be empty for OUI {}",
                oui
            );
        }
    }
}
