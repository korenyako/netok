<p align="center">
  <img src="logo.svg" width="120" alt="لوگو Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <b>فارسی</b> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge" alt="مجوز: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="کل دانلودها"></a>
</p>

<p align="center">
  <b>عیب‌یابی شبکه به زبان ساده.</b><br>
  برنامه دسکتاپ برای عیب‌یابی شبکه، محافظت DNS و VPN.<br>
  مسیر کامل اتصال از رایانه تا اینترنت را ببینید، ارائه‌دهنده DNS را با یک کلیک تغییر دهید<br>
  و از طریق VPN متصل شوید — همه چیز به زبان ساده توضیح داده شده، نه با کدهای خطا.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Ready-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Ready"></a>
  <img src="https://img.shields.io/badge/Android-In%20progress-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: In progress">
  <img src="https://img.shields.io/badge/macOS-Planned-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planned">
  <img src="https://img.shields.io/badge/iOS-Planned-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planned">
</p>

## چرا Netok

بیشتر ابزارهای شبکه برای مهندسان ساخته شده‌اند. Netok برای بقیه افراد ساخته شده.

وقتی اینترنت شما قطع می‌شود، نباید لازم باشد بدانید
`DNS_PROBE_FINISHED_NXDOMAIN` یعنی چه. Netok آن را به زبان قابل فهم ترجمه می‌کند:
چه چیزی خراب شده، کجا، و چه باید کرد.

---

## امکانات

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 عیب‌یابی</h3>
<p>رایانه ← Wi-Fi ← روتر ← اینترنت — بررسی مرحله‌به‌مرحله اتصال</p>
</td>
<td align="center" width="33%">
<h3>💬 زبان ساده</h3>
<p>بدون اصطلاحات فنی — پاسخ‌های واضح درباره مشکل و راه‌حل</p>
</td>
<td align="center" width="33%">
<h3>🛡️ محافظت DNS</h3>
<p>Cloudflare، AdGuard، CleanBrowsing یا سرورهای دلخواه شما</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS، VMess، Shadowsocks، Trojan، WireGuard از طریق sing-box</p>
</td>
<td align="center">
<h3>💻 شناسایی دستگاه‌ها</h3>
<p>اسکن شبکه محلی و شناسایی دستگاه‌ها بر اساس برند</p>
</td>
<td align="center">
<h3>⚡ تست سرعت</h3>
<p>امتیازدهی واقعی، نه فقط اعداد خام</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 امنیت Wi-Fi</h3>
<p>شناسایی آسیب‌پذیری‌های رمزنگاری و تهدیدهای شبکه</p>
</td>
<td align="center">
<h3>🌍 ۱۵ زبان</h3>
<p>بومی‌سازی کامل شامل اسکریپت‌های راست‌به‌چپ</p>
</td>
<td align="center">
<h3>🌒 تم‌ها</h3>
<p>تم روشن و تاریک با پشتیبانی از تنظیمات سیستم</p>
</td>
</tr>
</table>

---

## دانلود

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="دانلود برای ویندوز"></a>
</p>

### نکته درباره Windows SmartScreen

Netok هنوز دارای امضای کد نیست. ممکن است ویندوز هنگام اولین اجرا هشدار SmartScreen نمایش دهد — این برای برنامه‌های بدون امضا عادی است. روی «اطلاعات بیشتر» → «اجرا به هر حال» کلیک کنید تا ادامه دهید.

