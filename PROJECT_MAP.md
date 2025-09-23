# Project Map - Netok

Generated: 2025-09-23

## TREE (ASCII)

```text
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
│   │   │   ├── commands.rs
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
│   ├── .husky
│   │   └── pre-commit
│   ├── public
│   │   └── vite.svg
│   ├── src
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── DNSTab.tsx
│   │   │   ├── HeaderStatus.tsx
│   │   │   ├── MainPage.i18n.test.tsx
│   │   │   ├── MainPage.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── Spinner.tsx
│   │   ├── i18n
│   │   │   ├── en.json
│   │   │   └── ru.json
│   │   ├── mocks
│   │   │   └── snapshot.json
│   │   ├── store
│   │   │   ├── useDiagnostics.ts
│   │   │   └── useSettings.ts
│   │   ├── test
│   │   │   └── setup.ts
│   │   ├── types
│   │   │   └── diagnostics.ts
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
│   ├── vite.config.ts
│   └── vitest.config.ts
├── ui_legacy
│   ├── assets
│   ├── src
│   │   ├── computer.svg
│   │   ├── globe.svg
│   │   ├── i18n.rs
│   │   ├── main.rs
│   │   ├── router.svg
│   │   └── wifi.svg
│   ├── Cargo.toml
│   └── README.md
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
    "beforeDevCommand": "npm run dev:ui",
    "beforeBuildCommand": "npm run build:ui",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../ui/dist"
  },
  "app": {
    "windows": [
      {
        "title": "Netok",
        "width": 320,
        "height": 560,
        "minWidth": 280,
        "minHeight": 480,
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
    "lint:i18n": "eslint src/**/*.{ts,tsx}",
    "test": "vitest",
    "test:run": "vitest run",
    "test:i18n": "vitest run --reporter=verbose MainPage.i18n.test.tsx",
    "i18n:scan": "powershell -Command \"Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Where-Object { $_.FullName -notlike '*i18n*' -and $_.FullName -notlike '*node_modules*' -and $_.FullName -notlike '*dist*' } | ForEach-Object { Select-String -Path $_.FullName -Pattern '[А-Яа-яЁё]' -SimpleMatch:$false }\"",
    "i18n:enforce": "powershell -Command \"$found = Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx,*.js,*.jsx | Where-Object { $_.FullName -notlike '*i18n*' -and $_.FullName -notlike '*node_modules*' -and $_.FullName -notlike '*dist*' } | ForEach-Object { Select-String -Path $_.FullName -Pattern '[А-Яа-яЁё]' -SimpleMatch:$false } | Select-Object -First 1; if ($found) { echo '🔴 Cyrillic found outside i18n'; exit 1 } else { echo '✅ i18n clean' }\"",
    "i18n:scan:rg": "rg -n --glob '!src/i18n/**' --glob '!node_modules/**' --glob '!dist/**' -e '[А-Яа-яЁё]' src || echo 'No Cyrillic found'",
    "i18n:enforce:rg": "rg -n --glob '!src/i18n/**' --glob '!node_modules/**' --glob '!dist/**' -e '[А-Яа-яЁё]' src && echo '🔴 Cyrillic found outside i18n' && exit 1 || echo '✅ i18n clean'",
    "preview": "vite preview",
    "prepare": "husky"
  },
  "lint-staged": {
    "src/**/*.{ts,tsx}": [
      "eslint --fix",
      "npm run i18n:enforce"
    ],
    "!src/**/*.test.{ts,tsx}": []
  },
  "dependencies": {
    "@tauri-apps/api": "^2.8.0",
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
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.33.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^16.3.0",
// ... (truncated due to syntax error)
```

### ui/tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage';
import { SettingsPage } from './components/SettingsPage';

function App() {
  return (
    <Router>
      <div id="app" className="h-full">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

```

## MAP

### Build Commands

- **Dev Command**: npm run dev:ui
- **Build Command**: npm run build:ui
- **Dev Path**: <http://localhost:5173>
- **Dist Dir**: ../ui/dist
- **Window Title**: Netok
- **Window Size**: 320×560

### Routes

- НЕ НАЙДЕНО

### i18n Locales

- en
- ru

### Stores

- useDiagnostics
- useSettings

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
