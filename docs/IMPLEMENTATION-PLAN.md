# Netok — Implementation Plan (Network Diagnostics)

**Версия:** v1.0
**Дата:** 2025-11-13
**Статус:** Draft → Review → Accepted

---

## Общая логика

Netok строит **цепочку соединения** из четырёх узлов:

```
Компьютер → Сеть → Роутер → Интернет
```

Для каждого узла собираются данные из системных источников.
**Принцип:** Core всё делает локально — никакого своего сервера.

---

## 1. Компьютер (Computer Node)

### Что определяем:

| Параметр | Описание | Приоритет |
|----------|----------|-----------|
| **Hostname** | Имя хоста | MVP |
| **Local IP** | Локальный IP в LAN (первый приватный IPv4) | MVP |
| **Active Adapter** | Имя активного сетевого адаптера | MVP |
| **Adapter Model** | Модель адаптера (например "Realtek 8822CE") | Post-MVP |
| **Device Model** | Модель устройства (например "Dell OptiPlex 7090") | Post-MVP |
| **Connection Type** | wifi / ethernet / usb / mobile | MVP |

### Как определяется:

| ОС | Метод | Статус |
|----|-------|--------|
| **Windows** | `WinAPI` (GetAdaptersAddresses, GetIfEntry2) | ✅ Частично (hostname, local_ip, adapter name) |
| **Linux** | `/sys/class/net/*` + `ip addr show` | ✅ Частично (через get_if_addrs) |
| **macOS** | `ifconfig` + SystemConfiguration | ✅ Частично (через get_if_addrs) |

