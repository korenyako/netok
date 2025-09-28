use std::process::Command;
use crate::model::ConnectionType;

/// Enrich macOS interface information using system commands
pub fn enrich_macos_interface(
    interface_name: &Option<String>,
) -> (Option<String>, Option<String>, ConnectionType, Option<i32>, bool) {
    let interface_name = match interface_name {
        Some(name) => name,
        None => return (None, None, ConnectionType::Unknown, None, false),
    };

    let (adapter_friendly, connection_type) = get_hardware_port_info(interface_name);
    let adapter_model = None; // Skip for v1 as requested
    let oper_up = get_oper_up(interface_name);
    let rssi_dbm = if connection_type == ConnectionType::Wifi && oper_up {
        get_wifi_rssi(interface_name)
    } else {
        None
    };

    (adapter_friendly, adapter_model, connection_type, rssi_dbm, oper_up)
}

fn get_hardware_port_info(interface_name: &str) -> (Option<String>, ConnectionType) {
    // Use networksetup to determine hardware port
    if let Ok(output) = Command::new("networksetup")
        .args(&["-listallhardwareports"])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let lines: Vec<&str> = output_str.lines().collect();
            
            for (i, line) in lines.iter().enumerate() {
                if line.contains(&format!("Device: {}", interface_name)) {
                    // Look for the Hardware Port line (usually the next line)
                    if i + 1 < lines.len() {
                        let hardware_line = lines[i + 1];
                        if hardware_line.contains("Hardware Port:") {
                            let port_name = hardware_line
                                .split("Hardware Port:")
                                .nth(1)
                                .map(|s| s.trim().to_string());
                            
                            let connection_type = if hardware_line.contains("Wi-Fi") {
                                ConnectionType::Wifi
                            } else if hardware_line.contains("Ethernet") {
                                ConnectionType::Ethernet
                            } else if hardware_line.contains("USB") {
                                ConnectionType::UsbModem
                            } else {
                                ConnectionType::Unknown
                            };
                            
                            return (port_name, connection_type);
                        }
                    }
                }
            }
        }
    }

    // Fallback: determine type from interface name
    let connection_type = if interface_name.starts_with("en") {
        ConnectionType::Ethernet
    } else if interface_name.starts_with("wl") {
        ConnectionType::Wifi
    } else if interface_name.starts_with("utun") {
        ConnectionType::Vpn
    } else {
        ConnectionType::Unknown
    };

    let adapter_friendly = match connection_type {
        ConnectionType::Wifi => Some("Wi-Fi".to_string()),
        ConnectionType::Ethernet => Some("Ethernet".to_string()),
        ConnectionType::Vpn => Some("VPN".to_string()),
        ConnectionType::UsbModem => Some("USB Modem".to_string()),
        ConnectionType::Tethering => Some("Tethering".to_string()),
        ConnectionType::Unknown => Some(interface_name.to_string()),
    };

    (adapter_friendly, connection_type)
}

fn get_oper_up(interface_name: &str) -> bool {
    // Use ifconfig to check interface status
    if let Ok(output) = Command::new("ifconfig")
        .arg(interface_name)
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            // Check if interface is up and running
            return output_str.contains("status: active") || 
                   (output_str.contains("UP") && output_str.contains("RUNNING"));
        }
    }
    
    // Fallback: check netstat
    if let Ok(output) = Command::new("netstat")
        .args(&["-rn"])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            // Look for default route using this interface
            return output_str.contains(&format!("{}", interface_name));
        }
    }
    
    false
}

fn get_wifi_rssi(interface_name: &str) -> Option<i32> {
    // Use airport command to get RSSI
    if let Ok(output) = Command::new("/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport")
        .args(&["-I"])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.contains("agrCtlRSSI:") {
                    // Parse "agrCtlRSSI: -45"
                    if let Some(rssi_part) = line.split("agrCtlRSSI:").nth(1) {
                        if let Ok(rssi) = rssi_part.trim().parse::<i32>() {
                            return Some(rssi);
                        }
                    }
                }
            }
        }
    }

    eprintln!("[Netok core] Failed to get Wi-Fi RSSI for interface: {}", interface_name);
    None
}
