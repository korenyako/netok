# AI Assistants Guide

> **⚠️ Deprecated — 2025-09-11**  
> This guide is outdated. Use [docs/UI-SPEC.md](docs/UI-SPEC.md) for current UI/UX rules, [i18n/README.md](i18n/README.md) for internationalization guidelines, and [docs/SoT-ARCH.md](docs/SoT-ARCH.md) for current architecture.

## Purpose

Standard rules for any AI assistant (Gemini, Cursor, Claude, etc.) working with this repo.

## Read First

docs/UI-SPEC.md — authoritative UI/UX spec (cite §N). If inaccessible, ask to attach it or paste an excerpt.

## Interaction Pattern

Acknowledge which §§ you read and quote 1–2 lines.

Propose a minimal, incremental plan (files + rationale).

Execute with guardrails: tokens, accessibility, i18n extraction, no heavy deps.

Validate against the PR checklist.

## Excerpts Convention

When needed, ask the user to inline a subset of the spec with markers:

BEGIN UI-SPEC EXCERPT (§1, §7)
...pasted content…
END UI-SPEC EXCERPT

## Do Not

Add new dependencies casually.

Hardcode RU strings in logic.

Ignore size/scroll/header rules from §1–§3.
