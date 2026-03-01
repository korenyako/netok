# Privacy Policy

**Last updated:** March 2026

Netok is a desktop application for network diagnostics, DNS management, and VPN connectivity. This document describes what data the application accesses, what network requests it makes, and how that information is handled.

## Core Principle

Netok does not collect analytics, telemetry, or usage data. There are no tracking pixels, no crash reporting services, and no data shared with the developer or any third party for marketing or profiling purposes.

All diagnostic data stays on your device.

---

## Network Requests

Netok makes network requests as part of its core functionality. Below is a complete list, grouped by trigger type.

### Automatic (on each diagnostics run)

These requests are made every time you run a network diagnostic check:

| Service | Endpoint | Purpose |
|---------|----------|---------|
| DNS resolution test | `one.one.one.one` (Cloudflare), `dns.google` (fallback) | Verify that DNS resolution works |
| HTTP connectivity test | `https://www.cloudflare.com/cdn-cgi/trace`, `https://example.com` (fallback) | Verify internet access over HTTP |
| IP geolocation | `https://ipinfo.io/json` | Display your public IP, ISP name, city, and country |
| Reverse DNS | Local network IPs via system DNS | Identify device names on your local network |
| mDNS discovery | Local network (UDP port 5353) | Discover devices on your local network |

**Data handling:** All results are stored in memory only and discarded when the application is closed. Nothing is written to disk or sent elsewhere.

### Automatic (on application startup)

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Update check | `https://github.com/korenyako/netok/releases/latest/download/latest.json` | Check if a newer version is available |

**Data handling:** Only the version number is compared. No device information is sent. If an update is available, a notification is shown — the user decides whether to install it.

### User-triggered only

These requests are made only when you explicitly initiate the action:

| Service | Endpoint | Purpose |
|---------|----------|---------|
| Speed test | M-Lab NDT7 servers (`locate.measurementlab.net`, `wss://ndt-*.measurementlab.net`) | Measure download and upload speed |
| VPN connection | User-provided server address via sing-box | Establish VPN tunnel |
| VPN server location | `https://ipinfo.io/{server-ip}/json` | Display country and city of a VPN server |
| DNS provider change | System DNS settings (local) | Apply selected DNS servers to your network adapter |

### DNS servers (when DNS protection is active)

When you choose a DNS provider in the app, your DNS queries are sent to that provider's servers. The app supports Cloudflare, Google, AdGuard, Quad9, OpenDNS, DNS4EU, and custom servers. Netok does not proxy or inspect DNS traffic — it configures your system to use the selected DNS servers directly.

When VPN is active, DNS queries are routed through Cloudflare DNS-over-HTTPS (`1.1.1.1`) via the VPN tunnel.

---

## Data Storage

| Data | Storage | Persistence |
|------|---------|-------------|
| Diagnostic results (IP, ISP, signal, latency) | In-memory (RAM) | Cleared on app close |
| VPN server configurations | Local app storage (WebView) | Persists between sessions |
| VPN server location (country, city) | Local app storage (WebView) | Persists between sessions |
| Application settings (language, theme) | Local app storage (WebView) | Persists between sessions |

Netok does not write log files, does not store network traffic, and does not maintain history of diagnostic results.

---

## Third-Party Services

Netok relies on the following external services. Each has its own privacy policy:

| Service | Used for | Privacy policy |
|---------|----------|----------------|
| [ipinfo.io](https://ipinfo.io) | IP geolocation and ISP lookup | [ipinfo.io/privacy](https://ipinfo.io/privacy) |
| [Measurement Lab (M-Lab)](https://www.measurementlab.net) | Speed testing (NDT7) | [measurementlab.net/privacy](https://www.measurementlab.net/privacy/) |
| [Cloudflare](https://www.cloudflare.com) | HTTP connectivity test, DNS | [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/) |
| [GitHub](https://github.com) | Application update checks | [docs.github.com/privacy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) |

---

## What Netok Does NOT Do

- Does not collect or transmit analytics or telemetry
- Does not track usage patterns or behavior
- Does not share data with advertisers or data brokers
- Does not store browsing history or network traffic content
- Does not require an account or registration
- Does not access files outside its own installation directory

---

## Changes to This Policy

This policy may be updated when new features are added. Changes will be documented in the project's commit history. The "Last updated" date at the top reflects the most recent revision.

---

## Contact

If you have questions about this privacy policy, please [open an issue](https://github.com/korenyako/netok/issues) on GitHub.
