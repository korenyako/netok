//! Network diagnostics orchestration.
//!
//! This module combines infrastructure calls to produce domain objects,
//! implementing the core diagnostic logic.

use std::time::{Duration, Instant};
use time::OffsetDateTime;
use serde::Deserialize;

use crate::domain::{
    ComputerInfo, ConnectionType, DiagnosticsSnapshot, DnsProvider, InternetInfo, NetworkInfo,
    NodeId, NodeInfo, RouterInfo, Settings, Status,
};
use crate::infrastructure::{
    detect_connection_type, get_default_gateway, get_router_mac, get_wifi_info,
};
use crate::oui_database::OUI_DATABASE;

/// DNS Test: try to resolve known domains.
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

/// HTTP Test: try to fetch from known endpoints.
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

/// Response from ipinfo.io API.
#[derive(Deserialize, Debug)]
struct IpInfoResponse {
    ip: Option<String>,
    city: Option<String>,
    country: Option<String>,
    org: Option<String>,
}

/// Check if IP address is private (RFC 1918 or link-local).
fn is_private_ip(ip: &std::net::IpAddr) -> bool {
    match ip {
        std::net::IpAddr::V4(ipv4) => {
            let octets = ipv4.octets();
            // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16
            octets[0] == 10
                || (octets[0] == 172 && (16..=31).contains(&octets[1]))
                || (octets[0] == 192 && octets[1] == 168)
                || (octets[0] == 169 && octets[1] == 254)
        }
        _ => false,
    }
}

/// Check if IP address string is private.
fn is_private_ip_str(ip: &str) -> bool {
    ip.parse::<std::net::IpAddr>()
        .is_ok_and(|ip_addr| is_private_ip(&ip_addr))
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
pub fn lookup_vendor_by_mac(mac: &str) -> Option<String> {
    // Remove separators and convert to uppercase
    let clean_mac: String = mac
        .chars()
        .filter(|c| c.is_ascii_hexdigit())
        .map(|c| c.to_ascii_uppercase())
        .collect();

    // A valid MAC address must resolve to exactly 12 hexadecimal digits.
    if clean_mac.len() != 12 {
        return None;
    }

    // Try matching from longest to shortest OUI (6, 7, 8+ chars)
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

/// Get information about the local computer.
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
        let ip = interfaces
            .first()
            .map(|(_, ip)| ip.clone())
            .unwrap_or_default();
        (wifi_desc.clone(), ip)
    } else {
        // No Wi-Fi, use first available interface
        interfaces.first().cloned().unwrap_or_default()
    };

    // Get friendly name
    let friendly_adapter = if !adapter.is_empty() {
        Some(adapter)
    } else {
        None
    };

    ComputerInfo {
        hostname,
        model: None,
        adapter: friendly_adapter,
        local_ip: if local_ip.is_empty() {
            None
        } else {
            Some(local_ip)
        },
    }
}

