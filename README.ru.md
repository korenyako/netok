<p align="center">
  <img src="logo.svg" width="120" alt="Логотип Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <b>Русский</b> | <a href="README.fa.md">فارسی</a> | <a href="README.es.md">Español</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <b>Диагностика сети на понятном языке.</b><br>
  Netok показывает полный путь от вашего компьютера до интернета — и объясняет,<br>
  что не так, простыми словами, а не кодами ошибок.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20%D0%B4%D0%BB%D1%8F%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Скачать для Windows"></a>
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok"><img src="https://img.shields.io/github/stars/korenyako/netok?style=flat-square" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/%D0%9B%D0%B8%D1%86%D0%B5%D0%BD%D0%B7%D0%B8%D1%8F-GPL--3.0-blue?style=flat-square" alt="Лицензия: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/%D0%9F%D0%BB%D0%B0%D1%82%D1%84%D0%BE%D1%80%D0%BC%D0%B0-Windows-0078D4?style=flat-square&logo=windows" alt="Платформа: Windows"></a>
</p>

![Скриншот Netok](docs/screenshot.png)

---

## Возможности

- **Диагностика соединения** — Компьютер → Wi-Fi → Роутер → Интернет, шаг за шагом
- **Объяснения простым языком** — без технического жаргона, только понятные ответы
- **Защита DNS** — Cloudflare, AdGuard, CleanBrowsing или свои серверы
- **Поддержка VPN** — VLESS, VMess, Shadowsocks, Trojan, WireGuard через sing-box
- **Обнаружение устройств** — сканирование локальной сети, определение устройств по бренду
- **Тест скорости** — понятные оценки, а не просто цифры
- **Проверка безопасности Wi-Fi** — уязвимости шифрования и угрозы
- **15 языков** — полная локализация, включая RTL-скрипты
- **Светлая и тёмная тема**

---

## Скачать

> [Последний релиз для Windows](https://github.com/korenyako/netok/releases/latest)

> **Примечание:** Windows может показать предупреждение SmartScreen при первом запуске —
> это нормально для неподписанных приложений. Нажмите «Всё равно запустить», чтобы продолжить.

---

## Почему Netok

Большинство сетевых инструментов созданы для инженеров. Netok создан для всех остальных.

Когда интернет перестаёт работать, вам не нужно знать, что означает
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok переведёт это на понятный язык:
что сломалось, где, и что с этим делать.

---

## Поддержка платформ

| Платформа | Статус |
|-----------|--------|
| Windows | Готово |
| macOS | Планируется |
| Android | В разработке |
| iOS | Планируется |

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
