<p align="center">
  <img src="logo.svg" width="120" alt="Logo de Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a> | <a href="README.fa.md">فارسی</a> | <b>Español</b>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <b>Diagnóstico de red en lenguaje humano.</b><br>
  Netok te muestra el camino completo desde tu computadora hasta internet — y explica<br>
  qué está mal en términos simples, no en códigos de error.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Descargar%20para%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Descargar para Windows"></a>
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok"><img src="https://img.shields.io/github/stars/korenyako/netok?style=flat-square" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencia-GPL--3.0-blue?style=flat-square" alt="Licencia: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Plataforma-Windows-0078D4?style=flat-square&logo=windows" alt="Plataforma: Windows"></a>
</p>

![Captura de pantalla de Netok](docs/screenshot.png)

---

## Características

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Diagnóstico</h3>
<p>Computadora → Wi-Fi → Router → Internet — verificación paso a paso</p>
</td>
<td align="center" width="33%">
<h3>💬 Lenguaje Simple</h3>
<p>Sin jerga técnica — respuestas claras sobre qué falla y cómo solucionarlo</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Protección DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing o tus propios servidores</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard a través de sing-box</p>
</td>
<td align="center">
<h3>📡 Dispositivos</h3>
<p>Escanea tu red local e identifica dispositivos por marca</p>
</td>
<td align="center">
<h3>⚡ Test de Velocidad</h3>
<p>Calificaciones reales, no solo números crudos</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔒 Seguridad Wi-Fi</h3>
<p>Detecta vulnerabilidades de cifrado y amenazas de red</p>
</td>
<td align="center">
<h3>🌍 15 Idiomas</h3>
<p>Localización completa incluyendo scripts RTL</p>
</td>
<td align="center">
<h3>🎨 Temas</h3>
<p>Modo claro y oscuro con soporte de preferencias del sistema</p>
</td>
</tr>
</table>

---

## Descargar

> [Última versión para Windows](https://github.com/korenyako/netok/releases/latest)

> **Nota:** Windows puede mostrar una advertencia de SmartScreen en el primer inicio —
> esto es normal para aplicaciones sin firma. Haz clic en "Ejecutar de todas formas" para continuar.

---

## Por qué Netok

La mayoría de las herramientas de red están diseñadas para ingenieros. Netok está diseñado para todos los demás.

Cuando tu internet deja de funcionar, no deberías necesitar saber qué significa
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok lo traduce a algo útil:
qué está roto, dónde, y qué hacer al respecto.

---

## Soporte de plataformas

<p>
  <img src="https://img.shields.io/badge/Windows-Listo-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Listo">
  <img src="https://img.shields.io/badge/macOS-Planeado-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planeado">
  <img src="https://img.shields.io/badge/Android-En%20desarrollo-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: En desarrollo">
  <img src="https://img.shields.io/badge/iOS-Planeado-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planeado">
</p>

---

## Construido con

- [Rust](https://www.rust-lang.org/) — motor de diagnóstico
- [Tauri](https://tauri.app/) — framework de escritorio
- [React](https://react.dev/) + TypeScript — interfaz de usuario
- [sing-box](https://sing-box.sagernet.org/) — túneles VPN

---

## Licencia

GPL-3.0. Ver [LICENSE](LICENSE) y [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

*Hecho por [Anton Korenyako](https://github.com/korenyako)*
