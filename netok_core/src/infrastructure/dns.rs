//! DNS configuration and detection.

use crate::domain::DnsProvider;

/// Set DNS for active network adapter (both IPv4 and IPv6).
#[cfg(target_os = "windows")]
pub fn set_dns(provider: DnsProvider) -> Result<(), String> {
    use super::adapter::get_active_adapter_name;
    use super::hidden_cmd;

    // Get active network adapter name
    let adapter_name = get_active_adapter_name()
        .ok_or_else(|| "Failed to find active network adapter".to_string())?;

    match provider {
        DnsProvider::Auto => {
            // Set IPv4 DNS to obtain automatically (DHCP)
            let output = hidden_cmd("netsh")
                .args(["interface", "ip", "set", "dns", &adapter_name, "dhcp"])
                .output()
                .map_err(|e| format!("Failed to execute netsh: {}", e))?;

            if !output.status.success() {
                return Err(format!(
                    "Failed to set IPv4 DNS to auto: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }

            // Set IPv6 DNS to obtain automatically (DHCP)
            let output = hidden_cmd("netsh")
                .args(["interface", "ipv6", "set", "dns", &adapter_name, "dhcp"])
                .output()
                .map_err(|e| format!("Failed to execute netsh for IPv6: {}", e))?;

            if !output.status.success() {
                return Err(format!(
                    "Failed to set IPv6 DNS to auto: {}",
                    String::from_utf8_lossy(&output.stderr)
                ));
            }
        }
        _ => {
            // Set static IPv4 DNS (skip if no IPv4 addresses — e.g. IPv6-only custom)
            if let Some(primary) = provider.primary() {
                // Set primary IPv4 DNS
                let output = hidden_cmd("netsh")
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
                        "Failed to set primary IPv4 DNS: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ));
                }

                // Set secondary IPv4 DNS if available and different from primary
                if let Some(secondary) = provider.secondary().filter(|s| *s != primary) {
                    let output = hidden_cmd("netsh")
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
                            "Failed to set secondary IPv4 DNS: {}",
                            String::from_utf8_lossy(&output.stderr)
                        ));
                    }
                }
            } else {
                // No IPv4 DNS — reset to DHCP
                let _ = hidden_cmd("netsh")
                    .args(["interface", "ip", "set", "dns", &adapter_name, "dhcp"])
                    .output();
            }

            // Set IPv6 DNS if available
            if let Some(primary_v6) = provider.primary_ipv6() {
                // Set primary IPv6 DNS
                let output = hidden_cmd("netsh")
                    .args([
                        "interface",
                        "ipv6",
                        "set",
                        "dns",
                        &adapter_name,
                        "static",
                        &primary_v6,
                    ])
                    .output()
                    .map_err(|e| format!("Failed to execute netsh for IPv6: {}", e))?;

                if !output.status.success() {
                    return Err(format!(
                        "Failed to set primary IPv6 DNS: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ));
                }

                // Set secondary IPv6 DNS if available and different from primary
                if let Some(secondary_v6) = provider
                    .secondary_ipv6()
                    .filter(|s| Some(s.clone()) != provider.primary_ipv6())
                {
                    let output = hidden_cmd("netsh")
                        .args([
                            "interface",
                            "ipv6",
                            "add",
                            "dns",
                            &adapter_name,
                            &secondary_v6,
                            "index=2",
                        ])
                        .output()
                        .map_err(|e| format!("Failed to execute netsh for IPv6: {}", e))?;

                    if !output.status.success() {
                        return Err(format!(
                            "Failed to set secondary IPv6 DNS: {}",
                            String::from_utf8_lossy(&output.stderr)
                        ));
                    }
                }
            } else {
                // No IPv6 for this provider - reset to DHCP to avoid conflicts
                let _ = hidden_cmd("netsh")
                    .args(["interface", "ipv6", "set", "dns", &adapter_name, "dhcp"])
                    .output();
            }
        }
    }

    Ok(())
}

#[cfg(not(target_os = "windows"))]
pub fn set_dns(_provider: DnsProvider) -> Result<(), String> {
    Err("DNS configuration is only supported on Windows".to_string())
}

/// Build netsh command lines for setting DNS without executing them.
///
/// Returns a list of complete command strings (e.g. `netsh interface ip set dns "Wi-Fi" dhcp`).
/// The caller is responsible for executing them (typically with elevation on Windows).
#[cfg(target_os = "windows")]
pub fn build_dns_commands(provider: DnsProvider) -> Result<Vec<String>, String> {
    use super::adapter::get_active_adapter_name;

    let adapter = get_active_adapter_name()
        .ok_or_else(|| "Failed to find active network adapter".to_string())?;

    let mut cmds = Vec::new();

    match provider {
        DnsProvider::Auto => {
            cmds.push(format!(r#"netsh interface ip set dns "{}" dhcp"#, adapter));
            cmds.push(format!(r#"netsh interface ipv6 set dns "{}" dhcp"#, adapter));
        }
        _ => {
            // IPv4
            if let Some(primary) = provider.primary() {
                cmds.push(format!(
                    r#"netsh interface ip set dns "{}" static {}"#,
                    adapter, primary
                ));
                if let Some(secondary) = provider.secondary().filter(|s| *s != primary) {
                    cmds.push(format!(
                        r#"netsh interface ip add dns "{}" {} index=2"#,
                        adapter, secondary
                    ));
                }
            } else {
                cmds.push(format!(r#"netsh interface ip set dns "{}" dhcp"#, adapter));
            }

            // IPv6
            if let Some(primary_v6) = provider.primary_ipv6() {
                cmds.push(format!(
                    r#"netsh interface ipv6 set dns "{}" static {}"#,
                    adapter, primary_v6
                ));
                if let Some(secondary_v6) = provider
                    .secondary_ipv6()
                    .filter(|s| Some(s.clone()) != provider.primary_ipv6())
                {
                    cmds.push(format!(
                        r#"netsh interface ipv6 add dns "{}" {} index=2"#,
                        adapter, secondary_v6
                    ));
                }
            } else {
                cmds.push(format!(
                    r#"netsh interface ipv6 set dns "{}" dhcp"#,
                    adapter
                ));
            }
        }
    }

    Ok(cmds)
}

#[cfg(not(target_os = "windows"))]
pub fn build_dns_commands(_provider: DnsProvider) -> Result<Vec<String>, String> {
    Err("DNS configuration is only supported on Windows".to_string())
}

/// Get current DNS servers configured on the active adapter.
#[cfg(target_os = "windows")]
pub fn get_current_dns() -> Result<Vec<String>, String> {
    use super::adapter::get_active_adapter_name;
    use super::hidden_cmd;

    let adapter_name = get_active_adapter_name()
        .ok_or_else(|| "Failed to find active network adapter".to_string())?;

    // Force English culture for locale-independent output
    let culture_prefix = "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; ";
    let command = format!(
        "{}Get-DnsClientServerAddress -InterfaceAlias '{}' -AddressFamily IPv4 | Select-Object -ExpandProperty ServerAddresses",
        culture_prefix,
        adapter_name.replace('\'', "''")
    );

    // Use PowerShell to get DNS server addresses
    let output = hidden_cmd("powershell")
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

/// Perform a reverse DNS (PTR) lookup for an IP address.
///
/// Returns the hostname if found, or `None` on timeout/failure.
/// Uses a short timeout to avoid blocking the network scan.
pub fn reverse_dns_lookup(ip: &str, timeout_ms: u64) -> Option<String> {
    use trust_dns_resolver::config::*;
    use trust_dns_resolver::Resolver;

    let ip_addr: std::net::IpAddr = ip.parse().ok()?;

    let mut opts = ResolverOpts::default();
    opts.timeout = std::time::Duration::from_millis(timeout_ms);
    opts.attempts = 1;

    let resolver = Resolver::new(ResolverConfig::default(), opts).ok()?;

    let response = resolver.reverse_lookup(ip_addr).ok()?;

    response.iter().next().map(|name| {
        let s = name.to_string();
        // Remove trailing dot from FQDN (e.g., "DESKTOP-ABC.local." → "DESKTOP-ABC.local")
        s.trim_end_matches('.').to_string()
    })
}
