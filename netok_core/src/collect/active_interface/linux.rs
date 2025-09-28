use std::process::Command;
use std::path::Path;
use crate::model::ConnectionType;

/// Enrich Linux interface information using filesystem and CLI tools
pub fn enrich_linux_interface(
    interface_name: &Option<String>,
) -> (Option<String>, Option<String>, ConnectionType, Option<i32>, bool) {
    let interface_name = match interface_name {
        Some(name) => name,
        None => return (None, None, ConnectionType::Unknown, None, false),
    };

    let connection_type = determine_connection_type(interface_name);
    let adapter_friendly = get_friendly_name(&connection_type, interface_name);
    let adapter_model = get_adapter_model(interface_name);
    let oper_up = get_oper_up(interface_name);
    let rssi_dbm = if connection_type == ConnectionType::Wifi && oper_up {
        get_wifi_rssi(interface_name)
    } else {
        None
    };

    (adapter_friendly, adapter_model, connection_type, rssi_dbm, oper_up)
}

fn determine_connection_type(interface_name: &str) -> ConnectionType {
    // Check for wireless interface
    let wireless_path = format!("/sys/class/net/{}/wireless", interface_name);
    if Path::new(&wireless_path).exists() {
        return ConnectionType::Wifi;
    }

    // Check for VPN interfaces
    if interface_name.starts_with("tun") || interface_name.starts_with("tap") {
        return ConnectionType::Vpn;
    }

    // Check for USB modem interfaces
    if interface_name.starts_with("wwan") || 
       interface_name.starts_with("cdc") || 
       interface_name.starts_with("usb") {
        return ConnectionType::UsbModem;
    }

    // Check for tethering interfaces
    if interface_name.starts_with("usb") && interface_name.contains("rndis") {
        return ConnectionType::Tethering;
    }

    // Check for Ethernet interfaces
    if interface_name.starts_with("en") || 
       interface_name.starts_with("eth") ||
       interface_name.starts_with("ens") {
        return ConnectionType::Ethernet;
    }

    ConnectionType::Unknown
}

fn get_friendly_name(connection_type: &ConnectionType, interface_name: &str) -> Option<String> {
    match connection_type {
        ConnectionType::Wifi => Some("Wi-Fi".to_string()),
        ConnectionType::Ethernet => Some("Ethernet".to_string()),
        ConnectionType::Vpn => Some("VPN".to_string()),
        ConnectionType::UsbModem => Some("USB Modem".to_string()),
        ConnectionType::Tethering => Some("Tethering".to_string()),
        ConnectionType::Unknown => Some(interface_name.to_string()),
    }
}

fn get_adapter_model(interface_name: &str) -> Option<String> {
    // Try ethtool first
    if let Ok(output) = Command::new("ethtool")
        .args(&["-i", interface_name])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.starts_with("driver:") {
                    let driver = line.split(':').nth(1)?.trim();
                    return Some(format!("{} ({})", driver, interface_name));
                }
            }
        }
    }

    // Fallback to udevadm
    if let Ok(output) = Command::new("udevadm")
        .args(&["info", "--query=property", &format!("--path=/sys/class/net/{}/device", interface_name)])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.starts_with("ID_MODEL=") {
                    let model = line.split('=').nth(1)?.trim();
                    return Some(model.to_string());
                }
            }
        }
    }

    None
}

fn get_oper_up(interface_name: &str) -> bool {
    // Check /sys/class/net/<iface>/operstate
    let operstate_path = format!("/sys/class/net/{}/operstate", interface_name);
    if let Ok(content) = std::fs::read_to_string(&operstate_path) {
        return content.trim() == "up";
    }
    
    // Fallback: check carrier status
    let carrier_path = format!("/sys/class/net/{}/carrier", interface_name);
    if let Ok(content) = std::fs::read_to_string(&carrier_path) {
        return content.trim() == "1";
    }
    
    false
}

fn get_wifi_rssi(interface_name: &str) -> Option<i32> {
    // Use iw command to get signal strength
    if let Ok(output) = Command::new("iw")
        .args(&["dev", interface_name, "link"])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                if line.contains("signal:") {
                    // Parse "signal: -45 dBm"
                    if let Some(signal_part) = line.split("signal:").nth(1) {
                        if let Some(dbm_part) = signal_part.split("dBm").next() {
                            if let Ok(rssi) = dbm_part.trim().parse::<i32>() {
                                return Some(rssi);
                            }
                        }
                    }
                }
            }
        }
    }

    eprintln!("[Netok core] Failed to get Wi-Fi RSSI for interface: {}", interface_name);
    None
}
