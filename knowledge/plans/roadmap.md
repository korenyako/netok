# Roadmap

Источник: [docs/IMPLEMENTATION-PLAN.md](../../docs/IMPLEMENTATION-PLAN.md). Эта статья — конспект состояния по узлам и фичам на дату вики.

## По узлам диагностики

### Computer
- ✅ hostname, local_ip, adapter (description), connection_type
- ❌ device_model

### Network
- ✅ connection_type, SSID, RSSI, signal_quality, channel, frequency, link_speed, wifi_standard, encryption, is_legacy_wifi
- ❌ Wi-Fi info на Linux/macOS (есть только `connection_type`)

### Router
- ✅ gateway_ip (Win/Linux/macOS), gateway_mac (Windows), vendor (OUI)
- ❌ model (UPnP/SNMP), firmware
- ❌ MAC на Linux/macOS

### Internet
- ✅ public_ip, ISP, country, city, DNS test, HTTP test, latency
- ✅ download/upload/ping/latency/jitter — на фронте через NDT7 (см. [../subsystems/speed-test.md](../subsystems/speed-test.md))

## По фичам

### Реализовано (Phase 1 — MVP)
- 4-узловая диагностика
- OUI БД (компилируется в бинарник)
- Геолокация через ipinfo.io
- i18n (15 языков)
- Tray + Autostart (0.5.0: + start_minimized)

### Реализовано (Phase 2 — Post-MVP)
- Speed test (NDT7 frontend)
- Wi-Fi Security (4 проверки)
- Network Device Scan (5 фаз: ping → ARP → OUI → reverse DNS → mDNS)
- DNS Management (21 провайдер, IPv4+IPv6)
- VPN Tunnel (sing-box, 5 протоколов)
- Прогрессивная диагностика (4 отдельные команды + spawn_blocking)

### Не реализовано
- Computer device model
- Router model/firmware (UPnP/SNMP)
- Wi-Fi info / router MAC / ARP table на Linux/macOS
- Историческое отслеживание (мониторинг 1-2 часа, см. [docs/user-stories.md](../../docs/user-stories.md))
- Уведомления при проблемах
- Визуализация топологии сети
- Packet loss detection
- Auto-switching DNS по сети (home/work профили — feature opportunity)
- DoH/DoT
- Kill-switch для VPN
- QR-код сканирование VPN-ключей

## Приоритеты (из IMPLEMENTATION-PLAN)

Phase 3+ кандидаты:
1. Linux/macOS Wi-Fi реализация (CoreWLAN на macOS, nl80211 на Linux) — ~3–5 недель порта (см. [MACOS_PORT_ANALYSIS.md](../../MACOS_PORT_ANALYSIS.md))
2. Background мониторинг + нотификации (исходит из реальных user-stories)
3. Router model через UPnP (SSDP discovery)

## Платформы

| Платформа | Статус | Что не работает |
|-----------|--------|-----------------|
| Windows | Production (unsigned, SmartScreen warning) | — |
| Linux | Partial | Wi-Fi info, router MAC, DNS management, VPN, Wi-Fi Security |
| macOS | Planned | Всё кроме hostname/IP/gateway |
| Android | UI-prototype с mock data | См. [mobile.md](mobile.md) |
| iOS | Planned | — |

## Языки (15)

en, ru, de, es, fr, it, pt-BR, pt-PT, tr, fa, zh, ja, ko, uk, pl. Файлы в [ui/src/i18n/](../../ui/src/i18n/). README — на 15 языках (`README.pt.md` разделён на `README.pt-BR.md` и `README.pt-PT.md`).

## Релизы

Текущая версия: **0.6.0** ([netok_desktop/src-tauri/Cargo.toml](../../netok_desktop/src-tauri/Cargo.toml)).

В 0.5.0 добавлено:
- Опция «запускать свёрнутым» (`start_minimized`) на экране настроек автозапуска. См. [../subsystems/tray-autostart.md](../subsystems/tray-autostart.md).
