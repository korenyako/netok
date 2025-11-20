# CLAUDE.md — AI Assistant Guide for Netok

**Version:** 2.0
**Last Updated:** 2025-11-20
**Status:** Active

This document is the comprehensive guide for Claude and other AI assistants working on the Netok project. It consolidates architecture, workflows, conventions, and best practices into a single reference.

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Project Overview](#project-overview)
3. [Architecture & Structure](#architecture--structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflows](#development-workflows)
6. [Coding Conventions](#coding-conventions)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Testing Strategy](#testing-strategy)
9. [Git & CI/CD](#git--cicd)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)
12. [Quality Gates](#quality-gates)

---

## Quick Reference

### Sources of Truth (SoT)

**ALWAYS** consult these documents before making changes:

- **Architecture:** [docs/SoT-ARCH.md](docs/SoT-ARCH.md) — Tauri + Rust + WebView architecture
- **UI/UX Specs:** [docs/UI-SPEC.md](docs/UI-SPEC.md) — Design tokens, breakpoints, typography, i18n rules
- **Implementation Plan:** [docs/IMPLEMENTATION-PLAN.md](docs/IMPLEMENTATION-PLAN.md) — Network diagnostics roadmap
- **i18n Guide:** [i18n/README.md](i18n/README.md) — Translation system and conventions
- **Contributing:** [CONTRIBUTING.md](CONTRIBUTING.md) — Contribution guidelines
- **Project Context:** [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — Universal AI assistant guide

### Deprecated (DO NOT USE)

- `/deprecated/**` — Old assistant guides (GEMINI.md, old CLAUDE.md, etc.)
- `docs/deprecated/**` — Outdated documentation
- `ui_legacy/` — Old Iced UI (frozen)
- `ui-new/` — Alternative React setup (deprecated)

### Essential Commands

```bash
# Development
cargo tauri dev                # Full stack dev (Rust + React hot reload)
npm run dev:ui --prefix ui     # Frontend only (http://localhost:5173)

# Building
cargo build --release -p netok-desktop    # Production build
npm run build --prefix ui                 # UI production bundle

# Testing
cargo test -p netok_core       # Rust core tests
cargo test -p netok_bridge     # Bridge tests
npm run test:run --prefix ui   # Frontend unit tests
npm run test:coverage --prefix ui  # Coverage report

# Code Quality
cargo fmt --all -- --check     # Format check
cargo clippy --all-targets --all-features -- -D warnings  # Linting
npm run lint --prefix ui       # ESLint

# Project Map
npm run map                    # Update PROJECT_MAP.md (auto-runs on commit)
npm run map:check              # Verify map is current
```

---

## Project Overview

**Netok** is a cross-platform network diagnostics desktop application that helps users monitor and troubleshoot their internet connectivity.

### Key Features

- **Network Diagnostics:** Tests connectivity through 4 nodes (Computer → Network → Router → Internet)
- **Status Monitoring:** Real-time network status with color-coded indicators
- **DNS Management:** Switch DNS providers and flush DNS cache
- **Multi-language:** Russian (default) and English with extensible i18n system
- **Cross-platform:** Windows, macOS, Linux (mobile planned via native UI)

### Design Principles

1. **Reliability First:** No GPU dependencies, no driver-related crashes
2. **Clear Separation:** Core (Rust) business logic ≠ UI (React/Tauri)
3. **Incremental Changes:** Small PRs, focused diffs, no heavy refactors
4. **User-Centric:** All strings localized, accessible UI, clear error messages
5. **Performance:** Startup <400ms, diagnostics run ≤1.5s, memory ≤200MB at idle

---

## Architecture & Structure

### High-Level Architecture

```
┌─────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)   │  ← UI Layer
├─────────────────────────────────────────┤
│  Tauri Bridge (Rust Commands + Types)   │  ← IPC Layer
├─────────────────────────────────────────┤
│  Core Business Logic (Rust)             │  ← Business Logic
├─────────────────────────────────────────┤
│  System APIs (OS-specific)              │  ← System Layer
└─────────────────────────────────────────┘
```

### Repository Structure

```
netok/
├── netok_core/              # Rust: business logic, network tests, models
│   ├── src/lib.rs           # Core diagnostics, data structures
│   ├── tests/               # Integration tests
│   └── benches/             # Criterion benchmarks
│
├── netok_bridge/            # Rust: Tauri commands + type conversions
│   ├── src/lib.rs           # Bridge functions (JSON wrappers)
│   └── tests/               # Bridge integration tests
│
├── netok_desktop/           # Tauri desktop application
│   └── src-tauri/           # Tauri Rust code + config
│       ├── src/lib.rs       # Command registration
│       ├── src/main.rs      # Entry point
│       └── tauri.conf.json  # Window config, build settings
│
├── ui/                      # React frontend (ACTIVE)
│   ├── src/
│   │   ├── api/tauri.ts     # Tauri command wrappers
│   │   ├── components/      # Reusable UI components
│   │   ├── screens/         # Full-page screen components
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── tests/           # Vitest unit tests
│   │   └── i18n.ts          # i18next initialization
│   ├── vite.config.ts       # Vite configuration
│   ├── vitest.config.ts     # Test configuration
│   └── tailwind.config.js   # Tailwind theme tokens
│
├── i18n/                    # Translation files
│   ├── en.json              # English translations
│   └── ru.json              # Russian translations
│
├── docs/                    # Documentation (Sources of Truth)
│   ├── SoT-ARCH.md          # Architecture decisions
│   ├── UI-SPEC.md           # UI/UX specifications
│   └── IMPLEMENTATION-PLAN.md  # Roadmap
│
├── .github/workflows/       # CI/CD pipelines
│   ├── test.yml             # Tests (Rust + TS, multi-OS)
│   └── release.yml          # Release builds
│
├── scripts/                 # Utility scripts
│   └── generate_project_map.mjs  # Auto-generate PROJECT_MAP.md
│
└── [config files]           # Cargo.toml, package.json, etc.
```

### Crate Responsibilities

| Crate | Purpose | Key Exports | Dependencies |
|-------|---------|-------------|--------------|
| **netok_core** | Network diagnostics, data models, business logic | `run_diagnostics()`, `Settings`, `DiagnosticsSnapshot` | serde, time, get_if_addrs, reqwest, trust-dns-resolver |
| **netok_bridge** | Tauri command handlers, type conversions | `run_diagnostics_json()`, `get_settings_json()`, `set_dns_provider()` | netok_core, serde_json |
| **netok_desktop** | Tauri app container, command registration | Tauri app entry point | netok_bridge, tauri |

---

## Technology Stack

### Backend (Rust)

- **Rust Edition:** 2021
- **Core Dependencies:**
  - `serde` v1 — Serialization/deserialization
  - `serde_json` v1 — JSON handling
  - `tauri` v2.0 — Desktop framework
  - `tokio` v1 — Async runtime
  - `reqwest` v0.12 — HTTP client (blocking mode for diagnostics)
  - `trust-dns-resolver` v0.23 — DNS lookups
  - `time` v0.3 — Timestamps
  - `thiserror` v1 — Error types
  - `get_if_addrs` v0.5 — Network interface info
  - `windows` v0.58 (Windows only) — WiFi API access

### Frontend (React)

- **React** v19.1.1 — UI framework
- **TypeScript** v5.8.3 — Type safety
- **Vite** v7.1.2 — Build tool & dev server
- **Tailwind CSS** v3.4.17 — Utility-first styling
- **State Management:**
  - Zustand v5.0.8 — Global state stores
  - Custom hooks for composable logic
- **Routing:** Custom state-based navigation (no react-router)
- **i18n:** i18next v25.5.2 + react-i18next v15.7.3
- **Notifications:** React Hot Toast v2.6.0
- **Tauri API:** @tauri-apps/api v2.9.0

### Testing Tools

- **Rust:** Built-in `cargo test`, Criterion v0.5 (benchmarks)
- **TypeScript:** Vitest v4.0.11, React Testing Library v16.3.0
- **DOM:** jsdom v27.2.0 + happy-dom v20.0.10
- **Coverage:** v8 provider, 30% thresholds

### Development Tools

- **Linting:** Clippy (Rust), ESLint v9.33.0 (TypeScript)
- **Formatting:** rustfmt (Rust), automatic via ESLint (TypeScript)
- **Git Hooks:** Husky v8.0.3
- **CI/CD:** GitHub Actions (multi-platform matrix)

---

## Development Workflows

### Starting Development

#### Full-Stack Development (Recommended)

```bash
# Starts Rust backend + React frontend with hot reload
cargo tauri dev
```

- Launches desktop window with WebView
- Backend recompiles on Rust changes
- Frontend hot-reloads on React/TS changes
- Console logs visible in terminal

#### Frontend-Only Development

```bash
cd ui
npm run dev
# Open http://localhost:5173 in browser
```

- Faster iteration for UI-only changes
- Tauri commands will fail (mock them in tests)
- Good for styling and component work

### Making Changes

1. **Read the relevant SoT documents** (see Quick Reference)
2. **Create small, focused changes** (one feature/fix per PR)
3. **Update tests** for new functionality
4. **Run quality checks** before committing
5. **Update i18n** if adding user-facing text
6. **Verify both light/dark themes** if touching UI

### Running Tests

```bash
# Rust tests
cargo test --workspace --verbose

# Frontend tests
cd ui
npm run test:run           # Run once
npm run test:coverage      # With coverage report

# Full CI simulation (local)
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --workspace --verbose
cd ui && npm run test:run && cd ..
```

### Building for Production

```bash
# Full production build (all platforms)
cargo tauri build

# Output locations:
# - netok_desktop/src-tauri/target/release/bundle/msi/  (Windows)
# - netok_desktop/src-tauri/target/release/bundle/dmg/  (macOS)
# - netok_desktop/src-tauri/target/release/bundle/appimage/  (Linux)
```

---

## Coding Conventions

### Rust Conventions

#### Naming

- **Functions/variables:** `snake_case` (e.g., `run_diagnostics`, `local_ip`)
- **Types/structs/enums:** `PascalCase` (e.g., `DiagnosticsSnapshot`, `NodeStatus`)
- **Constants:** `SCREAMING_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT_MS`)

#### Code Style

- **Formatting:** Use `cargo fmt` (enforced by CI)
- **Linting:** Zero Clippy warnings (enforced: `-D warnings`)
- **Error Handling:**
  - Use `thiserror` for custom error types
  - Return `Result<T, Error>` from fallible functions
  - Tauri commands return `Result<T, String>` (error as string)
- **Async:** Use `tokio::spawn_blocking()` for long-running synchronous work

#### Example

```rust
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum DiagnosticsError {
    #[error("Network timeout: {0}")]
    Timeout(String),
    #[error("DNS resolution failed")]
    DnsFailure,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeInfo {
    pub id: String,
    pub status: NodeStatus,
    pub latency_ms: Option<u32>,
}

pub fn run_diagnostics() -> Result<DiagnosticsSnapshot, DiagnosticsError> {
    // Implementation
    Ok(DiagnosticsSnapshot {
        at_utc: current_timestamp(),
        nodes: gather_nodes()?,
    })
}
```

### TypeScript/React Conventions

#### Naming

- **Variables/functions:** `camelCase` (e.g., `runDiagnostics`, `isLoading`)
- **Components:** `PascalCase` (e.g., `StatusScreen`, `NodeCard`)
- **Types/interfaces:** `PascalCase` (e.g., `DiagnosticsSnapshot`, `NodeInfo`)
- **Files:** Match export name (e.g., `StatusScreen.tsx`, `useDiagnostics.ts`)

#### Code Style

- **Formatting:** ESLint (auto-fix on save)
- **React:** Functional components with hooks
- **State:** Zustand stores for global state, `useState` for local
- **Props:** Destructure in function signature
- **Types:** Explicit types for props, prefer inference for locals

#### Example

```typescript
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useDiagnosticsStore } from '../stores/useDiagnostics';

interface NodeCardProps {
  nodeId: string;
  status: 'ok' | 'warning' | 'error';
  latency?: number;
}

export function NodeCard({ nodeId, status, latency }: NodeCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshDiagnostics } = useDiagnosticsStore();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refreshDiagnostics();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="node-card">
      {/* UI implementation */}
    </div>
  );
}
```

### File Organization

#### Rust

- **One module per file** (prefer `lib.rs` with modules over `mod/` directories for small crates)
- **Tests:** Either inline `#[cfg(test)] mod tests` or separate `tests/` directory
- **Public API:** Clearly document with `///` doc comments

#### TypeScript

- **One component per file** (with related types in same file)
- **Index files:** Use sparingly, prefer explicit imports
- **Barrel exports:** Avoid (explicit imports are clearer)

---

## Internationalization (i18n)

### System Architecture

Netok uses a **dual-layer i18n system** for performance:

1. **Rust layer:** Enum-based keys (compile-time safety)
2. **React layer:** JSON-based translations (runtime flexibility)

### Key Conventions

- **Keys:** `PascalCase` (e.g., `AppName`, `NodeComputer`, `FactSignal`)
- **Categories:**
  - `Node*` — Node names
  - `Fact*` — Data labels
  - `Network*` — Network types
  - `Settings*` — Settings sections
  - `Diagnostic*` — Diagnostics text
- **Placeholders:** `{key}` syntax (e.g., `{down}`, `{up}`, `{dbm}`)
- **Fallback:** Current language → English → `!MISSING: key!`

### Adding New Strings

1. **Update JSON files:**

```json
// i18n/en.json
{
  "NewFeature": "New Feature",
  "NewFeatureDesc": "Description of the new feature"
}

// i18n/ru.json
{
  "NewFeature": "Новая функция",
  "NewFeatureDesc": "Описание новой функции"
}
```

2. **Use in React code:**

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('NewFeature')}</h1>
      <p>{t('NewFeatureDesc')}</p>
    </div>
  );
}
```

3. **For templated strings:**

```typescript
// JSON
{
  "SpeedValue": "Speed: {down}/{up} Mbps"
}

// Code
t('SpeedValue', { down: '100', up: '50' })
// → "Speed: 100/50 Mbps"
```

### Important Rules

- **NO hardcoded strings** in UI code (enforced by pre-commit hook for Cyrillic)
- **NO Cyrillic in Rust/TypeScript** files (all text from JSON)
- **ALWAYS add to both `en.json` AND `ru.json`**
- **TEST both languages** before committing

### Pre-commit Hook Validation

```bash
# Automatically checks for hardcoded Cyrillic text
# If found, commit is blocked with error message
rg "[А-Яа-я]" desktop/src --type rust
```

See [UI-SPEC.md §13](docs/UI-SPEC.md) and [i18n/README.md](i18n/README.md) for detailed rules.

---

## Testing Strategy

### Rust Tests

#### Unit Tests (Inline)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_diagnostics_snapshot() {
        let snapshot = DiagnosticsSnapshot {
            at_utc: "2025-11-20T10:00:00Z".to_string(),
            nodes: vec![],
        };
        assert_eq!(snapshot.nodes.len(), 0);
    }
}
```

#### Integration Tests

Location: `netok_bridge/tests/integration_tests.rs`

```rust
#[test]
fn test_settings_roundtrip() {
    let settings = Settings {
        language: "en".to_string(),
        test_timeout_ms: 2000,
    };
    let json = serde_json::to_string(&settings).unwrap();
    let parsed: Settings = serde_json::from_str(&json).unwrap();
    assert_eq!(parsed.language, "en");
}
```

#### Running

```bash
cargo test --workspace --verbose
cargo test -p netok_core           # Single crate
cargo test --lib                   # Only lib tests
cargo test test_diagnostics        # Specific test
```

### TypeScript Tests

#### Component Tests

Location: `ui/src/tests/`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StatusScreen } from '../screens/StatusScreen';

describe('StatusScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<StatusScreen />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays diagnostics after load', async () => {
    render(<StatusScreen />);
    await waitFor(() => {
      expect(screen.getByText(/internet/i)).toBeInTheDocument();
    });
  });
});
```

#### Store Tests

```typescript
import { describe, it, expect } from 'vitest';
import { useDiagnosticsStore } from '../stores/useDiagnostics';

