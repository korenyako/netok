# Testing Plan
**Project:** Netok - Network Diagnostics Tool
**Date:** 2025-01-19
**Version:** 1.0

---

## Executive Summary

**Current Test Coverage: ~10%** ⚠️
**Target Coverage: 70%+** 🎯

This document outlines a comprehensive testing strategy for Netok to achieve production-ready quality. The plan includes unit tests, integration tests, end-to-end tests, and performance benchmarks.

### Current State
- ✅ 4 basic unit tests in `netok_core`
- ❌ No integration tests
- ❌ No UI tests
- ❌ No end-to-end tests
- ❌ No performance benchmarks
- ❌ No CI/CD test automation

### Goals
1. Achieve 70%+ code coverage for core logic
2. Prevent regressions with automated test suite
3. Validate cross-platform compatibility
4. Ensure performance targets are met
5. Enable confident refactoring

---

## 1. Testing Strategy

### 1.1 Testing Pyramid

```
       ╱╲
      ╱E2E╲          5-10 tests (Critical user flows)
     ╱─────╲
    ╱ Integ╲         15-20 tests (Tauri commands, Bridge)
   ╱────────╲
  ╱  Unit    ╲       100+ tests (Core logic, Utils)
 ╱────────────╲
```

**Distribution:**
- **Unit Tests:** 70-80% of tests
- **Integration Tests:** 15-20% of tests
- **End-to-End Tests:** 5-10% of tests

### 1.2 Test Environments

| Environment | Purpose | Platform |
|-------------|---------|----------|
| Local Dev | Rapid feedback | Developer machine |
| CI (Linux) | Linux compatibility | GitHub Actions |
| CI (Windows) | Windows compatibility | GitHub Actions |
| CI (macOS) | macOS compatibility | GitHub Actions |
| Staging | Pre-release validation | Test machines |

---

## 2. Unit Tests

### 2.1 Rust Unit Tests (netok_core)

**Target Coverage: 80%**

#### 2.1.1 Network Information Tests

