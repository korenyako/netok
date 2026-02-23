<p align="center">
  <img src="logo.svg" width="120" alt="Логотип Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <b>Русский</b> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F-GPL--3.0-blue?style=flat-square" alt="Лицензия: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F" alt="Всего скачиваний"></a>
</p>

<p align="center">
  <b>Диагностика сети на понятном языке.</b><br>
  Netok показывает полный путь от вашего компьютера до интернета — и объясняет,<br>
  что не так, простыми словами, а не кодами ошибок.
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

> **Примечание:** Windows может показать предупреждение SmartScreen при первом запуске —
> это нормально для неподписанных приложений. Нажмите «Всё равно запустить», чтобы продолжить.

---

## Технологии

- [Rust](https://www.rust-lang.org/) — движок диагностики
- [Tauri](https://tauri.app/) — десктопный фреймворк
- [React](https://react.dev/) + TypeScript — интерфейс
- [sing-box](https://sing-box.sagernet.org/) — VPN-туннелирование

---

## Лицензия

GPL-3.0. См. [LICENSE](LICENSE) и [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

*Автор — [Антон Коренько](https://github.com/korenyako)*
