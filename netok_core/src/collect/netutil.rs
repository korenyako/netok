#[cfg(target_os = "windows")]
pub fn sockaddr_to_string(sockaddr: *const windows::Win32::Networking::WinSock::SOCKADDR) -> Option<String> {
    use windows::Win32::Networking::WinSock::*;
    if sockaddr.is_null() { return None; }
    unsafe {
        match (*sockaddr).sa_family {
            AF_INET => {
                let sa_in: *const SOCKADDR_IN = std::mem::transmute(sockaddr);
                let addr = (*sa_in).sin_addr.S_un.S_addr;
                let bytes = addr.to_ne_bytes();
                Some(format!("{}.{}.{}.{}", bytes[0], bytes[1], bytes[2], bytes[3]))
            }
            AF_INET6 => {
                let sa_in6: *const SOCKADDR_IN6 = std::mem::transmute(sockaddr);
                let seg = (*sa_in6).sin6_addr.u.Byte;
                let arr = std::slice::from_raw_parts(seg.as_ptr(), 16);
                // Упростим: вернём компактную форму:
                Some(format!(
                    "{:x}:{:x}:{:x}:{:x}:{:x}:{:x}:{:x}:{:x}",
                    (u16::from(arr[0])<<8 | u16::from(arr[1])),
                    (u16::from(arr[2])<<8 | u16::from(arr[3])),
                    (u16::from(arr[4])<<8 | u16::from(arr[5])),
                    (u16::from(arr[6])<<8 | u16::from(arr[7])),
                    (u16::from(arr[8])<<8 | u16::from(arr[9])),
                    (u16::from(arr[10])<<8 | u16::from(arr[11])),
                    (u16::from(arr[12])<<8 | u16::from(arr[13])),
                    (u16::from(arr[14])<<8 | u16::from(arr[15])),
                ))
            }
            _ => None,
        }
    }
}
