#[cfg(target_os = "windows")]
pub mod windows {
    use std::{ffi::OsString, os::windows::ffi::OsStringExt};
    use windows::Win32::NetworkManagement::IpHelper::{
        GetAdaptersAddresses, IP_ADAPTER_ADDRESSES_LH, GAA_FLAG_INCLUDE_PREFIX,
    };
    use windows::Win32::Networking::WinSock::AF_UNSPEC;
    use windows::Win32::Foundation::ERROR_BUFFER_OVERFLOW;
    use crate::model::ConnectionType;

    pub struct AdapterInfo {
        pub friendly_name: Option<String>,
        pub model: Option<String>,
        pub connection_type: ConnectionType,
    }

    /// Get adapter information for Windows using WinAPI
    pub fn get_adapter_info(local_ip: &str) -> Option<AdapterInfo> {
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
                        let slice = std::slice::from_raw_parts(pw.0, len);
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
                        let slice = std::slice::from_raw_parts(pw.0, len);
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

                    return Some(AdapterInfo {
                        friendly_name,
                        model,
                        connection_type,
                    });
                }

                cur = (*cur).Next;
            }
        }
        None
    }
}

#[cfg(any(target_os = "linux", target_os = "macos"))]
pub mod unix {
    use std::process::Command;
    use crate::model::ConnectionType;

    pub struct AdapterInfo {
        pub friendly_name: Option<String>,
        pub model: Option<String>,
        pub connection_type: ConnectionType,
    }

    /// Get adapter information for Unix systems (macOS/Linux)
    pub fn get_adapter_info(interface_name: &str) -> Option<AdapterInfo> {
        let connection_type = determine_connection_type(interface_name);
        let friendly_name = get_friendly_name(&connection_type, interface_name);
        
        Some(AdapterInfo {
            friendly_name,
            model: None, // Will be implemented later
            connection_type,
        })
    }

    fn determine_connection_type(interface_name: &str) -> ConnectionType {
        #[cfg(target_os = "macos")]
        {
            // macOS: use networksetup to determine hardware port
            if let Ok(output) = Command::new("networksetup")
                .args(&["-listallhardwareports"])
                .output()
            {
                let output_str = String::from_utf8_lossy(&output.stdout);
                for line in output_str.lines() {
                    if line.contains(&format!("Device: {}", interface_name)) {
                        // Look for the Hardware Port line
                        if let Some(hardware_line) = output_str.lines()
                            .skip_while(|l| !l.contains(&format!("Device: {}", interface_name)))
                            .skip(1)
                            .next()
                        {
                            if hardware_line.contains("Hardware Port: Wi-Fi") {
                                return ConnectionType::Wifi;
                            } else if hardware_line.contains("Hardware Port: Ethernet") {
                                return ConnectionType::Ethernet;
                            }
                        }
                    }
                }
            }
        }

        #[cfg(target_os = "linux")]
        {
            // Linux: check /sys/class/net/<iface>/wireless
            let wireless_path = format!("/sys/class/net/{}/wireless", interface_name);
            if std::path::Path::new(&wireless_path).exists() {
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

            // Check for Ethernet interfaces
            if interface_name.starts_with("en") || interface_name.starts_with("eth") {
                return ConnectionType::Ethernet;
            }
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
}
