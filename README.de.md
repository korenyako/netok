<p align="center">
  <img src="logo.svg" width="120" alt="Netok-Logo">
</p>

<p align="center">
  <a href="README.md">English</a> | <b>Deutsch</b> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Lizenz-GPL--3.0-blue?style=for-the-badge" alt="Lizenz: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Downloads gesamt"></a>
</p>

<p align="center">
  <b>Netzwerkdiagnose in verständlicher Sprache.</b><br>
  Desktop-App für Netzwerkdiagnose, DNS-Schutz und VPN.<br>
  Sehen Sie den vollständigen Verbindungspfad vom Computer zum Internet,<br>
  wechseln Sie DNS-Anbieter mit einem Klick und verbinden Sie sich über VPN —<br>
  alles in verständlicher Sprache erklärt, nicht in Fehlercodes.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Bereit-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Bereit"></a>
  <img src="https://img.shields.io/badge/Android-In%20Entwicklung-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: In Entwicklung">
  <img src="https://img.shields.io/badge/macOS-Geplant-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Geplant">
  <img src="https://img.shields.io/badge/iOS-Geplant-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Geplant">
</p>

## Warum Netok

Die meisten Netzwerk-Tools sind für Ingenieure gemacht. Netok ist für alle anderen.

Wenn Ihr Internet nicht mehr funktioniert, sollten Sie nicht wissen müssen, was
`DNS_PROBE_FINISHED_NXDOMAIN` bedeutet. Netok übersetzt das in verständliche Sprache:
was kaputt ist, wo, und was Sie dagegen tun können.

---

## Funktionen

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnose</h3>
<p>Computer → WLAN → Router → Internet — schrittweise Verbindungsprüfung</p>
</td>
<td align="center" width="33%">
<h3>💬 Einfache Sprache</h3>
<p>Kein Fachjargon — klare Antworten, was nicht funktioniert und wie man es behebt</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNS-Schutz</h3>
<p>Cloudflare, AdGuard, CleanBrowsing oder eigene Server</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard über sing-box</p>
</td>
<td align="center">
<h3>💻 Geräteerkennung</h3>
<p>Lokales Netzwerk scannen und Geräte nach Marke identifizieren</p>
</td>
<td align="center">
<h3>⚡ Geschwindigkeitstest</h3>
<p>Verständliche Bewertungen, nicht nur Rohzahlen</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 WLAN-Sicherheit</h3>
<p>Erkennung von Verschlüsselungsschwachstellen und Netzwerkbedrohungen</p>
</td>
<td align="center">
<h3>🌍 15 Sprachen</h3>
<p>Vollständige Lokalisierung einschließlich RTL-Schriften</p>
</td>
<td align="center">
<h3>🌒 Designs</h3>
<p>Hell- und Dunkelmodus mit Systemeinstellungs-Unterstützung</p>
</td>
</tr>
</table>

---

## Herunterladen

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=F%C3%BCr%20Windows%20herunterladen&style=for-the-badge&logo=windows&logoColor=white" alt="Für Windows herunterladen"></a>
</p>

### Hinweis zu Windows SmartScreen

Netok ist noch nicht code-signiert. Windows zeigt beim ersten Start möglicherweise eine SmartScreen-Warnung an — das ist normal für unsignierte Anwendungen. Klicken Sie auf „Weitere Informationen" → „Trotzdem ausführen", um fortzufahren.