describe('useDiagnosticsStore', () => {
  it('initializes with null snapshot', () => {
    const { snapshot } = useDiagnosticsStore.getState();
    expect(snapshot).toBeNull();
  });
});
```

#### Running

```bash
cd ui
npm run test:run           # Run once
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:ui            # Visual UI (Vitest UI)
```

### Test Coverage

- **Current threshold:** 30% (lines, functions, branches, statements)
- **Goal:** Increase incrementally
- **Reports:** `ui/coverage/` (HTML and LCOV)
- **CI:** Uploads to Codecov on Ubuntu runs

### Benchmarks

Location: `netok_core/benches/`

```bash
cargo bench --package netok_core
# Results: target/criterion/
# CI: Runs on push to main/master, uploads artifacts
```

---

## Git & CI/CD

### Branch Strategy

- **Main branch:** `main` (or `master` if legacy)
- **Feature branches:** `feature/short-description`
- **Claude branches:** `claude/claude-md-*` (auto-generated by Claude Code)
- **Hotfix branches:** `hotfix/issue-number`

### Commit Messages

Follow conventional commits:

```
feat: add DNS provider selection UI
fix: resolve RSSI display bug on Windows
docs: update CLAUDE.md with testing section
refactor: simplify diagnostics state management
test: add coverage for DNS store
chore: update dependencies
```

### Pre-commit Hooks

Automatically run via Husky:

1. **Update PROJECT_MAP.md** (`npm run map`)
2. **Block Cyrillic in code** (prevents hardcoded Russian text)

### CI/CD Pipeline

#### Test Workflow (`.github/workflows/test.yml`)

Runs on: Push to main/master, all PRs

**Jobs:**

1. **Rust Tests** (Ubuntu + Windows)
   - Format check (`cargo fmt --check`)
   - Clippy all crates (`-D warnings`)
   - Run tests (`cargo test --verbose`)

2. **TypeScript Tests** (Ubuntu + Windows)
   - Install dependencies
   - Run tests with coverage
   - Upload coverage to Codecov (Ubuntu only)

3. **Build Check** (Ubuntu)
   - Build UI (`npm run build`)
   - Build core + bridge (`cargo build --release`)

4. **Benchmarks** (Ubuntu, main/master only)
   - Run Criterion benchmarks
   - Upload results as artifacts (30-day retention)

#### Release Workflow (`.github/workflows/release.yml`)

Runs on: Tags matching `v*.*.*`

- Multi-platform builds (Windows MSI, macOS DMG, Linux AppImage)
- Code signing (macOS)
- GitHub Release creation with artifacts

### Quality Gates

Before merge, ALL must pass:

- ✅ Formatting check (rustfmt)
- ✅ Clippy with zero warnings
- ✅ All Rust tests pass
- ✅ All TypeScript tests pass
- ✅ Coverage meets 30% threshold
- ✅ Build succeeds on Ubuntu

---

## Common Tasks

### Adding a New Tauri Command

1. **Add function to `netok_bridge`:**

```rust
// netok_bridge/src/lib.rs
pub fn my_new_command() -> Result<String, String> {
    // Implementation
    Ok("result".to_string())
}
```

2. **Register in `netok_desktop`:**

```rust
// netok_desktop/src-tauri/src/lib.rs
use netok_bridge::my_new_command;

fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // ... existing commands
            my_new_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

3. **Call from frontend:**

```typescript
// ui/src/api/tauri.ts
export async function myNewCommand(): Promise<string> {
  return await invoke('my_new_command');
}

// Usage in component
import { myNewCommand } from '../api/tauri';

const result = await myNewCommand();
```

### Adding a New Screen

1. **Create screen component:**

```typescript
// ui/src/screens/NewScreen.tsx
export function NewScreen() {
  return (
    <div className="screen-container">
      <h1 className="text-xl font-semibold">New Screen</h1>
      {/* Content */}
    </div>
  );
}
```

2. **Add route in navigation:**

```typescript
// ui/src/hooks/useNavigation.ts
export type ScreenType = 'home' | 'diagnostics' | 'new-screen' | 'settings';

// Update navigation logic
```

3. **Add to bottom nav (if needed):**

```typescript
// ui/src/components/BottomNav.tsx
<button onClick={() => navigate('new-screen')}>
  <NewIcon />
</button>
```

### Adding a DNS Provider

1. **Update core types:**

```rust
// netok_core/src/lib.rs
#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DnsProvider {
    // ... existing
    NewProvider,
}

impl DnsProvider {
    pub fn servers(&self) -> Vec<String> {
        match self {
            // ... existing
            Self::NewProvider => vec!["1.2.3.4".to_string(), "5.6.7.8".to_string()],
        }
    }
}
```

