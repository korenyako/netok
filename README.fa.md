<p align="center">
  <img src="logo.svg" width="120" alt="لوگو Netok">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.ru.md">Русский</a> | <b>فارسی</b> | <a href="README.es.md">Español</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <b>عیب‌یابی شبکه به زبان ساده.</b><br>
  Netok مسیر کامل از رایانه شما تا اینترنت را نشان می‌دهد — و به زبان ساده<br>
  توضیح می‌دهد که مشکل چیست، نه با کدهای خطا.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white" alt="دانلود برای ویندوز"></a>
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok"><img src="https://img.shields.io/github/stars/korenyako/netok?style=flat-square" alt="GitHub Stars"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square" alt="مجوز: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows" alt="پلتفرم: ویندوز"></a>
</p>

![اسکرین‌شات Netok](docs/screenshot.png)

---

## امکانات

- **عیب‌یابی اتصال** — رایانه ← Wi-Fi ← روتر ← اینترنت، مرحله به مرحله
- **توضیحات به زبان ساده** — بدون اصطلاحات فنی، فقط پاسخ‌های واضح
- **محافظت DNS** — Cloudflare، AdGuard، CleanBrowsing یا سرورهای دلخواه
- **پشتیبانی VPN** — VLESS، VMess، Shadowsocks، Trojan، WireGuard از طریق sing-box
- **شناسایی دستگاه‌ها** — اسکن شبکه محلی، شناسایی دستگاه‌ها بر اساس برند
- **تست سرعت** — امتیازدهی واقعی، نه فقط اعداد خام
- **بررسی امنیت Wi-Fi** — آسیب‌پذیری‌های رمزنگاری و تهدیدها
- **۱۵ زبان** — بومی‌سازی کامل شامل اسکریپت‌های راست‌به‌چپ
- **تم روشن و تاریک**

---

## دانلود

> [آخرین نسخه برای ویندوز](https://github.com/korenyako/netok/releases/latest)

> **توجه:** ویندوز ممکن است هنگام اولین اجرا هشدار SmartScreen نشان دهد —
> این برای برنامه‌های بدون امضا طبیعی است. روی «Run anyway» کلیک کنید.

---

## چرا Netok

بیشتر ابزارهای شبکه برای مهندسان ساخته شده‌اند. Netok برای بقیه افراد ساخته شده.

وقتی اینترنت شما قطع می‌شود، نباید لازم باشد بدانید
`DNS_PROBE_FINISHED_NXDOMAIN` یعنی چه. Netok آن را به زبان قابل فهم ترجمه می‌کند:
چه چیزی خراب شده، کجا، و چه باید کرد.

---

## پشتیبانی از پلتفرم‌ها

| پلتفرم | وضعیت |
|---------|--------|
| ویندوز | آماده |
| مک | برنامه‌ریزی شده |
| اندروید | در حال توسعه |
| iOS | برنامه‌ریزی شده |

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

*ساخته شده توسط [آنتون کورنیاکو](https://github.com/korenyako)*
