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

/// An entry from the system ARP table.
pub struct ArpEntry {
    pub ip: String,
    pub mac: String,
}

/// Format a raw MAC string (from PowerShell) into AA:BB:CC:DD:EE:FF.
fn format_mac(raw: &str) -> Option<String> {
    let formatted = if raw.contains('-') {
        raw.replace('-', ":").to_uppercase()
    } else if raw.contains(':') {
        raw.to_uppercase()
    } else if raw.len() == 12 {
        format!(
            "{}:{}:{}:{}:{}:{}",
            &raw[0..2],
            &raw[2..4],
            &raw[4..6],
            &raw[6..8],
            &raw[8..10],
            &raw[10..12]
        )
        .to_uppercase()
    } else {
        return None;
    };

    if formatted.len() == 17 && formatted.matches(':').count() == 5 {
        Some(formatted)
    } else {
        None
    }
}

/// Extract subnet prefix from a gateway IP (e.g., "192.168.1.1" → "192.168.1").
fn subnet_prefix(gateway_ip: &str) -> Option<String> {
    let parts: Vec<&str> = gateway_ip.split('.').collect();
    if parts.len() == 4 {
        Some(format!("{}.{}.{}", parts[0], parts[1], parts[2]))
    } else {
        None
    }
}

/// Ping sweep: ping all IPs in the /24 subnet to populate the ARP table.
///
/// Uses parallel system `ping` commands (no admin rights needed).
/// Each ping has a 200ms timeout, run in batches of 20 threads.
/// Total time: ~3-5 seconds for a /24 subnet.
#[cfg(target_os = "windows")]
pub fn ping_sweep(gateway_ip: &str) {
    use std::process::Command;

    let prefix = match subnet_prefix(gateway_ip) {
        Some(p) => p,
        None => return,
    };

    // Ping all 254 hosts in parallel using thread::scope
    std::thread::scope(|s| {
        let batch_size = 20;
        for chunk_start in (1..=254).step_by(batch_size) {
            let chunk_end = (chunk_start + batch_size).min(255);
            let handles: Vec<_> = (chunk_start..chunk_end)
                .map(|i| {
                    let ip = format!("{}.{}", prefix, i);
                    s.spawn(move || {
                        // -n 1: single ping, -w 200: 200ms timeout
                        #[cfg(target_os = "windows")]
                        use std::os::windows::process::CommandExt;

                        let mut cmd = Command::new("ping");
                        cmd.args(["-n", "1", "-w", "200", &ip]);

                        // Hide console windows for ping processes
                        #[cfg(target_os = "windows")]
                        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW

                        let _ = cmd.output();
                    })
                })
                .collect();

            for handle in handles {
                let _ = handle.join();
            }
        }
    });
}

#[cfg(not(target_os = "windows"))]
pub fn ping_sweep(_gateway_ip: &str) {
    // TODO: Implement for Linux/macOS
    // Linux: ping -c 1 -W 1 <ip>
    // macOS: ping -c 1 -t 1 <ip>
}

/// Get all reachable entries from the ARP table (IPv4 only).
#[cfg(target_os = "windows")]
pub fn get_all_arp_entries() -> Vec<ArpEntry> {
    use std::process::Command;

    // Get-NetNeighbor returns all ARP entries.
    // Filter: IPv4, Reachable or Stale (exclude Unreachable and Incomplete).
    // Output: "IPAddress|LinkLayerAddress" per line for easy parsing.
    let command =
        "[System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US'; \
         Get-NetNeighbor -AddressFamily IPv4 -ErrorAction SilentlyContinue | \
         Where-Object { $_.State -ne 'Unreachable' -and $_.State -ne 'Incomplete' -and $_.LinkLayerAddress -ne '00-00-00-00-00-00' -and $_.LinkLayerAddress -ne 'FF-FF-FF-FF-FF-FF' } | \
         ForEach-Object { $_.IPAddress + '|' + $_.LinkLayerAddress }";

    let output = match Command::new("powershell")
        .args(["-NoProfile", "-Command", command])
        .output()
    {
        Ok(o) if o.status.success() => o,
        _ => return vec![],
    };

    let stdout = String::from_utf8_lossy(&output.stdout);

    stdout
        .lines()
        .filter_map(|line| {
            let line = line.trim();
            let parts: Vec<&str> = line.splitn(2, '|').collect();
            if parts.len() != 2 {
                return None;
            }
            let ip = parts[0].trim().to_string();
            let mac_raw = parts[1].trim();
            let mac = format_mac(mac_raw)?;

            // Skip multicast and broadcast IPs
            if ip.starts_with("224.") || ip.starts_with("239.") || ip == "255.255.255.255" {
                return None;
            }

            Some(ArpEntry { ip, mac })
        })
        .collect()
}

#[cfg(not(target_os = "windows"))]
pub fn get_all_arp_entries() -> Vec<ArpEntry> {
    // TODO: Implement for Linux/macOS
    vec![]
}
