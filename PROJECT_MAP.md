# Project Map - Netok

Generated: 2026-02-18

## TREE (ASCII)

```text
├── .claude
│   └── settings.local.json
├── .github
│   ├── ISSUE_TEMPLATE
│   │   └── feature_request.md
│   └── workflows
│       ├── docs-lint.yml
│       ├── release.yml
│       ├── tauri-windows.yml
│       └── test.yml
├── .husky
│   ├── _
│   │   └── husky.sh
│   └── pre-commit
├── docs
│   ├── deprecated
│   │   ├── CODING_RULES.md
│   │   ├── SoT.md
│   │   └── TASK_TEMPLATE.md
│   ├── ACTION_PLAN.md
│   ├── CODE_ANALYSIS.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── PROGRESS.md
│   ├── README.md
│   ├── RECOMMENDATIONS.md
│   ├── REFACTORING-PLAN-SOLID.md
│   ├── REVISED_PRIORITIES.md
│   ├── SECURITY_AUDIT.md
│   ├── SoT-ARCH.md
│   ├── TESTING_PLAN.md
│   └── UI-SPEC.md
├── i18n
│   ├── en.json
│   ├── README.md
│   └── ru.json
├── netok_bridge
│   ├── src
│   │   ├── lib.rs
│   │   └── types.rs
│   ├── tests
│   │   └── integration_tests.rs
│   └── Cargo.toml
├── netok_core
│   ├── benches
│   │   └── diagnostics_benchmark.rs
│   ├── src
│   │   ├── infrastructure
│   │   │   ├── vpn
│   │   │   │   ├── config.rs
│   │   │   │   ├── mod.rs
│   │   │   │   └── uri_parser.rs
│   │   │   ├── adapter.rs
│   │   │   ├── arp.rs
│   │   │   ├── connection.rs
│   │   │   ├── dns.rs
│   │   │   ├── gateway.rs
│   │   │   ├── mdns.rs
│   │   │   ├── mod.rs
│   │   │   ├── security.rs
│   │   │   └── wifi.rs
│   │   ├── brand_mapping.rs
│   │   ├── diagnostics.rs
│   │   ├── domain.rs
│   │   ├── lib.rs
│   │   └── oui_database.rs
│   └── Cargo.toml
├── netok_desktop
│   ├── public
│   │   ├── tauri.svg
│   │   └── vite.svg
│   ├── src
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── MainPage.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks
│   │   │   └── useLanguage.ts
│   │   ├── locales
│   │   │   ├── en
│   │   │   │   └── common.json
│   │   │   └── ru
│   │   │       └── common.json
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── i18n-config.ts
│   │   ├── i18n.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── src-tauri
│   │   ├── binaries
│   │   │   └── wintun.dll
│   │   ├── capabilities
│   │   │   └── default.json
│   │   ├── icons
│   │   │   ├── 32x32.png
│   │   │   └── icon.ico
│   │   ├── src
│   │   │   ├── lib.rs
│   │   │   └── main.rs
│   │   ├── tests
│   │   │   └── integration_tests.rs
│   │   ├── .gitignore
│   │   ├── build.rs
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   ├── .gitignore
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── scripts
│   ├── generate_oui_database.py
│   ├── generate_project_map.mjs
│   └── process_manuf.py
├── ui
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── api
│   │   │   └── tauri.ts
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── icons
│   │   │   │   ├── ActionIcons.tsx
│   │   │   │   ├── DiagnosticStatusIcons.tsx
│   │   │   │   ├── NavigationIcons.tsx
│   │   │   │   └── UIIcons.tsx
│   │   │   ├── ui
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   └── switch.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── DiagnosticMessage.tsx
│   │   │   ├── HeaderStatus.tsx
│   │   │   ├── MenuCard.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── ScanProgressRing.tsx
│   │   │   ├── SecurityRouter.tsx
│   │   │   ├── SettingsRouter.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── WindowControls.tsx
│   │   ├── constants
│   │   │   └── languages.ts
│   │   ├── data
│   │   │   └── dns-providers.json
│   │   ├── fonts
│   │   │   ├── Inter-Variable.ttf
│   │   │   ├── MartianMono-Variable.ttf
│   │   │   └── NotoSansArabic-Variable.ttf
│   │   ├── hooks
│   │   │   ├── useNavigation.ts
│   │   │   └── useTheme.ts
│   │   ├── i18n
│   │   │   ├── de.json
│   │   │   ├── en.json
│   │   │   ├── es.json
│   │   │   ├── fa.json
│   │   │   ├── fr.json
│   │   │   ├── it.json
│   │   │   ├── ja.json
│   │   │   ├── ko.json
│   │   │   ├── pl.json
│   │   │   ├── pt.json
│   │   │   ├── ru.json
│   │   │   ├── tr.json
│   │   │   ├── uk.json
│   │   │   └── zh.json
│   │   ├── lib
│   │   │   └── utils.ts
│   │   ├── screens
│   │   │   ├── AboutScreen.tsx
│   │   │   ├── AddVpnScreen.tsx
│   │   │   ├── CloseBehaviorSettingsScreen.tsx
│   │   │   ├── CustomIpScreen.tsx
│   │   │   ├── DeviceScanScreen.tsx
│   │   │   ├── DiagnosticsScreen.tsx
│   │   │   ├── DnsProvidersScreen.tsx
│   │   │   ├── LanguageSettingsScreen.tsx
│   │   │   ├── NodeDetailScreen.tsx
│   │   │   ├── ProtectionHubScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── SpeedTestScreen.tsx
│   │   │   ├── StatusScreen.tsx
│   │   │   ├── ThemeSettingsScreen.tsx
│   │   │   ├── ToolsScreen.tsx
│   │   │   ├── VpnTunnelScreen.tsx
│   │   │   └── WiFiSecurityScreen.tsx
│   │   ├── stores
│   │   │   ├── closeBehaviorStore.ts
│   │   │   ├── deviceScanStore.ts
│   │   │   ├── diagnosticsStore.ts
│   │   │   ├── dnsStore.ts
│   │   │   ├── speedTestStore.ts
│   │   │   ├── themeStore.ts
│   │   │   ├── useDnsStore.ts
│   │   │   ├── vpnStore.ts
│   │   │   └── wifiSecurityStore.ts
│   │   ├── tests
│   │   │   ├── dnsStore.test.ts
│   │   │   ├── formatUpdatedAt.test.ts
│   │   │   ├── notifications.test.ts
│   │   │   ├── setup.ts
│   │   │   ├── tauri.test.ts
│   │   │   └── themeStore.test.ts
│   │   ├── utils
│   │   │   ├── customDnsStorage.ts
│   │   │   ├── deriveScenario.ts
│   │   │   ├── dnsProviderLookup.ts
│   │   │   ├── formatUpdatedAt.ts
│   │   │   ├── ndt7Client.ts
│   │   │   ├── notifications.ts
│   │   │   └── vpnUri.ts
│   │   ├── App.tsx
│   │   ├── i18n.ts
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── .cursorrules
├── .gitattributes
├── .gitignore
├── Cargo.toml
├── CLAUDE.md
├── CONTRIBUTING.md
├── DNS_PROVIDERS.md
├── etsy-hover-effects-fixed.html
├── LICENSE.Apache-2.0
├── LICENSE.Proprietary
├── package-lock.json
├── package.json
├── PROJECT_CONTEXT.md
├── PROJECT_MAP.md
├── README_DEV.md
├── README.md
├── SETUP-PRECOMMIT.md
└── TESTING.md

```

