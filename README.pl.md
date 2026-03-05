<p align="center">
  <img src="logo.svg" width="120" alt="Logo Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <b>Polski</b> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencja-GPL--3.0-blue?style=for-the-badge" alt="Licencja: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Pobrań łącznie"></a>
</p>

<p align="center">
  <b>Diagnostyka sieci w ludzkim języku.</b><br>
  Aplikacja desktopowa do diagnostyki sieci, ochrony DNS i VPN.<br>
  Zobacz pełną ścieżkę połączenia od komputera do internetu,<br>
  zmień dostawcę DNS jednym kliknięciem i połącz się przez VPN —<br>
  wszystko wyjaśnione prostym językiem, nie kodami błędów.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Gotowy-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Gotowy"></a>
  <img src="https://img.shields.io/badge/Android-W%20trakcie-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: W trakcie">
  <img src="https://img.shields.io/badge/macOS-Planowany-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planowany">
  <img src="https://img.shields.io/badge/iOS-Planowany-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planowany">
</p>

## Dlaczego Netok

Większość narzędzi sieciowych jest stworzona dla inżynierów. Netok jest stworzony dla wszystkich pozostałych.

Kiedy Twój Internet przestaje działać, nie powinieneś musieć wiedzieć, co oznacza
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok przetłumaczy to na zrozumiały język:
co się zepsuło, gdzie i co z tym zrobić.

---

## Funkcje

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnostyka</h3>
<p>Komputer → Wi-Fi → Router → Internet — krok po kroku sprawdzanie połączenia</p>
</td>
<td align="center" width="33%">
<h3>💬 Prosty język</h3>
<p>Bez żargonu technicznego — jasne odpowiedzi, co nie działa i jak to naprawić</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Ochrona DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing lub własne serwery</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard przez sing-box</p>
</td>
<td align="center">
<h3>💻 Wykrywanie urządzeń</h3>
<p>Skanuj sieć lokalną i identyfikuj urządzenia według marki</p>
</td>
<td align="center">
<h3>⚡ Test prędkości</h3>
<p>Zrozumiałe oceny, nie tylko surowe liczby</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Bezpieczeństwo Wi-Fi</h3>
<p>Wykrywanie luk w szyfrowaniu i zagrożeń sieciowych</p>
</td>
<td align="center">
<h3>🌍 15 języków</h3>
<p>Pełna lokalizacja, w tym pisma RTL</p>
</td>
<td align="center">
<h3>🌒 Motywy</h3>
<p>Tryb jasny i ciemny z obsługą preferencji systemowych</p>
</td>
</tr>
</table>

---

## Pobierz

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Pobierz%20dla%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Pobierz dla Windows"></a>
</p>

### Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org).

- **Roles:** all governance roles (committer, reviewer, approver) are held by [Anton Korenyako](https://github.com/korenyako). See [CONTRIBUTING.md](CONTRIBUTING.md#project-governance) for details.
- **Privacy:** this application does not transfer any information to other networked systems unless specifically requested by the user or required for core diagnostic functionality. See [PRIVACY.md](PRIVACY.md) for the full list of network requests.

---

## Zbudowano z użyciem

- [Rust](https://www.rust-lang.org/) — silnik diagnostyczny
- [Tauri](https://tauri.app/) — framework desktopowy
- [React](https://react.dev/) + TypeScript — interfejs użytkownika
- [sing-box](https://sing-box.sagernet.org/) — tunelowanie VPN

---

## Licencja

GPL-3.0. Zobacz [LICENSE](LICENSE) i [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Prywatność i bezpieczeństwo

Zobacz [PRIVACY.md](PRIVACY.md) i [SECURITY.md](SECURITY.md).

---

*Stworzono przez [Anton Korenyako](https://korenyako.github.io)*