Die Anwendung wird automatisch aus dem Quellcode über GitHub Actions erstellt. Sie können den Build überprüfen, indem Sie den [Release-Workflow](https://github.com/korenyako/netok/releases) einsehen und die Prüfsummen vergleichen.

---

## Unter der Haube

### Diagnosekette

Jeder Knoten in der Kette führt unabhängige Prüfungen durch — kein Router-Admin-Zugang erforderlich:

**Computer** — `hostname::get()` für den Maschinennamen, `get_if_addrs` für Netzwerkschnittstellen, Windows WLAN API für Adapterdetails.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, Signalqualität umgerechnet in dBm (`-90 + quality/2`), TX-Rate, PHY-Typ → Wi-Fi-Standard, Kanal und Band (2,4/5/6 GHz) aus `ulChCenterFrequency`. Verbindungstyp wird durch Musterabgleich des Adapternamens erkannt.

**Router** — Gateway-IP geparst aus `route print` (Windows), `ip route` (Linux) oder `netstat -nr` (macOS). MAC-Adresse über `Get-NetNeighbor`. Hersteller identifiziert durch Longest-Prefix-OUI-Suche in 30.000+ Einträgen aus der Wireshark-Herstellerdatenbank.

**Internet** — Zwei Prüfungen parallel: DNS-Auflösung über `trust_dns_resolver` (versucht `one.one.one.one`, Fallback `dns.google`) und HTTP-Erreichbarkeit über `reqwest` (versucht Cloudflare trace, Fallback `example.com`). Beide bestanden → OK, eine bestanden → Partial, beide fehlgeschlagen → Fail.

### Wi-Fi-Sicherheit

Vier aufeinanderfolgende Prüfungen, alle über Windows WLAN API:

**Verschlüsselung** — Liest `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, ordnet zu: Open (Gefahr) / WEP, WPA (Warnung) / WPA2, WPA3 (sicher).

**Evil-Twin-Erkennung** — Ruft alle BSSIDs ab, die mit der verbundenen SSID übereinstimmen, über `WlanGetNetworkBssList`. Prüft das IEEE 802.11 Privacy-Bit an jedem AP. Wenn dieselbe SSID sowohl offene als auch verschlüsselte Zugangspunkte hat → Warnung.

**ARP-Spoofing-Erkennung** — Liest die vollständige ARP-Tabelle über `Get-NetNeighbor`, erstellt eine MAC → IP-Zuordnung. Wenn eine Nicht-Broadcast-MAC mehreren IPs zugeordnet ist, einschließlich des Gateways → Gefahr.

**DNS-Hijacking-Erkennung** — Löst `example.com` über den System-Resolver UND über eine Raw-UDP-Abfrage an `1.1.1.1` auf. Wenn sich die IP-Mengen nicht überschneiden → Warnung.

Gesamtsicherheitsstatus = schlechtestes Ergebnis der vier Prüfungen.

### Geschwindigkeitstest

Frontend-basiert, nutzt NDT7 (Network Diagnostic Tool v7) von M-Lab über WebSocket:

- Servererkennung über M-Lab locate API (nächster Server, 5 Min. Cache)
- Download-/Upload-Phasen je ~10 Sekunden
- **Ping**: Median von 3 WebSocket-Connect/Close-RTT-Zyklen
- **Latency**: Mittelwert `TCPInfo.SmoothedRTT` unter Last
- **Jitter**: Mittlere absolute aufeinanderfolgende Differenz der SmoothedRTT-Werte
- **Bufferbloat-Erkennung**: Latency > 3× Idle-Ping

Ergebnisse zugeordnet zu praktischen Aufgaben:

| Aufgabe | Bedingung |
|---------|-----------|
| 4K-Video | Download ≥ 25 Mbit/s |
| Online-Gaming | Ping ≤ 50 ms UND Jitter ≤ 30 ms |
| Videoanrufe | Download ≥ 3 Mbit/s UND Ping ≤ 100 ms |
| HD-Video | Download ≥ 10 Mbit/s |
| Musik/Podcasts | Download ≥ 1 Mbit/s |
| Social/Web | Download ≥ 3 Mbit/s |
| E-Mail/Messenger | Download ≥ 0,5 Mbit/s |

---

## Erstellt mit

- [Rust](https://www.rust-lang.org/) — Diagnose-Engine
- [Tauri](https://tauri.app/) — Desktop-Framework
- [React](https://react.dev/) + TypeScript — Benutzeroberfläche
- [sing-box](https://sing-box.sagernet.org/) — VPN-Tunneling

---

## Lizenz

GPL-3.0. Siehe [LICENSE](LICENSE) und [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Datenschutz & Sicherheit

Siehe [PRIVACY.md](PRIVACY.md) und [SECURITY.md](SECURITY.md).

---

*Erstellt von [Anton Korenyako](https://korenyako.github.io)*
