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

    let mut primary_adapter_friendly: Option<String> = None;

    #[cfg(target_os = "windows")]
    {
        if let Some(ip) = &local_ip {
            primary_adapter_friendly = crate::collect::adapter_friendly::win::friendly_by_local_ip(ip);
        }
    }

    #[cfg(any(target_os = "linux", target_os = "macos"))]
    {
        // На Unix — friendly = имя интерфейса (или эвристика по типу)
        primary_adapter_friendly = crate::collect::adapter_friendly::unix::friendly_by_local_ip(
            local_ip.as_deref().unwrap_or(""),
            adapter.as_deref(),
        );
    }

    crate::ComputerNode {
        hostname,
        model: None,        // fill later when we add a safe cross-platform method
        primary_adapter: adapter,                 // как раньше (GUID/имя)
        primary_adapter_friendly,                 // новое поле для UI
        local_ip,
    }
}
