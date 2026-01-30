# Project Map - Netok

Generated: 2026-01-30

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
│   │   │   ├── adapter.rs
│   │   │   ├── arp.rs
│   │   │   ├── connection.rs
│   │   │   ├── dns.rs
│   │   │   ├── gateway.rs
│   │   │   ├── mod.rs
│   │   │   └── wifi.rs
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
│   │   │   │   └── NavigationIcons.tsx
│   │   │   ├── ui
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── collapsible.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   └── sonner.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── DiagnosticMessage.tsx
│   │   │   ├── DnsVariantCard.tsx
│   │   │   ├── HeaderStatus.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── SecurityRouter.tsx
│   │   │   ├── SettingsRouter.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── constants
│   │   │   └── dnsVariantStyles.ts
│   │   ├── fonts
│   │   │   ├── Geist-Variable.woff2
│   │   │   └── GeistMono-Variable.woff2
│   │   ├── hooks
│   │   │   ├── useDiagnostics.ts
│   │   │   ├── useNavigation.ts
│   │   │   └── useTheme.ts
│   │   ├── i18n
│   │   │   ├── en.json
│   │   │   └── ru.json
│   │   ├── lib
│   │   │   └── utils.ts
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
│   │   │   ├── deriveScenario.ts
│   │   │   ├── formatUpdatedAt.ts
│   │   │   └── notifications.ts
│   │   ├── App.tsx
│   │   ├── fonts && cp dWorkNetoknetokuinode_modulesgeistdistfontsgeist-monoGeistMono-Variable.woff2 dWorkNetoknetokuisrcfonts
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
├── etsy-hover-effects-fixed.html
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
├── test_logging.rs
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
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.4",
    "@tauri-apps/api": "^2.9.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "geist": "^1.5.1",
    "i18next": "^25.5.2",
    "lucide-react": "^0.563.0",
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
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
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
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',}}}}}
```

### ui/index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
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
          />}}

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

- en
- ru

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
