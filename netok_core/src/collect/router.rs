use default_net::get_default_gateway;

pub fn collect_router() -> crate::RouterNode {
    let local_ip = get_default_gateway()
        .ok()
        .map(|gw| gw.ip_addr.to_string());

    crate::RouterNode { local_ip }
}
