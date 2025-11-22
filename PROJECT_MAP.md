# Project Map - Netok

Generated: 2025-11-22

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
│   ├── ACTION_PLAN.md
│   ├── CODE_ANALYSIS.md
│   ├── IMPLEMENTATION-PLAN.md
│   ├── PROGRESS.md
│   ├── README.md
│   ├── RECOMMENDATIONS.md
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
│   │   │   ├── BottomNav.tsx
│   │   │   ├── DnsVariantCard.tsx
│   │   │   ├── HeaderStatus.tsx
│   │   │   ├── MainPage.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── SecurityRouter.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── SettingsRouter.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── constants
│   │   │   └── dnsVariantStyles.ts
│   │   ├── hooks
│   │   │   ├── useDiagnostics.ts
│   │   │   └── useNavigation.ts
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
│   │   │   ├── ThemeSettingsScreen.tsx
│   │   │   └── ToolsScreen.tsx
│   │   ├── store
│   │   │   └── useDiagnostics.ts
│   │   ├── stores
│   │   │   ├── dnsStore.ts
│   │   │   ├── themeStore.ts
│   │   │   └── useDnsStore.ts
│   │   ├── tests
│   │   │   ├── dnsStore.test.ts
│   │   │   ├── formatUpdatedAt.test.ts
│   │   │   ├── notifications.test.ts
│   │   │   ├── setup.ts
│   │   │   ├── tauri.test.ts
│   │   │   └── themeStore.test.ts
│   │   ├── utils
│   │   │   ├── formatUpdatedAt.ts
│   │   │   └── notifications.ts
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
├── Cargo.lock
├── Cargo.toml
├── CLAUDE.md
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
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run"
  },
  "dependencies": {
    "@tauri-apps/api": "^2.9.0",
    "i18next": "^25.5.2",
    "netok": "file:..",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-hot-toast": "^2.6.0",
    "react-i18next": "^15.7.3",
    "react-router-dom": "^7.9.1",
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
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
    "happy-dom": "^20.0.10",
    "jsdom": "^27.2.0",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.39.1",
    "vite": "^7.1.2",
    "vitest": "^4.0.11"
  }}
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
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        xs: ['12px', '1.4'],
        sm: ['13px', '1.4'],
        base: ['14px', '1.4'],
        lg: ['16px', '1.4'],
        xl: ['18px', '1.3'],
        '2xl': ['20px', '1.3'],
        '3xl': ['24px', '1.25'],
      },
      colors: {}}}}
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
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { useNavigation } from './hooks/useNavigation';
import { useDiagnostics } from './hooks/useDiagnostics';

function App() {
  const {
    currentScreen,
    showDiagnostics,
    settingsSubScreen,
    securitySubScreen,
    setShowDiagnostics,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
  } = useNavigation();

  const { diagnosticsData, fetchDiagnosticsData } = useDiagnostics();

  if (showDiagnostics) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <DiagnosticsScreen
            onBack={() => setShowDiagnostics(false)}
            onRefresh={fetchDiagnosticsData}
            onNavigateToSecurity={() => {
              setShowDiagnostics(false);
              navigateToSecurity();
            }}
            onNavigateToTools={() => {
              setShowDiagnostics(false);
              navigateToTools();
            }}
            onNavigateToSettings={() => {
              setShowDiagnostics(false);
              navigateToSettings();
            }}
          />
        </div>}}

export default App;
```

## MAP

### Build Commands

- **Dev Command**: npm run dev --prefix ../ui
- **Build Command**: npm run build --prefix ../ui
- **Dev Path**: <http://localhost:5173>
- **Dist Dir**: ../../ui/dist
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
