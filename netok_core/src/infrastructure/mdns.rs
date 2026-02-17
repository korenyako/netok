//! mDNS/Bonjour device discovery.
//!
//! Discovers devices on the local network by browsing common mDNS service types
//! and extracting human-readable names from the instance name portion of the
//! service response.

use std::collections::HashMap;
use std::time::{Duration, Instant};

use mdns_sd::{ServiceDaemon, ServiceEvent};

/// Information discovered about a device via mDNS.
#[derive(Debug, Clone)]
pub struct MdnsDeviceInfo {
    /// Human-readable device name (extracted from mDNS instance name).
    pub name: String,
    /// The mDNS service types this device responded to.
    pub service_types: Vec<String>,
}

/// Service types to browse, with a category hint for device type inference.
const SERVICE_TYPES: &[(&str, &str)] = &[
    ("_airplay._tcp.local.", "apple_media"),
    ("_raop._tcp.local.", "apple_media"),
    ("_companion-link._tcp.local.", "apple"),
    ("_ipp._tcp.local.", "printer"),
    ("_ipps._tcp.local.", "printer"),
    ("_printer._tcp.local.", "printer"),
    ("_googlecast._tcp.local.", "chromecast"),
    ("_http._tcp.local.", "generic"),
    ("_smb._tcp.local.", "computer"),
    ("_afpovertcp._tcp.local.", "computer"),
];

/// Discover devices on the local network using mDNS.
///
/// Browses multiple service types simultaneously for the given timeout.
/// Returns a map of IPv4 address string → discovered device info.
///
/// This function is synchronous. It creates its own mDNS daemon thread
/// and shuts it down before returning. Safe to call from `spawn_blocking`.
pub fn mdns_discover(timeout: Duration) -> HashMap<String, MdnsDeviceInfo> {
    let mut results: HashMap<String, MdnsDeviceInfo> = HashMap::new();

    let daemon = match ServiceDaemon::new() {
        Ok(d) => d,
        Err(e) => {
            println!("[mDNS] Failed to create daemon: {}", e);
            return results;
        }
    };

    // Browse all service types simultaneously (single daemon handles all)
    let mut receivers = Vec::new();
    for (service_type, _hint) in SERVICE_TYPES {
        match daemon.browse(service_type) {
            Ok(receiver) => receivers.push((receiver, *service_type)),
            Err(e) => {
                println!("[mDNS] Failed to browse {}: {}", service_type, e);
            }
        }
    }

    let deadline = Instant::now() + timeout;
    let poll_interval = Duration::from_millis(50);

    // Collect resolved services until timeout
    while Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            break;
        }
        let poll_timeout = remaining.min(poll_interval);

        for (receiver, service_type) in &receivers {
            match receiver.recv_timeout(poll_timeout) {
                Ok(ServiceEvent::ServiceResolved(info)) => {
                    let instance_name = extract_instance_name(&info.fullname, service_type);
                    let clean_name = clean_device_name(&instance_name);

                    if clean_name.is_empty() {
                        continue;
                    }

                    println!(
                        "[mDNS] Resolved: {} → {} ({})",
                        info.fullname, clean_name, service_type
                    );

                    for ipv4 in info.get_addresses_v4() {
                        let ip_str = ipv4.to_string();
                        results
                            .entry(ip_str)
                            .and_modify(|existing| {
                                if !existing.service_types.contains(&service_type.to_string()) {
                                    existing.service_types.push(service_type.to_string());
                                }
                                // Prefer longer (more descriptive) names
                                if clean_name.len() > existing.name.len() {
                                    existing.name = clean_name.clone();
                                }
                            })
                            .or_insert_with(|| MdnsDeviceInfo {
                                name: clean_name.clone(),
                                service_types: vec![service_type.to_string()],
                            });
                    }
                }
                Ok(_) => {} // SearchStarted, ServiceFound, etc. — ignore
                Err(_) => {} // Timeout or channel closed — continue polling others
            }
        }
    }

    // Shut down daemon
    if let Ok(receiver) = daemon.shutdown() {
        let _ = receiver.recv_timeout(Duration::from_secs(1));
    }

    println!("[mDNS] Discovery complete: {} devices found", results.len());
    results
}

/// Extract the instance name from a fully qualified mDNS service name.
///
/// Example: `"HP LaserJet Pro._ipp._tcp.local."` with service `"_ipp._tcp.local."`
/// → `"HP LaserJet Pro"`
fn extract_instance_name(fullname: &str, service_type: &str) -> String {
    // service_type = "_ipp._tcp.local."
    // fullname = "HP LaserJet Pro._ipp._tcp.local."
    // We want everything before "._ipp._tcp.local."
    let service_trimmed = service_type.trim_end_matches('.');
    let suffix = format!(".{}", service_trimmed);

    // Try stripping ".{service_type}" (with or without trailing dot)
    if let Some(name) = fullname
        .trim_end_matches('.')
        .strip_suffix(service_trimmed)
    {
        return name.trim_end_matches('.').to_string();
    }

    if let Some(name) = fullname.strip_suffix(&suffix) {
        return name.to_string();
    }

    // Fallback: everything before first "._" segment
    fullname
        .split("._")
        .next()
        .unwrap_or(fullname)
        .to_string()
}

