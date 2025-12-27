//! DNS configuration and detection.

use crate::domain::DnsProvider;

/// Set DNS for active network adapter.
#[cfg(target_os = "windows")]
pub fn set_dns(provider: DnsProvider) -> Result<(), String> {
    use super::adapter::get_active_adapter_name;
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

/// Get current DNS servers configured on the active adapter.
#[cfg(target_os = "windows")]
pub fn get_current_dns() -> Result<Vec<String>, String> {
    use super::adapter::get_active_adapter_name;
    use std::process::Command;

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
