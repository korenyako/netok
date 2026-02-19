# Mobile Android App — Development Plan

**Created:** 2026-02-19
**Platform:** Android (Expo React Native)
**Status:** UI Prototype (mock API)

---

## Overview

Netok Mobile — Android-приложение на Expo SDK 54, портированное из десктопного React/Tauri UI. Использует React Navigation для навигации, Zustand для стейт-менеджмента, react-native-svg для иконок. Все сетевые функции пока работают на mock-данных.

### Tech Stack

- **Expo SDK** 54 + React Native 0.81
- **React Navigation** v7 (bottom tabs + native stacks)
- **Zustand** v5 (с AsyncStorage persistence)
- **i18next** v25 + react-i18next v15
- **react-native-svg** v15 (иконки)
- **expo-navigation-bar** v5 (системная навигация Android)
- **expo-network** v7 (информация о сети)

---

## Project Structure

```
expo-app/
├── App.tsx                              # Entry point (theme, status bar, navigation bar)
├── app.json                             # Expo config (permissions, edge-to-edge, package)
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── index.ts                             # Expo entry
│
├── src/
│   ├── api/
│   │   ├── types.ts                     # All TypeScript types (ported from desktop)
│   │   └── network.ts                   # Network API abstraction (MOCK data)
│   │
│   ├── components/
│   │   ├── MenuCard.tsx                 # Universal card component (ghost/filled/selected variants)
│   │   └── icons/
│   │       ├── NavigationIcons.tsx      # Bottom tab icons (Netok logo, Shield, Tools, Settings)
│   │       ├── UIIcons.tsx              # Common UI icons (ArrowLeft, Check, Wifi, etc.)
│   │       └── DiagnosticStatusIcons.tsx # Status indicators (Ok, Warning, Error, Loading)
│   │
│   ├── constants/
│   │   └── languages.ts                # Language definitions (14 languages)
│   │
│   ├── hooks/
│   │   └── useTheme.ts                 # Theme hook (colors + isDark + setTheme)
│   │
│   ├── i18n/
│   │   ├── index.ts                    # i18next initialization
│   │   ├── en.json                     # English translations
│   │   └── ru.json                     # Russian translations
│   │
│   ├── navigation/
│   │   └── RootNavigator.tsx           # Bottom tabs (4) + nested stack navigators
│   │
│   ├── screens/
│   │   ├── StatusScreen.tsx            # Home — status circle, indicators, auto-refresh
│   │   ├── DiagnosticsScreen.tsx       # 4-node progressive diagnostics
│   │   ├── ToolsScreen.tsx             # 2x2 tools grid
│   │   ├── SettingsScreen.tsx          # Theme, Language, About
│   │   ├── DnsProvidersScreen.tsx      # DNS provider selection (Cloudflare, AdGuard, Quad9)
│   │   ├── SpeedTestScreen.tsx         # Speed test with circular progress
│   │   ├── DeviceScanScreen.tsx        # Network device scanner
│   │   ├── WiFiSecurityScreen.tsx      # 4 WiFi security checks
│   │   ├── ThemeSettingsScreen.tsx     # Light/Dark toggle
│   │   ├── LanguageSettingsScreen.tsx  # 14 language options
│   │   └── AboutScreen.tsx            # Version, author
│   │
│   ├── stores/
│   │   ├── diagnosticsStore.ts         # Diagnostics state (nodes, isRunning, results)
│   │   └── themeStore.ts               # Theme state (persisted to AsyncStorage)
│   │
│   ├── theme/
│   │   └── colors.ts                   # Light/Dark color tokens (matched to desktop)
│   │
│   └── utils/
│       └── deriveScenario.ts           # Network scenario derivation logic
│
└── assets/                              # Icons, splash screen images
```

---

## Reused from Desktop

