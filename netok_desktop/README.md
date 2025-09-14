# Netok Desktop UI

Minimal React + Vite + Tailwind UI for Netok Tauri desktop app.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling (minimal bundle, no heavy UI kits)
- **Zustand** for state management
- **i18next** for internationalization (RU/EN)

## Project Structure

```
src/
├── ui/
│   ├── i18n/
│   │   ├── en.json          # English translations
│   │   └── ru.json          # Russian translations
│   ├── components/
│   │   ├── HeaderStatus.tsx # 3-line status block
│   │   └── NodeCard.tsx     # Node display component
│   ├── pages/
│   │   ├── MainPage.tsx     # Main diagnostics page
│   │   ├── SettingsPage.tsx # Settings with sidebar
│   │   └── Settings/
│   │       ├── SettingsLayout.tsx
│   │       ├── GeneralTab.tsx
│   │       ├── DNSTab.tsx
│   │       ├── GeoTab.tsx
│   │       └── ToolsTab.tsx
│   ├── store/
│   │   └── useDiagnostics.ts # Zustand diagnostics store
│   └── router/
│       └── AppRouter.tsx     # Simple routing
├── index.css                 # Tailwind imports + custom styles
├── i18n.ts                  # i18n configuration
└── App.tsx                  # Main app component
```

## Building for Tauri

### Development
```bash
npm run dev
```
Starts Vite dev server on port 1420 (required by Tauri).

### Production Build
```bash
npm run build
```
Builds the UI bundle to `dist/` directory. Tauri will automatically use this for the desktop app.

### Tauri Commands
```bash
# Development with hot reload
npm run tauri dev

# Production build
npm run tauri build
```

## UI Features

### Main Page
- **Fixed header** with status block (3 lines: internet status, speed, VPN info)
- **Scrollable content** with 4-node path: Computer → Network → Router → Internet
- **Fixed footer** with Refresh and Settings buttons (buttons don't shrink)
- **Responsive design** with visible scrollbars

### Settings Page
- **Sidebar navigation** with tabs: General, DNS, Geo, Tools
- **Language toggle** RU/EN with instant switching
- **DNS configuration** with preset options and custom input
- **Geo consent** toggle for location data
- **Tools section** with stub actions for network utilities

### Design System
- **Minimal styling** using Tailwind classes only
- **Accessible contrast** and focus states
- **Clean typography** with Inter font family
- **Consistent spacing** and border radius
- **No external UI kits** - custom components only

## Configuration

### Tailwind CSS
- **Purge enabled** for minimal bundle size
- **Custom color tokens** matching UI-SPEC
- **Custom scrollbar** styles for Windows/Linux
- **Responsive breakpoints** for different window sizes

### i18n
- **JSON-based translations** for easy maintenance
- **Template string support** with placeholders
- **Fallback to English** if translation missing
- **LocalStorage persistence** for language choice

### State Management
- **Zustand store** for diagnostics data
- **Realistic mock data** for development
- **Error handling** and loading states
- **TypeScript interfaces** for type safety

## Development Notes

- All user-visible strings are externalized to i18n JSON files
- No hardcoded Russian text in components
- Components are minimal and focused on single responsibilities
- Stub actions in Tools tab for future Tauri command integration
- Window resizing behavior follows UI-SPEC requirements