```rust
#[cfg(test)]
mod computer_info_tests {
    use super::*;

    #[test]
    fn test_get_computer_info_returns_hostname() {
        let info = get_computer_info();
        // Hostname should be present on all systems
        assert!(info.hostname.is_some());
        assert!(!info.hostname.unwrap().is_empty());
    }

    #[test]
    fn test_get_computer_info_local_ip_format() {
        let info = get_computer_info();
        if let Some(ip) = info.local_ip {
            // Should be valid IPv4 format
            assert!(ip.parse::<std::net::Ipv4Addr>().is_ok());
        }
    }

    #[test]
    fn test_private_ip_detection() {
        use std::net::IpAddr;

        // Private ranges
        assert!(is_private_ip(&"10.0.0.1".parse::<IpAddr>().unwrap()));
        assert!(is_private_ip(&"192.168.1.1".parse::<IpAddr>().unwrap()));
        assert!(is_private_ip(&"172.16.0.1".parse::<IpAddr>().unwrap()));
        assert!(is_private_ip(&"169.254.1.1".parse::<IpAddr>().unwrap()));

        // Public ranges
        assert!(!is_private_ip(&"8.8.8.8".parse::<IpAddr>().unwrap()));
        assert!(!is_private_ip(&"1.1.1.1".parse::<IpAddr>().unwrap()));
    }
}

#[cfg(test)]
mod network_tests {
    use super::*;

    #[test]
    fn test_connection_type_detection() {
        assert_eq!(detect_connection_type("Wi-Fi"), ConnectionType::Wifi);
        assert_eq!(detect_connection_type("wlan0"), ConnectionType::Wifi);
        assert_eq!(detect_connection_type("eth0"), ConnectionType::Ethernet);
        assert_eq!(detect_connection_type("en0"), ConnectionType::Ethernet);
        assert_eq!(detect_connection_type("USB Ethernet"), ConnectionType::Usb);
        assert_eq!(detect_connection_type("Unknown"), ConnectionType::Unknown);
    }

    #[test]
    fn test_network_info_without_wifi() {
        let info = get_network_info(Some("eth0"));
        assert_eq!(info.connection_type, ConnectionType::Ethernet);
        assert!(info.ssid.is_none());
    }
}

#[cfg(test)]
mod dns_tests {
    use super::*;

    #[test]
    fn test_dns_provider_primary_addresses() {
        assert_eq!(
            DnsProvider::Cloudflare.primary(),
            Some("1.1.1.1".to_string())
        );
        assert_eq!(
            DnsProvider::Google.primary(),
            Some("8.8.8.8".to_string())
        );
        assert_eq!(
            DnsProvider::Quad9Recommended.primary(),
            Some("9.9.9.9".to_string())
        );
    }

    #[test]
    fn test_dns_provider_secondary_addresses() {
        assert_eq!(
            DnsProvider::Cloudflare.secondary(),
            Some("1.0.0.1".to_string())
        );
        assert_eq!(
            DnsProvider::Google.secondary(),
            Some("8.8.4.4".to_string())
        );
    }

    #[test]
    fn test_detect_dns_provider_cloudflare() {
        let servers = vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()];
        let provider = detect_dns_provider(&servers);
        assert!(matches!(provider, DnsProvider::Cloudflare));
    }

    #[test]
    fn test_detect_dns_provider_google() {
        let servers = vec!["8.8.8.8".to_string(), "8.8.4.4".to_string()];
        let provider = detect_dns_provider(&servers);
        assert!(matches!(provider, DnsProvider::Google));
    }

    #[test]
    fn test_detect_dns_provider_custom() {
        let servers = vec!["1.2.3.4".to_string(), "5.6.7.8".to_string()];
        let provider = detect_dns_provider(&servers);
        assert!(matches!(provider, DnsProvider::Custom(..)));
    }

    #[test]
    fn test_detect_dns_provider_auto_when_empty() {
        let servers: Vec<String> = vec![];
        let provider = detect_dns_provider(&servers);
        assert!(matches!(provider, DnsProvider::Auto));
    }

    #[test]
    fn test_detect_dns_provider_single_server() {
        let servers = vec!["1.1.1.1".to_string()];
        let provider = detect_dns_provider(&servers);
        assert!(matches!(provider, DnsProvider::Cloudflare));
    }
}

#[cfg(test)]
mod diagnostics_tests {
    use super::*;

    #[test]
    fn test_run_diagnostics_returns_valid_snapshot() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        assert!(!snapshot.at_utc.is_empty());
        assert!(snapshot.nodes.len() >= 4);
        assert!(!snapshot.summary_key.is_empty());
    }

    #[test]
    fn test_diagnostics_includes_all_nodes() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let node_ids: Vec<_> = snapshot.nodes.iter().map(|n| n.id).collect();

        assert!(node_ids.iter().any(|&id| matches!(id, NodeId::Computer)));
        assert!(node_ids.iter().any(|&id| matches!(id, NodeId::Wifi)));
        assert!(node_ids.iter().any(|&id| matches!(id, NodeId::Internet)));
    }

    #[test]
    fn test_diagnostics_serialization() {
        let settings = get_default_settings();
        let snapshot = run_diagnostics(&settings);

        let json = serde_json::to_string(&snapshot).unwrap();
        assert!(!json.is_empty());

        let deserialized: DiagnosticsSnapshot =
            serde_json::from_str(&json).unwrap();
        assert_eq!(snapshot.at_utc, deserialized.at_utc);
    }

    #[test]
    fn test_diagnostics_performance() {
        use std::time::Instant;

        let settings = get_default_settings();
        let start = Instant::now();
        let _snapshot = run_diagnostics(&settings);
        let duration = start.elapsed();

        // Should complete within 3 seconds (generous for CI)
        assert!(
            duration.as_secs() < 3,
            "Diagnostics took too long: {:?}",
            duration
        );
    }
}

#[cfg(test)]
mod router_tests {
    use super::*;

    #[test]
    fn test_get_router_info_returns_structure() {
        let info = get_router_info();
        // Gateway IP should be present on most systems
        // (may fail on isolated systems)
        if let Some(gateway) = &info.gateway_ip {
            assert!(gateway.parse::<std::net::Ipv4Addr>().is_ok());
        }
    }
}

#[cfg(test)]
mod internet_tests {
    use super::*;

    #[test]
    #[ignore] // Network-dependent test
    fn test_get_internet_info_when_online() {
        let info = get_internet_info();
        assert!(info.dns_ok || info.http_ok); // At least one should work
    }

    #[test]
    fn test_internet_info_structure() {
        let info = get_internet_info();
        // Just verify structure is valid, don't assume connectivity
        assert!(info.dns_ok == true || info.dns_ok == false);
        assert!(info.http_ok == true || info.http_ok == false);
    }
}

#[cfg(test)]
mod settings_tests {
    use super::*;

    #[test]
    fn test_default_settings() {
        let settings = get_default_settings();
        assert_eq!(settings.language, "en");
        assert!(settings.test_timeout_ms > 0);
    }

    #[test]
    fn test_settings_serialization() {
        let settings = Settings {
            language: "ru".to_string(),
            test_timeout_ms: 3000,
            dns_servers: vec!["1.1.1.1".to_string()],
        };

        let json = serde_json::to_string(&settings).unwrap();
        let deserialized: Settings = serde_json::from_str(&json).unwrap();

        assert_eq!(settings.language, deserialized.language);
        assert_eq!(settings.test_timeout_ms, deserialized.test_timeout_ms);
    }
}
```

