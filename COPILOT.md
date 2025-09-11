# Netok — AI Assistant Context

> **⚠️ Deprecated — 2025-09-11**  
> This guide is outdated. Use [docs/UI-SPEC.md](docs/UI-SPEC.md) for current UI/UX rules and [i18n/README.md](i18n/README.md) for internationalization guidelines.

## Project

Netok — cross-platform network diagnostic tool.  
Stack: Rust + Iced (desktop MVP). Monorepo: `/core`, `/desktop`.

## Rules

- Follow `/docs/SoT.md`, `/docs/UI-SPEC.md`, `/docs/CODING_RULES.md`.
- Small, minimal diffs only. No changes to `/core` public API.
- Commit format: `feat(ui): ...`, `fix: ...`.
- Must pass: `cargo fmt`, `cargo clippy -- -D warnings`, `cargo test`.

## Workflow

1) First output: plan of changes + list of files.  
2) Then: patch diff (unified), not a full dump.  
3) Explain where/why the change is applied.  
4) Respect localization: no hardcoded RU strings in logic.  
5) No new crates unless justified in code comment.

## Goal

Stable, simple, predictable code for Netok desktop MVP.
