//! Default gateway discovery.

/// Get default gateway IP address.
#[cfg(target_os = "windows")]
pub fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "route print" and parse the output
    // LOCALE-INDEPENDENT: We parse IP addresses (0.0.0.0) which are not localized
    // The route table format is consistent across locales
    let output = Command::new("cmd")
        .args(["/C", "route print 0.0.0.0"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for lines with "0.0.0.0" and extract gateway IP
    // Format: "0.0.0.0  0.0.0.0  <gateway>  <interface>  <metric>"
    // We rely on IP addresses, not text labels, making this locale-independent
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[0] == "0.0.0.0" && parts[1] == "0.0.0.0" {
            // parts[2] is the gateway IP
            return Some(parts[2].to_string());
        }
    }

    None
}

#[cfg(target_os = "linux")]
pub fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "ip route" and parse the output
    // LOCALE-INDEPENDENT: The `ip` command outputs English keywords regardless of system locale
    // Keywords like "default" and "via" are not translated
    let output = Command::new("ip")
        .args(["route", "show", "default"])
        .output()
        .ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Format: "default via <gateway> dev <interface>"
    // Keywords "default" and "via" are part of the command's protocol, not user-facing text
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 3 && parts[0] == "default" && parts[1] == "via" {
            return Some(parts[2].to_string());
        }
    }

    None
}

#[cfg(target_os = "macos")]
pub fn get_default_gateway() -> Option<String> {
    use std::process::Command;

    // Run "netstat -nr" and parse the output
    // LOCALE-INDEPENDENT: netstat uses numeric format (-n) and standard keywords
    // The keyword "default" and IP "0.0.0.0" are not localized
    let output = Command::new("netstat").args(["-nr"]).output().ok()?;

    let text = String::from_utf8_lossy(&output.stdout);

    // Look for default route
    // Using -n flag ensures numeric output, and "default" keyword is not translated
    for line in text.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 && (parts[0] == "default" || parts[0] == "0.0.0.0") {
            return Some(parts[1].to_string());
        }
    }

    None
}

#[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
pub fn get_default_gateway() -> Option<String> {
    None
}
