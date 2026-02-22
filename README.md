<p align="center">
  <img src="logo.svg" width="120" alt="Netok logo">
</p>

<p align="center">
  <b>English</b> | <a href="README.ru.md">Русский</a> | <a href="README.fa.md">فارسی</a> | <a href="README.es.md">Español</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <b>Network diagnostics that speak human language.</b><br>
  Netok shows you the full path from your computer to the internet — and explains<br>
  what's wrong in plain terms, not error codes.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows"></a>
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok"><img src="https://img.shields.io/github/stars/korenyako/netok?style=flat-square" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="License: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows" alt="Platform: Windows"></a>
</p>

![Netok screenshot](docs/screenshot.png)

---

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
<h3>📡 Device Discovery</h3>
<p>Scan your local network and identify devices by brand</p>
</td>
<td align="center">
<h3>⚡ Speed Test</h3>
<p>Real-world ratings, not just raw numbers</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔒 Wi-Fi Security</h3>
<p>Detect encryption vulnerabilities and network threats</p>
</td>
<td align="center">
<h3>🌍 15 Languages</h3>
<p>Full localization including RTL scripts</p>
</td>
<td align="center">
<h3>🎨 Themes</h3>
<p>Light and dark mode with system preference support</p>
</td>
</tr>
</table>

---

## Download

→ [Latest release for Windows](https://github.com/korenyako/netok/releases/latest)

> **Note:** Windows may show a SmartScreen warning on first launch — this is normal
> for unsigned applications. Click "Run anyway" to proceed.

---

## Why Netok

Most network tools are built for engineers. Netok is built for everyone else.

When your internet stops working, you shouldn't need to know what
`DNS_PROBE_FINISHED_NXDOMAIN` means. Netok translates that into something useful:
what's broken, where, and what to do about it.

---

## Platform support

| Platform | Status |
|----------|--------|
| Windows | Ready |
| macOS | Planned |
| Android | In progress |
| iOS | Planned |

---

## Built with

- [Rust](https://www.rust-lang.org/) — core diagnostics engine
- [Tauri](https://tauri.app/) — desktop framework
- [React](https://react.dev/) + TypeScript — UI
- [sing-box](https://sing-box.sagernet.org/) — VPN tunneling

---

## License

GPL-3.0. See [LICENSE](LICENSE) and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

*Made by [Anton Korenyako](https://github.com/korenyako)*
