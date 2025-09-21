# Development Guide

This document describes the development commands and workflow for the Netok project.

## Quick Start

### UI Development Only

```bash
# Start the React frontend development server
npm run dev:ui
```

- Starts Vite dev server on `http://localhost:5173`
- Hot reload enabled for React components
- Use this for frontend-only development

### Full Application Development

```bash
# Run the complete Tauri application (Rust + UI)
cargo tauri dev

```

- Automatically starts the UI dev server
- Launches the desktop application
- Hot reload for both Rust backend and React frontend
- Use this for full-stack development

## Build Commands

### UI Build Only

```bash
# Build the React frontend for production
npm run build:ui

```

- Installs dependencies and builds optimized production bundle
- Outputs to `ui/dist/`
- Use this to test production UI build

### Full Application Build

```bash
# Build the complete Tauri application for production
cargo tauri build

```

- Builds both Rust backend and React frontend
- Creates platform-specific installers
- Outputs to `netok_desktop/src-tauri/target/release/bundle/`

## Project Structure

```text
/netok_core          # Rust business logic
/netok_bridge        # Tauri commands + FFI
/netok_desktop       # Tauri application (Rust + UI)
/ui                  # React frontend (canonical)
/ui_legacy           # Deprecated Rust + Iced UI
```

## Development Workflow

1. **Frontend changes**: Use `npm run dev:ui` for quick iteration
2. **Backend changes**: Use `cargo tauri dev` for full-stack development
3. **Testing production builds**: Use `npm run build:ui` then `cargo tauri build`

## Troubleshooting

- If `npm run build:ui` fails with permission errors, try running as Administrator
- Ensure port 5173 is available for the dev server
- Check that all dependencies are installed: `npm install` in both root and `/ui`
