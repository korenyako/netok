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
    org: Option<String>,     // "AS1234 Vodafone ..."
    city: Option<String>,
    country: Option<String>, // "IT" или полное имя
}

#[derive(Deserialize)]
struct IpapiResp {
    #[allow(dead_code)]
    ip: Option<String>,
    org: Option<String>,     // иногда пусто
    asn: Option<String>,     // "AS1234"
    city: Option<String>,
    country_name: Option<String>,
}

pub async fn collect_internet(geo_enabled: bool) -> crate::InternetNode {
    let client = Client::builder()
        .use_rustls_tls()
        .timeout(Duration::from_secs(3))
        .build()
        .ok();

    let mut provider: Option<String> = None;
    let mut public_ip: Option<String> = None;

    if let Some(c) = &client {
        // 1) публичный IP
        if let Ok(r) = c.get("https://api.ipify.org?format=json").send().await {
            if r.status() == StatusCode::OK {
                if let Ok(p) = r.json::<IpifyResp>().await {
                    public_ip = Some(p.ip);
                    provider = Some("ipify".into());
                }
            }
        }
        if public_ip.is_none() {
            if let Ok(r) = c.get("https://icanhazip.com").send().await {
                if r.status() == StatusCode::OK {
                    if let Ok(t) = r.text().await {
                        let ip = t.trim();
                        if !ip.is_empty() {
                            public_ip = Some(ip.to_string());
                            provider.get_or_insert("icanhazip".into());
                        }
                    }
                }
            }
        }
    }

    // 2) метаданные
    let (mut operator, mut city, mut country) = (None, None, None);
    if let (Some(c), Some(ip)) = (&client, &public_ip) {
        // ipinfo сначала
        if let Ok(r) = c.get(format!("https://ipinfo.io/{ip}/json")).send().await {
            if r.status() == StatusCode::OK {
                if let Ok(meta) = r.json::<IpinfoResp>().await {
                    operator = meta.org;
                    if geo_enabled {
                        city = meta.city;
                        country = meta.country;
                    }
                    if operator.is_some() || city.is_some() || country.is_some() {
                        provider.get_or_insert("ipinfo".into());
                    }
                }
            }
        }
        // fallback ipapi
        if operator.is_none() && (geo_enabled && (city.is_none() || country.is_none())) {
            if let Ok(r) = c.get(format!("https://ipapi.co/{ip}/json")).send().await {
                if r.status() == StatusCode::OK {
                    if let Ok(meta) = r.json::<IpapiResp>().await {
                        // попытка собрать operator
                        if meta.org.is_some() {
                            operator = meta.org;
                        } else if let Some(asn) = meta.asn {
                            operator = Some(asn);
                        }
                        if geo_enabled {
                            if city.is_none() { city = meta.city; }
                            if country.is_none() { country = meta.country_name; }
                        }
                        if operator.is_some() || city.is_some() || country.is_some() {
                            provider.get_or_insert("ipapi".into());
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
