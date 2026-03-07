<p align="center">
  <img src="logo.svg" width="120" alt="Логотип Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <b>Українська</b> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%D0%9B%D1%96%D1%86%D0%B5%D0%BD%D0%B7%D1%96%D1%8F-GPL--3.0-blue?style=for-the-badge" alt="Ліцензія: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Загалом завантажень"></a>
</p>

<p align="center">
  <b>Діагностика мережі зрозумілою мовою.</b><br>
  Десктопний застосунок для діагностики мережі, захисту DNS та VPN.<br>
  Покаже повний шлях з'єднання від комп'ютера до інтернету,<br>
  змінить DNS-провайдера в один клік і підключить через VPN —<br>
  усе зрозумілою мовою, без кодів помилок.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-%D0%93%D0%BE%D1%82%D0%BE%D0%B2%D0%BE-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Готово"></a>
  <img src="https://img.shields.io/badge/Android-%D0%A0%D0%BE%D0%B7%D1%80%D0%BE%D0%B1%D0%BA%D0%B0-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: Розробка">
  <img src="https://img.shields.io/badge/macOS-%D0%97%D0%B0%D0%BF%D0%BB%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0%D0%BD%D0%BE-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Заплановано">
  <img src="https://img.shields.io/badge/iOS-%D0%97%D0%B0%D0%BF%D0%BB%D0%B0%D0%BD%D0%BE%D0%B2%D0%B0%D0%BD%D0%BE-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Заплановано">
</p>

## Чому Netok

Більшість мережевих інструментів створено для інженерів. Netok створено для всіх інших.

Коли ваш Інтернет перестає працювати, вам не потрібно знати, що означає
`DNS_PROBE_FINISHED_NXDOMAIN`. Netok перекладе це зрозумілою мовою:
що зламалось, де і що з цим робити.

---

## Можливості

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Діагностика</h3>
<p>Комп'ютер → Wi-Fi → Роутер → Інтернет — покрокова перевірка з'єднання</p>
</td>
<td align="center" width="33%">
<h3>💬 Проста мова</h3>
<p>Без технічного жаргону — зрозумілі відповіді, що зламалось і як полагодити</p>
</td>
<td align="center" width="33%">
<h3>🛡️ Захист DNS</h3>
<p>Cloudflare, AdGuard, CleanBrowsing або власні сервери</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard через sing-box</p>
</td>
<td align="center">
<h3>💻 Пристрої</h3>
<p>Сканування локальної мережі та визначення пристроїв за брендом</p>
</td>
<td align="center">
<h3>⚡ Тест швидкості</h3>
<p>Зрозумілі оцінки, а не просто цифри</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Безпека Wi-Fi</h3>
<p>Виявлення вразливостей шифрування та мережевих загроз</p>
</td>
<td align="center">
<h3>🌍 15 мов</h3>
<p>Повна локалізація, включно з RTL-скриптами</p>
</td>
<td align="center">
<h3>🌒 Теми</h3>
<p>Світла та темна тема з підтримкою системних налаштувань</p>
</td>
</tr>
</table>

---

## Завантажити

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=%D0%97%D0%B0%D0%B2%D0%B0%D0%BD%D1%82%D0%B0%D0%B6%D0%B8%D1%82%D0%B8%20%D0%B4%D0%BB%D1%8F%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="Завантажити для Windows"></a>
</p>

### Примітка щодо Windows SmartScreen

Netok поки що не має цифрового підпису. При першому запуску Windows може показати попередження SmartScreen — це нормально для непідписаних застосунків. Натисніть «Докладніше» → «Все одно запустити», щоб продовжити.

