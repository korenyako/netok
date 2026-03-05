# Netok — UI Specification (Window, Settings, Tokens)

Version: **UI-SPEC v2 (2026-03-05)**

This specification defines visual and UX decisions for Netok. Behavior and copy only, no code.

---

## 1) Application Window

* **Default size:** width **340 px**, height **640 px**.
* **Minimum size:** width **340 px**, height **640 px**. Below this — disallowed.
* **Window frame:** `decorations: false`, `transparent: true` — **custom title bar** (drag region in the header).
* **Resize:** free, supports **maximize**.
* **Persistence:** save last size/position and restore on launch.
* **Header:** custom title bar with drag region; main content scrolls beneath it.
* **Layout breakpoints:**

  * **Compact ≤ 320 px:** single column, nodes as inline cards (dot + short label), details collapsed.
  * **Regular 321–600 px:** standard view, key rows visible (IP, Signal, Speed).
  * **Spacious > 600 px:** more padding, tooltips, optional detail panel on the right.

## 2) Navigation & Settings

### Navigation (Bottom Nav — 4 tabs)

Bottom bar with 4 icons (no labels):

| Tab | Icon | Screen | Sub-screens |
|-----|------|--------|-------------|
| **Home** | Netok logo (color changes by status: green/yellow/red) | StatusScreen | DiagnosticsScreen, SpeedTestScreen, DeviceScanScreen, NodeDetailScreen |
| **Security** | Shield | ProtectionHubScreen | DnsProvidersScreen, CustomIpScreen, VpnTunnelScreen, AddVpnScreen, WiFiSecurityScreen |
| **Tools** | Tools | ToolsScreen | DiagnosticsScreen, SpeedTestScreen, DeviceScanScreen, WiFiSecurityScreen |
| **Settings** | Gear | SettingsScreen | ThemeSettingsScreen, LanguageSettingsScreen, CloseBehaviorSettingsScreen, AboutScreen, DebugScenariosScreen |

Navigation is built on a custom state-based router (no react-router). Supports modal-style overlays and nested sub-screens.

### Settings

Flat list with sub-screens (no sidebar):

**Main settings screen:**
* Title: "Settings"
* Items:
  - **Theme** → Light / Dark selection screen
  - **Language** → language selection screen
  - **Close behavior** → Minimize to tray / Quit application
  - **About** → version, licenses, links
  - **Debug Scenarios** (dev mode) → test diagnostics scenarios

## 3) Scrolling and List Behavior

* Lists (nodes, settings) use **vertical scroll** when content overflows.
* macOS: auto-hiding scrollbar. Windows/Linux: **always visible** scrollbar.
* **Thickness:** 8 px, scroll thumb radius — 8 px, track — muted.
* Top status block **does not scroll**.

## 4) Typography and Fonts

* **Primary font:** **Geist** (`geist` package, weight 400/500/600).
* **Monospace:** Geist Mono (for metrics, IP addresses, speed values).
* **Sizes (Regular):**
  * Page title: 16 px / 600
  * Group headings: 14 px / 600
  * Body text: 13 px / 400–500
  * Captions/helper text: 12 px / 400
* **Compact:** minus 1 px for each.
* Line height: 1.35–1.45, clear focus states for accessibility.

## 5) Buttons and Interactive Elements

* **Border radius:** 10–12 px.
* **Padding:** minimum 8×12 px (Compact), 10×14 px (Regular).
* **States:** default / hover / active / focus / disabled.
* **Focus ring:** 2 px, primary/accessible color, visible on any background.
* **Toggles, selects, inputs** — consistent style; muted placeholder, not gray-on-gray.

## 6) Icons (SVG)

* **Set:** Custom SVG icons in `ui/src/components/icons/` (NavigationIcons, UIIcons, DiagnosticIcons, etc.).
* **Sizes:** 16 px (Compact), 20–24 px (Regular/Spacious).
* **Color:** `currentColor`; stroke 1.5 px.
* **UI components:** shadcn/ui (Radix UI primitives + Tailwind + class-variance-authority).

## 7) Status Dot Indicators

* **Geometry:** 10–12 px circle, 8 px right margin.
* **States:**
  * Working — **#22C55E** (green)
  * Unavailable — **#EF4444** (red)
  * Partial — **#F59E0B** (orange)
  * Unknown — **#9CA3AF** (gray)
  * Checking — **#3B82F6** stroke + soft pulse (500–800 ms)
* For colorblind users, meaning is duplicated in text; color is reinforcement only.

## 8) Color Tokens (Light/Dark)

### Light

* Background: **#FFFFFF**
* Surface: **#F7F7F8**
* Text Primary: **#111827**
* Text Secondary: **#6B7280**
* Border/Subtle: **#E5E7EB**
* Primary (accents/focus): **#3B82F6**
* Danger: **#EF4444**
* Warning: **#F59E0B**
* Success: **#22C55E**

### Dark

* Background: **#111827**
* Surface: **#1F2937**
* Text Primary: **#F9FAFB**
* Text Secondary: **#D1D5DB**
* Border/Subtle: **#374151**
* Primary: **#60A5FA**
* Danger: **#F87171**
* Warning: **#FBBF24**
* Success: **#34D399**

## 9) UI Copy Reference