/// Get network connection information.
pub fn get_network_info(adapter_name: Option<&str>) -> NetworkInfo {
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

/// Get router/gateway information.
pub fn get_router_info() -> RouterInfo {
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

/// Get internet connectivity information.
pub fn get_internet_info() -> InternetInfo {
    let dns_ok = test_dns();
    let http_ok = test_http();

    // Try to fetch geo info if HTTP works (with shorter timeout)
    let (public_ip, isp, country, city) = if http_ok {
        match reqwest::blocking::Client::builder()
            .timeout(Duration::from_secs(3))
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
        latency_ms: None,
        speed_down_mbps: None,
        speed_up_mbps: None,
    }
}

/// Check computer node. Returns the NodeInfo (with status/latency) and the detailed ComputerInfo.
pub fn check_computer() -> (NodeInfo, ComputerInfo) {
    let start = Instant::now();
    let computer = get_computer_info();
    let latency = start.elapsed().as_millis() as u32;
    let status = if computer.hostname.is_some() {
        Status::Ok
    } else {
        Status::Warn
    };
    let node = NodeInfo {
        id: NodeId::Computer,
        name_key: "nodes.computer.name".into(),
        status,
        latency_ms: Some(latency),
        hint_key: None,
    };
    (node, computer)
}

/// Check network node. Requires the adapter name from the computer check.
pub fn check_network(adapter_name: Option<&str>) -> (NodeInfo, NetworkInfo) {
    let start = Instant::now();
    let network = get_network_info(adapter_name);
    let latency = start.elapsed().as_millis() as u32;
    let status = match network.connection_type {
        ConnectionType::Unknown => Status::Warn,
        _ => Status::Ok,
    };
    let node = NodeInfo {
        id: NodeId::Wifi,
        name_key: "nodes.wifi.name".into(),
        status,
        latency_ms: Some(latency),
        hint_key: None,
    };
    (node, network)
}

/// Check router node.
pub fn check_router() -> (NodeInfo, RouterInfo) {
    let start = Instant::now();
    let router = get_router_info();
    let latency = start.elapsed().as_millis() as u32;
    let status = if router.gateway_ip.is_some() {
        Status::Ok
    } else {
        Status::Warn
    };
    let node = NodeInfo {
        id: NodeId::RouterUpnp,
        name_key: "nodes.router.name".into(),
        status,
        latency_ms: Some(latency),
        hint_key: None,
    };
    (node, router)
}

/// Check internet node.
pub fn check_internet() -> (NodeInfo, InternetInfo) {
    let start = Instant::now();
    let internet = get_internet_info();
    let latency = start.elapsed().as_millis() as u32;
    let status = if internet.dns_ok && internet.http_ok {
        Status::Ok
    } else if internet.dns_ok || internet.http_ok {
        Status::Warn
    } else {
        Status::Fail
    };
    let node = NodeInfo {
        id: NodeId::Internet,
        name_key: "nodes.internet.name".into(),
        status,
        latency_ms: Some(latency),
        hint_key: None,
    };
    (node, internet)
}

/// Run complete network diagnostics.
pub fn run_diagnostics(_settings: &Settings) -> DiagnosticsSnapshot {
    let now = OffsetDateTime::now_utc()
        .format(&time::format_description::well_known::Rfc3339)
        .unwrap();

    let (computer_node, computer) = check_computer();
    let (network_node, network) = check_network(computer.adapter.as_deref());
    let (router_node, router) = check_router();
    let (internet_node, internet) = check_internet();

    let nodes = vec![computer_node, network_node, router_node, internet_node];

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

/// Detect which DNS provider is currently in use based on DNS server IPs.
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
    fn test_private_ip_10_range() {
        let ip: std::net::IpAddr = "10.0.0.1".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_192_168() {
        let ip: std::net::IpAddr = "192.168.1.1".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_private_ip_172_16() {
        let ip: std::net::IpAddr = "172.16.0.1".parse().unwrap();
        assert!(is_private_ip(&ip));
    }

    #[test]
    fn test_public_ip() {
        let ip: std::net::IpAddr = "8.8.8.8".parse().unwrap();
        assert!(!is_private_ip(&ip));
    }

    #[test]
    fn test_detect_dns_cloudflare() {
        let provider = detect_dns_provider(&["1.1.1.1".to_string(), "1.0.0.1".to_string()]);
        assert_eq!(provider, DnsProvider::Cloudflare);
    }

    #[test]
    fn test_detect_dns_google() {
        let provider = detect_dns_provider(&["8.8.8.8".to_string(), "8.8.4.4".to_string()]);
        assert_eq!(provider, DnsProvider::Google);
    }

    #[test]
    fn test_detect_dns_auto_empty() {
        let provider = detect_dns_provider(&[]);
        assert_eq!(provider, DnsProvider::Auto);
    }

    #[test]
    fn test_detect_dns_auto_private() {
        let provider = detect_dns_provider(&["192.168.1.1".to_string()]);
        assert_eq!(provider, DnsProvider::Auto);
    }

    #[test]
    fn test_vendor_lookup_valid() {
        // TP-Link OUI
        let vendor = lookup_vendor_by_mac("40:ED:00:11:22:33");
        assert!(vendor.is_some());
    }

    #[test]
    fn test_vendor_lookup_invalid() {
        let vendor = lookup_vendor_by_mac("invalid");
        assert!(vendor.is_none());
    }
}
