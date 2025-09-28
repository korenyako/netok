use std::net::{IpAddr, SocketAddr, UdpSocket};
use get_if_addrs::get_if_addrs;
use crate::model::ConnectionType;

// Platform-specific modules
#[cfg(target_os = "windows")]
pub mod windows;

#[cfg(target_os = "linux")]
pub mod linux;

#[cfg(target_os = "macos")]
pub mod macos;

/// Represents the active network interface with enriched information
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ActiveInterface {
    pub interface_name: Option<String>,     // en0, wlp2s0, {GUID}
    pub local_ip: Option<String>,           // 192.168.1.100
    pub adapter_friendly: Option<String>,   // "Wi-Fi" or Windows FriendlyName
    pub adapter_model: Option<String>,      // Windows Description or best-effort
    pub connection_type: ConnectionType,    // Wifi/Ethernet/UsbModem/...
    pub rssi_dbm: Option<i32>,              // Signal strength for Wi-Fi
    pub oper_up: bool,                      // Operational state (up/down)
}

/// Determine the local IP address used for outgoing connections
/// by creating a UDP socket and connecting to a public address
fn get_outgoing_local_ip() -> Option<IpAddr> {
    // Try to connect to Google DNS (8.8.8.8:53) to determine outgoing interface
    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(s) => s,
        Err(e) => {
            eprintln!("[Netok core] Failed to bind UDP socket: {}", e);
            return None;
        }
    };
    
    let target = SocketAddr::from(([8, 8, 8, 8], 53));
    
    // Connect without sending data - this will bind the socket to the outgoing interface
    if let Err(e) = socket.connect(target) {
        eprintln!("[Netok core] Failed to connect UDP socket: {}", e);
        return None;
    }
    
    // Get the local address the socket is bound to
    match socket.local_addr() {
        Ok(addr) => Some(addr.ip()),
        Err(e) => {
            eprintln!("[Netok core] Failed to get local address: {}", e);
            None
        }
    }
}

/// Find the network interface that has the specified IP address
fn find_interface_by_ip(target_ip: IpAddr) -> Option<(String, String)> {
    let ifaces = match get_if_addrs() {
        Ok(ifaces) => ifaces,
        Err(e) => {
            eprintln!("[Netok core] Failed to get interface addresses: {}", e);
            return None;
        }
    };
    
    for iface in ifaces {
        if iface.ip() == target_ip {
            return Some((iface.name.clone(), iface.ip().to_string()));
        }
    }
    
    None
}

/// Get the active network interface information
pub fn get_active_interface() -> ActiveInterface {
    // Step A: Determine active local IP
    let outgoing_ip = match get_outgoing_local_ip() {
        Some(ip) => ip,
        None => {
            eprintln!("[Netok core] Could not determine outgoing IP, returning default interface");
            return ActiveInterface {
                interface_name: None,
                local_ip: None,
                adapter_friendly: None,
                adapter_model: None,
                connection_type: ConnectionType::Unknown,
                rssi_dbm: None,
                oper_up: false,
            };
        }
    };

    // Step B: Find interface by IP
    let (interface_name, local_ip) = match find_interface_by_ip(outgoing_ip) {
        Some((name, ip)) => (Some(name), Some(ip)),
        None => {
            eprintln!("[Netok core] Could not find interface for IP: {}", outgoing_ip);
            return ActiveInterface {
                interface_name: None,
                local_ip: Some(outgoing_ip.to_string()),
                adapter_friendly: None,
                adapter_model: None,
                connection_type: ConnectionType::Unknown,
                rssi_dbm: None,
                oper_up: false,
            };
        }
    };

    // Step C: Platform-specific enrichment
    let (adapter_friendly, adapter_model, connection_type, rssi_dbm, oper_up) = 
        enrich_interface_info(&interface_name, &local_ip);

    let result = ActiveInterface {
        interface_name,
        local_ip,
        adapter_friendly,
        adapter_model,
        connection_type,
        rssi_dbm,
        oper_up,
    };

    // Debug logging
    if let Ok(json) = serde_json::to_string(&result) {
        println!("[Netok core] ActiveIface: {}", json);
    }

    result
}

/// Platform-specific enrichment of interface information
fn enrich_interface_info(
    interface_name: &Option<String>,
    local_ip: &Option<String>,
) -> (Option<String>, Option<String>, ConnectionType, Option<i32>, bool) {
    #[cfg(target_os = "windows")]
    {
        crate::collect::active_interface::windows::enrich_windows_interface(interface_name, local_ip)
    }
    
    #[cfg(target_os = "linux")]
    {
        crate::collect::active_interface::linux::enrich_linux_interface(interface_name)
    }
    
    #[cfg(target_os = "macos")]
    {
        crate::collect::active_interface::macos::enrich_macos_interface(interface_name)
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    {
        eprintln!("[Netok core] Unsupported platform for interface enrichment");
        (None, None, ConnectionType::Unknown, None, false)
    }
}