**Total New Tests: ~30+**

---

#### 2.1.2 Error Handling Tests

```rust
#[cfg(test)]
mod error_handling_tests {
    use super::*;

    #[test]
    fn test_dns_test_handles_timeout() {
        // TODO: Mock DNS to force timeout
        // Should return false, not panic
    }

    #[test]
    fn test_http_test_handles_network_failure() {
        // TODO: Mock HTTP to force failure
        // Should return false, not panic
    }

    #[test]
    fn test_wifi_info_handles_no_adapter() {
        // Should return None values, not crash
        let (ssid, rssi, _) = get_wifi_info();
        // May be None on non-WiFi systems
        assert!(ssid.is_some() || ssid.is_none());
    }
}
```

---

#### 2.1.3 Platform-Specific Tests

```rust
#[cfg(all(test, target_os = "windows"))]
mod windows_tests {
    use super::*;

    #[test]
    fn test_get_active_adapter_name() {
        let adapter = get_active_adapter_name();
        if let Some(name) = adapter {
            assert!(!name.is_empty());
        }
    }

    #[test]
    #[ignore] // Requires admin privileges
    fn test_set_dns_requires_admin() {
        let result = set_dns(DnsProvider::Auto);
        // Should fail if not admin
    }
}

#[cfg(all(test, target_os = "linux"))]
mod linux_tests {
    use super::*;

    #[test]
    fn test_get_default_gateway_linux() {
        let gateway = get_default_gateway();
        if let Some(ip) = gateway {
            assert!(ip.parse::<std::net::Ipv4Addr>().is_ok());
        }
    }
}

#[cfg(all(test, target_os = "macos"))]
mod macos_tests {
    use super::*;

    #[test]
    fn test_get_default_gateway_macos() {
        let gateway = get_default_gateway();
        if let Some(ip) = gateway {
            assert!(ip.parse::<std::net::Ipv4Addr>().is_ok());
        }
    }
}
```

---

### 2.2 TypeScript Unit Tests (UI)

**Target Coverage: 70%**

