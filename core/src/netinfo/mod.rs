#[allow(unused_imports)]
use std::fs;
#[allow(unused_imports)]
use std::path::Path;
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NetworkKind {
    Wifi,
    Ethernet,
    Other,
}

/// Запуск внешней команды с простым таймаутом. Возвращает stdout как String при успехе.
fn run_with_timeout(cmd: &str, args: &[&str], timeout: Duration) -> Option<String> {
    let mut child = Command::new(cmd)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .ok()?;

    let start = Instant::now();
    loop {
        if let Some(status) = child.try_wait().ok()? {
            if status.success() {
                let mut out = String::new();
                if let Some(mut stdout) = child.stdout.take() {
                    use std::io::Read;
                    let _ = stdout.read_to_string(&mut out);
                }
                return Some(out);
            } else {
                let _ = child.kill();
                return None;
            }
        }
        if start.elapsed() > timeout {
            let _ = child.kill();
            return None;
        }
        std::thread::sleep(Duration::from_millis(20));
    }
}

#[cfg(target_os = "windows")]
pub fn detect_network_kind() -> NetworkKind {
    use windows::Win32::Foundation::ERROR_BUFFER_OVERFLOW;
    use windows::Win32::NetworkManagement::IpHelper::{
        GetAdaptersAddresses, GAA_FLAG_INCLUDE_ALL_INTERFACES, IP_ADAPTER_ADDRESSES_LH,
    };
    use windows::Win32::Networking::WinSock::AF_UNSPEC;

    // 1) Первый вызов — получить нужный размер буфера
    let mut size: u32 = 0;
    unsafe {
        let ret = GetAdaptersAddresses(
            AF_UNSPEC.0 as u32,
            GAA_FLAG_INCLUDE_ALL_INTERFACES,
            None,
            None,
            &mut size,
        );
        if ret != ERROR_BUFFER_OVERFLOW.0 {
            return NetworkKind::Other;
        }
    }

    // 2) Выделяем буфер и читаем список адаптеров
    let mut buf: Vec<u8> = vec![0u8; size as usize];
    let p_addrs = buf.as_mut_ptr() as *mut IP_ADAPTER_ADDRESSES_LH;
    let ret = unsafe {
        GetAdaptersAddresses(
            AF_UNSPEC.0 as u32,
            GAA_FLAG_INCLUDE_ALL_INTERFACES,
            None,
            Some(p_addrs),
            &mut size,
        )
    };
    if ret != 0 {
        return NetworkKind::Other;
    }

    // 3) Идем по списку и берём первый "активный" (есть Unicast адреса) интерфейс подходящего типа
    let mut cur = p_addrs;
    while !cur.is_null() {
        let a = unsafe { &*cur };

        // Активность по простому признаку: есть хотя бы один unicast адрес
        let has_unicast = !a.FirstUnicastAddress.is_null();
        if has_unicast {
            match a.IfType {
                71 => return NetworkKind::Wifi,    // IF_TYPE_IEEE80211
                6 => return NetworkKind::Ethernet, // IF_TYPE_ETHERNET_CSMACD
                _ => { /* смотрим дальше */ }
            }
        }
        cur = a.Next;
    }

    NetworkKind::Other
}

#[cfg(not(target_os = "windows"))]
pub fn detect_network_kind() -> NetworkKind {
    use std::collections::HashSet;
    // Активные интерфейсы: есть IP и не loopback
    let mut active_names: Vec<String> = Vec::new();
    if let Ok(ifaces) = get_if_addrs::get_if_addrs() {
        let mut seen: HashSet<String> = HashSet::new();
        for ifaddr in ifaces {
            // 1) сначала берём всё, что читаем методами/ссылками
            let ip = ifaddr.ip();
            let name: &str = ifaddr.name.as_str();

            if seen.contains(name) {
                continue;
            }
            // Отфильтруем loopback по адресу
            let is_loop = match ip {
                std::net::IpAddr::V4(v4) => v4.is_loopback(),
                std::net::IpAddr::V6(v6) => v6.is_loopback(),
            };
            if is_loop {
                continue;
            }
            seen.insert(name.to_string());
            active_names.push(name.to_string());
        }
    }

    // Эвристики по именам/подстрокам
    for name in &active_names {
        let lower = name.to_lowercase();
        // Windows имена: "Wi-Fi", "WLAN", "Wireless", "Беспроводная сеть"
        if lower.contains("wi-fi")
            || lower.contains("wifi")
            || lower.contains("wlan")
            || lower.contains("wireless")
            || lower.contains("беспровод")
        {
            return NetworkKind::Wifi;
        }
    }

    // Unix-префиксы имен интерфейсов
    for name in &active_names {
        let lower = name.to_lowercase();
        if lower.starts_with("wl") || lower.starts_with("wlan") || lower.starts_with("wifi") {
            return NetworkKind::Wifi;
        }
    }

    for name in &active_names {
        let lower = name.to_lowercase();
        if lower.contains("ethernet")
            || lower.starts_with("en")
            || lower.starts_with("eth")
            || lower.contains("realtek")
            || lower.contains("intel")
        {
            return NetworkKind::Ethernet;
        }
    }

    if !active_names.is_empty() {
        NetworkKind::Other
    } else {
        // Если ничего активного не найдено — по умолчанию Other
        NetworkKind::Other
    }
}

