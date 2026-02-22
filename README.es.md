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

- **Diagnóstico de conexión** — Computadora → Wi-Fi → Router → Internet, paso a paso
- **Explicaciones en lenguaje simple** — sin jerga técnica, solo respuestas claras
- **Protección DNS** — Cloudflare, AdGuard, CleanBrowsing o servidores personalizados
- **Soporte VPN** — VLESS, VMess, Shadowsocks, Trojan, WireGuard a través de sing-box
- **Descubrimiento de dispositivos** — escanea tu red local, identifica dispositivos por marca
- **Test de velocidad** — calificaciones reales, no solo números crudos
- **Verificación de seguridad Wi-Fi** — vulnerabilidades de cifrado y amenazas
- **15 idiomas** — localización completa incluyendo scripts RTL
- **Tema claro y oscuro**

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

| Plataforma | Estado |
|------------|--------|
| Windows | Listo |
| macOS | Planeado |
| Android | En desarrollo |
| iOS | Planeado |

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
