<p align="center">
  <img src="logo.svg" width="120" alt="Netok ロゴ">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <b>日本語</b> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%E3%83%A9%E3%82%A4%E3%82%BB%E3%83%B3%E3%82%B9-GPL--3.0-blue?style=for-the-badge" alt="ライセンス: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="総ダウンロード数"></a>
</p>

<p align="center">
  <b>人間の言葉で伝えるネットワーク診断。</b><br>
  ネットワーク診断、DNS保護、VPNのためのデスクトップアプリ。<br>
  コンピュータからインターネットまでの接続経路を確認し、<br>
  DNSプロバイダーをワンクリックで切り替え、VPNで接続 —<br>
  すべてエラーコードではなく、わかりやすい言葉で説明します。<br>
  Built with Rust + Tauri + React.
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

### Windows SmartScreen に関する注意

Netok はまだコード署名されていません。初回起動時に Windows が SmartScreen の警告を表示することがありますが、これは署名されていないアプリケーションでは正常な動作です。「詳細情報」→「実行」をクリックして続行してください。

このアプリケーションは GitHub Actions を通じてソースコードから自動的にビルドされています。[リリースワークフロー](https://github.com/korenyako/netok/releases)を確認し、チェックサムを比較することでビルドを検証できます。

---

## 内部の仕組み

### 診断チェーン

チェーンの各ノードは独立した検査を実行します — ルーターの管理者アクセスは不要です：

**コンピュータ** — `hostname::get()` でマシン名取得、`get_if_addrs` でネットワークインターフェース、Windows WLAN API でアダプター詳細。

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`)：SSID、信号品質をdBmに変換（`-90 + quality/2`）、TX速度、PHYタイプ → Wi-Fi規格、`ulChCenterFrequency` からチャンネルと帯域（2.4/5/6 GHz）。接続タイプはアダプター名のパターンマッチングで検出。

**ルーター** — ゲートウェイIPは `route print`（Windows）、`ip route`（Linux）、または `netstat -nr`（macOS）からパース。MACアドレスは `Get-NetNeighbor` 経由。ベンダーはWiresharkメーカーデータベースからコンパイルされた30,000以上のエントリに対する最長プレフィックスOUI検索で特定。

**インターネット** — 2つの検査を並列実行：`trust_dns_resolver` によるDNS解決（`one.one.one.one` を試行、フォールバック `dns.google`）と `reqwest` によるHTTP到達性（Cloudflare traceを試行、フォールバック `example.com`）。両方パス → OK、一方パス → Partial、両方失敗 → Fail。

### Wi-Fiセキュリティ

4つの順次検査、すべてWindows WLAN API経由：

**暗号化** — `dot11AuthAlgorithm` + `dot11CipherAlgorithm` を読み取り、Open（危険）/ WEP、WPA（警告）/ WPA2、WPA3（安全）にマッピング。

**Evil Twin検出** — `WlanGetNetworkBssList` 経由で接続中のSSIDに一致するすべてのBSSIDを取得。各APのIEEE 802.11 Privacyビットをチェック。同じSSIDにオープンと暗号化の両方のアクセスポイントがある場合 → 警告。

**ARPスプーフィング検出** — `Get-NetNeighbor` 経由でARP テーブル全体を読み取り、MAC → IPマッピングを構築。非ブロードキャストMACがゲートウェイを含む複数のIPにマッピングされている場合 → 危険。

**DNSハイジャック検出** — `example.com` をシステムリゾルバ経由 AND `1.1.1.1` へのraw UDPクエリ経由で解決。IPセットが重複しない場合 → 警告。

全体のセキュリティステータス = 4つの検査の最悪の結果。

### 速度テスト

フロントエンドベース、M-LabのNDT7（Network Diagnostic Tool v7）をWebSocket経由で使用：

- M-Lab locate API経由でサーバー検出（最寄りサーバー、5分キャッシュ）
- ダウンロード/アップロードフェーズ 各約10秒
- **Ping**：3回のWebSocket接続/切断RTTサイクルの中央値
- **Latency**：負荷時の `TCPInfo.SmoothedRTT` の平均
- **Jitter**：SmoothedRTTサンプルの平均絶対連続差分
- **Bufferbloat検出**：latency > 3× idle ping

結果は実用的なタスクにマッピング：

| タスク | 合格条件 |
|--------|----------|
| 4K動画 | download ≥ 25 Mbps |
| オンラインゲーム | ping ≤ 50 ms かつ jitter ≤ 30 ms |
| ビデオ通話 | download ≥ 3 Mbps かつ ping ≤ 100 ms |
| HD動画 | download ≥ 10 Mbps |
| 音楽/ポッドキャスト | download ≥ 1 Mbps |
| SNS/Web | download ≥ 3 Mbps |
| メール/メッセンジャー | download ≥ 0.5 Mbps |

---

## 使用技術

- [Rust](https://www.rust-lang.org/) — 診断エンジン
- [Tauri](https://tauri.app/) — デスクトップフレームワーク
- [React](https://react.dev/) + TypeScript — ユーザーインターフェース
- [sing-box](https://sing-box.sagernet.org/) — VPNトンネリング

---

## ライセンス

GPL-3.0。[LICENSE](LICENSE)と[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)を参照。

## プライバシーとセキュリティ

[PRIVACY.md](PRIVACY.md)と[SECURITY.md](SECURITY.md)を参照。

---

*[Anton Korenyako](https://korenyako.github.io) 作*