/// Clean up a device name extracted from mDNS.
fn clean_device_name(name: &str) -> String {
    let mut cleaned = name.to_string();

    // Strip .local. suffix (sometimes present in hostnames)
    if let Some(stripped) = cleaned.strip_suffix(".local.") {
        cleaned = stripped.to_string();
    }
    if let Some(stripped) = cleaned.strip_suffix(".local") {
        cleaned = stripped.to_string();
    }

    // Replace mDNS-escaped characters (e.g. \032 = space)
    cleaned = cleaned.replace("\\032", " ");
    cleaned = cleaned.replace("\\040", " ");

    cleaned.trim().to_string()
}

/// Infer a more specific device type based on the mDNS service types
/// a device responded to.
///
/// Returns `None` if no strong inference can be made.
pub fn infer_device_type_from_services(service_types: &[String]) -> Option<crate::DeviceType> {
    let has = |pattern: &str| service_types.iter().any(|t| t.contains(pattern));

    // Printer services → definitive
    if has("_ipp.") || has("_ipps.") || has("_printer.") {
        return Some(crate::DeviceType::Printer);
    }

    // Google Cast → SmartTv / Chromecast
    if has("_googlecast.") {
        return Some(crate::DeviceType::SmartTv);
    }

    // SMB / AFP → computer (NAS or file-sharing desktop)
    if has("_smb.") || has("_afpovertcp.") {
        return Some(crate::DeviceType::Computer);
    }

    // AirPlay/RAOP → too ambiguous (iPhone, iPad, Mac, Apple TV)
    // Don't override existing classification
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_instance_name_ipp() {
        let name = extract_instance_name(
            "HP LaserJet Pro._ipp._tcp.local.",
            "_ipp._tcp.local.",
        );
        assert_eq!(name, "HP LaserJet Pro");
    }

    #[test]
    fn test_extract_instance_name_googlecast() {
        let name = extract_instance_name(
            "Living Room TV._googlecast._tcp.local.",
            "_googlecast._tcp.local.",
        );
        assert_eq!(name, "Living Room TV");
    }

    #[test]
    fn test_extract_instance_name_airplay() {
        let name = extract_instance_name(
            "iPhone de Antoine._airplay._tcp.local.",
            "_airplay._tcp.local.",
        );
        assert_eq!(name, "iPhone de Antoine");
    }

    #[test]
    fn test_extract_instance_name_fallback() {
        let name = extract_instance_name(
            "SomeDevice._unknown._tcp.local.",
            "_other._tcp.local.",
        );
        assert_eq!(name, "SomeDevice");
    }

    #[test]
    fn test_clean_device_name_local_suffix() {
        assert_eq!(clean_device_name("MyPC.local."), "MyPC");
        assert_eq!(clean_device_name("MyPC.local"), "MyPC");
    }

    #[test]
    fn test_clean_device_name_escaped_spaces() {
        assert_eq!(clean_device_name("My\\032Device"), "My Device");
    }

    #[test]
    fn test_clean_device_name_trim() {
        assert_eq!(clean_device_name("  MyDevice  "), "MyDevice");
    }

    #[test]
    fn test_clean_device_name_no_change() {
        assert_eq!(clean_device_name("Normal Name"), "Normal Name");
    }

    #[test]
    fn test_infer_printer_from_ipp() {
        let types = vec!["_ipp._tcp.local.".to_string()];
        assert_eq!(
            infer_device_type_from_services(&types),
            Some(crate::DeviceType::Printer)
        );
    }

    #[test]
    fn test_infer_printer_from_ipps() {
        let types = vec!["_ipps._tcp.local.".to_string()];
        assert_eq!(
            infer_device_type_from_services(&types),
            Some(crate::DeviceType::Printer)
        );
    }

    #[test]
    fn test_infer_smarttv_from_googlecast() {
        let types = vec!["_googlecast._tcp.local.".to_string()];
        assert_eq!(
            infer_device_type_from_services(&types),
            Some(crate::DeviceType::SmartTv)
        );
    }

    #[test]
    fn test_infer_computer_from_smb() {
        let types = vec!["_smb._tcp.local.".to_string()];
        assert_eq!(
            infer_device_type_from_services(&types),
            Some(crate::DeviceType::Computer)
        );
    }

    #[test]
    fn test_infer_none_from_airplay() {
        let types = vec!["_airplay._tcp.local.".to_string()];
        assert_eq!(infer_device_type_from_services(&types), None);
    }

    #[test]
    fn test_infer_none_from_empty() {
        let types: Vec<String> = vec![];
        assert_eq!(infer_device_type_from_services(&types), None);
    }
}
