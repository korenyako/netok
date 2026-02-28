//! Wi-Fi security checks.
//!
//! Provides four security checks:
//! 1. Encryption — type of Wi-Fi encryption (Open/WEP/WPA/WPA2/WPA3)
//! 2. Evil Twin — duplicate SSIDs with different security
//! 3. ARP Spoofing — duplicate MACs in ARP table
//! 4. DNS Hijacking — DNS response mismatch

use serde::{Deserialize, Serialize};

// ==================== Domain Types ====================

/// Status of a security check.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SecurityStatus {
    Safe,
    Warning,
    Danger,
}

/// Type of security check.
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SecurityCheckType {
    Encryption,
    EvilTwin,
    ArpSpoofing,
    DnsHijacking,
}

/// Result of a single security check.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SecurityCheck {
    pub check_type: SecurityCheckType,
    pub status: SecurityStatus,
    /// Technical details (encryption type, IPs, etc.)
    pub details: Option<String>,
}

/// Complete Wi-Fi security report.
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct WiFiSecurityReport {
    pub checks: Vec<SecurityCheck>,
    pub overall_status: SecurityStatus,
    pub network_ssid: Option<String>,
    pub timestamp: u64,
}

// ==================== Encryption Check (Windows) ====================

/// Wi-Fi encryption type.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EncryptionType {
    Open,
    Wep,
    Wpa,
    Wpa2,
    Wpa3,
    Unknown(String),
}

impl std::fmt::Display for EncryptionType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            EncryptionType::Open => write!(f, "Open"),
            EncryptionType::Wep => write!(f, "WEP"),
            EncryptionType::Wpa => write!(f, "WPA"),
            EncryptionType::Wpa2 => write!(f, "WPA2"),
            EncryptionType::Wpa3 => write!(f, "WPA3"),
            EncryptionType::Unknown(s) => write!(f, "{}", s),
        }
    }
}