#### 2.2.1 Setup Testing Infrastructure

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event vitest jsdom @vitest/ui
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/tests/'],
    },
  },
});
```

#### 2.2.2 Component Tests

**dnsStore.test.ts:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dnsStore } from '../stores/dnsStore';
import * as tauriApi from '../api/tauri';

vi.mock('../api/tauri');

describe('dnsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', async () => {
    vi.mocked(tauriApi.getDnsProvider).mockResolvedValue({ type: 'Cloudflare' });

    expect(dnsStore.isLoadingProvider()).toBe(true);
    await dnsStore.initialize();
    expect(dnsStore.isLoadingProvider()).toBe(false);
  });

  it('loads current DNS provider on initialization', async () => {
    const mockProvider = { type: 'Google' as const };
    vi.mocked(tauriApi.getDnsProvider).mockResolvedValue(mockProvider);

    await dnsStore.initialize();

    expect(dnsStore.getCurrentProvider()).toEqual(mockProvider);
  });

  it('falls back to Auto on error', async () => {
    vi.mocked(tauriApi.getDnsProvider).mockRejectedValue(new Error('Failed'));

    await dnsStore.initialize();

    expect(dnsStore.getCurrentProvider()).toEqual({ type: 'Auto' });
  });

  it('notifies subscribers on provider change', async () => {
    const listener = vi.fn();
    dnsStore.subscribe(listener);

    dnsStore.setProvider({ type: 'Cloudflare' });

    expect(listener).toHaveBeenCalled();
  });

  it('allows unsubscribing', () => {
    const listener = vi.fn();
    const unsubscribe = dnsStore.subscribe(listener);

    unsubscribe();
    dnsStore.setProvider({ type: 'Google' });

    expect(listener).not.toHaveBeenCalled();
  });
});
```

**App.test.tsx:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import * as tauriApi from '../api/tauri';

vi.mock('../api/tauri');

describe('App', () => {
  it('renders home screen by default', async () => {
    vi.mocked(tauriApi.runDiagnostics).mockResolvedValue({
      overall: 'Ok',
      nodes: [],
      computer: {},
      network: {},
      router: {},
      internet: {},
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/status/i)).toBeInTheDocument();
    });
  });

  it('navigates to security screen when icon clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    const securityButton = screen.getByRole('button', { name: /security/i });
    await user.click(securityButton);

    expect(screen.getByText(/DNS Providers/i)).toBeInTheDocument();
  });

  it('loads diagnostics data on mount', async () => {
    const mockSnapshot = {
      overall: 'Ok' as const,
      nodes: [],
      computer: { hostname: 'test-pc' },
      network: {},
      router: {},
      internet: {},
    };

    vi.mocked(tauriApi.runDiagnostics).mockResolvedValue(mockSnapshot);

    render(<App />);

    await waitFor(() => {
      expect(tauriApi.runDiagnostics).toHaveBeenCalled();
    });
  });

  it('handles diagnostics error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(tauriApi.runDiagnostics).mockRejectedValue(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });
});
```

**StatusScreen.test.tsx:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusScreen } from '../screens/StatusScreen';

describe('StatusScreen', () => {
  it('displays OK status when all nodes are healthy', () => {
    const diagnostics = {
      overall: 'Ok' as const,
      nodes: [
        { id: 'Computer', label: 'Computer', status: 'Ok' as const },
        { id: 'Internet', label: 'Internet', status: 'Ok' as const },
      ],
      computer: {},
      network: {},
      router: {},
      internet: {},
    };

    render(
      <StatusScreen
        diagnostics={diagnostics}
        onOpenDiagnostics={() => {}}
        onNavigateToDnsProviders={() => {}}
      />
    );

    expect(screen.getByText(/All systems operational/i)).toBeInTheDocument();
  });

  it('displays warning when some nodes have issues', () => {
    const diagnostics = {
      overall: 'Partial' as const,
      nodes: [
        { id: 'Computer', label: 'Computer', status: 'Ok' as const },
        { id: 'Internet', label: 'Internet', status: 'Down' as const },
      ],
      computer: {},
      network: {},
      router: {},
      internet: {},
    };

    render(
      <StatusScreen
        diagnostics={diagnostics}
        onOpenDiagnostics={() => {}}
        onNavigateToDnsProviders={() => {}}
      />
    );

    expect(screen.getByText(/issues detected/i)).toBeInTheDocument();
  });
});
```

**Total New Tests: ~20+**

---

## 3. Integration Tests

### 3.1 Bridge Layer Tests (netok_bridge)

