# Netok — Coding Rules

> **⚠️ Deprecated — 2025-09-11**  
> This guide is outdated. Use [docs/UI-SPEC.md](docs/UI-SPEC.md) for current UI/UX rules and [i18n/README.md](i18n/README.md) for internationalization guidelines.

## Архитектура
- Монорепо: `/core` (Apache-2.0), `/desktop` (Iced). Core API стабильный: `Snapshot/Node/Status/run_all()`.
- **Жёсткое правило:** `core` не зависит от pro/private модулей.

## UI
- Следовать `docs/UI-SPEC.md` и SoT.
- Узлы показывают **факты**, статусы — только **цветом бусин**.
- Без эмодзи. Без слова «ОК» и «Внешний интернет» — пишем «Интернет».
- Нижние кнопки фиксированы; прокрутка — у центральной колонки.

## Локализация
- Все строки в `desktop/src/i18n/{ru,en}.rs`.
- Логику строим на ключах, не на тексте.

## Процессы
- Маленькие задачи → маленькие PR. Не переписывать модулей без необходимости.
- Перед PR обязательно: `cargo fmt`, `cargo clippy -- -D warnings`, `cargo test`.
- Коммиты: `feat(ui): ...`, `fix(core): ...`, `refactor: ...`.

## Зависимости
- Новые crates — только по необходимости, с обоснованием в комментарии.