/// Check Wi-Fi encryption type on Windows.
#[cfg(target_os = "windows")]
pub fn check_encryption() -> SecurityCheck {
    let start = std::time::Instant::now();
    use std::ptr;
    use windows::Win32::Foundation::*;
    use windows::Win32::NetworkManagement::WiFi::*;

    struct WlanHandle(HANDLE);

    impl Drop for WlanHandle {
        fn drop(&mut self) {
            unsafe {
                let _ = WlanCloseHandle(self.0, None);
            }
        }
    }

    unsafe {
        let mut client_handle: HANDLE = HANDLE::default();
        let mut negotiated_version: u32 = 0;

        let result = WlanOpenHandle(2, None, &mut negotiated_version, &mut client_handle);
        if result != 0 || client_handle.is_invalid() {
            return SecurityCheck {
                check_type: SecurityCheckType::Encryption,
                status: SecurityStatus::Warning,
                details: Some("wifi_unavailable".to_string()),
            };
        }

        let _handle_guard = WlanHandle(client_handle);

        let mut interface_list: *mut WLAN_INTERFACE_INFO_LIST = ptr::null_mut();
        let result = WlanEnumInterfaces(client_handle, None, &mut interface_list);
        if result != 0 || interface_list.is_null() {
            return SecurityCheck {
                check_type: SecurityCheckType::Encryption,
                status: SecurityStatus::Warning,
                details: Some("wifi_unavailable".to_string()),
            };
        }

        let list = &*interface_list;
        let mut check_result = SecurityCheck {
            check_type: SecurityCheckType::Encryption,
            status: SecurityStatus::Warning,
            details: Some("not_connected".to_string()),
        };

        // InterfaceInfo is a C flexible array member declared as [T; 1]
        // in Windows bindings. We must use raw pointer arithmetic instead
        // of Rust array indexing to avoid out-of-bounds panics.
        let interface_ptr = list.InterfaceInfo.as_ptr();
        for i in 0..list.dwNumberOfItems as usize {
            let interface = &*interface_ptr.add(i);
            if interface.isState != wlan_interface_state_connected {
                continue;
            }

            let mut data_size: u32 = 0;
            let mut connection_attrs: *mut WLAN_CONNECTION_ATTRIBUTES = ptr::null_mut();

            let result = WlanQueryInterface(
                client_handle,
                &interface.InterfaceGuid,
                wlan_intf_opcode_current_connection,
                None,
                &mut data_size,
                std::ptr::addr_of_mut!(connection_attrs) as *mut *mut core::ffi::c_void,
                None,
            );

            if result != 0 || connection_attrs.is_null() {
                continue;
            }

            let attrs = &*connection_attrs;

            // Determine auth algorithm
            let auth = attrs.wlanSecurityAttributes.dot11AuthAlgorithm;

            let enc_type = match auth {
                DOT11_AUTH_ALGO_80211_OPEN => {
                    // Check if there's a cipher (could be OWE)
                    let cipher = attrs.wlanSecurityAttributes.dot11CipherAlgorithm;
                    if cipher == DOT11_CIPHER_ALGO_NONE {
                        EncryptionType::Open
                    } else {
                        EncryptionType::Wpa2
                    }
                }
                DOT11_AUTH_ALGO_80211_SHARED_KEY => EncryptionType::Wep,
                DOT11_AUTH_ALGO_WPA => EncryptionType::Wpa,
                DOT11_AUTH_ALGO_WPA_PSK => EncryptionType::Wpa,
                DOT11_AUTH_ALGO_RSNA => EncryptionType::Wpa2,
                DOT11_AUTH_ALGO_RSNA_PSK => EncryptionType::Wpa2,
                _ => {
                    // Values >= 0x80000000 are IHV-defined — WPA3 uses SAE (value varies)
                    // DOT11_AUTH_ALGO_WPA3_SAE = 9 on newer Windows
                    let raw = auth.0;
                    if raw == 9 || raw == 10 {
                        EncryptionType::Wpa3
                    } else {
                        EncryptionType::Unknown(format!("auth_{}", raw))
                    }
                }
            };

            let (status, details) = match &enc_type {
                EncryptionType::Open => (SecurityStatus::Danger, "Open".to_string()),
                EncryptionType::Wep => (SecurityStatus::Warning, "WEP".to_string()),
                EncryptionType::Wpa => (SecurityStatus::Warning, "WPA".to_string()),
                EncryptionType::Wpa2 => (SecurityStatus::Safe, "WPA2".to_string()),
                EncryptionType::Wpa3 => (SecurityStatus::Safe, "WPA3".to_string()),
                EncryptionType::Unknown(s) => (SecurityStatus::Safe, s.clone()),
            };

            check_result = SecurityCheck {
                check_type: SecurityCheckType::Encryption,
                status,
                details: Some(details),
            };

            WlanFreeMemory(connection_attrs as *const core::ffi::c_void);
            break;
        }

        WlanFreeMemory(interface_list as *const core::ffi::c_void);
        println!(
            "[security] check_encryption: {:?} in {:.1}ms",
            check_result.status,
            start.elapsed().as_secs_f64() * 1000.0
        );
        check_result
    }
}

#[cfg(not(target_os = "windows"))]
pub fn check_encryption() -> SecurityCheck {
    SecurityCheck {
        check_type: SecurityCheckType::Encryption,
        status: SecurityStatus::Warning,
        details: Some("unsupported_platform".to_string()),
    }
}

// ==================== Evil Twin Detection (Windows) ====================