* Top block:
  — "Internet is working." / "Internet is unavailable." / "Internet is partially working."
  — "Speed: {down}/{up} Mbps"
* Buttons: "Refresh", "Settings", "Copy", "Open router page", "Open Wi-Fi login page"
* Nodes: **Computer → Network → Router → Internet**
* Network (Wi-Fi): "Signal: excellent/good/fair/weak ({rssi} dBm)", "Network name: {ssid}"
* Network (Cable): "Link: up/down"
* Router: "LAN IP: {ip}"
* Internet: "ISP: {isp}", "IP: {ip}", "{country}, {city}" *(if enabled)*
* Export: "Netok check result — {date} {time}"

## 10) "Unknown" Value Rules

* Show "unknown" **only for important fields** (e.g. "Signal: unknown").
* Secondary fields — **hide entirely**.
* If SSID is present but RSSI is not — show SSID and "Signal: unknown".
* If ISP is not determined — show only IP (omit the "ISP" row).

## 11) QA Scenarios (minimum set)

1. **First launch:** SSID present, RSSI missing → SSID visible, "Signal: unknown".
2. **After "Refresh":** RSSI appears → show signal level; subsequent refreshes don't revert to "unknown" while driver is stable.
3. **Window 340×640:** everything clickable, scroll works, header is fixed.
4. **Settings:** flat list navigation, sub-screens with back button.
5. **Focus navigation:** all interactive elements reachable by keyboard, focus ring visible.
6. **Dark theme:** text and interactive contrast ≥ WCAG AA.

## 12) Bundled Assets

* **Fonts:** Geist (Regular, Medium, SemiBold), Geist Mono.
* **Icons:** custom SVGs in `ui/src/components/icons/`.
* **Notifications:** Sonner (`sonner` v2) — toast notifications.
* **UI components:** shadcn/ui (Radix UI + Tailwind + CVA).
* **Status dots:** drawn as vector circles, no emoji.

## 13) Internationalization (i18n)

### Architecture

* **System:** JSON files + React i18next (frontend only)
* **Files:** `i18n/en.json`, `i18n/ru.json`
* **Module:** `ui/src/i18n.ts` — i18next initialization
* **Fallback:** current language → English → key
* **Loading:** once at startup, switching is instant
* **Rust-side i18n:** none. Rust returns i18n keys (e.g. `"diagnostic.scenario.wifi_disabled.title"`), frontend translates

### Usage in Code

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('AppName')}</h1>
      <p>{t('SpeedValue', { down: '100', up: '50' })}</p>
    </div>
  );
}
```

### Localization Rules

#### Russian (ru.json)

* **Tone:** professional, friendly
* **Terminology:** established IT terms (DNS, IP, Wi-Fi)
* **Abbreviations:** standard Russian (`Вкл`/`Выкл`, `Мбит/с`)
* **Punctuation:** Russian typography
* **Consistency:** Windows/macOS Russian terminology

#### English (en.json)

* **Tone:** clear, concise
* **Terminology:** standard technical terms
* **Abbreviations:** standard (`On`/`Off`, `Mbps`)
* **Punctuation:** standard English
* **Consistency:** platform conventions

#### Universal Rules

* **Placeholders:** preserve `{key}` unchanged
* **Context:** consider UI space constraints
* **User-facing:** write from the user's perspective
* **Accessibility:** avoid complex jargon

### Language Switching

* **UI location:** Settings → Language
* **Options:** Russian / English
* **Application:** instant, no restart required
* **Persistence:** in memory (persistence planned)
* **Default:** Russian

### Technical Integration

#### Adding New Strings

1. Add key to `i18n/en.json` and `i18n/ru.json`
2. Use `t('NewKey')` in React code

#### Quality Checks

* **Pre-commit hook:** blocks Cyrillic in source files
* **Manual testing:** switch languages in the app

#### Adding Languages

1. Create `/i18n/xx.json` (where xx = language code)
2. Copy from `en.json`, translate values
3. Add to UI language selector if needed

### Anti-patterns (DON'T)

* ❌ Hardcoded text: `<p>Settings</p>` → ✅ `<p>{t('Settings')}</p>`
* ❌ Cyrillic in `.tsx`/`.ts` files — all strings via `t()`
* ❌ Forgetting placeholders: `"{down} Mbps"` without substitution

### Performance

* **Startup:** JSON loading ~1ms
* **Runtime:** HashMap lookup ~10ns
* **Memory:** ~50KB for all translations
* **Switching:** ~100μs for language change

### Roadmap

* **Persistence:** save language choice in config
* **Pluralization:** plural form rules
* **RTL support:** Arabic/Hebrew layout support
* **Dynamic loading:** load translations on demand

## 14) Open Questions (next iteration)

* Should "Appearance" include font size toggle (Small/Medium/Large)?
* Animations: keep only the pulse on "checking" or add fade-in for row updates?

---

## Changelog

* 2026-03-05: v2 — updated: window size (340×640), custom title bar, Geist font, navigation (4 tabs), shadcn/ui, Sonner, removed non-existent Rust-side i18n, translated to English.
* 2025-09-11: v1.2 — expanded i18n section (§13) with detailed rules and examples.
* 2025-01-11: v1.1 — added i18n rules (§13).
* 2025-09-08: v1 — initial UI-SPEC (Window, Settings, Tokens).
