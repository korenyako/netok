<p align="center">
  <img src="logo.svg" width="120" alt="Logo Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <b>Français</b> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licence-GPL--3.0-blue?style=for-the-badge" alt="Licence : GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Téléchargements totaux"></a>
</p>

<p align="center">
  <b>Diagnostic réseau en langage humain.</b><br>
  Application de bureau pour le diagnostic réseau, la protection DNS et le VPN.<br>
  Visualisez le chemin complet de connexion de votre ordinateur à Internet,<br>
  changez de fournisseur DNS en un clic et connectez-vous via VPN —<br>
  le tout expliqué en langage clair, pas en codes d'erreur.<br>
  Built with Rust + Tauri + React.
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

### Remarque sur Windows SmartScreen

Netok n'est pas encore signé numériquement. Windows peut afficher un avertissement SmartScreen au premier lancement — c'est normal pour les applications non signées. Cliquez sur « Plus d'infos » → « Exécuter quand même » pour continuer.

L'application est compilée automatiquement à partir du code source via GitHub Actions. Vous pouvez vérifier la compilation en consultant le [workflow de publication](https://github.com/korenyako/netok/releases) et en comparant les sommes de contrôle.

---

## Sous le capot

### Chaîne de diagnostic

Chaque nœud de la chaîne exécute des vérifications indépendantes — aucun accès administrateur au routeur requis :

**Ordinateur** — `hostname::get()` pour le nom de la machine, `get_if_addrs` pour les interfaces réseau, Windows WLAN API pour les détails de l'adaptateur.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`) : SSID, qualité du signal convertie en dBm (`-90 + quality/2`), débit TX, type PHY → standard Wi-Fi, canal et bande (2,4/5/6 GHz) depuis `ulChCenterFrequency`. Type de connexion détecté par correspondance de motifs du nom de l'adaptateur.

**Routeur** — IP de la passerelle parsée depuis `route print` (Windows), `ip route` (Linux) ou `netstat -nr` (macOS). Adresse MAC via `Get-NetNeighbor`. Fabricant identifié par recherche OUI par plus long préfixe parmi 30 000+ entrées compilées depuis la base de données des fabricants Wireshark.

**Internet** — Deux vérifications en parallèle : résolution DNS via `trust_dns_resolver` (essaie `one.one.one.one`, repli `dns.google`) et accessibilité HTTP via `reqwest` (essaie Cloudflare trace, repli `example.com`). Les deux passent → OK, une passe → Partial, les deux échouent → Fail.

### Sécurité Wi-Fi

Quatre vérifications séquentielles, toutes via Windows WLAN API :

**Chiffrement** — Lit `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, mappe vers Open (danger) / WEP, WPA (avertissement) / WPA2, WPA3 (sûr).

**Détection de Evil Twin** — Récupère tous les BSSIDs correspondant au SSID connecté via `WlanGetNetworkBssList`. Vérifie le bit IEEE 802.11 Privacy sur chaque AP. Si le même SSID a des points d'accès ouverts et chiffrés → avertissement.

**Détection d'ARP Spoofing** — Lit la table ARP complète via `Get-NetNeighbor`, construit un mappage MAC → IP. Si un MAC non-broadcast correspond à plusieurs IPs incluant la passerelle → danger.

**Détection de détournement DNS** — Résout `example.com` via le résolveur système ET via une requête UDP brute vers `1.1.1.1`. Si les ensembles d'IP ne se chevauchent pas → avertissement.

Statut de sécurité global = pire résultat des quatre vérifications.

### Test de vitesse

Basé sur le frontend, utilisant NDT7 (Network Diagnostic Tool v7) de M-Lab via WebSocket :

- Découverte du serveur via M-Lab locate API (serveur le plus proche, cache 5 min)
- Phases de téléchargement/envoi ~10 secondes chacune
- **Ping** : médiane de 3 cycles RTT de connexion/fermeture WebSocket
- **Latency** : moyenne de `TCPInfo.SmoothedRTT` sous charge
- **Jitter** : moyenne de la différence absolue consécutive des échantillons SmoothedRTT
- **Détection de bufferbloat** : latency > 3× idle ping

Résultats associés à des tâches pratiques :

| Tâche | Condition |
|-------|-----------|
| Vidéo 4K | download ≥ 25 Mbps |
| Jeux en ligne | ping ≤ 50 ms ET jitter ≤ 30 ms |
| Appels vidéo | download ≥ 3 Mbps ET ping ≤ 100 ms |
| Vidéo HD | download ≥ 10 Mbps |
| Musique/Podcasts | download ≥ 1 Mbps |
| Réseaux sociaux/Web | download ≥ 3 Mbps |
| Email/Messagerie | download ≥ 0,5 Mbps |

---

## Technologies utilisées

- [Rust](https://www.rust-lang.org/) — moteur de diagnostic
- [Tauri](https://tauri.app/) — framework desktop
- [React](https://react.dev/) + TypeScript — interface utilisateur
- [sing-box](https://sing-box.sagernet.org/) — tunneling VPN

---

## Licence

GPL-3.0. Voir [LICENSE](LICENSE) et [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Confidentialit&#233; et s&#233;curit&#233;

Voir [PRIVACY.md](PRIVACY.md) et [SECURITY.md](SECURITY.md).

---

*Créé par [Anton Korenyako](https://korenyako.github.io)*