/// Scan for evil twin access points on Windows.
/// An evil twin is detected when there are multiple APs with the same SSID
/// but one is Open while others are encrypted.
#[cfg(target_os = "windows")]
pub fn check_evil_twin() -> SecurityCheck {
    let start = std::time::Instant::now();
    use std::ptr;
    use windows::Win32::Foundation::*;
    use windows::Win32::NetworkManagement::WiFi::*;

    struct WlanHandle(HANDLE);

    impl Drop for WlanHandle {
        fn drop(&mut self) {
            unsafe {
                let _ = WlanCloseHandle(self.0, None);
            }
        }
    }

    unsafe {
        let mut client_handle: HANDLE = HANDLE::default();
        let mut negotiated_version: u32 = 0;

        let result = WlanOpenHandle(2, None, &mut negotiated_version, &mut client_handle);
        if result != 0 || client_handle.is_invalid() {
            return SecurityCheck {
                check_type: SecurityCheckType::EvilTwin,
                status: SecurityStatus::Safe,
                details: Some("wifi_unavailable".to_string()),
            };
        }

        let _handle_guard = WlanHandle(client_handle);

        let mut interface_list: *mut WLAN_INTERFACE_INFO_LIST = ptr::null_mut();
        let result = WlanEnumInterfaces(client_handle, None, &mut interface_list);
        if result != 0 || interface_list.is_null() {
            return SecurityCheck {
                check_type: SecurityCheckType::EvilTwin,
                status: SecurityStatus::Safe,
                details: Some("wifi_unavailable".to_string()),
            };
        }

        let list = &*interface_list;
        let mut check_result = SecurityCheck {
            check_type: SecurityCheckType::EvilTwin,
            status: SecurityStatus::Safe,
            details: None,
        };
        let mut bss_scanned: u32 = 0;

        // InterfaceInfo is a C flexible array member — use raw pointer arithmetic.
        let interface_ptr = list.InterfaceInfo.as_ptr();
        for i in 0..list.dwNumberOfItems as usize {
            let interface = &*interface_ptr.add(i);
            if interface.isState != wlan_interface_state_connected {
                continue;
            }

            // Get current SSID
            let mut data_size: u32 = 0;
            let mut connection_attrs: *mut WLAN_CONNECTION_ATTRIBUTES = ptr::null_mut();

            let result = WlanQueryInterface(
                client_handle,
                &interface.InterfaceGuid,
                wlan_intf_opcode_current_connection,
                None,
                &mut data_size,
                std::ptr::addr_of_mut!(connection_attrs) as *mut *mut core::ffi::c_void,
                None,
            );

            if result != 0 || connection_attrs.is_null() {
                continue;
            }

            let attrs = &*connection_attrs;
            let ssid_len = attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength as usize;
            let current_ssid = if ssid_len > 0 && ssid_len <= 32 {
                let ssid_bytes = &attrs.wlanAssociationAttributes.dot11Ssid.ucSSID[..ssid_len];
                String::from_utf8(ssid_bytes.to_vec()).ok()
            } else {
                None
            };

            WlanFreeMemory(connection_attrs as *const core::ffi::c_void);

            let current_ssid = match current_ssid {
                Some(s) => s,
                None => continue,
            };

            // Scan BSS list for networks with the same SSID
            let mut bss_list_ptr: *mut WLAN_BSS_LIST = ptr::null_mut();

            let result = WlanGetNetworkBssList(
                client_handle,
                &interface.InterfaceGuid,
                None,
                dot11_BSS_type_infrastructure,
                true, // security enabled
                None,
                &mut bss_list_ptr,
            );

            if result != 0 || bss_list_ptr.is_null() {
                // Try without security filter
                let result = WlanGetNetworkBssList(
                    client_handle,
                    &interface.InterfaceGuid,
                    None,
                    dot11_BSS_type_infrastructure,
                    false,
                    None,
                    &mut bss_list_ptr,
                );

                if result != 0 || bss_list_ptr.is_null() {
                    continue;
                }
            }

            let bss_list = &*bss_list_ptr;

            let mut has_encrypted = false;
            let mut has_open = false;

            // wlanBssEntries is a C flexible array member — use raw pointer arithmetic.
            let bss_entry_ptr = bss_list.wlanBssEntries.as_ptr();
            for j in 0..bss_list.dwNumberOfItems as usize {
                let entry = &*bss_entry_ptr.add(j);

                let entry_ssid_len = entry.dot11Ssid.uSSIDLength as usize;
                if entry_ssid_len == 0 || entry_ssid_len > 32 {
                    continue;
                }

                let entry_ssid_bytes = &entry.dot11Ssid.ucSSID[..entry_ssid_len];
                let entry_ssid = match String::from_utf8(entry_ssid_bytes.to_vec()) {
                    Ok(s) => s,
                    Err(_) => continue,
                };

                if entry_ssid != current_ssid {
                    continue;
                }

                // Check if this BSSID has privacy (encryption)
                // The capability info bit 4 (0x0010) indicates privacy
                let has_privacy = (entry.usCapabilityInformation & 0x0010) != 0;

                if has_privacy {
                    has_encrypted = true;
                } else {
                    has_open = true;
                }
            }

            bss_scanned = bss_list.dwNumberOfItems;
            WlanFreeMemory(bss_list_ptr as *const core::ffi::c_void);

            // Suspicious: same SSID has both open and encrypted APs
            if has_open && has_encrypted {
                check_result = SecurityCheck {
                    check_type: SecurityCheckType::EvilTwin,
                    status: SecurityStatus::Warning,
                    details: Some(current_ssid),
                };
            }

            break;
        }

        WlanFreeMemory(interface_list as *const core::ffi::c_void);
        println!(
            "[security] check_evil_twin: {:?} (scanned {} BSSIDs) in {:.1}ms",
            check_result.status,
            bss_scanned,
            start.elapsed().as_secs_f64() * 1000.0
        );
        check_result
    }
}

