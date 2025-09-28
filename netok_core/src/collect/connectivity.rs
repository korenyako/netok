use std::net::{IpAddr, SocketAddr};
use std::time::Duration;
use tokio::net::TcpStream;
use tokio::time::timeout;
use reqwest::{Client, StatusCode};
use crate::model::Connectivity;

/// Try to get outgoing local IP using UDP socket
pub fn try_outgoing_local_ip() -> Option<IpAddr> {
    use std::net::UdpSocket;
    
    let socket = match UdpSocket::bind("0.0.0.0:0") {
        Ok(s) => s,
        Err(_) => return None,
    };
    
    let target = SocketAddr::from(([1, 1, 1, 1], 53));
    if socket.connect(target).is_err() {
        return None;
    }
    
    socket.local_addr().ok().map(|addr| addr.ip())
}

/// TCP probe with timeout
async fn tcp_probe(addr: &str, port: u16) -> bool {
    let addr = format!("{}:{}", addr, port);
    let timeout_duration = Duration::from_millis(800);
    
    match timeout(timeout_duration, TcpStream::connect(&addr)).await {
        Ok(Ok(_)) => true,
        Ok(Err(_)) => false,
        Err(_) => false, // timeout
    }
}

/// TCP probe for IP address and port
async fn tcp_probe_ip(addr: IpAddr, port: u16) -> bool {
    let timeout_duration = Duration::from_millis(800);
    
    match timeout(timeout_duration, TcpStream::connect((addr, port))).await {
        Ok(Ok(_)) => true,
        Ok(Err(_)) => false,
        Err(_) => false, // timeout
    }
}

/// HTTP client factory with proper configuration
pub fn make_http_client() -> Option<Client> {
    Client::builder()
        // Use system proxy by default
        .timeout(Duration::from_secs(2))
        .pool_idle_timeout(Duration::from_secs(5))
        .pool_max_idle_per_host(1)
        .build()
        .ok()
}

/// Universal HTTP probe with multiple targets
pub async fn http_online_probe(client: &Client) -> bool {
    // Order: fast 204, windows-check, then https variants
    let targets = [
        // HTTP (no TLS) - fewer problems with TLS interception
        ("http://connectivitycheck.gstatic.com/generate_204", StatusCode::NO_CONTENT),
        ("http://www.msftconnecttest.com/connecttest.txt", StatusCode::OK),
        // HTTPS variants (in case HTTP is blocked)
        ("https://www.gstatic.com/generate_204", StatusCode::NO_CONTENT),
        ("https://api.ipify.org?format=json", StatusCode::OK),
        ("https://cloudflare.com/cdn-cgi/trace", StatusCode::OK),
    ];

    for (url, expected) in targets {
        let res = client
            .get(url)
            .header("User-Agent", "Netok/1.0 connectivity")
            .timeout(Duration::from_millis(1200))
            .send()
            .await;

        match res {
            Ok(rsp) => {
                let sc = rsp.status();
                // Consider successful any 2xx/204 and even 3xx (redirect often indicates captive portal, but means HTTP works externally)
                if sc.is_success() || sc.is_redirection() || sc == expected {
                    tracing::debug!("[Netok core] HTTP probe {} succeeded with status {}", url, sc);
                    return true;
                }
            }
            Err(err) => {
                // For debug - one log per target
                tracing::debug!("[Netok core] HTTP probe {} failed: {}", url, err);
                continue;
            }
        }
    }
    false
}

/// Detect connectivity status with layered checks
pub async fn detect_connectivity(
    active_iface_ip: Option<IpAddr>, 
    gateway: Option<IpAddr>
) -> Connectivity {
    use Connectivity::*;
    
    // A) Check if there's an active outgoing IP
    let out_ip = active_iface_ip.or_else(try_outgoing_local_ip);
    if out_ip.is_none() { 
        eprintln!("[Netok core] No active outgoing IP detected");
        return Offline; 
    }

    // B) Check if gateway is reachable (if known)
    if let Some(gw) = gateway {
        eprintln!("[Netok core] Testing gateway connectivity: {}", gw);
        if !tcp_probe_ip(gw, 53).await && !tcp_probe_ip(gw, 80).await {
            eprintln!("[Netok core] Gateway not reachable");
            return NoRouter;
        }
    }

    // C) External connectivity check: DNS first
    eprintln!("[Netok core] Testing DNS connectivity");
    let dns_ok = tcp_probe("1.1.1.1", 53).await || tcp_probe("8.8.8.8", 53).await;
    
    // D) HTTP connectivity check with multiple targets
    let http_ok = if let Some(client) = make_http_client() {
        http_online_probe(&client).await
    } else {
        false
    };

    // Log summary result
    tracing::info!("[Netok core] Connectivity: dns_ok={}, http_ok={}", dns_ok, http_ok);

    // Determine final status
    if dns_ok && http_ok {
        eprintln!("[Netok core] Full connectivity confirmed");
        Online
    } else if dns_ok && !http_ok {
        eprintln!("[Netok core] DNS works but HTTP failed - captive portal or DNS issues");
        CaptiveOrNoDns
    } else {
        eprintln!("[Netok core] Neither DNS nor HTTP working");
        NoRouter
    }
}

/// Get gateway IP (simplified implementation)
pub fn get_gateway() -> Option<IpAddr> {
    // This is a simplified implementation
    // In a real implementation, you'd use platform-specific methods:
    // - Windows: GetIpForwardTable or route print
    // - Linux: /proc/net/route or ip route
    // - macOS: netstat -rn or route -n get default
    
    // For now, return None to skip gateway checks
    // This can be enhanced later with platform-specific implementations
    None
}