2. **Add translations:**

```json
// i18n/en.json
{
  "DnsNewProvider": "New Provider",
  "DnsNewProviderDesc": "Description of new provider"
}
```

3. **Add detail screen:**

```typescript
// ui/src/screens/dns/NewProviderDetailScreen.tsx
export function NewProviderDetailScreen() {
  const { t } = useTranslation();

  return (
    <DetailScreenLayout
      title={t('DnsNewProvider')}
      description={t('DnsNewProviderDesc')}
      // ... rest
    />
  );
}
```

### Debugging

#### Backend (Rust)

```rust
// Add logging
println!("Debug: value = {:?}", some_value);

// Use dbg! macro
dbg!(&diagnostics_snapshot);

// Run with full output
cargo run -p netok-desktop --verbose
```

#### Frontend (React)

```typescript
// Console logging
console.log('Debug:', { variable });

// React DevTools (in dev mode)
// Inspect component tree, props, state

// Check Tauri console for errors
// Open DevTools in dev mode: Right-click → Inspect
```

#### Tauri IPC

```typescript
// Log all Tauri commands
import { invoke } from '@tauri-apps/api/core';

const debugInvoke = async (cmd: string, args?: any) => {
  console.log(`[Tauri] Calling ${cmd}`, args);
  const result = await invoke(cmd, args);
  console.log(`[Tauri] Result from ${cmd}`, result);
  return result;
};
```

