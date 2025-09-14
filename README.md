# Netok MVP (Desktop)

## Project Docs

- **Architecture:** [docs/SoT-ARCH.md](docs/SoT-ARCH.md) — Desktop = **Tauri (WebView)**, Core = **Rust**
- **UI/UX:** [docs/UI-SPEC.md](docs/UI-SPEC.md) — UI specifications and design guidelines
- **i18n:** [i18n/README.md](i18n/README.md) — Internationalization guidelines
- **AI Assistants:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — Universal guide for all AI assistants

Mono-repo с двумя крейтами: `core` (Apache-2.0) и `desktop` (Tauri WebView).

## Сборка

Требуется Rust stable.

```bash
cargo build --release -p netok-desktop
```

## Запуск

```bash
cargo run -p desktop
```

## Project Map

Автоматическая генерация карты проекта:

```bash
npm run map
```

### Pre-commit Hook

При каждом коммите автоматически обновляется `PROJECT_MAP.md` через husky pre-commit hook.

### Скрипт генерации

- **Файл**: `scripts/generate_project_map.mjs`
- **Игнорируемые папки**: `node_modules`, `.git`, `target`, `dist`, `.next`, `.turbo`, `.pnpm-store`, `.cache`
- **Проверка**: `npm run map:check` — сравнивает с текущим PROJECT_MAP.md

### VS Code Task

Доступна задача "Update Project Map" для ручного обновления карты проекта.

## Лицензии

- core: Apache-2.0 (см. LICENSE.Apache-2.0)
- desktop: OSS, но бинарные релизы могут распространяться по проприетарной лицензии (см. LICENSE.Proprietary)
