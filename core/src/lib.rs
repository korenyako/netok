//! Публичное API ядра Netok

#[derive(Debug, Clone)]
pub struct Snapshot {
    pub nodes: Vec<Node>,
    pub internet_speed: Option<(u32, u32)>, // (down_mbps, up_mbps)
    pub vpn_detected: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Overall { Ok, DnsProblem, NoGateway, ProviderIssue }

#[derive(Debug, Clone)]
pub struct TopBanner {
    pub overall: Overall,
    pub speed: Option<(u32,u32)>,
    pub vpn: Option<(String, Option<String>)>, // country_flag, city
}

pub fn compose_top_banner(s: &Snapshot) -> TopBanner {
    // Эвристики на основе текущих статусов узлов
    let router_status = s
        .nodes
        .iter()
        .find(|n| matches!(n.kind, NodeKind::Router))
        .map(|n| n.status)
        .unwrap_or(Status::Unknown);
    let internet_status = s
        .nodes
        .iter()
        .find(|n| matches!(n.kind, NodeKind::Internet))
        .map(|n| n.status)
        .unwrap_or(Status::Unknown);

    let overall = if matches!(router_status, Status::Bad) {
        Overall::NoGateway
    } else if matches!(internet_status, Status::Partial) {
        Overall::DnsProblem
    } else if matches!(internet_status, Status::Bad | Status::Unknown) {
        Overall::ProviderIssue
    } else {
        Overall::Ok
    };

    let speed = s.internet_speed;
    let vpn = if s.vpn_detected {
        Some(("🇳🇱".to_string(), Some("Амстердам".to_string())))
    } else {
        None
    };

    TopBanner { overall, speed, vpn }
}

#[derive(Debug, Clone)]
pub struct Node {
    pub kind: NodeKind,
    pub status: Status,
    pub facts: Vec<(String, String)>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeKind {
    Computer,
    Network,
    Router,
    Internet,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Good,
    Bad,
    Partial,
    Unknown,
}

#[derive(Debug, Clone)]
pub enum DnsMode { 
    Auto, 
    Cloudflare, 
    Google, 
    Custom(String) 
}

pub mod dns {
    use super::DnsMode;
    pub async fn set(_mode: DnsMode) -> Result<(), String> { Ok(()) }
    pub async fn flush() -> Result<(), String> { Ok(()) }
}

pub mod tools {
    pub async fn short_speedtest() -> Result<(u32,u32), String> { Ok((73,18)) }
    pub async fn open_captive() -> Result<(), String> { Ok(()) }
    pub async fn open_router() -> Result<String, String> {
        // Заглушка: вернуть дефолтный шлюз
        Ok("192.168.1.1".to_string())
    }
    pub async fn copy_report() -> Result<String, String> { Ok("Диагностика скопирована".into()) }
}

/// Async version that runs network checks in parallel with per-adapter timeouts
pub async fn run_all_with_timeouts(geodata_enabled: Option<bool>) -> Snapshot {
    use std::time::Duration;
    
    // Create futures for each adapter type with specific timeouts
    let wifi_future = tokio::time::timeout(
        Duration::from_millis(1500),
        tokio::task::spawn_blocking(wifi_adapter_info)
    );
    
    let computer_future = tokio::time::timeout(
        Duration::from_millis(500), // Quick operation
        tokio::task::spawn_blocking(computer_adapter_info)
    );
    
    let upnp_future = tokio::time::timeout(
        Duration::from_millis(1000),
        tokio::task::spawn_blocking(upnp_adapter_info)
    );
    
    let dns_future = tokio::time::timeout(
        Duration::from_millis(1000),
        tokio::task::spawn_blocking(dns_adapter_info)
    );
    
    let internet_meta_future = tokio::time::timeout(
        Duration::from_millis(1500),
        tokio::task::spawn_blocking(move || internet_meta_adapter_info(geodata_enabled))
    );
    
    // Run all adapters in parallel
    let (wifi_result, computer_result, upnp_result, dns_result, internet_result) = tokio::join!(
        wifi_future,
        computer_future, 
        upnp_future,
        dns_future,
        internet_meta_future
    );
    
    // Process results, handling timeouts gracefully
    let mut nodes = Vec::new();
    
    // Computer node (always first)
    let computer_node = match computer_result {
        Ok(Ok(node)) => node,
        _ => Node {
            kind: NodeKind::Computer,
            status: Status::Unknown,
            facts: vec![("Error".to_string(), "Timeout or failed".to_string())],
        }
    };
    nodes.push(computer_node);
    
    // Network node (WiFi/Ethernet) - merge with DNS results
    let mut network_node = match wifi_result {
        Ok(Ok(node)) => node,
        _ => Node {
            kind: NodeKind::Network,
            status: Status::Unknown,
            facts: vec![("Type".to_string(), "Unknown".to_string())],
        }
    };
    
    // Determine if DNS works for later use
    let dns_working = matches!(&dns_result, Ok(Ok(dns_node)) if dns_node.status == Status::Good);
    
    // Add DNS status to network node
    match dns_result {
        Ok(Ok(dns_node)) => {
            // Merge DNS facts into network node
            network_node.facts.extend(dns_node.facts);
            // Update status based on DNS result
            if network_node.status == Status::Good && dns_node.status != Status::Good {
                network_node.status = Status::Partial;
            }
        }
        _ => {
            network_node.facts.push(("DNS".to_string(), "Timeout".to_string()));
            if network_node.status == Status::Good {
                network_node.status = Status::Partial;
            }
        }
    }
    nodes.push(network_node);
    
    // Router node (UPnP)
    let router_node = match upnp_result {
        Ok(Ok(node)) => node,
        _ => Node {
            kind: NodeKind::Router,
            status: Status::Unknown,
            facts: vec![("Gateway".to_string(), "Unknown".to_string())],
        }
    };
    nodes.push(router_node);
    
    // Internet node
    let internet_node = match internet_result {
        Ok(Ok(node)) => node,
        _ => Node {
            kind: NodeKind::Internet,
            status: Status::Unknown,
            facts: vec![("Public IP".to_string(), "Unknown".to_string())],
        }
    };
    nodes.push(internet_node);
    
    // Determine internet speed (simplified for now)
    let internet_speed = if dns_working {
        Some((100, 50)) // Mock speed if DNS works
    } else {
        None
    };
    
    Snapshot {
        nodes,
        internet_speed,
        vpn_detected: false,
    }
}

/// Original blocking implementation moved to separate function
pub fn run_all_blocking(_geodata_enabled: Option<bool>) -> Snapshot {
    // geodata_enabled пока игнорируется
    let mut nodes: Vec<Node> = Vec::new();

    // Узел Компьютер (как было)
    nodes.push(Node {
        kind: NodeKind::Computer,
        status: Status::Good,
        facts: vec![("OS".into(), std::env::consts::OS.into())],
    });

    // Узел Сеть
    let mut network_facts: Vec<(String, String)> = Vec::new();
    {
        use crate::netinfo::{detect_network_kind, wifi_signal_dbm, wifi_quality_label, ethernet_link_status, wifi_ssid, NetworkKind};
        match detect_network_kind() {
            NetworkKind::Wifi => {
                if let Some(dbm) = wifi_signal_dbm() {
                    let label = wifi_quality_label(dbm);
                    network_facts.push(("Сигнал".to_string(), format!("{label} ({dbm} dBm)")));
                } else {
                    network_facts.push(("Тип".to_string(), "Wi-Fi".to_string()));
                }
                if let Some(ssid) = wifi_ssid() {
                    network_facts.push(("SSID".to_string(), ssid));
                }
            }
            NetworkKind::Ethernet => {
                if let Some(link) = ethernet_link_status() {
                    network_facts.push(("Линк".to_string(), link));
                } else {
                    network_facts.push(("Тип".to_string(), "кабель".to_string()));
                }
            }
            NetworkKind::Other => {
                network_facts.push(("Тип".to_string(), "другое".to_string()));
            }
        }
    }
    nodes.push(Node { kind: NodeKind::Network, status: Status::Good, facts: network_facts });

    // Узел Компьютер — добавим сетевой адаптер
    if let Some(desc) = crate::netinfo::adapter_description() {
        if let Some(node) = nodes.iter_mut().find(|n| matches!(n.kind, NodeKind::Computer)) {
            node.facts.push(("Сетевой адаптер".into(), desc));
        }
    }

    // Остальные узлы оставляем заглушками как были
    nodes.push(Node {
        kind: NodeKind::Router,
        status: Status::Unknown,
        facts: vec![("Gateway".into(), "192.168.1.1".into())],
    });
    nodes.push(Node {
        kind: NodeKind::Internet,
        status: Status::Good,
        facts: vec![("Public IP".into(), "203.0.113.10".into())],
    });

    Snapshot {
        nodes,
        internet_speed: Some((100, 50)),
        vpn_detected: false,
    }
}

/// Individual adapter functions for parallel execution

/// WiFi adapter info - detects WiFi networks and signal strength
fn wifi_adapter_info() -> Node {
    use crate::netinfo::{detect_network_kind, wifi_signal_dbm, wifi_quality_label, ethernet_link_status, wifi_ssid, NetworkKind};
    
    let mut network_facts: Vec<(String, String)> = Vec::new();
    let status;
    
    match detect_network_kind() {
        NetworkKind::Wifi => {
            status = Status::Good;
            if let Some(dbm) = wifi_signal_dbm() {
                let label = wifi_quality_label(dbm);
                network_facts.push(("Сигнал".to_string(), format!("{label} ({dbm} dBm)")));
            } else {
                network_facts.push(("Тип".to_string(), "Wi-Fi".to_string()));
            }
            if let Some(ssid) = wifi_ssid() {
                network_facts.push(("SSID".to_string(), ssid));
            }
        }
        NetworkKind::Ethernet => {
            status = Status::Good;
            if let Some(link) = ethernet_link_status() {
                network_facts.push(("Линк".to_string(), link));
            } else {
                network_facts.push(("Тип".to_string(), "кабель".to_string()));
            }
        }
        NetworkKind::Other => {
            status = Status::Partial;
            network_facts.push(("Тип".to_string(), "другое".to_string()));
        }
    }
    
    Node { 
        kind: NodeKind::Network, 
        status, 
        facts: network_facts 
    }
}

/// Computer adapter info - gets basic computer information
fn computer_adapter_info() -> Node {
    let mut facts = vec![("OS".to_string(), std::env::consts::OS.to_string())];
    
    // Add network adapter description if available
    if let Some(desc) = crate::netinfo::adapter_description() {
        facts.push(("Сетевой адаптер".to_string(), desc));
    }
    
    Node {
        kind: NodeKind::Computer,
        status: Status::Good,
        facts,
    }
}

/// UPnP adapter info - discovers router information
fn upnp_adapter_info() -> Node {
    // TODO: Implement actual UPnP discovery with timeout
    // For now, simulate router discovery with a simple gateway detection
    
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        
        // Try to get default gateway
        if let Ok(output) = Command::new("ipconfig")
            .args(&["/all"])
            .output() 
        {
            if let Ok(text) = String::from_utf8(output.stdout) {
                for line in text.lines() {
                    if line.contains("Default Gateway") || line.contains("Основной шлюз") {
                        if let Some(ip) = extract_ip_from_line(line) {
                            return Node {
                                kind: NodeKind::Router,
                                status: Status::Good,
                                facts: vec![("Gateway".to_string(), ip)],
                            };
                        }
                    }
                }
            }
        }
    }
    