---

## Troubleshooting

### Common Issues

#### "Cannot find module '@tauri-apps/api'"

**Solution:** Install frontend dependencies

```bash
cd ui
npm install
```

#### "Error: failed to bundle project"

**Causes:**
- UI not built: `cd ui && npm run build`
- Rust compilation error: Check error message, fix Rust code
- Missing dependencies: `cargo update`

#### "Type error in TypeScript"

**Solution:** Check types in `ui/src/api/tauri.ts` match Rust return types

```typescript
// Ensure types match Rust structs
export interface DiagnosticsSnapshot {
  at_utc: string;          // Matches Rust String
  nodes: NodeInfo[];       // Matches Rust Vec<NodeInfo>
}
```

#### "Translation key not found"

**Solution:** Add to BOTH `en.json` and `ru.json`

```bash
# Check which keys are missing
cd i18n
diff <(jq -r 'keys[]' en.json | sort) <(jq -r 'keys[]' ru.json | sort)
```

#### "Pre-commit hook fails"

**Causes:**
- PROJECT_MAP.md out of date: `npm run map`
- Cyrillic in code: Remove hardcoded Russian text, use i18n

#### "Tests failing in CI but pass locally"

**Common causes:**
- OS-specific behavior (Windows vs Linux)
- Missing dependencies in CI
- Timeout issues (increase timeout in tests)
- Date/time formatting (use fixed timestamps in tests)

