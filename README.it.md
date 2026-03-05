<p align="center">
  <img src="logo.svg" width="120" alt="Logo Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <b>Italiano</b> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licenza-GPL--3.0-blue?style=for-the-badge" alt="Licenza: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Download totali"></a>
</p>

<p align="center">
  <b>Diagnostica di rete in linguaggio umano.</b><br>
  App desktop per diagnostica di rete, protezione DNS e VPN.<br>
  Visualizza il percorso completo di connessione dal computer a Internet,<br>
  cambia provider DNS con un clic e connettiti tramite VPN —<br>
  il tutto spiegato in linguaggio semplice, non in codici di errore.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Pronto-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Pronto"></a>
  <img src="https://img.shields.io/badge/Android-In%20sviluppo-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: In sviluppo">
  <img src="https://img.shields.io/badge/macOS-Pianificato-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Pianificato">
  <img src="https://img.shields.io/badge/iOS-Pianificato-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Pianificato">
</p>

## Perché Netok

La maggior parte degli strumenti di rete è pensata per gli ingegneri. Netok è pensato per tutti gli altri.

Quando Internet smette di funzionare, non dovresti aver bisogno di sapere cosa significa
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok lo traduce in un linguaggio comprensibile:
cosa si è rotto, dove, e cosa fare.

---

## Funzionalità

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnostica</h3>
<p>Computer → Wi-Fi → Router → Internet — controllo passo dopo passo della connessione</p>
</td>
<td align="center" width="33%">
<h3>💬 Linguaggio semplice</h3>
<p>Nessun gergo tecnico — risposte chiare su cosa non funziona e come risolvere</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Protezione DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing o i tuoi server personalizzati</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard tramite sing-box</p>
</td>
<td align="center">
<h3>💻 Scoperta dispositivi</h3>
<p>Scansiona la tua rete locale e identifica i dispositivi per marca</p>
</td>
<td align="center">
<h3>⚡ Test di velocità</h3>
<p>Valutazioni comprensibili, non solo numeri grezzi</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Sicurezza Wi-Fi</h3>
<p>Rilevamento di vulnerabilità crittografiche e minacce di rete</p>
</td>
<td align="center">
<h3>🌍 15 lingue</h3>
<p>Localizzazione completa, inclusi script RTL</p>
</td>
<td align="center">
<h3>🌒 Temi</h3>
<p>Modalità chiara e scura con supporto preferenze di sistema</p>
</td>
</tr>
</table>

---

## Scarica

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Scarica%20per%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Scarica per Windows"></a>
</p>

### Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org).

- **Roles:** all governance roles (committer, reviewer, approver) are held by [Anton Korenyako](https://github.com/korenyako). See [CONTRIBUTING.md](CONTRIBUTING.md#project-governance) for details.
- **Privacy:** this application does not transfer any information to other networked systems unless specifically requested by the user or required for core diagnostic functionality. See [PRIVACY.md](PRIVACY.md) for the full list of network requests.

---

## Realizzato con

- [Rust](https://www.rust-lang.org/) — motore diagnostico
- [Tauri](https://tauri.app/) — framework desktop
- [React](https://react.dev/) + TypeScript — interfaccia utente
- [sing-box](https://sing-box.sagernet.org/) — tunneling VPN

---

## Licenza

GPL-3.0. Vedi [LICENSE](LICENSE) e [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Privacy e sicurezza

Vedi [PRIVACY.md](PRIVACY.md) e [SECURITY.md](SECURITY.md).

---

*Creato da [Anton Korenyako](https://korenyako.github.io)*