## KEY FILES

### src-tauri/tauri.conf.json

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Netok",
  "identifier": "netok",

  "build": {
    "beforeDevCommand": "npm run dev --prefix ui",
    "beforeBuildCommand": "npm run build --prefix ui",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../../ui/dist"
  },

  "app": {
    "windows": [
      {
        "title": "Netok",
        "width": 320,
        "height": 600,
        "minWidth": 320,
        "minHeight": 600,
        "resizable": true,
        "decorations": false,
        "transparent": true
      }
    ]
  },

  "bundle": {
    "active": true,
    "targets": ["nsis"],
    "icon": [
      "icons/32x32.png",
      "icons/icon.ico"
    ],
    "externalBin": [
      "binaries/sing-box"
    ],
    "windows": {
      "nsis": {
        "installMode": "currentUser"
      }
    }
  }
}

```

### ui/package.json

```json
{
  "name": "ui",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "dependencies": {
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@radix-ui/react-switch": "^1.2.6",
    "@tauri-apps/api": "^2.9.0",
    "@tauri-apps/plugin-opener": "^2.5.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "geist": "^1.5.1",
    "i18next": "^25.5.2",
    "netok": "file:..",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-i18next": "^15.7.3",
    "sonner": "^2.0.7",
    "tailwind-merge": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.33.0",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "@vitest/coverage-v8": "^4.0.12",
    "@vitest/ui": "^4.0.11",
    "autoprefixer": "^10.4.21",
    "baseline-browser-mapping": "^2.9.19",
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
// ... (truncated due to syntax error)
```

### ui/tailwind.config.js

```javascript
import tailwindcssAnimate from 'tailwindcss-animate'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Lato',
          'Noto Sans Arabic',
          'PingFang SC', 'Microsoft YaHei',
          'Hiragino Sans', 'Meiryo',
          'Apple SD Gothic Neo', 'Malgun Gothic',
          'sans-serif',
        ],
        mono: ['"Martian Mono"', 'monospace'],
      },}}}