/// Returns current Wi‑Fi RSSI in dBm (signed).
///
/// The value is taken as-is from the platform (negative dBm).
/// If the platform does not provide RSSI, returns `None`.
pub fn wifi_signal_dbm() -> Option<i32> {
    #[cfg(target_os = "windows")]
    {
        // netsh wlan show interfaces → "Signal             : 88%"
        let out = run_with_timeout(
            "netsh",
            &["wlan", "show", "interfaces"],
            Duration::from_millis(800),
        )?;
        for line in out.lines() {
            let l = line.trim();
            if l.to_lowercase().starts_with("signal") {
                if let Some(percent_str) = l.split(':').nth(1) {
                    let percent_str = percent_str.trim().trim_end_matches('%').trim();
                    if let Ok(p) = percent_str.parse::<i32>() {
                        // Грубая оценка: dBm ≈ (quality/2) - 100
                        return Some((p / 2) - 100);
                    }
                }
            }
        }
        return None;
    }
    #[cfg(target_os = "linux")]
    {
        // Попробуем /proc/net/wireless
        if let Ok(text) = fs::read_to_string("/proc/net/wireless") {
            // Формат: iface: status link level noise
            for line in text.lines().skip(2) {
                if let Some(colon) = line.find(':') {
                    let rest = &line[colon + 1..];
                    let parts: Vec<&str> = rest.split_whitespace().collect();
                    if parts.len() >= 3 {
                        // level вроде как третий столбец, как число с точкой
                        let level_str = parts[2].trim_end_matches('.');
                        if let Ok(level) = level_str.parse::<f32>() {
                            let dbm = level.round() as i32;
                            // Обычно level уже отрицательный dBm
                            return Some(dbm);
                        }
                    }
                }
            }
        }
        // fallback: iwconfig
        if let Some(out) = run_with_timeout("iwconfig", &[], Duration::from_millis(800)) {
            for line in out.lines() {
                let l = line.trim();
                if l.contains("Signal level=") {
                    // Ищем `Signal level=-48 dBm` или `Signal level=-48`
                    if let Some(pos) = l.find("Signal level=") {
                        let v = &l[pos + 13..];
                        let v = v.split_whitespace().next().unwrap_or("");
                        if let Ok(dbm) = v.parse::<i32>() {
                            return Some(dbm);
                        }
                    }
                }
            }
        }
        // fallback: nmcli -f IN-USE,SIGNAL dev wifi
        if let Some(out) = run_with_timeout(
            "nmcli",
            &["-f", "IN-USE,SIGNAL", "dev", "wifi"],
            Duration::from_millis(800),
        ) {
            // Найдем активную строку с '*' и возьмем сигнал (%) → конвертируем
            for line in out.lines() {
                if line.contains('*') {
                    let parts: Vec<&str> = line.split_whitespace().collect();
                    if let Some(sig_str) = parts.last() {
                        if let Ok(p) = sig_str.parse::<i32>() {
                            return Some((p / 2) - 100);
                        }
                    }
                }
            }
        }
        return None;
    }
    #[cfg(target_os = "macos")]
    {
        let airport = "/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport";
        if Path::new(airport).exists() {
            if let Some(out) = run_with_timeout(airport, &["-I"], Duration::from_millis(800)) {
                for line in out.lines() {
                    let l = line.trim();
                    if l.starts_with("agrCtlRSSI:") {
                        if let Some(v) = l.split(':').nth(1) {
                            if let Ok(dbm) = v.trim().parse::<i32>() {
                                return Some(dbm);
                            }
                        }
                    }
                }
            }
        }
        return None;
    }
    #[allow(unreachable_code)]
    {
        None
    }
}

pub fn wifi_quality_label(dbm: i32) -> &'static str {
    if dbm >= -50 {
        "отличный"
    } else if dbm >= -60 {
        "хороший"
    } else if dbm >= -70 {
        "средний"
    } else {
        "слабый"
    }
}

