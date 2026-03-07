<p align="center">
  <img src="logo.svg" width="120" alt="Netok logo">
</p>

<p align="center">
  <b>English</b> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>
<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"></a>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="License: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Total Downloads"></a>
</p>

<p align="center">
  <b>Network diagnostics that speak human language.</b><br>
  Desktop app for network diagnostics, DNS protection, and VPN.<br>
  See your full connection path from computer to internet, switch DNS providers in one click,<br>
  and connect through VPN — all explained in plain language, not error codes.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <img src="docs/screenshots/netok-flow.gif" alt="Netok — network diagnostics demo">
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Ready-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Ready"></a>
  <img src="https://img.shields.io/badge/Android-In%20progress-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: In progress">
  <img src="https://img.shields.io/badge/macOS-Planned-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planned">
  <img src="https://img.shields.io/badge/iOS-Planned-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planned">
</p>

## Why Netok

Most network tools are built for engineers. Netok is built for everyone else.

When your internet stops working, you shouldn't need to know what
`DNS_PROBE_FINISHED_NXDOMAIN` means. Netok translates that into something useful:
what's broken, where, and what to do about it.



## Features

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnostics</h3>
<p>Computer → Wi-Fi → Router → Internet — step-by-step connection check</p>
</td>
<td align="center" width="33%">
<h3>💬 Plain Language</h3>
<p>No technical jargon — clear answers about what's wrong and how to fix it</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNS Protection</h3>
<p>Cloudflare, AdGuard, CleanBrowsing, or your own custom servers</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard via sing-box</p>
</td>
<td align="center">
<h3>💻 Device Discovery</h3>
<p>Scan your local network and identify devices by brand</p>
</td>
<td align="center">
<h3>⚡ Speed Test</h3>
<p>Real-world ratings, not just raw numbers</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Wi-Fi Security</h3>
<p>Detect encryption vulnerabilities and network threats</p>
</td>
<td align="center">
<h3>🌍 15 Languages</h3>
<p>Full localization including RTL scripts</p>
</td>
<td align="center">
<h3>🌒 Themes</h3>
<p>Light and dark mode with system preference support</p>
</td>
</tr>
</table>



## Download

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"></a>
</p>

### Note on Windows SmartScreen

Netok is not yet code-signed. Windows may show a SmartScreen warning on first launch — this is normal for unsigned applications. Click "More info" → "Run anyway" to proceed.