```

### ui/index.html

```html
<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Netok</title>
    <script>
      // Apply saved theme before first paint to prevent flash
      try {
        var d = JSON.parse(localStorage.getItem('theme-storage') || '{}');
        if ((d.state && d.state.theme) === 'dark') document.documentElement.classList.add('dark');
      } catch(e) {
        document.documentElement.classList.add('dark');
      }
    </script>
    <style>
      .app-loader{display:flex;align-items:center;justify-content:center;height:100%;background:hsl(var(--background))}
      .app-loader-spinner{width:32px;height:32px;border:3px solid hsl(var(--border));border-top-color:hsl(var(--primary));border-radius:50%;animation:loader-spin .8s linear infinite}
      @keyframes loader-spin{to{transform:rotate(360deg)}}
```

### ui/src/main.tsx

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

```

### ui/src/App.tsx

```typescript
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { SpeedTestScreen } from './screens/SpeedTestScreen';
import { DeviceScanScreen } from './screens/DeviceScanScreen';
import { useNavigation } from './hooks/useNavigation';

function App() {
  const {
    currentScreen,
    showDiagnostics,
    showSpeedTest,
    showDeviceScan,
    settingsSubScreen,
    securitySubScreen,
    setShowDiagnostics,
    setShowSpeedTest,
    setShowDeviceScan,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
  } = useNavigation();

  if (showDeviceScan) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <DeviceScanScreen onBack={() => setShowDeviceScan(false)} />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={() => { setShowDeviceScan(false); navigateToHome(); }}
            onNavigateToSecurity={() => { setShowDeviceScan(false); navigateToSecurity(); }}
            onNavigateToTools={() => { setShowDeviceScan(false); navigateToTools(); }}
            onNavigateToSettings={() => { setShowDeviceScan(false); navigateToSettings(); }}
          />
        </div>
      </ThemeProvider>
    );
  }

  if (showSpeedTest) {}}

export default App;
```

## MAP

### Build Commands

- **Dev Command**: npm run dev --prefix ui
- **Build Command**: npm run build --prefix ui
- **Dev Path**: <http://localhost:5173>
- **Dist Dir**: ../../ui/dist
- **Window Title**: Netok
- **Window Size**: 320×600

### Routes

- НЕ НАЙДЕНО

### i18n Locales

- de
- en
- es
- fa
- fr
- it
- ja
- ko
- pl
- pt
- ru
- tr
- uk
- zh

### Stores

- НЕ НАЙДЕНО

### Pages

- НЕ НАЙДЕНО

### Settings Tabs

- НЕ НАЙДЕНО

## SOT CHECK

- ✅ **Tauri config exists**: tauri.conf.json найден
- ✅ **UI folder found**: Папка фронта: ui
- ✅ **Package.json exists**: ui/package.json найден
- ✅ **Tailwind configured**: ui/tailwind.config.js найден
- ✅ **Build commands configured**: beforeBuildCommand настроен

## Obvious SoT Mismatches

- ✅ No obvious mismatches found

---

*This file is auto-generated. Do not edit manually.*
