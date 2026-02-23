<p align="center">
  <img src="logo.svg" width="120" alt="Netok ロゴ">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <b>日本語</b> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9-GPL--3.0-blue?style=flat-square" alt="ライセンス: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89" alt="総ダウンロード数"></a>
</p>

<p align="center">
  <b>人間の言葉で伝えるネットワーク診断。</b><br>
  Netokはコンピュータからインターネットまでの完全な経路を表示し、<br>
  エラーコードではなく、わかりやすい言葉で問題を説明します。
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-%E6%BA%96%E5%82%99%E5%AE%8C%E4%BA%86-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: 準備完了"></a>
  <img src="https://img.shields.io/badge/Android-%E9%96%8B%E7%99%BA%E4%B8%AD-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: 開発中">
  <img src="https://img.shields.io/badge/macOS-%E8%A8%88%E7%94%BB%E4%B8%AD-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: 計画中">
  <img src="https://img.shields.io/badge/iOS-%E8%A8%88%E7%94%BB%E4%B8%AD-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: 計画中">
</p>

## なぜNetokなのか

ほとんどのネットワークツールはエンジニア向けに作られています。Netokはそれ以外のすべての人のために作られました。

インターネットが動かなくなったとき、`DNS_PROBE_FINISHED_NXDOMAIN`が何を意味するか
知る必要はないはずです。Netokはそれをわかりやすく翻訳します：
何が壊れているのか、どこで、どうすればいいのか。

---

## 機能

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 診断</h3>
<p>コンピュータ → Wi-Fi → ルーター → インターネット — ステップごとの接続チェック</p>
</td>
<td align="center" width="33%">
<h3>💬 わかりやすい言葉</h3>
<p>専門用語なし — 何が問題でどう直せばいいか、明確な回答</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNSプロテクション</h3>
<p>Cloudflare、AdGuard、CleanBrowsing、またはカスタムサーバー</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS、VMess、Shadowsocks、Trojan、WireGuard（sing-box経由）</p>
</td>
<td align="center">
<h3>💻 デバイス検出</h3>
<p>ローカルネットワークをスキャンし、ブランド別にデバイスを識別</p>
</td>
<td align="center">
<h3>⚡ スピードテスト</h3>
<p>生の数値だけでなく、わかりやすい評価</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Wi-Fiセキュリティ</h3>
<p>暗号化の脆弱性とネットワーク脅威の検出</p>
</td>
<td align="center">
<h3>🌍 15言語</h3>
<p>RTLスクリプトを含む完全なローカライズ</p>
</td>
<td align="center">
<h3>🌒 テーマ</h3>
<p>ライト・ダークモード、システム設定に対応</p>
</td>
</tr>
</table>

---

## ダウンロード

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Windows%E7%89%88%E3%82%92%E3%83%80%E3%82%A6%E3%83%B3%E3%83%AD%E3%83%BC%E3%83%89&style=for-the-badge&logo=windows&logoColor=white" alt="Windows版をダウンロード"></a>
</p>

> **注意:** 初回起動時にWindowsがSmartScreen警告を表示する場合があります —
> これは署名されていないアプリケーションでは正常です。「実行」をクリックして続行してください。

---

## 使用技術

- [Rust](https://www.rust-lang.org/) — 診断エンジン
- [Tauri](https://tauri.app/) — デスクトップフレームワーク
- [React](https://react.dev/) + TypeScript — ユーザーインターフェース
- [sing-box](https://sing-box.sagernet.org/) — VPNトンネリング

---

## ライセンス

GPL-3.0。[LICENSE](LICENSE)と[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)を参照。

---

*[Anton Korenyako](https://korenyako.github.io) 作*