#[cfg(not(target_os = "windows"))]
pub fn check_evil_twin() -> SecurityCheck {
    SecurityCheck {
        check_type: SecurityCheckType::EvilTwin,
        status: SecurityStatus::Safe,
        details: None,
    }
}

// ==================== ARP Spoofing Detection ====================

/// Check for ARP spoofing by looking for duplicate MACs in the ARP table.
pub fn check_arp_spoofing() -> SecurityCheck {
    let start = std::time::Instant::now();
    use super::arp::get_all_arp_entries;
    use super::gateway::get_default_gateway;
    use std::collections::HashMap;

    let gateway_ip = get_default_gateway();
    let entries = get_all_arp_entries();

    let entry_count = entries.len();

    if entries.is_empty() {
        println!(
            "[security] check_arp_spoofing: Safe (empty ARP table) in {:.1}ms",
            start.elapsed().as_secs_f64() * 1000.0
        );
        return SecurityCheck {
            check_type: SecurityCheckType::ArpSpoofing,
            status: SecurityStatus::Safe,
            details: None,
        };
    }

    // Build a map: MAC -> list of IPs
    let mut mac_to_ips: HashMap<String, Vec<String>> = HashMap::new();
    for entry in &entries {
        mac_to_ips
            .entry(entry.mac.clone())
            .or_default()
            .push(entry.ip.clone());
    }

    // Check for duplicate MACs (same MAC, different IPs)
    let gateway_ip_str = gateway_ip.as_deref().unwrap_or("");

    for (mac, ips) in &mac_to_ips {
        if ips.len() < 2 {
            continue;
        }

        // Skip broadcast/multicast MACs
        if mac == "FF:FF:FF:FF:FF:FF" || mac == "00:00:00:00:00:00" {
            continue;
        }

        // Check if gateway IP is involved — that's dangerous
        let gateway_involved = ips.iter().any(|ip| ip == gateway_ip_str);

        if gateway_involved {
            let r = SecurityCheck {
                check_type: SecurityCheckType::ArpSpoofing,
                status: SecurityStatus::Danger,
                details: Some(format!("gateway_mac_duplicate:{}", mac)),
            };
            println!(
                "[security] check_arp_spoofing: Danger (gateway MAC dup: {}) ({} entries) in {:.1}ms",
                mac, entry_count, start.elapsed().as_secs_f64() * 1000.0
            );
            return r;
        }

        // Other duplicates are suspicious but not critical
        let r = SecurityCheck {
            check_type: SecurityCheckType::ArpSpoofing,
            status: SecurityStatus::Warning,
            details: Some(format!("mac_duplicate:{}", mac)),
        };
        println!(
            "[security] check_arp_spoofing: Warning (MAC dup: {}) ({} entries) in {:.1}ms",
            mac, entry_count, start.elapsed().as_secs_f64() * 1000.0
        );
        return r;
    }

    let result = SecurityCheck {
        check_type: SecurityCheckType::ArpSpoofing,
        status: SecurityStatus::Safe,
        details: None,
    };
    println!(
        "[security] check_arp_spoofing: {:?} ({} ARP entries, gateway={:?}) in {:.1}ms",
        result.status,
        entry_count,
        gateway_ip,
        start.elapsed().as_secs_f64() * 1000.0
    );
    result
}

