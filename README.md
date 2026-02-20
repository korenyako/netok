# Netok

**Network diagnostics that speak human language.**

Netok shows you the full path from your computer to the internet — and explains
what's wrong in plain terms, not error codes.

![Netok screenshot](docs/screenshot.png)

---

## Features

- **Connection diagnostics** — Computer → Wi-Fi → Router → Internet, step by step
- **Plain language explanations** — no technical jargon, just clear answers
- **DNS protection** — Cloudflare, AdGuard, CleanBrowsing, or custom servers
- **VPN support** — VLESS, VMess, Shadowsocks, Trojan, WireGuard via sing-box
- **Device discovery** — scan your local network, identify devices by brand
- **Speed test** — real-world ratings, not just raw numbers
- **Wi-Fi security check** — encryption vulnerabilities and threats
- **15 languages** — full localization including RTL scripts
- **Light and dark theme**

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
