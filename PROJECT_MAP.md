# Project Map - Netok

Generated: 2025-11-17

## TREE (ASCII)

```text
├── .claude
│   └── settings.local.json
├── .github
│   ├── ISSUE_TEMPLATE
│   │   └── feature_request.md
│   ├── workflows
│   │   ├── docs-lint.yml
│   │   ├── release.yml
│   │   └── tauri-windows.yml
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky
│   ├── _
│   │   ├── .gitignore
│   │   └── husky.sh
│   └── pre-commit
├── core
│   ├── src
│   │   ├── netinfo
│   │   │   └── mod.rs
│   │   └── lib.rs
│   └── Cargo.toml
├── deprecated
│   ├── AI_ASSISTANTS.md
│   ├── CLAUDE.md
│   ├── COPILOT.md
│   └── GEMINI.md
├── docs
│   ├── deprecated
│   │   ├── CODING_RULES.md
│   │   ├── SoT.md
│   │   └── TASK_TEMPLATE.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── README.md
│   ├── SoT-ARCH.md
│   └── UI-SPEC.md
├── i18n
│   ├── en.json
│   ├── README.md
│   └── ru.json
├── netok_bridge
│   ├── src
│   │   ├── lib.rs
│   │   └── types.rs
│   └── Cargo.toml
├── netok_core
│   ├── src
│   │   └── lib.rs
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
│   │   ├── capabilities
│   │   │   └── default.json
│   │   ├── gen
│   │   │   └── schemas
│   │   │       ├── acl-manifests.json
│   │   │       ├── capabilities.json
│   │   │       ├── desktop-schema.json
│   │   │       └── windows-schema.json
│   │   ├── icons
│   │   │   ├── 128x128.png
│   │   │   ├── 128x128@2x.png
│   │   │   ├── 32x32.png
│   │   │   ├── icon.icns
│   │   │   ├── icon.ico
│   │   │   ├── icon.png
│   │   │   ├── Square107x107Logo.png
│   │   │   ├── Square142x142Logo.png
│   │   │   ├── Square150x150Logo.png
│   │   │   ├── Square284x284Logo.png
│   │   │   ├── Square30x30Logo.png
│   │   │   ├── Square310x310Logo.png
│   │   │   ├── Square44x44Logo.png
│   │   │   ├── Square71x71Logo.png
│   │   │   ├── Square89x89Logo.png
│   │   │   └── StoreLogo.png
│   │   ├── src
│   │   │   ├── lib.rs
│   │   │   └── main.rs
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
│   └── generate_project_map.mjs
├── src
│   └── i18n.ts
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
│   │   │   │   └── NavigationIcons.tsx
│   │   │   ├── HeaderStatus.tsx
│   │   │   ├── MainPage.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── i18n
│   │   │   ├── en.json
│   │   │   └── ru.json
│   │   ├── screens
│   │   │   ├── AdGuardDetailScreen.tsx
│   │   │   ├── CleanBrowsingDetailScreen.tsx
│   │   │   ├── CloudflareDetailScreen.tsx
│   │   │   ├── DiagnosticsScreen.tsx
│   │   │   ├── Dns4EuDetailScreen.tsx
│   │   │   ├── DnsProvidersScreen.tsx
│   │   │   ├── GoogleDetailScreen.tsx
│   │   │   ├── LanguageSettingsScreen.tsx
│   │   │   ├── OpenDnsDetailScreen.tsx
│   │   │   ├── Quad9DetailScreen.tsx
│   │   │   ├── SecurityScreen.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   ├── StatusScreen.tsx
│   │   │   └── ThemeSettingsScreen.tsx
│   │   ├── store
│   │   │   └── useDiagnostics.ts
│   │   ├── stores
│   │   │   ├── dnsStore.ts
│   │   │   ├── themeStore.ts
│   │   │   └── useDnsStore.ts
│   │   ├── utils
│   │   │   └── formatUpdatedAt.ts
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
│   └── vite.config.ts
├── ui_legacy
│   ├── src
│   │   ├── computer.svg
│   │   ├── globe.svg
│   │   ├── i18n.rs
│   │   ├── main.rs
│   │   ├── router.svg
│   │   └── wifi.svg
│   ├── Cargo.toml
│   └── README.md
├── ui-new
│   ├── src
│   │   ├── components
│   │   │   ├── figma
│   │   │   │   └── ImageWithFallback.tsx
│   │   │   ├── screens
│   │   │   │   ├── LanguageScreen.tsx
│   │   │   │   ├── NetworkScreen.tsx
│   │   │   │   ├── SecurityScreen.tsx
│   │   │   │   ├── SettingsScreen.tsx
│   │   │   │   ├── ThemeScreen.tsx
│   │   │   │   └── ToolsScreen.tsx
│   │   │   ├── ui
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aspect-ratio.tsx
│   │   │   │   ├── avatar.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── breadcrumb.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── carousel.tsx
│   │   │   │   ├── chart.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── drawer.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── hover-card.tsx
│   │   │   │   ├── input-otp.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── menubar.tsx
│   │   │   │   ├── navigation-menu.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── resizable.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── sonner.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toggle-group.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── use-mobile.ts
│   │   │   │   └── utils.ts
│   │   │   ├── DetailedPathCard.tsx
│   │   │   ├── MainStatusCard.tsx
│   │   │   └── StatusHeader.tsx
│   │   ├── guidelines
│   │   │   └── Guidelines.md
│   │   ├── imports
│   │   │   ├── Card-31-242.tsx
│   │   │   ├── Card-33-466.tsx
│   │   │   ├── Card-33-569.tsx
│   │   │   ├── Card-37-829.tsx
│   │   │   ├── Card-42-1026.tsx
│   │   │   ├── Card-42-1119.tsx
│   │   │   ├── Card-9-130.tsx
│   │   │   ├── Card-9-292.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Check.tsx
│   │   │   ├── svg-7mtmmw9lcd.ts
│   │   │   ├── svg-awoydyzf8i.ts
│   │   │   ├── svg-egvceuz6nw.ts
│   │   │   ├── svg-exnfuwyo3q.ts
│   │   │   ├── svg-gjkejt3b1w.ts
│   │   │   ├── svg-gt5503apnm.ts
│   │   │   ├── svg-havri7zc8r.ts
│   │   │   ├── svg-nfe8ucn0br.ts
│   │   │   ├── svg-qf6f52nkak.ts
│   │   │   └── svg-urvarrlt82.ts
│   │   ├── styles
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   ├── Attributions.md
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── vite.config.ts
├── .cursorrules
├── .gitignore
├── Cargo.lock
├── Cargo.toml
├── CONTRIBUTING.md
├── LICENSE.Apache-2.0
├── LICENSE.Proprietary
├── Loading prop to NodeCard for better UX
├── package-lock.json
├── package.json
├── PROJECT_CONTEXT.md
├── PROJECT_MAP.md
├── README_DEV.md
├── README.md
├── s Refresh' when !isLoading
├── SETUP-PRECOMMIT.md
├── tatus
└── test_logging.rs

```

