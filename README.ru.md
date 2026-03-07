<p align="center">
  <img src="logo.svg" width="120" alt="Логотип Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <b>Русский</b> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F-GPL--3.0-blue?style=for-the-badge" alt="Лицензия: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Всего скачиваний"></a>
</p>

<p align="center">
  <b>Диагностика сети на понятном языке.</b><br>
  Десктопное приложение для диагностики сети, защиты DNS и VPN.<br>
  Покажет полный путь подключения от компьютера до интернета,<br>
  сменит DNS-провайдера в один клик и подключит через VPN —<br>
  всё на понятном языке, без кодов ошибок.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%BE-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Готово"></a>
  <img src="https://img.shields.io/badge/Android-%D0%92%20%D1%80%D0%B0%D0%B7%D1%80%D0%B0%D0%B1%D0%BE%D1%82%D0%BA%D0%B5-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: В разработке">
  <img src="https://img.shields.io/badge/macOS-%D0%9F%D0%BB%D0%B0%D0%BD%D0%B8%D1%80%D1%83%D0%B5%D1%82%D1%81%D1%8F-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Планируется">
  <img src="https://img.shields.io/badge/iOS-%D0%9F%D0%BB%D0%B0%D0%BD%D0%B8%D1%80%D1%83%D0%B5%D1%82%D1%81%D1%8F-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Планируется">
</p>

## Почему Netok

Большинство сетевых инструментов созданы для инженеров. Netok создан для всех остальных.

Когда интернет перестаёт работать, вам не нужно знать, что означает
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok переведёт это на понятный язык:
что сломалось, где, и что с этим делать.

---

## Возможности

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Диагностика</h3>
<p>Компьютер → Wi-Fi → Роутер → Интернет — пошаговая проверка соединения</p>
</td>
<td align="center" width="33%">
<h3>💬 Простой язык</h3>
<p>Без технического жаргона — понятные ответы, что сломалось и как починить</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Защита DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing или свои серверы</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard через sing-box</p>
</td>
<td align="center">
<h3>💻 Устройства</h3>
<p>Сканирование локальной сети и определение устройств по бренду</p>
</td>
<td align="center">
<h3>⚡ Тест скорости</h3>
<p>Понятные оценки, а не просто цифры</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Безопасность Wi-Fi</h3>
<p>Обнаружение уязвимостей шифрования и сетевых угроз</p>
</td>
<td align="center">
<h3>🌍 15 языков</h3>
<p>Полная локализация, включая RTL-скрипты</p>
</td>
<td align="center">
<h3>🌒 Темы</h3>
<p>Светлая и тёмная тема с поддержкой системных настроек</p>
</td>
</tr>
</table>

---

## Скачать

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20%D0%B4%D0%BB%D1%8F%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Скачать для Windows"></a>
</p>

### Примечание о Windows SmartScreen

Netok пока не имеет цифровой подписи. При первом запуске Windows может показать предупреждение SmartScreen — это нормально для неподписанных приложений. Нажмите «Подробнее» → «Выполнить в любом случае», чтобы продолжить.

Приложение автоматически собирается из исходного кода через GitHub Actions. Вы можете проверить сборку, ознакомившись с [процессом выпуска](https://github.com/korenyako/netok/releases) и сравнив контрольные суммы.

---

## Под капотом

### Диагностическая цепочка

Каждый узел цепочки выполняет независимые проверки — доступ к настройкам роутера не требуется:

**Компьютер** — `hostname::get()` для имени машины, `get_if_addrs` для сетевых интерфейсов, Windows WLAN API для параметров адаптера.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, качество сигнала с конвертацией в dBm (`-90 + quality/2`), скорость TX, тип PHY → стандарт Wi-Fi, канал и диапазон (2.4/5/6 ГГц) из `ulChCenterFrequency`. Тип подключения определяется по паттерну имени адаптера.

**Роутер** — IP шлюза парсится из `route print` (Windows), `ip route` (Linux) или `netstat -nr` (macOS). MAC-адрес через `Get-NetNeighbor`. Производитель определяется через longest-prefix OUI-поиск по 30 000+ записей из базы производителей Wireshark.

**Интернет** — Две проверки параллельно: DNS-резолвинг через `trust_dns_resolver` (пробует `one.one.one.one`, запасной `dns.google`) и HTTP-доступность через `reqwest` (пробует Cloudflare trace, запасной `example.com`). Обе прошли → OK, одна прошла → Partial, обе провалились → Fail.

### Безопасность Wi-Fi

Четыре последовательные проверки через Windows WLAN API:

**Шифрование** — Читает `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, маппит в Open (опасно) / WEP, WPA (предупреждение) / WPA2, WPA3 (безопасно).

**Обнаружение Evil Twin** — Получает все BSSID, совпадающие с подключённым SSID через `WlanGetNetworkBssList`. Проверяет бит IEEE 802.11 Privacy на каждой точке доступа. Если один SSID имеет и открытые, и зашифрованные точки → предупреждение.

**Обнаружение ARP-спуфинга** — Читает полную ARP-таблицу через `Get-NetNeighbor`, строит маппинг MAC → IP. Если не-broadcast MAC соответствует нескольким IP включая шлюз → опасно.

**Обнаружение DNS-перехвата** — Резолвит `example.com` через системный резолвер И через raw UDP-запрос к `1.1.1.1`. Если множества IP не пересекаются → предупреждение.

Общий статус безопасности = наихудший результат из четырёх проверок.

### Тест скорости

Работает на фронтенде, используя NDT7 (Network Diagnostic Tool v7) от M-Lab через WebSocket:

- Обнаружение сервера через M-Lab locate API (ближайший сервер, кэш 5 мин)
- Фазы загрузки/выгрузки ~10 секунд каждая
- **Ping**: медиана 3 циклов RTT подключения/закрытия WebSocket
- **Latency**: среднее `TCPInfo.SmoothedRTT` под нагрузкой
- **Jitter**: среднее абсолютной последовательной разности SmoothedRTT
- **Обнаружение bufferbloat**: latency > 3× idle ping

Результаты привязаны к практическим задачам:

| Задача | Условие |
|--------|---------|
| Видео 4K | download ≥ 25 Мбит/с |
| Онлайн-игры | ping ≤ 50 мс И jitter ≤ 30 мс |
| Видеозвонки | download ≥ 3 Мбит/с И ping ≤ 100 мс |
| HD-видео | download ≥ 10 Мбит/с |
| Музыка/Подкасты | download ≥ 1 Мбит/с |
| Соцсети/Веб | download ≥ 3 Мбит/с |
| Почта/Мессенджеры | download ≥ 0.5 Мбит/с |

---

## Технологии

- [Rust](https://www.rust-lang.org/) — движок диагностики
- [Tauri](https://tauri.app/) — десктопный фреймворк
- [React](https://react.dev/) + TypeScript — интерфейс
- [sing-box](https://sing-box.sagernet.org/) — VPN-туннелирование

---

## Лицензия

GPL-3.0. См. [LICENSE](LICENSE) и [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Конфиденциальность и безопасность

См. [PRIVACY.md](PRIVACY.md) и [SECURITY.md](SECURITY.md).

---

*Автор — [Антон Кореняко](https://korenyako.github.io)*
