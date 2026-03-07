<p align="center">
  <img src="logo.svg" width="120" alt="Netok 标志">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <b>中文</b>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E8%AE%B8%E5%8F%AF%E8%AF%81-GPL--3.0-blue?style=for-the-badge" alt="许可证: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="总下载量"></a>
</p>

<p align="center">
  <b>用人话说的网络诊断。</b><br>
  网络诊断、DNS 防护和 VPN 桌面应用。<br>
  查看从电脑到互联网的完整连接路径，一键切换 DNS 提供商，<br>
  通过 VPN 连接 — 一切用简单易懂的语言说明，而非错误代码。<br>
  Built with Rust + Tauri + React.
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

### 关于 Windows SmartScreen 的说明

Netok 尚未进行代码签名。首次启动时，Windows 可能会显示 SmartScreen 警告——这对于未签名的应用程序是正常的。点击"更多信息"→"仍要运行"即可继续。

该应用程序通过 GitHub Actions 从源代码自动构建。您可以通过查看[发布工作流](https://github.com/korenyako/netok/releases)并比较校验和来验证构建。

---

## 技术细节

### 诊断链

链中的每个节点运行独立检查——无需路由器管理员权限：

**计算机** — `hostname::get()` 获取机器名，`get_if_addrs` 获取网络接口，Windows WLAN API 获取适配器详情。

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`)：SSID、信号质量转换为 dBm (`-90 + quality/2`)、TX 速率、PHY 类型 → Wi-Fi 标准、从 `ulChCenterFrequency` 获取信道和频段 (2.4/5/6 GHz)。连接类型通过适配器名称模式匹配检测。

**路由器** — 网关 IP 从 `route print` (Windows)、`ip route` (Linux) 或 `netstat -nr` (macOS) 解析。MAC 地址通过 `Get-NetNeighbor`。制造商通过最长前缀 OUI 查找识别，数据库包含从 Wireshark 制造商数据库编译的 30,000+ 条目。

**互联网** — 两项检查并行运行：通过 `trust_dns_resolver` 进行 DNS 解析（尝试 `one.one.one.one`，备选 `dns.google`）和通过 `reqwest` 进行 HTTP 可达性检测（尝试 Cloudflare trace，备选 `example.com`）。两者通过 → OK，一者通过 → Partial，两者失败 → Fail。

### Wi-Fi 安全

四项顺序检查，均通过 Windows WLAN API：

**加密** — 读取 `dot11AuthAlgorithm` + `dot11CipherAlgorithm`，映射为 Open（危险）/ WEP、WPA（警告）/ WPA2、WPA3（安全）。

**Evil Twin 检测** — 通过 `WlanGetNetworkBssList` 获取与已连接 SSID 匹配的所有 BSSID。检查每个 AP 的 IEEE 802.11 Privacy 位。如果同一 SSID 同时有开放和加密的接入点 → 警告。

**ARP 欺骗检测** — 通过 `Get-NetNeighbor` 读取完整 ARP 表，构建 MAC → IP 映射。如果非广播 MAC 映射到包括网关在内的多个 IP → 危险。

**DNS 劫持检测** — 通过系统解析器和对 `1.1.1.1` 的原始 UDP 查询解析 `example.com`。如果 IP 集合不重叠 → 警告。

总体安全状态 = 四项检查的最差结果。

### 速度测试

基于前端，使用 M-Lab 的 NDT7（Network Diagnostic Tool v7），通过 WebSocket：

- 通过 M-Lab locate API 发现服务器（最近服务器，缓存 5 分钟）
- 下载/上传阶段各约 10 秒
- **Ping**：3 次 WebSocket 连接/关闭 RTT 周期的中位数
- **Latency**：负载下 `TCPInfo.SmoothedRTT` 的平均值
- **Jitter**：SmoothedRTT 采样的平均绝对连续差值
- **Bufferbloat 检测**：latency > 3× idle ping

结果映射到实际任务：

| 任务 | 通过条件 |
|------|----------|
| 4K 视频 | download ≥ 25 Mbps |
| 在线游戏 | ping ≤ 50 ms 且 jitter ≤ 30 ms |
| 视频通话 | download ≥ 3 Mbps 且 ping ≤ 100 ms |
| 高清视频 | download ≥ 10 Mbps |
| 音乐/播客 | download ≥ 1 Mbps |
| 社交/网页 | download ≥ 3 Mbps |
| 邮件/即时通讯 | download ≥ 0.5 Mbps |

---

## 技术栈

- [Rust](https://www.rust-lang.org/) — 诊断引擎
- [Tauri](https://tauri.app/) — 桌面框架
- [React](https://react.dev/) + TypeScript — 用户界面
- [sing-box](https://sing-box.sagernet.org/) — VPN 隧道

---

## 许可证

GPL-3.0。参见 [LICENSE](LICENSE) 和 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)。

## 隐私与安全

参见 [PRIVACY.md](PRIVACY.md) 和 [SECURITY.md](SECURITY.md)。

---

*由 [Anton Korenyako](https://korenyako.github.io) 创建*
