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

pub async fn run_all(_geodata_enabled: Option<bool>) -> Snapshot {
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