// ==================== DNS Hijacking Detection ====================

/// Check for DNS hijacking by comparing system DNS response with a trusted DNS.
pub fn check_dns_hijacking() -> SecurityCheck {
    let start = std::time::Instant::now();
    let test_domain = "example.com";

    // Resolve via system DNS
    let t0 = std::time::Instant::now();
    let system_ips = resolve_domain_system(test_domain);
    let system_ms = t0.elapsed().as_secs_f64() * 1000.0;

    // Resolve via trusted DNS (1.1.1.1)
    let t1 = std::time::Instant::now();
    let trusted_ips = resolve_domain_direct(test_domain, "1.1.1.1:53");
    let trusted_ms = t1.elapsed().as_secs_f64() * 1000.0;

    println!(
        "[security] check_dns_hijacking: system DNS -> {:?} ({:.1}ms), trusted DNS -> {:?} ({:.1}ms)",
        system_ips, system_ms, trusted_ips, trusted_ms
    );

    // If either fails, we can't determine — report safe to avoid false positives
    if system_ips.is_empty() || trusted_ips.is_empty() {
        println!(
            "[security] check_dns_hijacking: Safe (dns_check_failed) in {:.1}ms",
            start.elapsed().as_secs_f64() * 1000.0
        );
        return SecurityCheck {
            check_type: SecurityCheckType::DnsHijacking,
            status: SecurityStatus::Safe,
            details: Some("dns_check_failed".to_string()),
        };
    }

    // Compare: if system DNS returns completely different IPs, it's suspicious
    let has_overlap = system_ips.iter().any(|ip| trusted_ips.contains(ip));

    let result = if has_overlap {
        SecurityCheck {
            check_type: SecurityCheckType::DnsHijacking,
            status: SecurityStatus::Safe,
            details: None,
        }
    } else {
        SecurityCheck {
            check_type: SecurityCheckType::DnsHijacking,
            status: SecurityStatus::Warning,
            details: Some(format!(
                "system:{} trusted:{}",
                system_ips.join(","),
                trusted_ips.join(",")
            )),
        }
    };
    println!(
        "[security] check_dns_hijacking: {:?} in {:.1}ms",
        result.status,
        start.elapsed().as_secs_f64() * 1000.0
    );
    result
}

/// Resolve a domain using the system's default DNS.
fn resolve_domain_system(domain: &str) -> Vec<String> {
    use std::net::ToSocketAddrs;

    let addr = format!("{}:80", domain);
    match addr.to_socket_addrs() {
        Ok(addrs) => addrs
            .filter_map(|a| match a {
                std::net::SocketAddr::V4(v4) => Some(v4.ip().to_string()),
                _ => None,
            })
            .collect(),
        Err(_) => vec![],
    }
}

/// Resolve a domain by sending a raw DNS query to a specific server.
fn resolve_domain_direct(domain: &str, dns_server: &str) -> Vec<String> {
    use std::net::UdpSocket;
    use std::time::Duration;

    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(s) => s,
        Err(_) => return vec![],
    };

    let _ = socket.set_read_timeout(Some(Duration::from_secs(3)));

    let packet = build_dns_query(domain);
    if socket.send_to(&packet, dns_server).is_err() {
        return vec![];
    }

    let mut buf = [0u8; 512];
    match socket.recv_from(&mut buf) {
        Ok((len, _)) => parse_dns_response(&buf[..len]),
        Err(_) => vec![],
    }
}

