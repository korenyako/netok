use get_if_addrs::get_if_addrs;
use std::net::IpAddr;

pub fn collect_computer() -> crate::ComputerNode {
    let hostname = hostname::get()
        .ok()
        .and_then(|s| s.into_string().ok());

    let mut local_ip: Option<String> = None;
    let mut adapter: Option<String> = None;

    if let Ok(ifaces) = get_if_addrs() {
        // First try to find IPv4 interface
        if let Some(ifa) = ifaces.iter().find(|i| {
            !i.is_loopback() && matches!(i.ip(), IpAddr::V4(_))
        }) {
            local_ip = Some(ifa.ip().to_string());
            adapter = Some(ifa.name.clone());
        } else {
            // Fallback to IPv6 if no IPv4 found
            if let Some(ifa) = ifaces.iter().find(|i| {
                !i.is_loopback() && matches!(i.ip(), IpAddr::V6(_))
            }) {
                local_ip = Some(ifa.ip().to_string());
                adapter = Some(ifa.name.clone());
            }
        }
    }

    crate::ComputerNode {
        hostname,
        model: None,        // fill later when we add a safe cross-platform method
        primary_adapter: adapter,
        local_ip,
    }
}