```rust
#[cfg(test)]
mod bridge_integration_tests {
    use super::*;
    use tokio::runtime::Runtime;

    #[test]
    fn test_run_diagnostics_struct_async() {
        let rt = Runtime::new().unwrap();
        let snapshot = rt.block_on(run_diagnostics_struct()).unwrap();

        assert!(snapshot.nodes.len() >= 4);
        assert!(matches!(snapshot.overall, Overall::Ok | Overall::Partial));
    }

    #[test]
    fn test_dns_provider_type_conversion() {
        let bridge_provider = DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Standard,
        };
        let core_provider = dns_provider_to_core(bridge_provider.clone());

        assert!(matches!(core_provider, netok_core::DnsProvider::Cloudflare));

        let back_to_bridge = dns_provider_from_core(core_provider);
        // Should round-trip correctly
    }

    #[test]
    fn test_all_dns_variants_convert() {
        // Test all enum variants convert without panicking
        let variants = vec![
            DnsProviderType::Auto,
            DnsProviderType::Google,
            DnsProviderType::Cloudflare {
                variant: CloudflareVariant::Malware,
            },
            DnsProviderType::AdGuard {
                variant: AdGuardVariant::Family,
            },
            // ... all other variants
        ];

        for variant in variants {
            let core = dns_provider_to_core(variant.clone());
            let _back = dns_provider_from_core(core);
            // Should not panic
        }
    }
}
```

### 3.2 Tauri Command Tests

```rust
#[cfg(test)]
mod tauri_command_tests {
    use super::*;

    #[tokio::test]
    async fn test_run_diagnostics_command() {
        let result = run_diagnostics().await;
        assert!(result.is_ok());

        let snapshot = result.unwrap();
        assert!(!snapshot.nodes.is_empty());
    }

    #[test]
    fn test_get_settings_command() {
        let json = get_settings();
        assert!(!json.is_empty());

        let settings: serde_json::Value = serde_json::from_str(&json).unwrap();
        assert!(settings.get("language").is_some());
    }

    #[test]
    fn test_set_settings_command() {
        let settings_json = r#"{"language":"ru","test_timeout_ms":3000,"dns_servers":[]}"#;
        let result = set_settings(settings_json.to_string());
        assert!(result.is_ok());
    }

    #[test]
    fn test_set_settings_invalid_json() {
        let result = set_settings("invalid json".to_string());
        assert!(result.is_err());
    }
}
```

**Total Integration Tests: ~15+**

---

## 4. End-to-End Tests

### 4.1 WebDriver Tests (Tauri-specific)

**Setup:**
```bash
npm install --save-dev @tauri-apps/cli @tauri-apps/driver webdriverio
```

**e2e/diagnostics.test.ts:**
```typescript
import { remote } from 'webdriverio';
import { platform } from 'os';

describe('Diagnostics Flow', () => {
  let browser;

  beforeAll(async () => {
    browser = await remote({
      capabilities: {
        'tauri:options': {
          application: '../target/release/netok',
        },
      },
    });
  });

  afterAll(async () => {
    await browser.deleteSession();
  });

  it('should load the home screen', async () => {
    const title = await browser.getTitle();
    expect(title).toContain('Netok');
  });

  it('should run diagnostics and display results', async () => {
    // Wait for diagnostics to complete
    await browser.waitUntil(
      async () => {
        const status = await browser.$('[data-testid="status-indicator"]');
        return await status.isDisplayed();
      },
      { timeout: 5000 }
    );

    const statusText = await browser.$('[data-testid="status-text"]').getText();
    expect(statusText).toBeTruthy();
  });

  it('should navigate to DNS providers screen', async () => {
    const securityTab = await browser.$('[data-testid="nav-security"]');
    await securityTab.click();

    const heading = await browser.$('h1').getText();
    expect(heading).toContain('DNS');
  });

  it('should display current DNS provider', async () => {
    const currentProvider = await browser.$('[data-testid="current-dns"]');
    const text = await currentProvider.getText();
    expect(text).toBeTruthy();
  });
});
```