    // Fallback
    Node {
        kind: NodeKind::Router,
        status: Status::Unknown,
        facts: vec![("Gateway".to_string(), "192.168.1.1".to_string())],
    }
}

/// DNS adapter info - tests DNS resolution
fn dns_adapter_info() -> Node {
    use std::net::ToSocketAddrs;
    
    // Test DNS resolution with a simple domain
    let dns_works = std::thread::spawn(|| {
        // Try to resolve a common domain
        "google.com:80".to_socket_addrs().is_ok()
    }).join().unwrap_or(false);
    
    // Return a temporary node that will be merged into the network node
    Node {
        kind: NodeKind::Network,
        status: if dns_works { Status::Good } else { Status::Partial },
        facts: vec![("DNS".to_string(), if dns_works { "Working".to_string() } else { "Failed".to_string() })],
    }
}

/// Internet metadata adapter - gets public IP and geolocation info
fn internet_meta_adapter_info(geodata_enabled: Option<bool>) -> Node {
    // TODO: Implement actual HTTP request to get public IP
    // For now, return mock data
    
    let mut facts = vec![("Public IP".to_string(), "203.0.113.10".to_string())];
    
    if geodata_enabled.unwrap_or(false) {
        facts.push(("Country".to_string(), "Unknown".to_string()));
        facts.push(("City".to_string(), "Unknown".to_string()));
    }
    
    Node {
        kind: NodeKind::Internet,
        status: Status::Good,
        facts,
    }
}

/// Helper function to extract IP address from text line
fn extract_ip_from_line(line: &str) -> Option<String> {
    // Simple regex-like extraction for IP addresses
    let parts: Vec<&str> = line.split_whitespace().collect();
    for part in parts {
        if part.matches('.').count() == 3 {
            // Basic IP validation
            let octets: Vec<&str> = part.split('.').collect();
            if octets.len() == 4 && octets.iter().all(|s| s.parse::<u8>().is_ok()) {
                return Some(part.to_string());
            }
        }
    }
    None
}

/// Legacy async function - now delegates to the new timeout-aware version
pub async fn run_all(geodata_enabled: Option<bool>) -> Snapshot {
    run_all_with_timeouts(geodata_enabled).await
}

// Заглушечные модули (пока не используются)
pub mod diag {
    // ping/http/dns/gateway – заглушки
}

pub mod netinfo;

pub mod speedtest {
    // короткий тест – заглушка
}

pub mod geo {
    // публичный IP (+опц. гео) – заглушка
}

pub mod report {
    // «Скопировать диагностику» – заглушка
}