The application is built automatically from source code via GitHub Actions. You can verify the build by checking the [release workflow](https://github.com/korenyako/netok/releases) and comparing checksums.



## Diagnostics

Computer → Wi-Fi → Router → Internet — see your full connection path step by step. Each node is tested independently so you know exactly where the problem is.

<p align="center">
  <img src="docs/screenshots/netok-diagnostics.gif" alt="Netok diagnostics — step-by-step connection check">
</p>



## Plain Language

No error codes, no technical jargon. When something breaks, Netok tells you what happened and what to do — in words anyone can understand.

<p align="center">
  <img src="docs/screenshots/netok-weak.gif" alt="Netok plain language — clear explanation of weak signal">
</p>



## DNS Protection

Switch your DNS provider in one click — Cloudflare, AdGuard, CleanBrowsing, or set your own custom servers. Block ads, malware, and adult content at the network level.

<p align="center">
  <img src="docs/screenshots/netok-dns.gif" alt="Netok DNS protection — switching DNS providers">
</p>



## VPN

Connect through VLESS, VMess, Shadowsocks, Trojan, or WireGuard — powered by sing-box. Paste a link, scan a QR code, or import a config file.

<p align="center">
  <img src="docs/screenshots/netok-vpn.gif" alt="Netok VPN — connecting through sing-box">
</p>


## Speed Test

Measure your real download and upload speed with human-readable ratings — not just raw numbers.

<p align="center">
  <img src="docs/screenshots/netok-speed.gif" alt="Netok speed test — real-world speed ratings">
</p>


## Wi-Fi Security

Detect weak encryption, open networks, and other vulnerabilities. Know if your Wi-Fi is safe before you connect.

<p align="center">
  <img src="docs/screenshots/netok-wifi.gif" alt="Netok Wi-Fi security — detecting vulnerabilities">
</p>


## Languages

Netok speaks 15 languages — including right-to-left scripts like Farsi.
Every label, every message, every tooltip is fully translated. No half-baked Google Translate patches — each locale is reviewed for natural phrasing.

**Supported:** English, Deutsch, Español, Français, Italiano, Polski, Português, Türkçe, Українська, Русский, 日本語, 한국어, 中文, فارسی, and more coming.

<p align="center">
  <img src="docs/screenshots/netok-rtl.gif" alt="Netok in Farsi — right-to-left interface">
</p>


## Under the Hood

### Diagnostic Chain

Each node in the chain runs independent checks — no router admin access needed:

**Computer** — `hostname::get()` for machine name, `get_if_addrs` for network interfaces, Windows WLAN API for adapter details.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, signal quality converted to dBm (`-90 + quality/2`), TX rate, PHY type → Wi-Fi standard, channel and band (2.4/5/6 GHz) from `ulChCenterFrequency`. Connection type detected from adapter name pattern matching.

**Router** — Gateway IP parsed from `route print` (Windows), `ip route` (Linux), or `netstat -nr` (macOS). MAC address via `Get-NetNeighbor`. Vendor identified through longest-prefix OUI lookup against 30,000+ entries compiled from the Wireshark manufacturer database.

**Internet** — Two checks run in parallel: DNS resolution via `trust_dns_resolver` (tries `one.one.one.one`, fallback `dns.google`) and HTTP reachability via `reqwest` (tries Cloudflare trace, fallback `example.com`). Both pass → OK, one passes → Partial, both fail → Fail.

### Wi-Fi Security

Four sequential checks, all via Windows WLAN API:

**Encryption** — Reads `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, maps to Open (danger) / WEP, WPA (warning) / WPA2, WPA3 (safe).

**Evil Twin Detection** — Gets all BSSIDs matching the connected SSID via `WlanGetNetworkBssList`. Checks the IEEE 802.11 Privacy bit on each AP. If the same SSID has both open and encrypted access points → warning.

**ARP Spoofing Detection** — Reads the full ARP table via `Get-NetNeighbor`, builds a MAC → IP mapping. If any non-broadcast MAC maps to multiple IPs including the gateway → danger.

**DNS Hijacking Detection** — Resolves `example.com` via the system resolver AND via a raw UDP query to `1.1.1.1`. If the IP sets don't overlap → warning.

Overall security status = worst result of the four checks.

### Speed Test

Frontend-based, using NDT7 (Network Diagnostic Tool v7) by M-Lab over WebSocket:

- Server discovery via M-Lab locate API (nearest server, cached 5 min)
- Download/upload phases ~10 seconds each
- **Ping**: median of 3 WebSocket connect/close RTT cycles
- **Latency**: mean `TCPInfo.SmoothedRTT` under load
- **Jitter**: mean absolute consecutive difference of SmoothedRTT samples
- **Bufferbloat detection**: latency > 3× idle ping

Results mapped to practical tasks:

| Task | Pass condition |
|------|---------------|
| 4K Video | download ≥ 25 Mbps |
| Online Gaming | ping ≤ 50 ms AND jitter ≤ 30 ms |
| Video Calls | download ≥ 3 Mbps AND ping ≤ 100 ms |
| HD Video | download ≥ 10 Mbps |
| Music/Podcasts | download ≥ 1 Mbps |
| Social/Web | download ≥ 3 Mbps |
| Email/Messengers | download ≥ 0.5 Mbps |


## Built with

- [Rust](https://www.rust-lang.org/) — core diagnostics engine
- [Tauri](https://tauri.app/) — desktop framework
- [React](https://react.dev/) + TypeScript — UI
- [sing-box](https://sing-box.sagernet.org/) — VPN tunneling



## License

GPL-3.0. See [LICENSE](LICENSE) and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Privacy & Security

See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

---

*Made by [Anton Korenyako](https://korenyako.github.io)*