## KEY FILES

### src-tauri/tauri.conf.json

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "Netok",
  "identifier": "netok",

  "build": {
    "beforeDevCommand": "npm run dev --prefix ../ui",
    "beforeBuildCommand": "npm run build --prefix ../ui",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../ui-new/dist"
  },

  "app": {
    "windows": [
      {
        "title": "Netok",
        "width": 320,
        "height": 600,
        "minWidth": 320,
        "minHeight": 600,
        "resizable": true
      }
    ]
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
    "preview": "vite preview"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.9.0",
    "i18next": "^25.5.2",
    "netok": "file:..",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-i18next": "^15.7.3",
    "react-router-dom": "^7.9.1",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.33.0",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.39.1",
    "vite": "^7.1.2"
  }
}

```

### ui/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      colors: {
        background: {
          DEFAULT: 'var(--color-background)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          hover: 'var(--color-background-hover)',
        },
        foreground: {
          DEFAULT: 'var(--color-foreground)',
          secondary: 'var(--color-foreground-secondary)',}}}}}
```

### ui/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap" rel="stylesheet">
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

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
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './components/ThemeProvider';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { DnsProvidersScreen } from './screens/DnsProvidersScreen';
import { CloudflareDetailScreen } from './screens/CloudflareDetailScreen';
import { AdGuardDetailScreen } from './screens/AdGuardDetailScreen';
import { Dns4EuDetailScreen } from './screens/Dns4EuDetailScreen';
import { CleanBrowsingDetailScreen } from './screens/CleanBrowsingDetailScreen';
import { Quad9DetailScreen } from './screens/Quad9DetailScreen';
import { OpenDnsDetailScreen } from './screens/OpenDnsDetailScreen';
import { GoogleDetailScreen } from './screens/GoogleDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ThemeSettingsScreen } from './screens/ThemeSettingsScreen';
import { LanguageSettingsScreen } from './screens/LanguageSettingsScreen';
import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from './components/icons/NavigationIcons';
import { runDiagnostics, type DiagnosticsSnapshot } from './api/tauri';
import { dnsStore } from './stores/dnsStore';

type Screen = 'home' | 'security' | 'tools' | 'settings';
type SettingsSubScreen = 'main' | 'theme' | 'language';
type SecuritySubScreen = 'dns-providers' | 'cloudflare-detail' | 'adguard-detail' | 'dns4eu-detail' | 'cleanbrowsing-detail' | 'quad9-detail' | 'opendns-detail' | 'google-detail';

function App() {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [settingsSubScreen, setSettingsSubScreen] = useState<SettingsSubScreen>('main');
  const [securitySubScreen, setSecuritySubScreen] = useState<SecuritySubScreen>('dns-providers');
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsSnapshot | null>(null);

  // Load diagnostics data once on mount
  useEffect(() => {
    fetchDiagnosticsData();
  }, []);

  const fetchDiagnosticsData = async () => {
    try {
      const snapshot = await runDiagnostics();
      setDiagnosticsData(snapshot);
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
    }
  };

  // If diagnostics is shown, render it without the nav
  if (showDiagnostics) {
    return (
      <ThemeProvider>}}

export default App;
```

## MAP

### Build Commands

- **Dev Command**: npm run dev --prefix ../ui
- **Build Command**: npm run build --prefix ../ui
- **Dev Path**: <http://localhost:5173>
- **Dist Dir**: ../ui-new/dist
- **Window Title**: Netok
- **Window Size**: 320×600

### Routes

- НЕ НАЙДЕНО

### i18n Locales

- en
- ru

### Stores

- useDiagnostics

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
