<p align="center">
  <img src="logo.svg" width="120" alt="لوگو Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <b>فارسی</b> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="مجوز: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=%D8%AF%D8%A7%D9%86%D9%84%D9%88%D8%AF%D9%87%D8%A7" alt="کل دانلودها"></a>
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

> **توجه:** ویندوز ممکن است هنگام اولین اجرا هشدار SmartScreen نشان دهد —
> این برای برنامه‌های بدون امضا طبیعی است. روی «Run anyway» کلیک کنید.

---

## ساخته شده با

- [Rust](https://www.rust-lang.org/) — موتور عیب‌یابی
- [Tauri](https://tauri.app/) — فریمورک دسکتاپ
- [React](https://react.dev/) + TypeScript — رابط کاربری
- [sing-box](https://sing-box.sagernet.org/) — تونل‌سازی VPN

---

## مجوز

GPL-3.0. مراجعه کنید به [LICENSE](LICENSE) و [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

---

*ساخته شده توسط [Anton Korenyako](https://korenyako.github.io)*
