# Netok MVP (Desktop)

## Project Docs

UI-SPEC v1: docs/UI-SPEC.md — single source of truth for UI/UX. Cite sections like §1.

AI Assistants Guide: AI_ASSISTANTS.md — how Gemini/Cursor/etc. should work with this repo.

GEMINI.md: project-specific instructions for the VSCode Gemini extension.

Mono-repo с двумя крейтами: `core` (Apache-2.0) и `desktop` (Iced UI).

## Сборка

Требуется Rust stable.

```bash
cargo build --release -p netok-desktop
```

## Запуск

```bash
cargo run -p desktop
```

## Лицензии

- core: Apache-2.0 (см. LICENSE.Apache-2.0)
- desktop: OSS, но бинарные релизы могут распространяться по проприетарной лицензии (см. LICENSE.Proprietary)
