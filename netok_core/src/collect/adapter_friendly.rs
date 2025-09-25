#[cfg(target_os = "windows")]
pub mod win {
    use std::{ffi::OsString, os::windows::ffi::OsStringExt};
    use windows::Win32::NetworkManagement::IpHelper::{
        GetAdaptersAddresses, IP_ADAPTER_ADDRESSES_LH, GAA_FLAG_INCLUDE_PREFIX,
    };
    use windows::Win32::Networking::WinSock::AF_UNSPEC;
    use windows::Win32::Foundation::ERROR_BUFFER_OVERFLOW;

    /// По локальному IP пытаемся найти адаптер и вернуть его FriendlyName.
    pub fn friendly_by_local_ip(local_ip: &str) -> Option<String> {
        // Первый проход — узнать нужный буфер
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
                // крайне редко, но тогда просто None
            }
        }

        // Аллоцируем буфер и второй проход
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
                // Соберём все IP этого адаптера и сравним с local_ip
                // Перебор Unicast адресов
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
                    // FriendlyName — PWSTR (wide)
                    let pw = (*cur).FriendlyName;
                    if !pw.is_null() {
                        // Найдём длину по \0
                        let mut len = 0usize;
                        while *pw.0.add(len) != 0 {
                            len += 1;
                        }
                        let slice = std::slice::from_raw_parts(pw.0, len);
                        let s = OsString::from_wide(slice).to_string_lossy().to_string();
                        return Some(s);
                    }
                }

                cur = (*cur).Next;
            }
        }
        None
    }
}

#[cfg(any(target_os = "linux", target_os = "macos"))]
pub mod unix {
    /// На Unix системах берём имя интерфейса как есть.
    pub fn friendly_by_local_ip(_local_ip: &str, iface_name: Option<&str>) -> Option<String> {
        iface_name.map(|s| s.to_string())
    }
}
