//! ARP table lookups for MAC address resolution.

/// Get router MAC address via ARP lookup.
#[cfg(target_os = "windows")]
pub fn get_router_mac(gateway_ip: &str) -> Option<String> {
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
pub fn get_router_mac(_gateway_ip: &str) -> Option<String> {
    // TODO: Implement for Linux (parse `ip neigh` or `arp -a`)
    // TODO: Implement for macOS (parse `arp -a`)
    None
}
