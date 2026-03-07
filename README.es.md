<p align="center">
  <img src="logo.svg" width="120" alt="Logo de Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <b>Español</b> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Licencia-GPL--3.0-blue?style=for-the-badge" alt="Licencia: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Descargas totales"></a>
</p>

<p align="center">
  <b>Diagnóstico de red en lenguaje humano.</b><br>
  Aplicación de escritorio para diagnóstico de red, protección DNS y VPN.<br>
  Ve la ruta completa de conexión desde tu computadora hasta internet,<br>
  cambia de proveedor DNS con un clic y conéctate a través de VPN —<br>
  todo explicado en lenguaje sencillo, no en códigos de error.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Listo-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Listo"></a>
  <img src="https://img.shields.io/badge/Android-En%20desarrollo-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: En desarrollo">
  <img src="https://img.shields.io/badge/macOS-Planeado-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planeado">
  <img src="https://img.shields.io/badge/iOS-Planeado-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planeado">
</p>

## Por qué Netok

La mayoría de las herramientas de red están diseñadas para ingenieros. Netok está diseñado para todos los demás.

Cuando tu internet deja de funcionar, no deberías necesitar saber qué significa
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok lo traduce a algo útil:
qué está roto, dónde, y qué hacer al respecto.

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
<h3>💻 Dispositivos</h3>
<p>Escanea tu red local e identifica dispositivos por marca</p>
</td>
<td align="center">
<h3>⚡ Test de Velocidad</h3>
<p>Calificaciones reales, no solo números crudos</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Seguridad Wi-Fi</h3>
<p>Detecta vulnerabilidades de cifrado y amenazas de red</p>
</td>
<td align="center">
<h3>🌍 15 Idiomas</h3>
<p>Localización completa incluyendo scripts RTL</p>
</td>
<td align="center">
<h3>🌒 Temas</h3>
<p>Modo claro y oscuro con soporte de preferencias del sistema</p>
</td>
</tr>
</table>

---

## Descargar

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Descargar%20para%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Descargar para Windows"></a>
</p>

### Nota sobre Windows SmartScreen

Netok aún no cuenta con firma de código. Windows puede mostrar una advertencia de SmartScreen en el primer inicio — esto es normal para aplicaciones sin firmar. Haga clic en "Más información" → "Ejecutar de todas formas" para continuar.

La aplicación se compila automáticamente a partir del código fuente mediante GitHub Actions. Puede verificar la compilación consultando el [flujo de lanzamiento](https://github.com/korenyako/netok/releases) y comparando las sumas de verificación.

---

## Bajo el capó

### Cadena de diagnóstico

Cada nodo de la cadena ejecuta verificaciones independientes — no se necesita acceso de administrador al router:

**Computadora** — `hostname::get()` para el nombre de la máquina, `get_if_addrs` para interfaces de red, Windows WLAN API para detalles del adaptador.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, calidad de señal convertida a dBm (`-90 + quality/2`), tasa TX, tipo PHY → estándar Wi-Fi, canal y banda (2.4/5/6 GHz) desde `ulChCenterFrequency`. Tipo de conexión detectado por coincidencia de patrones del nombre del adaptador.

**Router** — IP del gateway parseada de `route print` (Windows), `ip route` (Linux) o `netstat -nr` (macOS). Dirección MAC vía `Get-NetNeighbor`. Fabricante identificado mediante búsqueda OUI de prefijo más largo entre 30.000+ entradas compiladas de la base de datos de fabricantes de Wireshark.

**Internet** — Dos verificaciones en paralelo: resolución DNS vía `trust_dns_resolver` (intenta `one.one.one.one`, respaldo `dns.google`) y accesibilidad HTTP vía `reqwest` (intenta Cloudflare trace, respaldo `example.com`). Ambas pasan → OK, una pasa → Partial, ambas fallan → Fail.

### Seguridad Wi-Fi

Cuatro verificaciones secuenciales, todas vía Windows WLAN API:

**Cifrado** — Lee `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, mapea a Open (peligro) / WEP, WPA (advertencia) / WPA2, WPA3 (seguro).

**Detección de Evil Twin** — Obtiene todos los BSSIDs que coinciden con el SSID conectado vía `WlanGetNetworkBssList`. Verifica el bit IEEE 802.11 Privacy en cada AP. Si el mismo SSID tiene puntos de acceso abiertos y cifrados → advertencia.

**Detección de ARP Spoofing** — Lee la tabla ARP completa vía `Get-NetNeighbor`, construye un mapeo MAC → IP. Si algún MAC no-broadcast mapea a múltiples IPs incluyendo el gateway → peligro.

**Detección de secuestro DNS** — Resuelve `example.com` vía el resolver del sistema Y vía una consulta UDP raw a `1.1.1.1`. Si los conjuntos de IP no se superponen → advertencia.

Estado general de seguridad = peor resultado de las cuatro verificaciones.

### Test de velocidad

Basado en frontend, usando NDT7 (Network Diagnostic Tool v7) de M-Lab sobre WebSocket:

- Descubrimiento de servidor vía M-Lab locate API (servidor más cercano, caché 5 min)
- Fases de descarga/subida ~10 segundos cada una
- **Ping**: mediana de 3 ciclos RTT de conexión/cierre WebSocket
- **Latency**: media de `TCPInfo.SmoothedRTT` bajo carga
- **Jitter**: media de la diferencia absoluta consecutiva de muestras SmoothedRTT
- **Detección de bufferbloat**: latency > 3× idle ping

Resultados mapeados a tareas prácticas:

| Tarea | Condición |
|-------|-----------|
| Video 4K | download ≥ 25 Mbps |
| Juegos en línea | ping ≤ 50 ms Y jitter ≤ 30 ms |
| Videollamadas | download ≥ 3 Mbps Y ping ≤ 100 ms |
| Video HD | download ≥ 10 Mbps |
| Música/Podcasts | download ≥ 1 Mbps |
| Redes sociales/Web | download ≥ 3 Mbps |
| Email/Mensajería | download ≥ 0.5 Mbps |

---

## Construido con

- [Rust](https://www.rust-lang.org/) — motor de diagnóstico
- [Tauri](https://tauri.app/) — framework de escritorio
- [React](https://react.dev/) + TypeScript — interfaz de usuario
- [sing-box](https://sing-box.sagernet.org/) — túneles VPN

---

## Licencia

GPL-3.0. Ver [LICENSE](LICENSE) y [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Privacidad y seguridad

Ver [PRIVACY.md](PRIVACY.md) y [SECURITY.md](SECURITY.md).

---

*Hecho por [Anton Korenyako](https://korenyako.github.io)*