| Component | Source (desktop) | Mobile adaptation |
|-----------|-----------------|-------------------|
| Zustand stores | `ui/src/stores/` | 1:1 logic, AsyncStorage instead of localStorage |
| i18n translations | `i18n/en.json`, `i18n/ru.json` | Copied, extended with mobile-specific keys |
| `deriveScenario()` | `ui/src/utils/` | Pure function, no changes |
| API types | `ui/src/api/tauri.ts` | All interfaces ported to `api/types.ts` |
| SVG icon paths | `ui/src/components/icons/` | Same paths, wrapped in react-native-svg |
| Color tokens | `ui/src/index.css` (HSL) | Converted to HEX in `theme/colors.ts` |

---

## Screens

### Tab 1: Home (Netok)
- **StatusScreen** — Main screen with 220px status circle (color-coded: green/orange/red/gray). Shows connection type + SSID. Three bottom indicators: DNS protection, VPN status, WiFi security. Auto-refreshes every 30 seconds. Tap circle → DiagnosticsScreen.

### Tab 2: Security (Shield)
- **DnsProvidersScreen** — Radio selection for DNS providers: System, Cloudflare (3 variants), AdGuard (3 variants), Quad9 (3 variants). Loading spinner during apply.
- **WiFiSecurityScreen** — Accessible from Security tab.

### Tab 3: Tools
- **ToolsScreen** — 2x2 grid: Diagnostics, Speed Test, Device Scan, WiFi Security.
- **DiagnosticsScreen** — Progressive 4-node check (Computer → Network → Router → Internet). Shows adapter, IP, SSID, signal, gateway, ISP info.
- **SpeedTestScreen** — Circular progress, 3 phases (Ping → Download → Upload), results in cards.
- **DeviceScanScreen** — Scan button → device list with icon/vendor/IP/MAC. Device type icons (phone/computer/TV/router).
- **WiFiSecurityScreen** — Shield status card + 4 staggered checks (encryption, evil twin, ARP spoofing, DNS hijacking).

### Tab 4: Settings
- **SettingsScreen** — Menu: Theme, Language, About.
- **ThemeSettingsScreen** — Light/Dark with sun/moon icons.
- **LanguageSettingsScreen** — 14 languages with native names.
- **AboutScreen** — Logo, version "0.1.0 (Mobile)", author.

---

## UI Fixes Applied

After initial creation, the following fixes were made to match the desktop UI:

1. **Color tokens** — All colors in `theme/colors.ts` converted from blue-tinted Tailwind slate to desktop's near-black/green palette. HSL values from `ui/src/index.css` → HEX.

2. **SafeAreaView** — Added `<SafeAreaView edges={['top']}>` to all 11 screens to prevent Android status bar overlap.

3. **Bottom tab bar** — Uses `useSafeAreaInsets()` for dynamic bottom padding (`insets.bottom + 12px`). Removed `borderTopWidth` and `elevation`.

4. **Back button headers** — All screens except StatusScreen have consistent header with back arrow (ArrowLeft icon). Tab root screens (Tools, Settings, Security) navigate back to Home tab via `useNavigation()`.

5. **System navigation bar** — Installed `expo-navigation-bar`. `App.tsx` sets navigation bar color to match theme on mount and theme change.

6. **Splash/icon colors** — Updated `app.json` splash and adaptive icon `backgroundColor` from `#0F172A` → `#131314`.

---

## Feature Gap: Mobile vs Desktop

| Feature | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Diagnostics (4-node) | Real backend | **Mock** | Needs Expo native module or HTTP API |
| Speed Test (NDT7) | WebSocket real test | **Mock** | Needs NDT7 WebSocket client |
| Device Scan (ARP/mDNS) | Real backend | **Mock** | Needs native module (no JS ARP access) |
| WiFi Security (4 checks) | Real backend | **Mock** | Needs native WiFi APIs |
| DNS Provider Selection | System DNS change | **Mock** | Android: needs VPN API; iOS: restricted |
| Custom DNS IP | Full UI + validation | **Not implemented** | |
| VPN Tunnel | Full (sing-box) | **Not implemented** | Needs Android VPN Service API |
| Node Detail Screen | Expandable cards | **Not implemented** | Desktop has detailed per-node view |
| Protection Hub | DNS + VPN summary | **Partial** (DNS only) | No VPN integration yet |
| Check for Updates | Tauri updater | **Not applicable** | Use app store updates |
| Close Behavior | Minimize to tray | **N/A** | Mobile-specific lifecycle |
| Languages (files) | 2 (en, ru) | 2 (en, ru) | Need 12 more translation files |

