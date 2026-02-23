<p align="center">
  <img src="logo.svg" width="120" alt="Logo Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <b>Français</b> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licence-GPL--3.0-blue?style=flat-square" alt="Licence : GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=T%C3%A9l%C3%A9chargements" alt="Téléchargements totaux"></a>
</p>

<p align="center">
  <b>Diagnostic réseau en langage humain.</b><br>
  Netok vous montre le chemin complet de votre ordinateur à Internet — et explique<br>
  ce qui ne va pas en termes simples, pas en codes d'erreur.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Pr%C3%AAt-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows : Prêt"></a>
  <img src="https://img.shields.io/badge/Android-En%20cours-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android : En cours">
  <img src="https://img.shields.io/badge/macOS-Pr%C3%A9vu-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS : Prévu">
  <img src="https://img.shields.io/badge/iOS-Pr%C3%A9vu-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS : Prévu">
</p>

## Pourquoi Netok

La plupart des outils réseau sont conçus pour les ingénieurs. Netok est conçu pour tous les autres.

Quand votre Internet cesse de fonctionner, vous ne devriez pas avoir besoin de savoir ce que
signifie `DNS_PROBE_FINISHED_NXDOMAIN`. Netok traduit cela en langage clair :
ce qui est cassé, où, et quoi faire.

---

## Fonctionnalités

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnostic</h3>
<p>Ordinateur → Wi-Fi → Routeur → Internet — vérification étape par étape</p>
</td>
<td align="center" width="33%">
<h3>💬 Langage simple</h3>
<p>Pas de jargon technique — des réponses claires sur ce qui ne va pas et comment le réparer</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Protection DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing ou vos propres serveurs</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard via sing-box</p>
</td>
<td align="center">
<h3>💻 Découverte d'appareils</h3>
<p>Scannez votre réseau local et identifiez les appareils par marque</p>
</td>
<td align="center">
<h3>⚡ Test de vitesse</h3>
<p>Des évaluations concrètes, pas juste des chiffres bruts</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Sécurité Wi-Fi</h3>
<p>Détection des vulnérabilités de chiffrement et des menaces réseau</p>
</td>
<td align="center">
<h3>🌍 15 langues</h3>
<p>Localisation complète, y compris les écritures RTL</p>
</td>
<td align="center">
<h3>🌒 Thèmes</h3>
<p>Mode clair et sombre avec prise en charge des préférences système</p>
</td>
</tr>
</table>

---

## Télécharger

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=T%C3%A9l%C3%A9charger%20pour%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Télécharger pour Windows"></a>
</p>

> **Note :** Windows peut afficher un avertissement SmartScreen au premier lancement —
> c'est normal pour les applications non signées. Cliquez sur « Exécuter quand même » pour continuer.

---

## Technologies utilisées

- [Rust](https://www.rust-lang.org/) — moteur de diagnostic
- [Tauri](https://tauri.app/) — framework desktop
- [React](https://react.dev/) + TypeScript — interface utilisateur
- [sing-box](https://sing-box.sagernet.org/) — tunneling VPN

---

## Licence

GPL-3.0. Voir [LICENSE](LICENSE) et [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

*Créé par [Anton Korenyako](https://github.com/korenyako)*