pub fn ethernet_link_status() -> Option<String> {
    #[cfg(target_os = "linux")]
    {
        // Найдем первый активный не-WiFi интерфейс и прочтем speed
        let ifaces = get_if_addrs::get_if_addrs().ok()?;
        let mut names: Vec<String> = Vec::new();
        for ifaddr in ifaces {
            // 1) сначала берём всё, что читаем методами/ссылками
            let ip = ifaddr.ip();
            let name: &str = ifaddr.name.as_str();

            let is_loop = match ip {
                std::net::IpAddr::V4(v4) => v4.is_loopback(),
                std::net::IpAddr::V6(v6) => v6.is_loopback(),
            };
            if is_loop {
                continue;
            }
            let lower = name.to_lowercase();
            let is_wifi =
                lower.starts_with("wl") || lower.starts_with("wlan") || lower.starts_with("wifi");
            if !is_wifi {
                names.push(name.to_string());
            }
        }
        names.sort();
        names.dedup();
        for name in names {
            let path = format!("/sys/class/net/{}/speed", name);
            if let Ok(text) = fs::read_to_string(&path) {
                if let Ok(mbps) = text.trim().parse::<i32>() {
                    if mbps >= 1000 {
                        return Some("1 Gbps".to_string());
                    }
                    if mbps > 0 {
                        return Some(format!("{} Mbps", mbps));
                    }
                }
            }
        }
        // если не удалось – просто активен
        return Some("активен".into());
    }
    #[cfg(target_os = "windows")]
    {
        // wmic nic where (NetEnabled=true) get Name,Speed
        if let Some(out) = run_with_timeout(
            "wmic",
            &[
                "nic",
                "where",
                "(NetEnabled=true)",
                "get",
                "Name,Speed",
                "/FORMAT:CSV",
            ],
            Duration::from_millis(1000),
        ) {
            // Ищем максимальную скорость
            let mut best: Option<u128> = None;
            for line in out.lines() {
                let l = line.trim();
                if l.is_empty() || l.starts_with("Node,") {
                    continue;
                }
                let parts: Vec<&str> = l.split(',').collect();
                if parts.len() >= 3 {
                    let speed_str = parts.last().unwrap().trim();
                    if let Ok(val) = speed_str.parse::<u128>() {
                        best = Some(best.map_or(val, |b| b.max(val)));
                    }
                }
            }
            if let Some(bps) = best {
                // сопоставим в удобную строку
                if bps >= 1_000_000_000 {
                    return Some("1 Gbps".into());
                }
                if bps >= 100_000_000 {
                    return Some("100 Mbps".into());
                }
                return Some("активен".into());
            }
        }
        return Some("активен".into());
    }
    #[cfg(target_os = "macos")]
    {
        return Some("активен".into());
    }
    #[allow(unreachable_code)]
    {
        None
    }
}

pub fn wifi_ssid() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        if let Some(out) = run_with_timeout(
            "netsh",
            &["wlan", "show", "interfaces"],
            Duration::from_millis(800),
        ) {
            for line in out.lines() {
                let l = line.trim();
                let lower = l.to_lowercase();
                // Пропускаем BSSID
                if lower.starts_with("bssid") {
                    continue;
                }
                if lower.starts_with("ssid") {
                    if let Some(val) = l.split(':').nth(1) {
                        let ssid = val.trim().to_string();
                        if !ssid.is_empty() {
                            return Some(ssid);
                        }
                    }
                }
            }
        }
        return None;
    }
    #[allow(unreachable_code)]
    {
        None
    }
}

pub fn adapter_description() -> Option<String> {
    #[cfg(target_os = "windows")]
    {
        // Попробуем получить описание из netsh (локализованное поле "Описание" или английское "Description")
        if let Some(out) = run_with_timeout(
            "netsh",
            &["wlan", "show", "interfaces"],
            Duration::from_millis(800),
        ) {
            for line in out.lines() {
                let l = line.trim();
                let lower = l.to_lowercase();
                if lower.starts_with("описание") || lower.starts_with("description") {
                    if let Some(val) = l.split(':').nth(1) {
                        let desc = val.trim().to_string();
                        if !desc.is_empty() {
                            return Some(desc);
                        }
                    }
                }
            }
        }
        // Fallback: wmic nic where (NetEnabled=true) get Name /VALUE
        if let Some(out) = run_with_timeout(
            "wmic",
            &["nic", "where", "(NetEnabled=true)", "get", "Name", "/VALUE"],
            Duration::from_millis(1000),
        ) {
            for line in out.lines() {
                let l = line.trim();
                if l.to_lowercase().starts_with("name=") {
                    let desc = l[5..].trim().to_string();
                    if !desc.is_empty() {
                        return Some(desc);
                    }
                }
            }
        }
        return None;
    }
    #[allow(unreachable_code)]
    {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::wifi_quality_label;

    #[test]
    fn quality_map() {
        assert_eq!(wifi_quality_label(-45), "отличный");
        assert_eq!(wifi_quality_label(-55), "хороший");
        assert_eq!(wifi_quality_label(-65), "средний");
        assert_eq!(wifi_quality_label(-75), "слабый");
    }
}
