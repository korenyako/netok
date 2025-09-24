use chrono::Utc;
use reqwest::{Client, StatusCode};
use serde::Deserialize;
use std::time::Duration;

#[derive(Deserialize)]
struct IpifyResp { 
    ip: String 
}

#[derive(Deserialize)]
struct IpinfoResp {
    #[allow(dead_code)]
    ip: Option<String>,
    org: Option<String>,     // ISP/ASN, например "AS1234 Vodafone"
    city: Option<String>,
    country: Option<String>, // двухбуквенный код или название
}

pub async fn collect_internet(geo_enabled: bool) -> crate::InternetNode {
    let client = Client::builder()
        .use_rustls_tls()
        .timeout(Duration::from_secs(3))
        .build()
        .ok();

    // 1) Публичный IP
    let mut public_ip: Option<String> = None;
    let mut provider = None;

    if let Some(c) = &client {
        // Try ipify.org first
        if let Ok(resp) = c.get("https://api.ipify.org?format=json").send().await {
            if resp.status() == StatusCode::OK {
                if let Ok(parsed) = resp.json::<IpifyResp>().await {
                    public_ip = Some(parsed.ip);
                    provider = Some("ipify".to_string());
                }
            }
        }
        
        // fallback icanhazip.com (plaintext)
        if public_ip.is_none() {
            if let Ok(resp) = c.get("https://icanhazip.com").send().await {
                if resp.status() == StatusCode::OK {
                    if let Ok(text) = resp.text().await {
                        let ip = text.trim().to_string();
                        if !ip.is_empty() {
                            public_ip = Some(ip);
                            provider = Some("icanhazip".to_string());
                        }
                    }
                }
            }
        }
    }

    // 2) Гео/оператор (по согласию)
    let mut operator = None;
    let mut city = None;
    let mut country = None;

    if geo_enabled {
        if let (Some(c), Some(ip)) = (&client, &public_ip) {
            // ipinfo
            let url = format!("https://ipinfo.io/{ip}/json");
            if let Ok(resp) = c.get(url).send().await {
                if resp.status() == StatusCode::OK {
                    if let Ok(meta) = resp.json::<IpinfoResp>().await {
                        operator = meta.org;
                        city = meta.city;
                        country = meta.country;
                        if provider.is_none() { 
                            provider = Some("ipinfo".to_string()); 
                        }
                    }
                }
            }
        }
    }

    crate::InternetNode {
        reachable: public_ip.is_some(),
        public_ip,
        operator,
        city,
        country,
        provider,
        timestamp: Utc::now(),
    }
}
