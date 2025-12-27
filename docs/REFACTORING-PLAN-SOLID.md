# Refactoring Plan: SOLID Modularization

**Date:** 2025-12-27
**Status:** In Progress
**Branch:** `claude/refactor-netok-solid-018D7HYTot5UMHYqediLr9fK`

---

## Goal

Refactor `netok_core` to separate domain models, network infrastructure, and diagnostic logic following SOLID principles. Additionally, clean up UI state management by removing side effects from stores.

---

## Principles

1. **SRP (Single Responsibility):** Each module has one reason to change
2. **DIP (Dependency Inversion):** High-level modules don't depend on low-level details
3. **API Stability:** Public API of `netok_core` must NOT break — all re-exports preserved
4. **Lift & Shift:** Move code first, refactor logic later (minimize risk)

---

## Phase 1: Core Rust Modularization

### 1.1 Create `domain.rs` — Pure Data Types

**Responsibility:** Data structures with no logic, no external calls.

**Move from `lib.rs`:**
- `NodeId` enum
- `Status` enum
- `NodeInfo` struct
- `ComputerInfo` struct
- `ConnectionType` enum
- `NetworkInfo` struct
- `RouterInfo` struct
- `InternetInfo` struct
- `DiagnosticsSnapshot` struct
- `Settings` struct
- `DnsProvider` enum (including `primary()` and `secondary()` methods)

**Verification:** `cargo check -p netok_core`

---

### 1.2 Create `infrastructure/` Module — Platform-Specific Code

**Responsibility:** OS-specific implementations, external command execution.

**Structure:**
```
netok_core/src/infrastructure/
├── mod.rs           # Module exports
├── wifi.rs          # get_wifi_info() - Windows/dummy
├── gateway.rs       # get_default_gateway() - Windows/Linux/macOS
├── arp.rs           # get_router_mac() - Windows/dummy
├── dns.rs           # set_dns(), get_current_dns() - Windows/dummy
└── adapter.rs       # get_active_adapter_name() - Windows only
```

**Move from `lib.rs`:**
- `get_wifi_info()` (Windows + non-Windows)
- `get_default_gateway()` (Windows + Linux + macOS + other)
- `get_router_mac()` (Windows + non-Windows)
- `get_active_adapter_name()` (Windows only)
- `set_dns()` (Windows + non-Windows)
- `get_current_dns()` (Windows + non-Windows)
- `detect_connection_type()` (platform-independent helper)

**Verification:** `cargo check -p netok_core`

---

### 1.3 Create `diagnostics.rs` — Orchestration Logic

**Responsibility:** Combine infrastructure calls to produce domain objects.

**Move from `lib.rs`:**
- `run_diagnostics()`
- `get_computer_info()`
- `get_network_info()`
- `get_router_info()`
- `get_internet_info()`
- `test_dns()`
- `test_http()`
- `is_private_ip()`
- `is_private_ip_str()`
- `lookup_vendor_by_mac()`
- `detect_dns_provider()`
- `IpInfoResponse` struct (internal)

**Verification:** `cargo check -p netok_core`

---

### 1.4 Update `lib.rs` — Public Facade

**Responsibility:** Re-export public API, maintain backward compatibility.

**Final structure:**
```rust
mod domain;
mod infrastructure;
mod diagnostics;
mod oui_database;

// Re-export all domain types
pub use domain::*;

// Re-export public functions
pub use diagnostics::{
    run_diagnostics,
    get_computer_info,
    detect_dns_provider,
};

pub use infrastructure::dns::{
    set_dns,
    get_current_dns,
};

// Settings helper
pub fn get_default_settings() -> Settings { ... }
```

**Critical:** All current public exports must remain accessible at `netok_core::*`

**Verification:** `cargo check -p netok_bridge` (uses netok_core)

---

### 1.5 Full Test Suite

```bash
cargo test -p netok_core --verbose
cargo test -p netok_bridge --verbose
cargo clippy --all-targets --all-features -- -D warnings
```

---

## Phase 2: UI Store Cleanup

### 2.1 Refactor `themeStore.ts`

**Problem:** DOM manipulation inside store actions violates SRP.

**Current:**
```typescript
setTheme: (theme) => {
  set({ theme });
  document.documentElement.classList.add('dark'); // Side effect!
}
```

**After:**
```typescript
// themeStore.ts — pure state
setTheme: (theme) => {
  set({ theme, resolvedTheme: resolveTheme(theme) });
}

// useThemeEffect.ts — side effects in hook
export function useThemeEffect() {
  const resolvedTheme = useThemeStore(s => s.resolvedTheme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);
}
```

**Verification:** Toggle theme in app, verify DOM updates correctly.

---

### 2.2 Verify Integration

```bash
npm run build --prefix ui
cargo tauri dev
```

Manual checks:
- [ ] Theme toggle works (Light → Dark → System)
- [ ] DNS provider displays correctly
- [ ] Diagnostics run without errors

---

## Verification Checklist

### Automated
- [ ] `cargo check -p netok_core` passes
- [ ] `cargo check -p netok_bridge` passes
- [ ] `cargo test --workspace` passes
- [ ] `cargo clippy --all-targets -- -D warnings` passes
- [ ] `npm run build --prefix ui` passes

### Manual
- [ ] App starts without errors
- [ ] Diagnostics complete successfully
- [ ] Theme switching works
- [ ] DNS info displays

---

## Rollback Plan

If issues arise:
1. All changes are on feature branch
2. Main branch unchanged
3. Git revert to previous commit if needed

---

## Future Improvements (Not in this PR)

1. **Traits for platform code:** `PlatformNetwork` trait for better testability
2. **dnsStore → Zustand:** Convert class-based store to Zustand (low priority)
3. **Contract tests:** Add explicit API contract tests

---

## Files Changed

### New Files
- `netok_core/src/domain.rs`
- `netok_core/src/infrastructure/mod.rs`
- `netok_core/src/infrastructure/wifi.rs`
- `netok_core/src/infrastructure/gateway.rs`
- `netok_core/src/infrastructure/arp.rs`
- `netok_core/src/infrastructure/dns.rs`
- `netok_core/src/infrastructure/adapter.rs`
- `netok_core/src/diagnostics.rs`
- `ui/src/hooks/useThemeEffect.ts`

### Modified Files
- `netok_core/src/lib.rs` (reduced to facade)
- `ui/src/stores/themeStore.ts` (remove DOM manipulation)
- `ui/src/App.tsx` (add useThemeEffect)

### Unchanged
- `netok_bridge/` (imports remain same due to re-exports)
- `netok_desktop/` (no changes needed)