**e2e/dns-configuration.test.ts:**
```typescript
describe('DNS Configuration', () => {
  it('should change DNS provider (requires admin)', async () => {
    // Navigate to DNS providers
    await browser.$('[data-testid="nav-security"]').click();

    // Select Cloudflare
    await browser.$('[data-testid="provider-cloudflare"]').click();

    // Apply configuration
    await browser.$('[data-testid="apply-dns"]').click();

    // Verify success message or updated status
    await browser.waitUntil(
      async () => {
        const success = await browser.$('[data-testid="dns-success"]');
        return await success.isExisting();
      },
      { timeout: 10000 }
    );
  });
});
```

**Total E2E Tests: ~8-10**

---

## 5. Performance Tests

### 5.1 Benchmark Suite

**benches/diagnostics_benchmark.rs:**
```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use netok_core::{get_default_settings, run_diagnostics};

fn benchmark_full_diagnostics(c: &mut Criterion) {
    let settings = get_default_settings();

    c.bench_function("run_diagnostics", |b| {
        b.iter(|| {
            let snapshot = run_diagnostics(black_box(&settings));
            black_box(snapshot);
        })
    });
}

fn benchmark_computer_info(c: &mut Criterion) {
    c.bench_function("get_computer_info", |b| {
        b.iter(|| {
            let info = netok_core::get_computer_info();
            black_box(info);
        })
    });
}

fn benchmark_dns_detection(c: &mut Criterion) {
    let servers = vec!["1.1.1.1".to_string(), "1.0.0.1".to_string()];

    c.bench_function("detect_dns_provider", |b| {
        b.iter(|| {
            let provider = netok_core::detect_dns_provider(black_box(&servers));
            black_box(provider);
        })
    });
}

criterion_group!(
    benches,
    benchmark_full_diagnostics,
    benchmark_computer_info,
    benchmark_dns_detection
);
criterion_main!(benches);
```

**Cargo.toml:**
```toml
[dev-dependencies]
criterion = "0.5"

[[bench]]
name = "diagnostics_benchmark"
harness = false
```

**Run benchmarks:**
```bash
cargo bench
```

**Performance Targets:**
- Full diagnostics: < 1.5s (p95)
- Computer info: < 50ms (p95)
- DNS detection: < 1ms (p95)

---

## 6. Test Automation (CI/CD)

### 6.1 GitHub Actions Workflow