---

## Roadmap

### Phase 1 — Backend Integration (Priority: High)

Replace mock API (`src/api/network.ts`) with real implementations:

- [ ] **Diagnostics**: Real network checks via Expo native modules or remote HTTP API
  - Computer: device info, local IP (partially available via `expo-network`)
  - Network: WiFi SSID, signal strength (needs native module)
  - Router: gateway IP, vendor lookup (needs native module for ARP)
  - Internet: public IP, ISP, geolocation (HTTP API — straightforward)
- [ ] **Speed Test**: Implement NDT7 WebSocket client in JS (protocol works on mobile)
- [ ] **Device Scan**: Native module for ARP table access or mDNS discovery
- [ ] **WiFi Security**: Native module for WiFi info (encryption type, BSSID list)
- [ ] **DNS Setting**: Android VPN Service API for DNS-over-HTTPS/TLS routing

### Phase 2 — Missing Screens & Features

- [ ] **Node Detail Screen** — Expandable view per node (IP copy, details, router admin link)
- [ ] **Custom DNS IP Screen** — IPv4/IPv6 input with validation and test
- [ ] **VPN Integration** — Android VPN Service for sing-box/WireGuard
- [ ] **Protection Hub** — Combined DNS + VPN status summary

### Phase 3 — Polish & Localization

- [ ] Add 12 language translation files (de, es, fr, it, pt, tr, fa, zh, ja, ko, uk, pl)
- [ ] Custom app icon (current: Expo default)
- [ ] Custom splash screen
- [ ] Performance optimization (lazy loading, memo)
- [ ] Accessibility improvements
- [ ] Unit tests (Detox or Jest + RNTL)

### Phase 4 — Distribution

- [ ] EAS Build configuration
- [ ] Google Play Store listing preparation
- [ ] CI/CD pipeline for mobile builds (GitHub Actions + EAS)
- [ ] Beta testing (internal track)
- [ ] Production release

---

## How to Run

```bash
cd expo-app
npm install
npx expo start --android
```

**Options:**
- **Expo Go on phone**: Scan QR code from terminal
- **Android Studio emulator**: Will auto-detect running emulator
- **Development build**: `npx expo run:android` (requires Android SDK)

---

## Dependencies

```json
{
  "@react-native-async-storage/async-storage": "~2.1.2",
  "@react-navigation/bottom-tabs": "^7.3.0",
  "@react-navigation/native": "^7.1.0",
  "@react-navigation/native-stack": "^7.3.0",
  "expo": "~54.0.33",
  "expo-localization": "~17.0.8",
  "expo-navigation-bar": "~5.0.10",
  "expo-network": "~7.0.5",
  "expo-status-bar": "~3.0.9",
  "i18next": "^25.5.2",
  "react": "19.1.0",
  "react-i18next": "^15.7.3",
  "react-native": "0.81.5",
  "react-native-safe-area-context": "~5.4.0",
  "react-native-screens": "~4.11.1",
  "react-native-svg": "~15.15.3",
  "zustand": "^5.0.8"
}
```

---

## Android Permissions

```json
[
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
  "android.permission.INTERNET"
]
```

Future additions (for real features):
- `android.permission.CHANGE_NETWORK_STATE` — for DNS changes
- `android.permission.ACCESS_FINE_LOCATION` — for WiFi scan results (Android 10+)
- `android.permission.FOREGROUND_SERVICE` — for VPN service

---

## Reference

- **Desktop UI source**: `ui/src/` (React + Tailwind + Vite)
- **Desktop API layer**: `ui/src/api/tauri.ts` (Tauri IPC commands)
- **Desktop stores**: `ui/src/stores/` (Zustand)
- **i18n originals**: `i18n/en.json`, `i18n/ru.json`
- **Theme source (HSL)**: `ui/src/index.css` → converted to HEX in `expo-app/src/theme/colors.ts`
- **Desktop progress**: `docs/PROGRESS.md`
- **Desktop action plan**: `docs/ACTION_PLAN.md`
