<p align="center">
  <img src="logo.svg" width="120" alt="Netok 标志">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <b>中文</b>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-GPL--3.0-blue?style=flat-square" alt="许可证: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=%E4%B8%8B%E8%BD%BD%E9%87%8F" alt="总下载量"></a>
</p>

<p align="center">
  <b>用人话说的网络诊断。</b><br>
  Netok 展示从您的电脑到互联网的完整路径——<br>
  用简单易懂的语言解释问题，而不是错误代码。
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-%E5%B7%B2%E5%B0%B1%E7%BB%AA-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: 已就绪"></a>
  <img src="https://img.shields.io/badge/Android-%E5%BC%80%E5%8F%91%E4%B8%AD-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: 开发中">
  <img src="https://img.shields.io/badge/macOS-%E8%AE%A1%E5%88%92%E4%B8%AD-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: 计划中">
  <img src="https://img.shields.io/badge/iOS-%E8%AE%A1%E5%88%92%E4%B8%AD-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: 计划中">
</p>

## 为什么选择 Netok

大多数网络工具是为工程师设计的。Netok 是为其他所有人设计的。

当您的网络出现问题时，您不需要知道 `DNS_PROBE_FINISHED_NXDOMAIN` 是什么意思。
Netok 会用通俗易懂的语言告诉您：哪里出了问题、在哪里、该怎么办。

---

## 功能

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 诊断</h3>
<p>电脑 → Wi-Fi → 路由器 → 互联网 — 逐步连接检查</p>
</td>
<td align="center" width="33%">
<h3>💬 通俗语言</h3>
<p>没有技术术语 — 清楚地告诉您哪里出了问题以及如何修复</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNS 保护</h3>
<p>Cloudflare、AdGuard、CleanBrowsing 或自定义服务器</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS、VMess、Shadowsocks、Trojan、WireGuard（通过 sing-box）</p>
</td>
<td align="center">
<h3>💻 设备发现</h3>
<p>扫描本地网络并按品牌识别设备</p>
</td>
<td align="center">
<h3>⚡ 速度测试</h3>
<p>通俗易懂的评价，不仅仅是数字</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Wi-Fi 安全</h3>
<p>检测加密漏洞和网络威胁</p>
</td>
<td align="center">
<h3>🌍 15 种语言</h3>
<p>完整本地化，包括 RTL 文字</p>
</td>
<td align="center">
<h3>🌒 主题</h3>
<p>浅色和深色模式，支持系统偏好设置</p>
</td>
</tr>
</table>

---

## 下载

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=%E4%B8%8B%E8%BD%BD%20Windows%20%E7%89%88&style=for-the-badge&logo=windows&logoColor=white" alt="下载 Windows 版"></a>
</p>

> **注意：** 首次启动时 Windows 可能会显示 SmartScreen 警告 ——
> 这对于未签名的应用程序是正常的。点击"仍要运行"继续。

---

## 技术栈

- [Rust](https://www.rust-lang.org/) — 诊断引擎
- [Tauri](https://tauri.app/) — 桌面框架
- [React](https://react.dev/) + TypeScript — 用户界面
- [sing-box](https://sing-box.sagernet.org/) — VPN 隧道

---

## 许可证

GPL-3.0。参见 [LICENSE](LICENSE) 和 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)。

---

*由 [Anton Korenyako](https://github.com/korenyako) 创建*