/// Build a simple DNS A record query packet.
fn build_dns_query(domain: &str) -> Vec<u8> {
    let mut packet = Vec::with_capacity(64);

    // Transaction ID
    packet.extend_from_slice(&[0x12, 0x34]);
    // Flags: standard query, recursion desired
    packet.extend_from_slice(&[0x01, 0x00]);
    // Questions: 1
    packet.extend_from_slice(&[0x00, 0x01]);
    // Answer, Authority, Additional: 0
    packet.extend_from_slice(&[0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

    // Domain name
    for label in domain.split('.') {
        packet.push(label.len() as u8);
        packet.extend_from_slice(label.as_bytes());
    }
    packet.push(0x00); // End of domain

    // Type A (1) and Class IN (1)
    packet.extend_from_slice(&[0x00, 0x01, 0x00, 0x01]);

    packet
}

/// Parse DNS response and extract A record IPs.
fn parse_dns_response(data: &[u8]) -> Vec<String> {
    let mut ips = Vec::new();

    if data.len() < 12 {
        return ips;
    }

    let answer_count = u16::from_be_bytes([data[6], data[7]]) as usize;
    if answer_count == 0 {
        return ips;
    }

    // Skip header (12 bytes) and question section
    let mut pos = 12;

    // Skip question section (QNAME + QTYPE + QCLASS)
    loop {
        if pos >= data.len() {
            return ips;
        }
        let b = data[pos];
        if b == 0 {
            pos += 1;
            break;
        }
        if (b & 0xC0) == 0xC0 {
            // Compression pointer — 2 bytes
            pos += 2;
            break;
        }
        let label_len = b as usize;
        pos += 1 + label_len;
    }
    // Skip QTYPE (2) and QCLASS (2)
    if pos + 4 > data.len() {
        return ips;
    }
    pos += 4;

    // Parse answers
    for _ in 0..answer_count {
        if pos >= data.len() {
            break;
        }

        // Name (may be a compression pointer)
        if pos >= data.len() {
            break;
        }
        if (data[pos] & 0xC0) == 0xC0 {
            // Compression pointer — 2 bytes
            if pos + 2 > data.len() {
                break;
            }
            pos += 2;
        } else {
            // Walk labels until null terminator
            loop {
                if pos >= data.len() {
                    break;
                }
                let b = data[pos];
                if b == 0 {
                    pos += 1;
                    break;
                }
                if (b & 0xC0) == 0xC0 {
                    // Compression pointer inside name
                    if pos + 2 > data.len() {
                        break;
                    }
                    pos += 2;
                    break;
                }
                let label_len = b as usize;
                pos += 1 + label_len;
            }
        }

        if pos + 10 > data.len() {
            break;
        }

        let rtype = u16::from_be_bytes([data[pos], data[pos + 1]]);
        let rdlength = u16::from_be_bytes([data[pos + 8], data[pos + 9]]) as usize;
        pos += 10;

        if pos + rdlength > data.len() {
            break;
        }

        // Type A = 1, rdlength = 4
        if rtype == 1 && rdlength == 4 {
            let ip = format!(
                "{}.{}.{}.{}",
                data[pos],
                data[pos + 1],
                data[pos + 2],
                data[pos + 3]
            );
            ips.push(ip);
        }

        pos += rdlength;
    }

    ips
}

// ==================== Orchestrator ====================

/// Get the SSID of the currently connected Wi-Fi network.
fn get_current_ssid() -> Option<String> {
    super::wifi::get_wifi_info().ssid
}

/// Run all 4 security checks and produce a report.
pub fn check_wifi_security() -> WiFiSecurityReport {
    let total_start = std::time::Instant::now();
    println!("[security] ===== Starting WiFi security scan =====");

    let ssid = get_current_ssid();
    println!("[security] Network SSID: {:?}", ssid);

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);

    let encryption = check_encryption();
    let evil_twin = check_evil_twin();
    let arp = check_arp_spoofing();
    let dns = check_dns_hijacking();

    let checks = vec![encryption, evil_twin, arp, dns];

    // Overall status = worst of all checks
    let overall_status = checks
        .iter()
        .map(|c| c.status)
        .max_by_key(|s| match s {
            SecurityStatus::Safe => 0,
            SecurityStatus::Warning => 1,
            SecurityStatus::Danger => 2,
        })
        .unwrap_or(SecurityStatus::Safe);

    println!(
        "[security] ===== Scan complete: {:?} in {:.1}ms =====",
        overall_status,
        total_start.elapsed().as_secs_f64() * 1000.0
    );

    WiFiSecurityReport {
        checks,
        overall_status,
        network_ssid: ssid,
        timestamp,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_security_status_ordering() {
        let statuses = [
            SecurityStatus::Safe,
            SecurityStatus::Warning,
            SecurityStatus::Danger,
        ];
        let worst = statuses
            .iter()
            .max_by_key(|s| match s {
                SecurityStatus::Safe => 0,
                SecurityStatus::Warning => 1,
                SecurityStatus::Danger => 2,
            })
            .unwrap();
        assert_eq!(*worst, SecurityStatus::Danger);
    }

    #[test]
    fn test_build_dns_query() {
        let packet = build_dns_query("example.com");
        assert!(packet.len() > 12);
        // Check header: 1 question
        assert_eq!(packet[4], 0x00);
        assert_eq!(packet[5], 0x01);
    }

    #[test]
    fn test_parse_dns_response_empty() {
        let ips = parse_dns_response(&[]);
        assert!(ips.is_empty());
    }

    #[test]
    fn test_parse_dns_response_short() {
        let ips = parse_dns_response(&[0u8; 5]);
        assert!(ips.is_empty());
    }

    #[test]
    fn test_security_check_serialization() {
        let check = SecurityCheck {
            check_type: SecurityCheckType::Encryption,
            status: SecurityStatus::Safe,
            details: Some("WPA2".to_string()),
        };

        let json = serde_json::to_string(&check).unwrap();
        let parsed: SecurityCheck = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.check_type, SecurityCheckType::Encryption);
        assert_eq!(parsed.status, SecurityStatus::Safe);
        assert_eq!(parsed.details, Some("WPA2".to_string()));
    }

    #[test]
    fn test_wifi_security_report_serialization() {
        let report = WiFiSecurityReport {
            checks: vec![
                SecurityCheck {
                    check_type: SecurityCheckType::Encryption,
                    status: SecurityStatus::Safe,
                    details: Some("WPA2".to_string()),
                },
                SecurityCheck {
                    check_type: SecurityCheckType::ArpSpoofing,
                    status: SecurityStatus::Safe,
                    details: None,
                },
            ],
            overall_status: SecurityStatus::Safe,
            network_ssid: Some("TestNetwork".to_string()),
            timestamp: 1000,
        };

        let json = serde_json::to_string(&report).unwrap();
        assert!(!json.is_empty());

        let parsed: WiFiSecurityReport = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.checks.len(), 2);
        assert_eq!(parsed.overall_status, SecurityStatus::Safe);
        assert_eq!(parsed.network_ssid, Some("TestNetwork".to_string()));
    }

    #[test]
    fn test_encryption_type_display() {
        assert_eq!(EncryptionType::Open.to_string(), "Open");
        assert_eq!(EncryptionType::Wep.to_string(), "WEP");
        assert_eq!(EncryptionType::Wpa.to_string(), "WPA");
        assert_eq!(EncryptionType::Wpa2.to_string(), "WPA2");
        assert_eq!(EncryptionType::Wpa3.to_string(), "WPA3");
    }
}