Застосунок автоматично збирається з вихідного коду через GitHub Actions. Ви можете перевірити збірку, переглянувши [процес випуску](https://github.com/korenyako/netok/releases) та порівнявши контрольні суми.

---

## Під капотом

### Діагностичний ланцюг

Кожен вузол ланцюга виконує незалежні перевірки — доступ адміністратора до маршрутизатора не потрібен:

**Комп'ютер** — `hostname::get()` для імені машини, `get_if_addrs` для мережевих інтерфейсів, Windows WLAN API для деталей адаптера.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, якість сигналу конвертується в dBm (`-90 + quality/2`), швидкість TX, тип PHY → стандарт Wi-Fi, канал і діапазон (2.4/5/6 ГГц) з `ulChCenterFrequency`. Тип з'єднання визначається за патерном імені адаптера.

**Маршрутизатор** — IP шлюзу парситься з `route print` (Windows), `ip route` (Linux) або `netstat -nr` (macOS). MAC-адреса через `Get-NetNeighbor`. Виробник визначається через longest-prefix OUI-пошук серед 30 000+ записів з бази виробників Wireshark.

**Інтернет** — Дві перевірки паралельно: DNS-резолвінг через `trust_dns_resolver` (пробує `one.one.one.one`, запасний `dns.google`) та HTTP-доступність через `reqwest` (пробує Cloudflare trace, запасний `example.com`). Обидві пройшли → OK, одна пройшла → Partial, обидві не пройшли → Fail.

### Безпека Wi-Fi

Чотири послідовні перевірки через Windows WLAN API:

**Шифрування** — Читає `dot11AuthAlgorithm` + `dot11CipherAlgorithm`, мапить у Open (небезпечно) / WEP, WPA (попередження) / WPA2, WPA3 (безпечно).

**Виявлення Evil Twin** — Отримує всі BSSID, що збігаються з підключеним SSID через `WlanGetNetworkBssList`. Перевіряє біт IEEE 802.11 Privacy на кожному AP. Якщо один SSID має і відкриті, і зашифровані точки доступу → попередження.

**Виявлення ARP-спуфінгу** — Читає повну ARP-таблицю через `Get-NetNeighbor`, будує маппінг MAC → IP. Якщо не-broadcast MAC відповідає кільком IP включно зі шлюзом → небезпечно.

**Виявлення DNS-перехоплення** — Резолвить `example.com` через системний резолвер ТА через raw UDP-запит до `1.1.1.1`. Якщо множини IP не перетинаються → попередження.

Загальний статус безпеки = найгірший результат з чотирьох перевірок.

### Тест швидкості

Працює на фронтенді, використовуючи NDT7 (Network Diagnostic Tool v7) від M-Lab через WebSocket:

- Виявлення сервера через M-Lab locate API (найближчий сервер, кеш 5 хв)
- Фази завантаження/вивантаження ~10 секунд кожна
- **Ping**: медіана 3 циклів RTT підключення/закриття WebSocket
- **Latency**: середнє `TCPInfo.SmoothedRTT` під навантаженням
- **Jitter**: середнє абсолютної послідовної різниці SmoothedRTT
- **Виявлення bufferbloat**: latency > 3× idle ping

Результати прив'язані до практичних задач:

| Задача | Умова |
|--------|-------|
| Відео 4K | download ≥ 25 Мбіт/с |
| Онлайн-ігри | ping ≤ 50 мс ТА jitter ≤ 30 мс |
| Відеодзвінки | download ≥ 3 Мбіт/с ТА ping ≤ 100 мс |
| HD-відео | download ≥ 10 Мбіт/с |
| Музика/Подкасти | download ≥ 1 Мбіт/с |
| Соцмережі/Веб | download ≥ 3 Мбіт/с |
| Пошта/Месенджери | download ≥ 0.5 Мбіт/с |

---

## Створено з

- [Rust](https://www.rust-lang.org/) — рушій діагностики
- [Tauri](https://tauri.app/) — десктопний фреймворк
- [React](https://react.dev/) + TypeScript — інтерфейс
- [sing-box](https://sing-box.sagernet.org/) — VPN-тунелювання

---

## Ліцензія

GPL-3.0. Див. [LICENSE](LICENSE) та [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Конфіденційність та безпека

Див. [PRIVACY.md](PRIVACY.md) та [SECURITY.md](SECURITY.md).

---

*Автор — [Антон Кореняко](https://korenyako.github.io)*
