use get_if_addrs::get_if_addrs;

pub fn collect_computer() -> crate::ComputerInfo {
    let hostname = hostname::get()
        .ok()
        .and_then(|s| s.into_string().ok());

    // Pick first non-loopback, "up" interface with private IPv4.
    let (adapter, local_ip) = match get_if_addrs() {
        Ok(ifaces) => {
            let mut pick: Option<(String, String)> = None;
            for iface in ifaces {
                if iface.is_loopback() { continue; }
                // get_if_addrs has no is_up(), so we just skip loopback and prefer private IPv4
                if let std::net::IpAddr::V4(ipv4) = iface.ip() {
                    let octets = ipv4.octets();
                    let is_private =
                        octets[0] == 10 ||
                        (octets[0] == 172 && (16..=31).contains(&octets[1])) ||
                        (octets[0] == 192 && octets[1] == 168);
                    if is_private {
                        pick = Some((iface.name.clone(), ipv4.to_string()));
                        break;
                    }
                }
            }
            pick
        }
        Err(_) => None,
    }.unwrap_or_default();

    crate::ComputerInfo {
        hostname,
        model: None,        // fill later when we add a safe cross-platform method
        adapter: if adapter.is_empty() { None } else { Some(adapter) },
        local_ip: if local_ip.is_empty() { None } else { Some(local_ip) },
    }
}
