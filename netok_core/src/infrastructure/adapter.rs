//! Network adapter discovery.

/// Get active network adapter alias for Windows.
#[cfg(target_os = "windows")]
pub fn get_active_adapter_name() -> Option<String> {
    use super::wifi::get_wifi_info;

    fn run_powershell(command: &str) -> Option<String> {
        // Force English culture to ensure locale-independent output
        // This prevents localized enum values like "Connected"/"Подключено"
        let culture_prefix =
            "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; ";
        let full_command = format!("{}{}", culture_prefix, command);

        let output = super::hidden_cmd("powershell")
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

#[cfg(not(target_os = "windows"))]
#[allow(dead_code)]
pub fn get_active_adapter_name() -> Option<String> {
    // On non-Windows platforms, adapter name comes from get_if_addrs
    None
}
