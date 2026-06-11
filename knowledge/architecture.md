# Архитектура

Netok — кросс-платформенный desktop-app для сетевой диагностики. Текущая версия `0.6.0` (см. [netok_desktop/src-tauri/Cargo.toml](../netok_desktop/src-tauri/Cargo.toml)).

## Слои

```
┌──────────────────────────────────────────┐
│ ui/        React 19 + TS + Vite + TW3    │  UI Layer
├──────────────────────────────────────────┤
│ netok_bridge   Tauri commands, JSON      │  IPC Layer
├──────────────────────────────────────────┤
│ netok_core     business logic, models    │  Business Logic
├──────────────────────────────────────────┤
│ netok_desktop  Tauri shell, tray, VPN    │  System Layer / OS APIs
└──────────────────────────────────────────┘
```

| Слой | Crate / папка | Зона ответственности |
|------|---------------|----------------------|
| Core | [netok_core/](../netok_core/) | Диагностика, модели данных, OUI БД, Wi-Fi/DNS/Gateway/ARP/mDNS, парсинг VPN URI |
| Bridge | [netok_bridge/](../netok_bridge/) | JSON-обёртки над core, типы для IPC |
| Desktop | [netok_desktop/src-tauri/](../netok_desktop/src-tauri/) | Tauri-приложение, регистрация команд, tray, autostart, VPN supervision (sing-box) |
| UI | [ui/src/](../ui/src/) | Экраны, Zustand-сторы, i18next, Tauri-API обёртка |

## Cargo workspace

Корневой [Cargo.toml](../Cargo.toml) определяет 3 члена workspace: `netok_core`, `netok_bridge`, `netok_desktop/src-tauri`. Edition `2021`, лицензия `GPL-3.0-or-later`. Релиз-профиль: `strip = true`, `lto = true`, `codegen-units = 1`.

Общие deps в `[workspace.dependencies]`: `serde`, `serde_json`, `thiserror`, `time`.

## Стек

### Backend (Rust)
- `tauri` 2.0 (с фичей `tray-icon`)
- `tauri-plugin-{opener, shell, updater, process, autostart}`
- `tokio` 1 (только `rt`, `time` для desktop; core использует blocking + `std::thread::scope`)
- `reqwest` 0.12 (blocking)
- `trust-dns-resolver` 0.23
- `get_if_addrs` 0.5, `hostname` 0.3
- `mdns-sd` 0.17
- `windows` 0.58 (Win32 WLAN/Foundation/Shell/Threading/Registry — только для Windows)

### Frontend (UI)
- React 19.1, TypeScript 5.8, Vite 7.1
- Tailwind 3.4 + shadcn/ui (Radix primitives + CVA)
- Zustand 5 — глобальное состояние (см. `ui/src/stores/`)
- i18next 25 + react-i18next 15 — переводы из `ui/src/i18n/*.json`
- Sonner 2 — тосты
- Шрифты: Geist + Geist Mono
- Кастомный state-based роутер (без react-router)

## UI окно

Параметры из [docs/UI-SPEC.md §1](../docs/UI-SPEC.md):
- Размер по умолчанию и минимум: **340×640** px
- `decorations: false`, `transparent: true` — кастомный title bar (`data-tauri-drag-region`)
- Брейкпоинты: Compact ≤320, Regular 321–600, Spacious >600
- Геометрия и цвета сохраняются между запусками

## Структура UI-папок

`ui/src/` содержит: `App.tsx`, `api/` (Tauri-обёртка), `components/`, `screens/`, `stores/`, `hooks/`, `i18n/` (14 JSON), `i18n.ts` (init), `lib/`, `utils/`, `tests/`, `data/`, `fonts/`, `index.css`.

## Сборка и релизы

| Команда | Что делает |
|---------|-----------|
| `cargo tauri dev` | Полный стек dev (Rust hot-reload + Vite HMR) |
| `npm run dev:ui --prefix ui` | Только фронт на `localhost:5173` (Tauri-команды упадут) |
| `cargo tauri build` | Production-сборка, артефакты в `netok_desktop/src-tauri/target/release/bundle/` |
| `npm run map` | Регенерирует `PROJECT_MAP.md` (husky pre-commit) |

CI/CD ([.github/workflows/](../.github/workflows/)):
- `test.yml`: rustfmt + clippy `-D warnings` + cargo test (Ubuntu+Windows), npm test+coverage, бенчмарки на main/master, артефакты в Codecov
- `release.yml`: триггер на тег `v*.*.*`, мульти-платформенные бандлы

### SemVer
- Pre-release `0.x.x`: `0.x.0` — фичи, `0.x.y` — багфиксы.
- Версия фиксируется в [netok_desktop/src-tauri/Cargo.toml](../netok_desktop/src-tauri/Cargo.toml).
- Чек-лист релиза: bump version → обновить `settings.about.changes` в `ui/src/i18n/{en,ru}.json` → коммит `chore: bump version` → опц. тег.

## Платформы

| Платформа | Статус |
|-----------|--------|
| Windows | Production (есть unsigned-сборка + SmartScreen warning) |
| macOS | Planned (см. [MACOS_PORT_ANALYSIS.md](../MACOS_PORT_ANALYSIS.md), 3–5 недель) |
| Linux | Planned (частично работает: hostname, get_if_addrs, gateway via `ip route`) |
| Android | In progress (Expo SDK 54, mock data, см. [plans/mobile.md](plans/mobile.md)) |
| iOS | Planned |

## NFR (целевые показатели)

- Старт <400 ms
- Полная диагностика ≤1.5 s (типичная), хард-лимит — `test_timeout_ms` из настроек
- Память в idle ≤200 MB
- DNS query 1 s, HTTP 2 s, ping host 200 ms, mDNS browse 3 s, тест DNS-сервера 5 s
