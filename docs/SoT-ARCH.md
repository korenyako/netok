# Architecture Decision: Desktop = Tauri, Core = Rust, Mobile = Native

**Статус:** Accepted  
**Дата:** 2025-09-11  
**Контекст:** Нужна простая, стабильная и быстрая утилита мониторинга сети для обычных пользователей. Ранее UI был на Iced + wgpu и зависал на части систем (драйверы GPU, выбор backend).

## Решение (TL;DR)

- **Ядро:** `netok_core` (Rust) — вся бизнес-логика (профили тестов, статусы, конфиг, сериализация).
- **Desktop UI:** **Tauri (WebView)** + лёгкий web-фреймворк (React/Vite или Svelte).  
  Причина: исключаем зависимость от драйверов (DX12/Vulkan), получаем стабильный рендер и быстрый dev-цикл.
- **Mobile UI:** нативно (**SwiftUI** / **Jetpack Compose**) через **Rust FFI** к `netok_core`.
- **i18n:** ключи в ядре, строки в JSON (UI-слой). Фолбэк: `current → en → [MISSING:key]`.

## Цели и ограничения

- **Надёжность:** отсутствие зависаний/«серых окон» из-за GPU/драйверов.
- **Простота UI:** статус узлов, кнопка обновления, базовые настройки.
- **Кроссплатформенность:** Win/macOS/Linux; позже iOS/Android с иным нативным UI.
- **Чёткое разделение:** Core ≠ UI; UI можно менять без затрагивания ядра.

## Структура репозитория (workspace)

```text
/netok_core    # Rust: бизнес-логика, тесты сети, модели, serde
/netok_bridge  # Rust: Tauri-команды + FFI (uniffi) над core
/netok_desktop # Tauri-приложение (frontend + tauri.conf.json)
/i18n          # en.json, ru.json (локализации UI-слоя)
/docs          # SoT-ARCH, UI-SPEC, i18n/README, ADRs
```

## Контракт Bridge-слоя

### Tauri команды (Rust, экспорт в фронтенд)

```rust
run_diagnostics() -> string // JSON DiagnosticsSnapshot
get_settings() -> string     // JSON Settings
set_settings(json: string) -> Result<(), Error>
get_version() -> string     // опционально
```

### FFI для мобилок (через uniffi)

Те же функции, возвращают JSON-строки (или DTO uniffi).

**Конвенции:**

- Ошибки → код+сообщение (`{"code":"DNS_TIMEOUT","message":"..."}`)
- Асинхронщина — вызов в отдельном потоке ядра, колбэк/промис в UI

### i18n политика

- Ключи живут в ядре (enum/константы)
- Строки — в `/i18n/*.json` (UI)
- Фолбэк: `current → en → [MISSING:key]`
- Запрет: никакого «жёсткого» текста в коде UI/Core

### Нефункциональные требования (NFR)

- Старт desktop UI: < 400 ms на средней машине
- Запуск полного набора диагностик: обычно ≤ 1.5 s; жёсткая отсечка — `test_timeout_ms`
- Память desktop: ≤ 200 MB при простое
- UI реакция: первый meaningful paint ≤ 300 ms (Tauri/WebView2)
- Без GPU-зависимостей в desktop-рендере (всё рисует WebView)

### UI-минимум (Desktop)

- Экран статусов (4–6 узлов): цвет/иконка/название, кнопка «Обновить»
- Экран «Настройки»: язык, таймауты, опционально DNS
- Системный трэй, single-instance, автообновления (Tauri встроенно)

### Сборки и таргеты

- **Windows:** MSI/EXE (WebView2 bootstrap включён)
- **macOS:** DMG, подпись/нотаризация (конфиг в `tauri.conf.json`)
- **Linux:** AppImage + Deb/RPM (по необходимости)
- **CI:** матрица Win/macOS/Linux (Release + подписи)

### Риски и план В

- Если WebView2 отсутствует на старых Win → Tauri установит runtime (bootstrap)
- Если потребуется «нативный» UI без web-движка → Slint + Rust как альтернатива (ADR-draft готовим)
- Для headless/CLI-режима оставить маленький бинарь `netok_cli` (по желанию)

## План миграции (если есть legacy-код)

1. Заморозить старый Iced-UI (branch `legacy-iced`)
2. Выделить `netok_core` (только логика и DTO)
3. Добавить `netok_bridge` (Tauri cmd + uniffi)
4. Поднять `netok_desktop` (Tauri) с минимальным экраном
5. Вынести тексты в `/i18n/*.json`, перепривязать ключи
6. Включить автообновления, single-instance, системный трэй
7. CI-сборки, smoke-тест, пилот на Win + macOS

## Критерии приёмки (MVP)

- Приложение стартует и показывает экран статусов без зависаний на Win/macOS/Linux
- Кнопка «Обновить» возвращает `DiagnosticsSnapshot` со всеми узлами
- Переключение языка влияет на все видимые тексты (фолбэк на en)
- Установка и автообновление работают (manual e2e тест)
- Логи содержат: версию ядра, длительность тестов, итоговый summary

## Приложение: JSON-схемы (укороченные)

### DiagnosticsSnapshot

```json
{
  "at_utc": "2025-09-11T10:15:30Z",
  "nodes": [
    {
      "id": "Dns",
      "name_key": "nodes.dns.name",
      "status": "Ok",
      "latency_ms": 29,
      "hint_key": null
    }
  ],
  "summary_key": "summary.ok"
}
```

### Settings

```json
{
  "language": "en",
  "test_timeout_ms": 2000,
  "dns_servers": ["1.1.1.1","8.8.8.8"]
}
```
