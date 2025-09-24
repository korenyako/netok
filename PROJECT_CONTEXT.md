# Netok — Project Context (Universal)

## Purpose

This file is the **single entry point** for any AI assistant (Cursor, Gemini, Claude, Copilot) working in this repo. It tells you where the Sources of Truth live and which rules to follow.

## Sources of Truth (SoT)

- **Architecture:** `docs/SoT-ARCH.md` — Desktop = **Tauri (WebView)**, Core = **Rust**. Mobile = native via Rust FFI.
- **UI/UX:** `docs/UI-SPEC.md` — Window behavior, settings sidebar, scroll rules, tokens, copy, i18n policy.
- **Main Screen Design:** See section below — **SoT v1.4 (Актуально)**.
- **i18n:** `i18n/README.md` — Keys, JSON structure, fallback, usage patterns.

> Only use the files above as the canonical reference. Ignore anything in `docs/deprecated/` and `/deprecated/`.

# Netok — SoT (UI): Главный экран — v1.4 (Актуально)

## Верхний блок (шапка)
- RU:  
  - «Интернет работает»  
  - «IP: 93.45.121.87 (Турин, Италия)»  
  - «Соединение без VPN»
- EN:  
  - "Internet available"  
  - "IP: 93.45.121.87 (Turin, Italy)"  
  - "Connection without VPN"

## Узлы (вертикальный путь)
- **Компьютер (ANTON-PC)**  
  - RU: «Сетевой адаптер: Intel I217-V», «IP в локальной сети: 192.168.0.24»  
  - EN: "Network adapter: Intel I217-V", "Local IP: 192.168.0.24"
- **Сеть (Wi-Fi: MyHome5G)**  
  - RU: «Сигнал: хороший (-65 dBm)»  
  - EN: "Signal: good (-65 dBm)"
- **Роутер (TP-Link Archer C6)**  
  - RU: «IP в локальной сети: 192.168.0.1»  
  - EN: "Local IP: 192.168.0.1"
- **Интернет (TIM)**  
  - RU: «Скорость: 120/95 Мбит/с»  
  - EN: "Speed: 120/95 Mbps"

## Нижний блок
- RU: кнопки «[Обновить] [Настройки]», затем «Обновлено 12:20:22»
- EN: buttons "[Refresh] [Settings]", then "Updated 12:20:22"

## ASCII-эскиз (референс)
```
Интернет работает
IP: 93.45.121.87 (Турин, Италия)
Соединение без VPN

● Компьютер (ANTON-PC)
Сетевой адаптер: Intel I217-V
IP в локальной сети: 192.168.0.24

● Сеть (Wi-Fi: MyHome5G)
Сигнал: хороший (-65 dBm)

● Роутер (TP-Link Archer C6)
IP в локальной сети: 192.168.0.1

● Интернет (TIM)
Скорость: 120/95 Мбит/с

[Обновить] [Настройки]

Обновлено 12:20:22
```

## Changelog (дизайн экрана)
- v1.4: скорость перенесена в «Интернет»; в шапке только статус + внешний IP + VPN; убрана «Модель»; имя/название — рядом с заголовком узла; единственный timestamp внизу.

## Guardrails (must)

- Keep changes **small and incremental**; no heavy dependencies.
- All user-visible strings come from **i18n JSON**. No hardcoded RU text in logic.
- Respect UI-SPEC rules: header fixed, content scrollable; min window 240×360; visible scrollbars; Inter/Roboto; accessibility and tokens.
- Follow the Architecture split: **core (Rust)** business logic, **bridge/desktop UI** in Tauri. Do not leak UI strings into core.

## Typical Workflow

1. Read `docs/SoT-ARCH.md` and `docs/UI-SPEC.md` for the task at hand.
2. Propose a minimal plan listing files to touch.
3. Implement focused diffs (avoid wide refactors).
4. Verify i18n extraction and both locales (RU/EN).
5. Provide a short test plan (manual or automated), aligned with UI-SPEC.

## Deprecated (do not use as context)

- `docs/deprecated/**` (old SoT, coding rules, templates)
- `/deprecated/**` (assistant-specific guides like GEMINI.md, CLAUDE.md, COPILOT.md, AI_ASSISTANTS.md)

## Notes for Assistants

- If a rule conflicts across files, prefer `docs/SoT-ARCH.md` (architecture) and `docs/UI-SPEC.md` (UI/UX).
- When in doubt, surface the ambiguity and cite the section (§) you rely on.

## Typical Tasks for Assistants

Use these as starting prompts in Cursor/Gemini/Claude. Always follow the Sources of Truth (`docs/SoT-ARCH.md`, `docs/UI-SPEC.md`) and i18n rules.

### UI / Frontend

- **Implement resize & scroll behavior (UI-SPEC §1–3):**  
  "Ensure main window follows UI-SPEC: default 300×480, min 240×360, fixed header, vertical scroll with visible scrollbars. Update frontend code accordingly."
- **Add a new settings section (UI-SPEC §2):**  
  "Implement a new Settings tab 'Privacy' with toggles as described in UI-SPEC §2. Use i18n keys, no hardcoded RU text."
- **Add bead indicators (UI-SPEC §7):**  
  "Implement bead indicators with colors and states from UI-SPEC §7. Ensure accessibility: duplicate meaning in text."

### i18n

- **Add a new string:**  
  "Add translation key `NewFeatureLabel` in i18n (RU/EN). Update i18n.rs and both JSON files. Replace hardcoded text in UI with s(S::NewFeatureLabel)."
- **Template string:**  
  "Introduce templated string `SpeedValue` with placeholders {down}/{up}. Update UI to use t('SpeedValue', …)."

### Core / Bridge

- **Add new diagnostic fact:**  
  "Extend DiagnosticsSnapshot with a new field (e.g., packetLoss%). Update netok_core models and bridge serialization. No UI hardcoding."
- **Error handling:**  
  "Standardize error response: return JSON {code, message} per SoT-ARCH.md."

### Testing / QA

- **Add Playwright test:**  
  "Create Playwright test for window resizing: at 260px width header stays fixed and vertical scrollbar appears. At 800px width sidebar shows as 2-column layout (UI-SPEC §1–2)."
- **i18n test:**  
  "Add cargo test to verify all enum keys in i18n.rs exist in both en.json and ru.json."

### Housekeeping

- **Docs consistency:**  
  "Check that no files link to docs/deprecated or /deprecated. Update links to use PROJECT_CONTEXT.md instead."
- **Pre-commit hook update:**  
  "Update pre-commit hook to also check that new strings are added in both en.json and ru.json."

---

END OF FILE