این برنامه به‌طور خودکار از کد منبع از طریق GitHub Actions ساخته می‌شود. می‌توانید با بررسی [گردش کار انتشار](https://github.com/korenyako/netok/releases) و مقایسه چک‌سام‌ها، صحت ساخت را تأیید کنید.

---

## زیر کاپوت

### زنجیره تشخیص

هر گره در زنجیره بررسی‌های مستقل انجام می‌دهد — نیازی به دسترسی مدیریتی روتر نیست:

**کامپیوتر** — `hostname::get()` برای نام ماشین، `get_if_addrs` برای رابط‌های شبکه، Windows WLAN API برای جزئیات آداپتور.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID، کیفیت سیگنال تبدیل شده به dBm (`-90 + quality/2`)، نرخ TX، نوع PHY → استاندارد Wi-Fi، کانال و باند (2.4/5/6 GHz) از `ulChCenterFrequency`. نوع اتصال از طریق تطبیق الگوی نام آداپتور تشخیص داده می‌شود.

**روتر** — IP گیت‌وی از `route print` (ویندوز)، `ip route` (لینوکس) یا `netstat -nr` (مک) تجزیه می‌شود. آدرس MAC از طریق `Get-NetNeighbor`. سازنده از طریق جستجوی OUI با بلندترین پیشوند در بیش از 30,000 ورودی گردآوری شده از پایگاه داده سازندگان Wireshark شناسایی می‌شود.

**اینترنت** — دو بررسی به صورت موازی: تفکیک DNS از طریق `trust_dns_resolver` (ابتدا `one.one.one.one`، جایگزین `dns.google`) و دسترسی‌پذیری HTTP از طریق `reqwest` (ابتدا Cloudflare trace، جایگزین `example.com`). هر دو موفق → OK، یکی موفق → Partial، هر دو ناموفق → Fail.

### امنیت Wi-Fi

چهار بررسی متوالی، همگی از طریق Windows WLAN API:

**رمزگذاری** — خواندن `dot11AuthAlgorithm` + `dot11CipherAlgorithm`، نگاشت به Open (خطر) / WEP، WPA (هشدار) / WPA2، WPA3 (ایمن).

**تشخیص Evil Twin** — دریافت تمام BSSIDهای منطبق با SSID متصل از طریق `WlanGetNetworkBssList`. بررسی بیت IEEE 802.11 Privacy روی هر AP. اگر یک SSID هم نقاط دسترسی باز و هم رمزگذاری شده داشته باشد → هشدار.

**تشخیص ARP Spoofing** — خواندن کامل جدول ARP از طریق `Get-NetNeighbor`، ساخت نگاشت MAC → IP. اگر MAC غیر-broadcast به چندین IP از جمله گیت‌وی نگاشت شود → خطر.

**تشخیص ربودن DNS** — تفکیک `example.com` از طریق resolver سیستم و همچنین از طریق پرس‌وجوی خام UDP به `1.1.1.1`. اگر مجموعه‌های IP همپوشانی نداشته باشند → هشدار.

وضعیت کلی امنیت = بدترین نتیجه از چهار بررسی.

### تست سرعت

مبتنی بر فرانت‌اند، با استفاده از NDT7 (Network Diagnostic Tool v7) توسط M-Lab از طریق WebSocket:

- کشف سرور از طریق M-Lab locate API (نزدیک‌ترین سرور، کش 5 دقیقه)
- فازهای دانلود/آپلود هرکدام ~10 ثانیه
- **Ping**: میانه 3 چرخه RTT اتصال/قطع WebSocket
- **Latency**: میانگین `TCPInfo.SmoothedRTT` تحت بار
- **Jitter**: میانگین اختلاف مطلق متوالی نمونه‌های SmoothedRTT
- **تشخیص bufferbloat**: latency > 3× idle ping

نتایج نگاشت شده به کارهای عملی:

| کار | شرط قبولی |
|-----|-----------|
| ویدیوی 4K | download ≥ 25 Mbps |
| بازی آنلاین | ping ≤ 50 ms و jitter ≤ 30 ms |
| تماس تصویری | download ≥ 3 Mbps و ping ≤ 100 ms |
| ویدیوی HD | download ≥ 10 Mbps |
| موسیقی/پادکست | download ≥ 1 Mbps |
| شبکه‌های اجتماعی/وب | download ≥ 3 Mbps |
| ایمیل/پیام‌رسان | download ≥ 0.5 Mbps |

---

## ساخته شده با

- [Rust](https://www.rust-lang.org/) — موتور عیب‌یابی
- [Tauri](https://tauri.app/) — فریمورک دسکتاپ
- [React](https://react.dev/) + TypeScript — رابط کاربری
- [sing-box](https://sing-box.sagernet.org/) — تونل‌سازی VPN

---

## مجوز

GPL-3.0. مراجعه کنید به [LICENSE](LICENSE) و [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## حریم خصوصی و امنیت

مراجعه کنید به [PRIVACY.md](PRIVACY.md) و [SECURITY.md](SECURITY.md).

---

*ساخته شده توسط [Anton Korenyako](https://korenyako.github.io)*
