use netok_core::{run_diagnostics, get_default_settings, DiagnosticsSnapshot};
use std::process::Command;

#[tauri::command]
pub fn get_snapshot() -> Result<DiagnosticsSnapshot, String> {
    let settings = get_default_settings();
    Ok(run_diagnostics(&settings))
}

#[tauri::command]
pub fn set_dns(mode: String, custom_dns: Option<String>) -> Result<(), String> {
    match mode.as_str() {
        "auto" => restore_system_dns(),
        "cloudflare" => set_dns_servers(&["1.1.1.1", "1.0.0.1"]),
        "google" => set_dns_servers(&["8.8.8.8", "8.8.4.4"]),
        "custom" => {
            if let Some(dns) = custom_dns {
                let servers: Vec<&str> = dns.split(',').map(|s| s.trim()).collect();
                set_dns_servers(&servers)
            } else {
                Err("Custom DNS servers not provided".to_string())
            }
        }
        _ => Err(format!("Unknown DNS mode: {}", mode))
    }
}

#[tauri::command]
pub fn flush_dns_cache() -> Result<(), String> {
    if cfg!(target_os = "windows") {
        let output = Command::new("netsh")
            .args(&["interface", "ip", "delete", "dnsservers", "Wi-Fi", "all"])
            .output()
            .map_err(|e| format!("Failed to flush DNS cache: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("DNS cache flush failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        // Re-add DNS servers to trigger cache refresh
        let output = Command::new("netsh")
            .args(&["interface", "ip", "set", "dnsservers", "Wi-Fi", "dhcp"])
            .output()
            .map_err(|e| format!("Failed to refresh DNS: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("DNS refresh failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(())
    } else if cfg!(target_os = "macos") {
        let output = Command::new("sudo")
            .args(&["dscacheutil", "-flushcache"])
            .output()
            .map_err(|e| format!("Failed to flush DNS cache: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("DNS cache flush failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(())
    } else {
        // Linux - TODO: implement NetworkManager/resolv.conf approach
        Err("DNS cache flush not implemented for Linux yet".to_string())
    }
}

fn restore_system_dns() -> Result<(), String> {
    if cfg!(target_os = "windows") {
        let output = Command::new("netsh")
            .args(&["interface", "ip", "set", "dnsservers", "Wi-Fi", "dhcp"])
            .output()
            .map_err(|e| format!("Failed to restore system DNS: {}", e))?;
        
        if !output.status.success() {
            return Err(format!("System DNS restore failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        
        Ok(())
    } else if cfg!(target_os = "macos") {
        // macOS automatically uses system DNS when no custom DNS is set
        Ok(())
    } else {
        // Linux - TODO: implement
        Err("System DNS restore not implemented for Linux yet".to_string())
    }
}

fn set_dns_servers(servers: &[&str]) -> Result<(), String> {
    if cfg!(target_os = "windows") {
        // First clear existing DNS servers
        let _ = Command::new("netsh")
            .args(&["interface", "ip", "delete", "dnsservers", "Wi-Fi", "all"])
            .output();
        
        // Set new DNS servers
        for (i, server) in servers.iter().enumerate() {
            let dns_type = if i == 0 { "static" } else { "none" };
            let output = Command::new("netsh")
                .args(&["interface", "ip", "set", "dnsservers", "Wi-Fi", dns_type, server])
                .output()
                .map_err(|e| format!("Failed to set DNS server {}: {}", server, e))?;
            
            if !output.status.success() {
                return Err(format!("Failed to set DNS server {}: {}", server, String::from_utf8_lossy(&output.stderr)));
            }
        }
        
        Ok(())
    } else if cfg!(target_os = "macos") {
        // macOS DNS configuration would require more complex approach
        Err("Custom DNS not implemented for macOS yet".to_string())
    } else {
        // Linux - TODO: implement
        Err("Custom DNS not implemented for Linux yet".to_string())
    }
}