### Текущая реализация:
- ✅ [netok_core/src/lib.rs:61-98](netok_core/src/lib.rs#L61-L98) - `get_computer_info()`
- ✅ Получает: hostname, adapter name, local_ip
- ❌ TODO: Connection Type, Adapter Model, Device Model

---

## 2. Сеть (Network Node)

### Что определяем:

| Параметр | Описание | Приоритет |
|----------|----------|-----------|
| **Type** | Wi-Fi / Ethernet / USB / Mobile | MVP |
| **SSID** | Имя Wi-Fi сети (только для Wi-Fi) | MVP |
| **RSSI** | Уровень сигнала в dBm (только для Wi-Fi) | MVP |
| **Signal Quality** | Оценка: отличный/хороший/средний/слабый | MVP |
| **Channel** | Канал Wi-Fi (например 6, 36) | Post-MVP |
| **Frequency** | Частота: 2.4 GHz / 5 GHz | Post-MVP |
| **Link Speed** | Скорость соединения (Mbps) | Post-MVP |

### Как определяется:

| ОС | Метод | Статус |
|----|-------|--------|
| **Windows** | `WlanAPI` (WlanGetAvailableNetworkList, WlanQueryInterface) | ❌ TODO |
| **Linux** | `iw dev <iface> link` или `nmcli dev wifi list` | ❌ TODO |
| **macOS** | `/System/Library/PrivateFrameworks/Apple80211.framework` или `airport -I` | ❌ TODO |

### Signal Quality mapping:

```
RSSI (dBm)    | Quality
--------------|----------
>= -50        | Отличный
-50 до -60    | Хороший
-60 до -70    | Средний
< -70         | Слабый
```

---

## 3. Роутер (Router Node)

### Что определяем:

| Параметр | Описание | Приоритет |
|----------|----------|-----------|
| **Gateway IP** | IP шлюза (например 192.168.1.1) | MVP |
| **Gateway MAC** | MAC-адрес шлюза | MVP |
| **Vendor** | Производитель по OUI (например "TP-Link") | MVP |
| **Model** | Модель роутера (через UPnP/SNMP) | Post-MVP |
| **Firmware** | Версия прошивки | Post-MVP |

### Как определяется:

| ОС | Метод для Gateway IP | Метод для MAC |
|----|---------------------|---------------|
| **Windows** | `GetIpForwardTable2` или `route print` | `GetIpNetTable2` или `arp -a` |
| **Linux** | `ip route` или `netstat -rn` | `arp -n` или `/proc/net/arp` |
| **macOS** | `netstat -rn` | `arp -n` |

### OUI Lookup:

- **Источник:** Локальная база `assets/oui.csv` (скачать с IEEE)
- **Формат:** `MAC_PREFIX,Vendor_Name`
- **Пример:** `00:1A:2B,TP-Link Technologies Co Ltd`
- **Update:** Периодическое обновление через CI/CD

---

## 4. Интернет (Internet Node)

### Что определяем:

| Параметр | Описание | Приоритет |
|----------|----------|-----------|
| **Public IP** | Публичный IP адрес | MVP |
| **ISP** | Интернет-провайдер (ASN org) | MVP |
| **Country** | Страна | MVP |
| **City** | Город | MVP |
| **DNS Connectivity** | Проверка резолва DNS | MVP |
| **HTTP Connectivity** | Проверка доступности HTTP | MVP |
| **Latency** | Пинг до внешнего сервера | Post-MVP |
| **Download Speed** | Скорость загрузки (Mbps) | Post-MVP |
| **Upload Speed** | Скорость отдачи (Mbps) | Post-MVP |
| **VPN Detection** | Определение VPN/Proxy | Post-MVP |

### Как определяется:

#### Public IP + Geo:

| API | Endpoint | Возвращает | Приоритет |
|-----|----------|------------|-----------|
| **ipify** | `https://api.ipify.org?format=json` | IP only | Primary |
| **ipinfo.io** | `https://ipinfo.io/json` | IP, ASN, city, country, org | Primary |
| **ipapi.co** | `https://ipapi.co/json/` | IP, ASN, city, country | Fallback 1 |
| **ipwhois.io** | `https://ipwhois.app/json/` | IP, ASN, city, country | Fallback 2 |

**Стратегия fallback:**
1. Попытка ipinfo.io (один запрос → все данные)
2. Если ошибка → ipapi.co
3. Если ошибка → ipwhois.io
4. Если все упали → только IP через ipify

#### DNS Test:

```rust
// Резолв известного домена
resolve("one.one.one.one") -> Ok/Fail
resolve("dns.google") -> Ok/Fail (fallback)
```

#### HTTP Test:

```rust
// GET запрос к стабильному endpoint
GET https://www.cloudflare.com/cdn-cgi/trace -> Ok/Fail
GET https://example.com -> Ok/Fail (fallback)
```

#### Speed Test (Post-MVP):

| Сервис | Метод | Примечание |
|--------|-------|------------|
| **M-Lab** | NDT7 protocol | Open source, рекомендуется Google |
| **Cloudflare** | `https://speed.cloudflare.com/__down` | Простой HTTP download |
| **fast.com** | Netflix CDN API | Backup |

---

## Проверки соединений (Connectivity Tests)

### DNS Test:
- **Метод:** Резолв `one.one.one.one` (Cloudflare)
- **Fallback:** Резолв `dns.google` (Google)
- **Timeout:** 2 секунды
- **Статус:** Ok / Warn / Fail

### HTTP Test:
- **Метод:** `GET https://www.cloudflare.com/cdn-cgi/trace`
- **Fallback:** `GET https://example.com`
- **Timeout:** 3 секунды
- **Статус:** Ok / Warn / Fail

### VPN Detection (Post-MVP):
- Сравнение публичного IP с IP гео-положения
- DNS leak проверка (резолв через разные DNS серверы)
- Проверка HTTP headers (X-Forwarded-For)

---

## Таймауты и NFR

Из [docs/SoT-ARCH.md](SoT-ARCH.md):

| Операция | Таймаут | Примечание |
|----------|---------|------------|
| **Весь тест** | 1.5s (типично), до `test_timeout_ms` (жёсткий) | Настраиваемо |
| **DNS query** | 2s | |
| **HTTP request** | 3s | |
| **ARP lookup** | 1s | |
| **Speed test** | 10s | Post-MVP |

---

## Структура данных

### DiagnosticsSnapshot (финальная версия):

```rust
pub struct DiagnosticsSnapshot {
    pub at_utc: String,              // ISO 8601 timestamp
    pub nodes: Vec<NodeInfo>,        // 4 узла
    pub summary_key: String,         // i18n key: "summary.ok" | "summary.partial" | "summary.down"
    pub computer: ComputerInfo,      // Computer node details
    pub network: NetworkInfo,        // Network node details (NEW)
    pub router: RouterInfo,          // Router node details (NEW)
    pub internet: InternetInfo,      // Internet node details (NEW)
}

pub struct NetworkInfo {
    pub connection_type: ConnectionType,  // Wifi | Ethernet | Usb | Mobile
    pub ssid: Option<String>,
    pub rssi: Option<i32>,                // dBm
    pub signal_quality: Option<String>,   // i18n key: "signal.excellent" etc
    pub channel: Option<u8>,
    pub frequency: Option<String>,        // "2.4 GHz" | "5 GHz"
}

pub struct RouterInfo {
    pub gateway_ip: Option<String>,
    pub gateway_mac: Option<String>,
    pub vendor: Option<String>,           // From OUI lookup
    pub model: Option<String>,            // From UPnP (Post-MVP)
}

pub struct InternetInfo {
    pub public_ip: Option<String>,
    pub isp: Option<String>,              // ASN org
    pub country: Option<String>,
    pub city: Option<String>,
    pub dns_ok: bool,
    pub http_ok: bool,
    pub latency_ms: Option<u32>,
    pub speed_down_mbps: Option<f64>,     // Post-MVP
    pub speed_up_mbps: Option<f64>,       // Post-MVP
}
```

---

## Roadmap

### MVP (Phase 1):
- [ ] Computer: hostname, local_ip, adapter, connection_type
- [ ] Network: type, SSID, RSSI, signal quality
- [ ] Router: gateway_ip, gateway_mac, vendor (OUI)
- [ ] Internet: public_ip, ISP, country, city, DNS test, HTTP test
- [ ] OUI database integration (local CSV)
- [ ] Fallback strategy for geo APIs

### Post-MVP (Phase 2):
- [ ] Network: channel, frequency, link speed
- [ ] Router: model via UPnP, firmware version
- [ ] Internet: latency measurement
- [ ] Speed test integration (M-Lab NDT7)
- [ ] VPN detection
- [ ] Computer: device model, adapter model

### Future (Phase 3):
- [ ] Historical data tracking
- [ ] Notifications on connection issues
- [ ] Network topology visualization
- [ ] Packet loss detection

---

## Dependencies

### Rust Crates (для netok_core):

```toml
[dependencies]
# Уже есть:
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
time = "0.3"
get_if_addrs = "0.5"
hostname = "0.4"

# Нужно добавить:
reqwest = { version = "0.12", features = ["json", "blocking"] }  # HTTP requests
trust-dns-resolver = "0.23"                                       # DNS lookups
csv = "1.3"                                                       # OUI database

# Platform-specific:
[target.'cfg(windows)'.dependencies]
windows = { version = "0.58", features = ["Win32_NetworkManagement_IpHelper", "Win32_NetworkManagement_WiFi"] }

[target.'cfg(target_os = "linux")'.dependencies]
# Linux-специфичные крейты если нужны

[target.'cfg(target_os = "macos")'.dependencies]
# macOS-специфичные крейты если нужны
```

---

## Changelog

- **2025-11-13 v1.0:** Первичная фиксация плана реализации на основе обсуждения
