# macOS Port Analysis — Netok

**Date:** 2026-03-02
**Version analyzed:** 0.4.5
**Analyst:** Claude (automated code audit)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Windows-Specific Code Inventory](#windows-specific-code-inventory)
3. [Detailed Analysis by Module](#detailed-analysis-by-module)
4. [Cargo.toml & Build Configuration](#cargotoml--build-configuration)
5. [Tauri Config (tauri.conf.json)](#tauri-config-tauriconfjson)
6. [Effort Estimate](#effort-estimate)
7. [Porting Plan](#porting-plan)
8. [Risk Assessment](#risk-assessment)

---

## Executive Summary

Netok is currently a **Windows-first** application with extensive use of Windows-specific APIs
across 8 Rust source files. The project already has a good architectural foundation for
cross-platform support — most Windows code is isolated behind `#[cfg(target_os = "windows")]`
with stub fallbacks for other platforms. Some modules (gateway discovery) already have
a working macOS implementation.

### Key Numbers

| Metric | Value |
|--------|-------|
| Files with Windows-specific code | 8 |
| Windows-only functions | ~20 |
| Lines of Windows-specific Rust | ~1,200 |
| Already has macOS impl | 1 module (gateway) |
| Already has non-Windows stubs | All modules |
| Estimated porting effort | **3–5 weeks** (one developer) |

### Biggest Challenges

1. **Wi-Fi info & security** — Windows WLAN API → macOS CoreWLAN framework (~400 lines)
2. **VPN / process elevation** — UAC/ShellExecuteExW → macOS `osascript`/`launchd` (~300 lines)
3. **DNS configuration** — `netsh` → `networksetup` commands (~200 lines)
4. **Installer & bundling** — NSIS → DMG/pkg, wintun.dll → macOS tun/utun

---

## Windows-Specific Code Inventory

### Summary Table

| # | Module | File | Lines | Windows API | Complexity |
|---|--------|------|-------|-------------|------------|
| 1 | Hidden Command | `netok_core/src/infrastructure/mod.rs:25-31` | 7 | `CREATE_NO_WINDOW` flag | Easy |
| 2 | PowerShell Wrapper | `netok_core/src/infrastructure/mod.rs:38-59` | 22 | PowerShell + UTF-16 fix | Easy |
| 3 | Gateway Discovery | `netok_core/src/infrastructure/gateway.rs:4-30` | 27 | `route print` | **Done** |
| 4 | Active Adapter | `netok_core/src/infrastructure/adapter.rs:4-40` | 37 | PowerShell `Get-NetAdapter` | Easy |
| 5 | ARP Lookup | `netok_core/src/infrastructure/arp.rs:4-192` | 188 | PowerShell `Get-NetNeighbor`, `ping` | Medium |
| 6 | DNS Config | `netok_core/src/infrastructure/dns.rs:6-309` | 303 | `netsh`, `ipconfig`, PowerShell | Medium |
| 7 | Wi-Fi Info | `netok_core/src/infrastructure/wifi.rs:49-291` | 243 | Win32 WLAN API | Hard |
| 8 | Wi-Fi Security | `netok_core/src/infrastructure/security.rs:53-412` | 360 | Win32 WLAN API | Hard |
| 9 | Process Elevation | `netok_desktop/src-tauri/src/lib.rs:37-268` | 232 | `ShellExecuteExW`, `TerminateProcess` | Hard |
| 10 | VPN Connect | `netok_desktop/src-tauri/src/lib.rs:581-669` | 89 | Elevated sing-box spawn | Hard |
| 11 | VPN Disconnect | `netok_desktop/src-tauri/src/lib.rs:686-784` | 99 | `taskkill`, `TerminateProcess` | Hard |
| 12 | VPN Monitor | `netok_desktop/src-tauri/src/lib.rs:820-829` | 10 | `OpenProcess` | Easy |
| 13 | DNS Elevated Exec | `netok_desktop/src-tauri/src/lib.rs:331-346` | 16 | Elevated `cmd.exe` + `.bat` | Medium |
| 14 | Kill Orphans | `netok_desktop/src-tauri/src/lib.rs:948-965` | 18 | `taskkill /F /IM` | Easy |
| 15 | VPN Cleanup | `netok_desktop/src-tauri/src/lib.rs:970-977` | 8 | `TerminateProcess` via handle | Easy |

---

## Detailed Analysis by Module

### 1. Hidden Command Helper (`infrastructure/mod.rs:25-31`)

**What it does:** Creates `std::process::Command` with `CREATE_NO_WINDOW` flag (0x08000000) to
prevent child processes from spawning visible console windows in a GUI app.

**macOS equivalent:** Not needed. macOS doesn't create console windows for child processes
in GUI apps. Use `std::process::Command::new()` directly.

**Porting complexity:** Easy
**Estimated effort:** 0.5 hours

```rust
#[cfg(target_os = "macos")]
pub fn hidden_cmd(program: &str) -> std::process::Command {
    std::process::Command::new(program) // No special flags needed
}
```

---

### 2. PowerShell Wrapper (`infrastructure/mod.rs:38-59`)

**What it does:** Runs PowerShell commands with UTF-8 encoding fix and `en-US` culture.
Used by adapter, ARP, DNS modules.

**macOS equivalent:** Not needed as a concept. macOS uses standard shell commands (`/bin/sh`)
that output UTF-8 by default. Individual callers will use different system commands.

**Porting complexity:** Easy (remove, replace with direct command calls in each module)
**Estimated effort:** No direct port — each consumer module handles its own commands.

---

### 3. Gateway Discovery (`infrastructure/gateway.rs:4-30`) — ALREADY DONE

**What it does:** Parses `route print 0.0.0.0` output.

**macOS implementation (lines 58-79):** Already implemented using `netstat -nr`.

**Status: No work needed.**

---

### 4. Active Adapter Name (`infrastructure/adapter.rs:4-40`)

**What it does:** Finds the active network adapter name using PowerShell commands
(`Get-NetAdapter`, `Get-NetIPInterface`). Used by DNS module to target the right interface.

**macOS equivalent:** Use `networksetup -listallhardwareports` or `scutil --nwi` to get
the active interface. The active service can be found via:
```sh
route -n get default | grep interface   # → e.g. "en0"
networksetup -listnetworkserviceorder   # → maps interface to service name
```

**Porting complexity:** Easy
**Estimated effort:** 2-3 hours

```rust
#[cfg(target_os = "macos")]
pub fn get_active_adapter_name() -> Option<String> {
    // 1. Get default interface from `route -n get default`
    // 2. Map interface (en0) to service name ("Wi-Fi") via networksetup
    // networksetup needs the service name for DNS config
}
```

---

### 5. ARP Table Lookups (`infrastructure/arp.rs:4-192`)

**What it does:**
- `get_router_mac()` — Gets router MAC via `Get-NetNeighbor` PowerShell command
- `ping_sweep()` — Pings /24 subnet to populate ARP table (parallel, 200ms timeout)
- `get_all_arp_entries()` — Gets full ARP table via `Get-NetNeighbor` PowerShell

**macOS equivalent:**
- `get_router_mac()` → Parse `arp -a <gateway_ip>` output
- `ping_sweep()` → Use `ping -c 1 -t 1 <ip>` (note: `-t` is timeout on macOS, `-W` on Linux)
- `get_all_arp_entries()` → Parse `arp -a` output (format: `host (ip) at mac on iface`)

**Porting complexity:** Medium
**Estimated effort:** 4-6 hours

**Notes:**
- macOS `arp -a` outputs in format: `? (192.168.1.1) at aa:bb:cc:dd:ee:ff on en0 ifscope [ethernet]`
- MAC format is already colon-separated on macOS (no conversion needed)
- `ping -c 1 -t 1` uses `-t` for timeout (seconds), not `-w` (Windows) or `-W` (Linux)
- `format_mac()` and `subnet_prefix()` helper functions can be shared cross-platform

---

### 6. DNS Configuration (`infrastructure/dns.rs:6-309`)

**What it does:**
- `set_dns()` — Sets DNS via `netsh interface ip set dns` (IPv4 + IPv6)
- `build_dns_commands()` — Builds `netsh` command strings
- `get_current_dns()` — Gets DNS servers via `Get-DnsClientServerAddress` PowerShell
- `flush_dns()` — Runs `ipconfig /flushdns`

**macOS equivalent:**
- `set_dns()` → `networksetup -setdnsservers "Wi-Fi" 8.8.8.8 8.8.4.4`
  - IPv6: `networksetup -setdnsservers "Wi-Fi" 2001:4860:4860::8888`
  - Auto/DHCP: `networksetup -setdnsservers "Wi-Fi" "Empty"`
  - **Requires sudo** (equivalent to Windows elevation)
- `get_current_dns()` → `networksetup -getdnsservers "Wi-Fi"` or parse `/etc/resolv.conf`
- `flush_dns()` → `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`

**Porting complexity:** Medium
**Estimated effort:** 6-8 hours

**Key differences:**
- `networksetup` uses service name ("Wi-Fi"), not adapter name ("en0")
- DNS changes require `sudo` on macOS (similar to Windows elevation)
- IPv4 and IPv6 are set separately but via same `networksetup` command
- `flush_dns` command varies by macOS version:
  - macOS 12+: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
  - macOS 11: same
  - macOS 10.15 and earlier: `sudo killall -HUP mDNSResponder`

---

### 7. Wi-Fi Information (`infrastructure/wifi.rs:49-291`)

**What it does:** Gets detailed Wi-Fi connection info using Windows WLAN API:
- SSID, signal strength (RSSI), transmit rate, channel frequency, PHY type
- Adapter state (Connected/Disconnected/Disabled/Absent)
- Uses RAII guards for WLAN handle cleanup

**Windows APIs used:**
- `WlanOpenHandle`, `WlanCloseHandle`
- `WlanEnumInterfaces`
- `WlanQueryInterface` (connection attributes)
- `WlanGetNetworkBssList` (BSS list for channel frequency)

**macOS equivalent — Option A: CoreWLAN framework (via objc2 crate)**

```rust
// Requires objc2 + objc2-core-wlan crates
use objc2_core_wlan::CWWiFiClient;

let client = CWWiFiClient::shared();
let interface = client.interface(); // CWInterface
let ssid = interface.ssid();
let rssi = interface.rssiValue();         // dBm
let noise = interface.noiseMeasurement(); // dBm
let tx_rate = interface.transmitRate();   // Mbps (f64)
let channel = interface.wlanChannel();    // CWChannel
let phy_mode = interface.activePHYMode(); // CWPHYMode
```

**macOS equivalent — Option B: Shell command (simpler, less info)**

```sh
/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I
# Returns: SSID, BSSID, RSSI, channel, etc.
```

**Porting complexity:** Hard
**Estimated effort:** 8-12 hours (CoreWLAN) or 3-4 hours (airport CLI)

**Recommendation:** Start with `airport -I` CLI approach for v1, migrate to CoreWLAN later.
The CLI approach is simpler but `airport` is a private framework tool that Apple may
deprecate. CoreWLAN via `objc2` crate gives full API access but requires Objective-C FFI.

**New crate dependencies:**
- Option A: `objc2 = "0.6"`, `objc2-core-wlan = "0.3"`, `objc2-foundation = "0.3"`
- Option B: None (shell command parsing)

---

### 8. Wi-Fi Security Checks (`infrastructure/security.rs:53-412`)

**What it does:**
- `check_encryption()` — Determines Wi-Fi encryption type (Open/WEP/WPA/WPA2/WPA3) via WLAN API
- `check_evil_twin()` — Scans for duplicate SSIDs with mixed encryption (evil twin detection)
- Both use same WLAN API as wifi.rs (WlanOpenHandle, WlanQueryInterface, WlanGetNetworkBssList)

**macOS equivalent:**
- `check_encryption()` → CoreWLAN: `CWInterface.security()` returns `CWSecurity` enum
  - Or parse `airport -I` output field `link auth`
- `check_evil_twin()` → CoreWLAN: `CWInterface.scanForNetworks(withName:)` to get all BSSIDs
  - Or `airport -s` to list all visible networks with SSID, BSSID, security

**Porting complexity:** Hard
**Estimated effort:** 8-12 hours (CoreWLAN) or 4-6 hours (airport CLI)

**Notes:**
- `EncryptionType` enum and `SecurityCheck` types are cross-platform (keep as-is)
- `check_arp_spoofing()` and `check_dns_hijacking()` are already cross-platform
- Evil twin detection needs the BSS list — CoreWLAN `scanForNetworks` is the cleanest way

---

### 9. Process Elevation (`netok_desktop/src-tauri/src/lib.rs:37-268`)

**What it does:**
- `spawn_elevated()` — Launches process with UAC prompt via `ShellExecuteExW` with `"runas"` verb
- `is_process_alive()` — Checks process by PID via `OpenProcess`
- `run_elevated_wait()` — Launches elevated, waits for completion, checks exit code
- `terminate_process()` — Kills process via stored HANDLE + `TerminateProcess`
- `close_handle()` — Closes raw HANDLE
- `kill_process_elevated()` — Fallback: elevated `taskkill` via UAC

**macOS equivalent:**

macOS doesn't have UAC. Elevation options:

1. **`osascript` with `do shell script ... with administrator privileges`**
   - Shows native macOS password dialog
   - Best for one-shot elevated commands (like DNS config)
   ```sh
   osascript -e 'do shell script "networksetup -setdnsservers Wi-Fi 8.8.8.8" with administrator privileges'
   ```

2. **`sudo` with password pipe** (not recommended for GUI apps)

3. **`SMJobBless` / `launchd` privileged helper** (proper approach for long-running daemons)
   - Register a privileged helper tool via `SMJobBless`
   - The helper runs as root and can manage sing-box
   - Requires code signing and a `launchd.plist`
   - One-time authorization prompt

4. **Process management:**
   - `is_process_alive()` → `kill(pid, 0)` (signal 0 = test if process exists)
   - `terminate_process()` → `kill(pid, SIGTERM)` then `kill(pid, SIGKILL)`
   - No HANDLEs on Unix — just use PID + signals
   - `waitpid(pid, WNOHANG)` to check if exited

**Porting complexity:** Hard
**Estimated effort:** 12-16 hours

**Recommendation:** For v1 macOS, use `osascript` for DNS config elevation and
a simple `kill(pid, SIGTERM)` for process management. For v2, implement a
`SMJobBless` privileged helper for sing-box lifecycle management.

---

### 10-11. VPN Connect/Disconnect (`lib.rs:581-784`)

**What it does:**
- Spawns sing-box elevated with UAC, stores PID + HANDLE
- Multi-step disconnect: TerminateProcess → taskkill → elevated taskkill
- Monitors process in background, emits events on unexpected exit

**macOS equivalent:**
- **sing-box on macOS** uses `utun` (macOS built-in TUN) instead of `wintun.dll`
- No need to bundle `wintun.dll`
- sing-box needs root for TUN interface creation → use `osascript` or privileged helper
- Process kill: `kill(pid, SIGTERM)`, fallback to `SIGKILL`
- Process monitoring: `waitpid()` or periodic `kill(pid, 0)` check

**Porting complexity:** Hard
**Estimated effort:** 10-14 hours (part of process elevation work)

**Key changes:**
- Remove `wintun.dll` resource bundling
- Add sing-box macOS binary (`sing-box-aarch64-apple-darwin`)
- Replace `ShellExecuteExW("runas")` with `osascript` elevation
- Replace HANDLE-based process management with PID + Unix signals
- Replace `taskkill` with `kill` command

---

### 12-15. Minor Windows Items

| Item | What it does | macOS equivalent | Effort |
|------|-------------|-----------------|--------|
| VPN Monitor (`lib.rs:820-829`) | `is_process_alive(pid)` | `kill(pid, 0) == 0` | 0.5h |
| DNS Elevated (`lib.rs:331-346`) | cmd.exe + .bat + UAC | `osascript` with admin privileges | 2h |
| Kill Orphans (`lib.rs:948-965`) | `taskkill /F /IM sing-box.exe` | `pkill -f sing-box` or `killall sing-box` | 1h |
| VPN Cleanup (`lib.rs:970-977`) | `TerminateProcess(handle)` | `kill(pid, SIGTERM)` | 0.5h |

---

## Cargo.toml & Build Configuration

### Windows-Only Dependencies

**`netok_core/Cargo.toml` (line 19-20):**
```toml
[target.'cfg(windows)'.dependencies]
windows = { version = "0.58", features = ["Win32_NetworkManagement_WiFi", "Win32_Foundation"] }
```

**`netok_desktop/src-tauri/Cargo.toml` (lines 33-39):**
```toml
[target.'cfg(windows)'.dependencies]
windows = { version = "0.58", features = [
    "Win32_UI_Shell",
    "Win32_System_Threading",
    "Win32_System_Registry",
    "Win32_Foundation",
] }
```

### Changes Needed for macOS

**`netok_core/Cargo.toml` — add:**
```toml
[target.'cfg(target_os = "macos")'.dependencies]
# Option A: CoreWLAN via objc2 (recommended for full Wi-Fi API)
objc2 = "0.6"
objc2-foundation = "0.3"
objc2-core-wlan = "0.3"
# Option B: No new deps (use airport CLI parsing)
```

**`netok_desktop/src-tauri/Cargo.toml` — add:**
```toml
[target.'cfg(target_os = "macos")'.dependencies]
# libc for kill()/waitpid() if not using nix crate
libc = "0.2"
# OR use nix for cleaner Unix API:
# nix = { version = "0.29", features = ["signal", "process"] }
```

### Library Name Workaround

```toml
[lib]
name = "netok_desktop_lib"  # Windows-specific workaround (cargo#8519)
```
This is harmless on macOS — no change needed.

---

## Tauri Config (tauri.conf.json)

### Current State (Windows-only)

```json
{
  "bundle": {
    "targets": ["nsis"],           // ← Windows only
    "icon": ["icons/32x32.png", "icons/icon.ico"],  // ← .ico is Windows
    "externalBin": ["binaries/sing-box"],
    "resources": { "binaries/wintun.dll": "./" },    // ← Windows only
    "windows": {
      "nsis": { ... }             // ← Windows only
    }
  }
}
```

### Changes Needed

```json
{
  "bundle": {
    "targets": "all",  // or ["nsis", "dmg", "app"]
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",        // Add for macOS
      "icons/128x128@2x.png",     // Add for macOS Retina
      "icons/icon.icns",          // Add macOS icon format
      "icons/icon.ico"
    ],
    "externalBin": ["binaries/sing-box"],
    "resources": {
      "binaries/wintun.dll": "./"  // Keep for Windows, macOS ignores
    },
    "windows": { ... },
    "macOS": {
      "minimumSystemVersion": "12.0",
      "frameworks": [],
      "entitlements": "Entitlements.plist",   // For network + TUN access
      "signingIdentity": "Developer ID Application: ..."
    }
  }
}
```

### macOS Entitlements Required

Create `netok_desktop/src-tauri/Entitlements.plist`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "...">
<plist version="1.0">
<dict>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <!-- For sing-box TUN interface (if using SMJobBless helper) -->
    <key>com.apple.security.temporary-exception.mach-lookup.global-name</key>
    <array>
        <string>com.netok.vpn-helper</string>
    </array>
</dict>
</plist>
```

### CI/CD Changes

**`.github/workflows/release.yml` — add macOS job:**
- Runner: `macos-latest`
- Download `sing-box-aarch64-apple-darwin` (ARM64) and optionally `x86_64-apple-darwin`
- Rename to `sing-box-aarch64-apple-darwin` for Tauri sidecar convention
- Code sign with Developer ID certificate
- Notarize with `xcrun notarytool`

---

## Effort Estimate

### By Module

| Module | Complexity | Estimated Hours | Dependencies |
|--------|-----------|----------------|--------------|
| Hidden command helper | Easy | 0.5 | None |
| Active adapter name | Easy | 3 | None |
| Gateway discovery | **Done** | 0 | — |
| ARP lookups | Medium | 5 | None |
| DNS configuration | Medium | 7 | adapter module |
| DNS flush | Easy | 1 | None |
| Wi-Fi info (airport CLI) | Medium | 4 | None |
| Wi-Fi info (CoreWLAN) | Hard | 10 | objc2 crates |
| Wi-Fi security | Hard | 10 | Wi-Fi info module |
| Process elevation (osascript) | Hard | 12 | None |
| VPN connect/disconnect | Hard | 12 | elevation module |
| Kill orphans / cleanup | Easy | 1.5 | None |
| VPN process monitoring | Easy | 1 | None |
| Tauri config + icons | Easy | 2 | None |
| CI/CD + code signing | Medium | 8 | Apple Developer cert |
| Entitlements + notarization | Medium | 4 | Apple Developer cert |
| Testing on macOS hardware | — | 8 | macOS machine |

### Total Estimate

| Approach | Hours | Calendar (1 dev) |
|----------|-------|-----------------|
| **Minimal (airport CLI, osascript)** | 60-80h | **3-4 weeks** |
| **Full (CoreWLAN, SMJobBless)** | 90-120h | **5-6 weeks** |
| **Recommended (CLI first, CoreWLAN later)** | 70-90h | **3-5 weeks** |

### Prerequisites

- macOS development machine (or CI with macOS runner)
- Apple Developer account ($99/year) for code signing + notarization
- `sing-box` macOS binary (available from SagerNet releases)

---

## Porting Plan

### Phase 1: Foundation (Week 1)

**Goal:** App compiles and launches on macOS (no Windows-specific features).

1. **Update `tauri.conf.json`**
   - Add `"dmg"` to bundle targets
   - Add macOS icon files (`.icns`, `128x128.png`, `128x128@2x.png`)
   - Add basic `macOS` section

2. **Create cross-platform command helper**
   ```rust
   // infrastructure/mod.rs
   #[cfg(target_os = "macos")]
   pub fn hidden_cmd(program: &str) -> std::process::Command {
       std::process::Command::new(program)
   }
   ```

3. **Port `get_active_adapter_name()`**
   - Parse `route -n get default` for interface
   - Map to service name via `networksetup -listnetworkserviceorder`

4. **Verify gateway discovery** (already done, just test)

5. **Set up macOS CI job** in `test.yml`
   - Add `macos-latest` to test matrix
   - Download macOS sing-box binary

### Phase 2: Network Diagnostics (Week 2)

**Goal:** Core diagnostics work on macOS.

6. **Port ARP module**
   - `get_router_mac()` → parse `arp -a <ip>`
   - `ping_sweep()` → `ping -c 1 -t 1 <ip>` (parallel threads)
   - `get_all_arp_entries()` → parse `arp -a` full output

7. **Port Wi-Fi info (airport CLI approach)**
   - Parse `/System/Library/PrivateFrameworks/Apple80211.framework/.../airport -I`
   - Extract SSID, RSSI, channel, link speed, security type

8. **Port DNS read operations**
   - `get_current_dns()` → `networksetup -getdnsservers "Wi-Fi"` or parse `/etc/resolv.conf`
   - `flush_dns()` → `dscacheutil -flushcache` + `killall -HUP mDNSResponder`

### Phase 3: DNS & Security (Week 3)

**Goal:** DNS management and security checks work.

9. **Port DNS write operations**
   - `set_dns()` → `networksetup -setdnsservers <service> <servers>`
   - `build_dns_commands()` → Generate `networksetup` commands
   - Handle elevation via `osascript` with admin privileges

10. **Port Wi-Fi security checks**
    - `check_encryption()` → Parse `airport -I` for auth type
    - `check_evil_twin()` → Parse `airport -s` for all visible networks

### Phase 4: VPN (Week 4)

**Goal:** VPN via sing-box works on macOS.

11. **Port process management to Unix model**
    - Replace `HANDLE`-based tracking with PID + signals
    - `is_process_alive()` → `libc::kill(pid, 0)`
    - `terminate_process()` → `libc::kill(pid, SIGTERM)`, then `SIGKILL`

12. **Port VPN connect/disconnect**
    - Use `osascript` to run sing-box with admin privileges
    - sing-box uses macOS `utun` (built-in TUN) — no `wintun.dll` needed
    - Remove `wintun.dll` from macOS resource bundle

13. **Port `kill_orphaned_singbox()`**
    - Use `pkill -f sing-box` or `killall sing-box`

### Phase 5: Release Pipeline (Week 5)

**Goal:** Automated macOS builds with signing.

14. **Set up macOS code signing**
    - Developer ID Application certificate
    - Store in GitHub Secrets

15. **Set up notarization**
    - `xcrun notarytool submit`
    - Required for macOS Gatekeeper to allow installation

16. **Add macOS to release workflow**
    - Build DMG (and optionally `.app` bundle)
    - Sign and notarize
    - Upload to GitHub Releases

17. **Update auto-updater endpoint**
    - Ensure `latest.json` includes macOS artifacts

### Phase 6 (Optional): CoreWLAN Migration

**Goal:** Replace `airport` CLI with proper CoreWLAN API.

18. **Add `objc2-core-wlan` dependency**
19. **Rewrite `get_wifi_info()` with CoreWLAN**
20. **Rewrite security checks with CoreWLAN scan API**

This phase can be done later as `airport` CLI works fine for initial release.

---

## Risk Assessment

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| `airport` CLI deprecated by Apple | Wi-Fi info stops working | Plan CoreWLAN migration (Phase 6) |
| sing-box TUN requires root | VPN doesn't work without elevation | Use `osascript` or `SMJobBless` for elevation |
| Code signing costs $99/year | Can't distribute outside App Store | Required for Gatekeeper; budget for it |
| macOS Sequoia permission dialogs | User confused by multiple prompts | Clear in-app explanations, minimize elevation requests |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| `networksetup` requires admin | DNS changes need elevation | Batch commands into single `osascript` call |
| macOS Ventura network changes | Some commands may differ | Test on macOS 12, 13, 14, 15 |
| ARM64 vs x86_64 | Need universal binary or separate | Start with ARM64 (most modern Macs), add x86_64 later |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| `arp -a` output format changes | ARP parsing breaks | Pin to known macOS versions, add format validation |
| Tauri v2 macOS quirks | Minor UI differences | Test window management, tray behavior |
| mDNS discovery | Already cross-platform via `mdns-sd` crate | No changes needed |

---

## Cross-Platform Code Already Working

These modules work on all platforms with no changes needed:

- **mDNS discovery** (`infrastructure/mdns.rs`) — uses `mdns-sd` crate
- **Connection type detection** (`infrastructure/connection.rs`) — string matching
- **OUI database** — compiled lookup table
- **Reverse DNS lookup** (`dns.rs:265-284`) — uses `trust-dns-resolver`
- **DNS hijacking check** (`security.rs:520-578`) — uses raw UDP sockets
- **ARP spoofing check** (`security.rs:426-515`) — depends on ARP module
- **All frontend code** (React/TypeScript) — platform-independent
- **All bridge code** (`netok_bridge`) — Rust logic, no OS calls
- **Domain types** (`netok_core/src/domain/`) — pure Rust data structures
- **System tray** (`lib.rs:870-941`) — Tauri handles cross-platform

---

*End of analysis*