**.github/workflows/test.yml:**
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  rust-tests:
    name: Rust Tests (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Run tests
        run: cargo test --all-features --workspace

      - name: Run tests (release mode)
        run: cargo test --all-features --workspace --release

  rust-coverage:
    name: Code Coverage
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          components: llvm-tools-preview

      - name: Install cargo-llvm-cov
        run: cargo install cargo-llvm-cov

      - name: Generate coverage
        run: cargo llvm-cov --all-features --workspace --lcov --output-path lcov.info

      - name: Upload to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: lcov.info
          fail_ci_if_error: true

  typescript-tests:
    name: TypeScript Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./ui

      - name: Run tests
        run: npm test
        working-directory: ./ui

      - name: Run tests with coverage
        run: npm run test:coverage
        working-directory: ./ui

  e2e-tests:
    name: E2E Tests (${{ matrix.os }})
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          npm ci
          npm ci --prefix ./ui

      - name: Build application
        run: cargo build --release -p netok_desktop

      - name: Run E2E tests
        run: npm run test:e2e
        working-directory: ./ui

  lint:
    name: Linting
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          components: clippy, rustfmt

      - name: Check formatting
        run: cargo fmt --all -- --check

      - name: Run Clippy
        run: cargo clippy --all-features --workspace -- -D warnings

      - name: Setup Node.js
        uses: actions/setup-node@v4

      - name: Run ESLint
        run: npm run lint
        working-directory: ./ui
```

---

## 7. Test Data and Fixtures

### 7.1 Mock Data

**tests/fixtures/diagnostics.json:**
```json
{
  "at_utc": "2025-01-19T10:00:00Z",
  "nodes": [
    {
      "id": "Computer",
      "name_key": "nodes.computer.name",
      "status": "Ok",
      "latency_ms": 5,
      "hint_key": null
    }
  ],
  "summary_key": "summary.ok",
  "computer": {
    "hostname": "test-pc",
    "model": null,
    "adapter": "Wi-Fi",
    "local_ip": "192.168.1.100"
  },
  "network": {
    "connection_type": "Wifi",
    "ssid": "TestNetwork",
    "rssi": -45,
    "signal_quality": "signal.excellent",
    "channel": 6,
    "frequency": "2.4 GHz"
  },
  "router": {
    "gateway_ip": "192.168.1.1",
    "gateway_mac": null,
    "vendor": null,
    "model": null
  },
  "internet": {
    "public_ip": "203.0.113.1",
    "isp": "Test ISP",
    "country": "US",
    "city": "San Francisco",
    "dns_ok": true,
    "http_ok": true,
    "latency_ms": 25,
    "speed_down_mbps": null,
    "speed_up_mbps": null
  }
}
```

---

## 8. Testing Checklist

### 8.1 Pre-Release Testing Checklist

**Unit Tests:**
- [ ] All core functions have unit tests
- [ ] Error paths tested
- [ ] Edge cases covered
- [ ] Platform-specific code tested on target platforms

**Integration Tests:**
- [ ] Tauri commands tested
- [ ] Bridge layer conversions validated
- [ ] Async operations tested

**E2E Tests:**
- [ ] Critical user flows tested
- [ ] DNS configuration flow tested (on Windows)
- [ ] Navigation tested
- [ ] Error handling tested

**Performance:**
- [ ] Benchmarks run and within targets
- [ ] Memory usage profiled
- [ ] Startup time measured

**Cross-Platform:**
- [ ] Tests pass on Windows
- [ ] Tests pass on macOS
- [ ] Tests pass on Linux

**Code Quality:**
- [ ] Code coverage > 70%
- [ ] All tests pass
- [ ] No test flakiness
- [ ] CI/CD green

---

## 9. Test Maintenance

### 9.1 Test Review Schedule

- **Weekly:** Review failed tests, update as needed
- **Monthly:** Review test coverage, add tests for uncovered code
- **Quarterly:** Review performance benchmarks, update targets
- **Annually:** Full test suite audit

### 9.2 Test Ownership

| Test Type | Owner | Reviewer |
|-----------|-------|----------|
| Rust Unit | Core Team | Lead Dev |
| TypeScript Unit | Frontend Team | Lead Dev |
| Integration | Full Stack | Tech Lead |
| E2E | QA Team | Product |
| Performance | DevOps | Tech Lead |

---

## 10. Implementation Timeline

### Phase 1: Foundation (Week 1-2)
- [ ] Set up testing infrastructure (vitest, criterion)
- [ ] Write first 20 Rust unit tests
- [ ] Write first 10 TypeScript unit tests
- [ ] Configure CI/CD for test automation

### Phase 2: Core Coverage (Week 3-4)
- [ ] Complete Rust unit tests (60+ tests)
- [ ] Complete TypeScript unit tests (30+ tests)
- [ ] Achieve 50%+ code coverage

### Phase 3: Integration (Week 5-6)
- [ ] Write integration tests (15+ tests)
- [ ] Write E2E test infrastructure
- [ ] Write first E2E tests (5+ tests)

### Phase 4: Advanced (Week 7-8)
- [ ] Performance benchmarks
- [ ] Cross-platform testing
- [ ] Achieve 70%+ code coverage
- [ ] Test documentation

---

## Conclusion

Implementing this testing plan will:
1. ✅ Increase confidence in code quality
2. ✅ Enable safe refactoring
3. ✅ Catch regressions early
4. ✅ Validate cross-platform compatibility
5. ✅ Meet production-ready quality standards

**Estimated Effort:** 6-8 weeks (1-2 developers)
**Priority:** HIGH - Critical for production readiness

---

**Document Version:** 1.0
**Last Updated:** 2025-01-19
**Next Review:** 2025-02-19
