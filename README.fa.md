[English](README.md) | [Русский](README.ru.md) | **فارسی** | [Español](README.es.md)

# Netok

**عیب‌یابی شبکه به زبان ساده.**

Netok مسیر کامل از رایانه شما تا اینترنت را نشان می‌دهد — و به زبان ساده
توضیح می‌دهد که مشکل چیست، نه با کدهای خطا.

[![دانلود برای ویندوز](https://img.shields.io/github/v/release/korenyako/netok?label=Download%20for%20Windows&style=for-the-badge&logo=windows&logoColor=white)](https://github.com/korenyako/netok/releases/latest)

[![GitHub Stars](https://img.shields.io/github/stars/korenyako/netok?style=flat-square)](https://github.com/korenyako/netok)
[![مجوز: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=flat-square)](LICENSE)
[![پلتفرم: ویندوز](https://img.shields.io/badge/Platform-Windows-0078D4?style=flat-square&logo=windows)](https://github.com/korenyako/netok/releases/latest)

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
