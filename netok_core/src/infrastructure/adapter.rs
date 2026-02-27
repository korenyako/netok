//! Network adapter discovery.

/// Get active network adapter alias for Windows.
#[cfg(target_os = "windows")]
pub fn get_active_adapter_name() -> Option<String> {
    use super::run_powershell;
    use super::wifi::get_wifi_info;

    // Try to map the currently connected Wi-Fi adapter description to a friendly alias.
    if let (_, _, Some(wifi_desc), _) = get_wifi_info() {
        let escaped = wifi_desc.replace('\'', "''");
        let command = format!(
            "Get-NetAdapter | Where-Object {{ $_.InterfaceDescription -eq '{}' -and $_.Status -eq 'Up' }} | Select-Object -First 1 -ExpandProperty Name",
            escaped
        );
        if let Some(alias) = run_powershell(&command) {
            return Some(alias);
        }
    }

    // Prefer the interface that currently has an IPv4 connection and the lowest metric.
    // Exclude virtual adapters (Hyper-V, WSL, VPN tunnels) — they typically have
    // no DNS configured and would cause DNS detection to fail.
    let commands = [
        "Get-NetIPInterface -AddressFamily IPv4 | Where-Object {$_.ConnectionState -eq 'Connected'} | Sort-Object -Property InterfaceMetric | ForEach-Object { $a = Get-NetAdapter -InterfaceIndex $_.ifIndex -ErrorAction SilentlyContinue; if ($a -and -not $a.Virtual) { $_.InterfaceAlias } } | Select-Object -First 1",
        // Fallback: any connected physical adapter
        "Get-NetAdapter | Where-Object {$_.Status -eq 'Up' -and -not $_.Virtual} | Sort-Object -Property LinkSpeed -Descending | Select-Object -First 1 -ExpandProperty Name",
        // Last resort: any connected adapter (including virtual)
        "Get-NetIPInterface -AddressFamily IPv4 | Where-Object {$_.ConnectionState -eq 'Connected'} | Sort-Object -Property InterfaceMetric | Select-Object -First 1 -ExpandProperty InterfaceAlias",
    ];

    for cmd in commands {
        if let Some(alias) = run_powershell(cmd) {
            return Some(alias);
        }
    }

    None
}

#[cfg(not(target_os = "windows"))]
#[allow(dead_code)]
pub fn get_active_adapter_name() -> Option<String> {
    // On non-Windows platforms, adapter name comes from get_if_addrs
    None
}
