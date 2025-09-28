use std::{ffi::OsString, os::windows::ffi::OsStringExt};
use windows::Win32::NetworkManagement::IpHelper::{
    GetAdaptersAddresses, IP_ADAPTER_ADDRESSES_LH, GAA_FLAG_INCLUDE_PREFIX,
};
use windows::Win32::Networking::WinSock::AF_UNSPEC;
use windows::Win32::Foundation::ERROR_BUFFER_OVERFLOW;
use crate::model::ConnectionType;

/// Enrich Windows interface information using WinAPI
pub fn enrich_windows_interface(
    _interface_name: &Option<String>,
    local_ip: &Option<String>,
) -> (Option<String>, Option<String>, ConnectionType, Option<i32>, bool) {
    let local_ip = match local_ip {
        Some(ip) => ip,
        None => return (None, None, ConnectionType::Unknown, None, false),
    };

    // Get adapter information using GetAdaptersAddresses
    match get_adapter_info(local_ip) {
        Some(info) => {
            let rssi = if info.connection_type == ConnectionType::Wifi {
                get_wifi_rssi(&info.adapter_guid)
            } else {
                None
            };
            
            (info.friendly_name, info.model, info.connection_type, rssi, info.oper_up)
        }
        None => (None, None, ConnectionType::Unknown, None, false),
    }
}

struct AdapterInfo {
    friendly_name: Option<String>,
    model: Option<String>,
    connection_type: ConnectionType,
    adapter_guid: Option<String>,
    oper_up: bool,
}

/// Get adapter information for Windows using WinAPI
fn get_adapter_info(local_ip: &str) -> Option<AdapterInfo> {
    // First pass - get required buffer size
    let mut size: u32 = 0;
    unsafe {
        let ret = GetAdaptersAddresses(
            AF_UNSPEC.0 as u32,
            GAA_FLAG_INCLUDE_PREFIX,
            None,
            None,
            &mut size,
        );
        if ret != ERROR_BUFFER_OVERFLOW.0 {
            eprintln!("[Netok core] GetAdaptersAddresses first call failed: {}", ret);
            return None;
        }
    }

    // Second pass - get adapter information
    let mut buf: Vec<u8> = vec![0u8; size as usize];
    let p_addrs = buf.as_mut_ptr() as *mut IP_ADAPTER_ADDRESSES_LH;
    let ret = unsafe {
        GetAdaptersAddresses(
            AF_UNSPEC.0 as u32,
            GAA_FLAG_INCLUDE_PREFIX,
            None,
            Some(p_addrs),
            &mut size,
        )
    };
    if ret != 0 {
        eprintln!("[Netok core] GetAdaptersAddresses second call failed: {}", ret);
        return None;
    }

    unsafe {
        let mut cur = p_addrs;
        while !cur.is_null() {
            // Check if this adapter has the target IP
            let mut has_ip = false;
            let mut unicast = (*cur).FirstUnicastAddress;
            while !unicast.is_null() {
                let sockaddr = (*unicast).Address.lpSockaddr;
                if !sockaddr.is_null() {
                    if let Some(ip) = crate::collect::netutil::sockaddr_to_string(sockaddr) {
                        if ip == local_ip {
                            has_ip = true;
                            break;
                        }
                    }
                }
                unicast = (*unicast).Next;
            }

            if has_ip {
                // Extract friendly name
                let friendly_name = if !(*cur).FriendlyName.is_null() {
                    let pw = (*cur).FriendlyName;
                    let mut len = 0usize;
                    while *pw.0.add(len) != 0 {
                        len += 1;
                    }
                    let slice = std::slice::from_raw_parts(pw.0 as *const u16, len);
                    Some(OsString::from_wide(slice).to_string_lossy().to_string())
                } else {
                    None
                };

                // Extract description (model)
                let model = if !(*cur).Description.is_null() {
                    let pw = (*cur).Description;
                    let mut len = 0usize;
                    while *pw.0.add(len) != 0 {
                        len += 1;
                    }
                    let slice = std::slice::from_raw_parts(pw.0 as *const u16, len);
                    Some(OsString::from_wide(slice).to_string_lossy().to_string())
                } else {
                    None
                };

                // Extract adapter GUID
                let adapter_guid = if !(*cur).AdapterName.is_null() {
                    let pw = (*cur).AdapterName;
                    let mut len = 0usize;
                    while *pw.0.add(len) != 0 {
                        len += 1;
                    }
                    let slice = std::slice::from_raw_parts(pw.0 as *const u16, len);
                    Some(OsString::from_wide(slice).to_string_lossy().to_string())
                } else {
                    None
                };

                // Determine connection type from IfType
                let connection_type = match (*cur).IfType {
                    71 => ConnectionType::Wifi,        // IF_TYPE_IEEE80211
                    6 => ConnectionType::Ethernet,     // IF_TYPE_ETHERNET_CSMACD
                    23 | 131 => ConnectionType::Vpn,   // IF_TYPE_PPP / IF_TYPE_TUNNEL
                    243 | 244 => ConnectionType::UsbModem, // IF_TYPE_WWANPP / WWANPP2
                    _ => ConnectionType::Unknown,
                };

                // Determine operational status from OperStatus
                let oper_up = (*cur).OperStatus == windows::Win32::NetworkManagement::Ndis::IF_OPER_STATUS(1); // IfOperStatusUp = 1

                return Some(AdapterInfo {
                    friendly_name,
                    model,
                    connection_type,
                    adapter_guid,
                    oper_up,
                });
            }

            cur = (*cur).Next;
        }
    }
    None
}

/// Get Wi-Fi RSSI using WLAN API (simplified implementation)
fn get_wifi_rssi(_adapter_guid: &Option<String>) -> Option<i32> {
    // TODO: Implement WLAN API RSSI reading
    // For now, return None as this requires complex WLAN API integration
    eprintln!("[Netok core] Wi-Fi RSSI detection not yet implemented for Windows");
    None
}