### Performance Issues

#### Slow startup

- Check bundle size: `cd ui/dist && du -sh *`
- Analyze with: `npm run build -- --report`
- Optimize images, remove unused dependencies

#### Slow diagnostics

- Check timeouts in Settings
- Profile with: `cargo build --release && time cargo run`
- Check network conditions (DNS/HTTP test timeouts)

---

## Quality Gates

### Before Committing

```bash
# Format check
cargo fmt --all -- --check

# Lint check
cargo clippy --all-targets --all-features -- -D warnings

# Run tests
cargo test --workspace --verbose
cd ui && npm run test:run

# Build check
cd ui && npm run build
```

### Before Creating PR

- [ ] All tests pass locally
- [ ] No Clippy warnings
- [ ] Code formatted (rustfmt)
- [ ] Added/updated tests for new functionality
- [ ] Updated i18n (both en.json and ru.json)
- [ ] Verified in both light and dark themes
- [ ] Tested at multiple window sizes (240px, 320px, 600px+)
- [ ] Updated documentation if needed
- [ ] PR description explains changes clearly
- [ ] Referenced relevant issue numbers
- [ ] Kept changes small and focused

### Code Review Checklist

- [ ] Follows architecture patterns (see SoT-ARCH.md)
- [ ] Respects UI-SPEC tokens and conventions
- [ ] No hardcoded strings (all from i18n)
- [ ] Error handling appropriate
- [ ] Performance considerations addressed
- [ ] No new heavy dependencies without discussion
- [ ] Tests provide adequate coverage
- [ ] Code is readable and well-commented

---

## Additional Resources

### Documentation

- [Tauri Documentation](https://tauri.app/v2/guide/)
- [React Documentation](https://react.dev/)
- [Rust Book](https://doc.rust-lang.org/book/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

### Project-Specific

- **PROJECT_MAP.md** — Auto-generated file tree (run `npm run map`)
- **Cargo workspace** — All Rust crates defined in root `Cargo.toml`
- **Tauri config** — `netok_desktop/src-tauri/tauri.conf.json`
- **Vite config** — `ui/vite.config.ts`

### Getting Help

1. **Check SoT documents** first (docs/SoT-ARCH.md, docs/UI-SPEC.md)
2. **Search existing issues** on GitHub
3. **Review recent commits** for similar changes
4. **Run with verbose output** for debugging

---

## Changelog

- **2025-11-20:** v2.0 — Comprehensive rewrite with current project state
- **2025-09-11:** v1.0 — Deprecated in favor of PROJECT_CONTEXT.md
- **Earlier:** Original CLAUDE.md (see deprecated/CLAUDE.md)

---

## License

- **Core (netok_core):** Apache-2.0
- **Desktop binaries:** Proprietary (see LICENSE.Proprietary)

---

**END OF DOCUMENT**

For questions or clarifications, refer to PROJECT_CONTEXT.md or consult the relevant SoT document.
