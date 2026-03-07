<p align="center">
  <img src="logo.svg" width="120" alt="Netok logosu">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <a href="README.ko.md">한국어</a> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <b>Türkçe</b> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/Lisans-GPL--3.0-blue?style=for-the-badge" alt="Lisans: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="Toplam indirmeler"></a>
</p>

<p align="center">
  <b>Anlasilir dilde ag tanilama.</b><br>
  Ag tanilama, DNS korumasi ve VPN icin masaustu uygulamasi.<br>
  Bilgisayardan internete kadar tam baglanti yolunu gorun,<br>
  DNS saglayicisini tek tikla degistirin ve VPN uzerinden baglanin —<br>
  hepsi hata kodlariyla degil, anlasilir bir dille aciklaniyor.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-Haz%C4%B1r-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: Hazir"></a>
  <img src="https://img.shields.io/badge/Android-Geli%C5%9Ftiriliyor-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: Gelistiriliyor">
  <img src="https://img.shields.io/badge/macOS-Planland%C4%B1-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: Planlandi">
  <img src="https://img.shields.io/badge/iOS-Planland%C4%B1-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: Planlandi">
</p>

## Neden Netok

Cogu ag araci muhendisler icin yapilmistir. Netok ise diger herkes icin.

Internetiniz calismayai biraktiginda, `DNS_PROBE_FINISHED_NXDOMAIN`'in ne anlama
geldigini bilmenize gerek olmamali. Netok bunu anlasilir bir dile cevirir:
ne bozuldu, nerede ve ne yapilmali.

---

## Ozellikler

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 Tanilama</h3>
<p>Bilgisayar → Wi-Fi → Yonlendirici → Internet — adim adim baglanti kontrolu</p>
</td>
<td align="center" width="33%">
<h3>💬 Sade dil</h3>
<p>Teknik jargon yok — neyin yanlis oldugu ve nasil duzeltilecegi hakkinda net yanitlar</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNS korumasi</h3>
<p>Cloudflare, AdGuard, CleanBrowsing veya kendi sunuculariniz</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard (sing-box ile)</p>
</td>
<td align="center">
<h3>💻 Cihaz kesfi</h3>
<p>Yerel aginizi tarayin ve cihazlari markaya gore tanimlayin</p>
</td>
<td align="center">
<h3>⚡ Hiz testi</h3>
<p>Ham sayilar degil, anlasilir degerlendirmeler</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Wi-Fi guvenligi</h3>
<p>Sifreleme aciklarini ve ag tehditlerini tespit edin</p>
</td>
<td align="center">
<h3>🌍 15 dil</h3>
<p>RTL yazilari dahil tam yellestirme</p>
</td>
<td align="center">
<h3>🌒 Temalar</h3>
<p>Sistem tercihi destegiyle acik ve koyu mod</p>
</td>
</tr>
</table>

---

## Indir

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Windows%20i%C3%A7in%20indir&style=for-the-badge&logo=windows&logoColor=white" alt="Windows icin indir"></a>
</p>

### Windows SmartScreen Hakkında Not

Netok henüz kod imzalı değildir. İlk açılışta Windows bir SmartScreen uyarısı gösterebilir — bu, imzasız uygulamalar için normaldir. Devam etmek için "Daha fazla bilgi" → "Yine de çalıştır" seçeneğine tıklayın.

Uygulama, GitHub Actions aracılığıyla kaynak koddan otomatik olarak derlenmektedir. [Yayın iş akışını](https://github.com/korenyako/netok/releases) kontrol ederek ve sağlama toplamlarını karşılaştırarak derlemeyi doğrulayabilirsiniz.

---

## Kaputun altında

### Tanı zinciri

Zincirdeki her düğüm bağımsız kontroller yürütür — yönlendirici yönetici erişimi gerekmez:

**Bilgisayar** — Makine adı için `hostname::get()`, ağ arayüzleri için `get_if_addrs`, adaptör detayları için Windows WLAN API.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, sinyal kalitesi dBm'e dönüştürülür (`-90 + quality/2`), TX hızı, PHY tipi → Wi-Fi standardı, `ulChCenterFrequency`'den kanal ve bant (2,4/5/6 GHz). Bağlantı türü adaptör adı kalıp eşleştirmesiyle tespit edilir.

**Yönlendirici** — Ağ geçidi IP'si `route print` (Windows), `ip route` (Linux) veya `netstat -nr` (macOS) çıktısından ayrıştırılır. MAC adresi `Get-NetNeighbor` üzerinden. Üretici, Wireshark üretici veritabanından derlenen 30.000+ girişe karşı en uzun önek OUI aramasıyla belirlenir.

**İnternet** — İki kontrol paralel çalışır: `trust_dns_resolver` ile DNS çözümleme (`one.one.one.one` dener, yedek `dns.google`) ve `reqwest` ile HTTP erişilebilirliği (Cloudflare trace dener, yedek `example.com`). İkisi de geçerse → OK, biri geçerse → Partial, ikisi de başarısız → Fail.

### Wi-Fi güvenliği

Dört ardışık kontrol, tümü Windows WLAN API üzerinden:

**Şifreleme** — `dot11AuthAlgorithm` + `dot11CipherAlgorithm` okur, Open (tehlike) / WEP, WPA (uyarı) / WPA2, WPA3 (güvenli) olarak eşler.

**Evil Twin tespiti** — `WlanGetNetworkBssList` üzerinden bağlı SSID ile eşleşen tüm BSSID'leri alır. Her AP'de IEEE 802.11 Privacy bitini kontrol eder. Aynı SSID'de hem açık hem şifreli erişim noktaları varsa → uyarı.

**ARP Spoofing tespiti** — `Get-NetNeighbor` üzerinden tam ARP tablosunu okur, MAC → IP eşlemesi oluşturur. Broadcast olmayan bir MAC, ağ geçidi dahil birden fazla IP'ye eşleniyorsa → tehlike.

**DNS ele geçirme tespiti** — `example.com`'u sistem çözümleyici VE `1.1.1.1`'e ham UDP sorgusu ile çözümler. IP kümeleri örtüşmüyorsa → uyarı.

Genel güvenlik durumu = dört kontrolün en kötü sonucu.

### Hız testi

Frontend tabanlı, M-Lab'ın NDT7'sini (Network Diagnostic Tool v7) WebSocket üzerinden kullanır:

- M-Lab locate API ile sunucu keşfi (en yakın sunucu, 5 dk önbellek)
- İndirme/yükleme aşamaları her biri ~10 saniye
- **Ping**: 3 WebSocket bağlantı/kapanış RTT döngüsünün medyanı
- **Latency**: Yük altında `TCPInfo.SmoothedRTT` ortalaması
- **Jitter**: SmoothedRTT örneklerinin ortalama mutlak ardışık farkı
- **Bufferbloat tespiti**: latency > 3× idle ping

Sonuçlar pratik görevlere eşlenir:

| Görev | Geçiş koşulu |
|-------|--------------|
| 4K Video | download ≥ 25 Mbps |
| Çevrimiçi oyun | ping ≤ 50 ms VE jitter ≤ 30 ms |
| Görüntülü arama | download ≥ 3 Mbps VE ping ≤ 100 ms |
| HD Video | download ≥ 10 Mbps |
| Müzik/Podcast | download ≥ 1 Mbps |
| Sosyal medya/Web | download ≥ 3 Mbps |
| E-posta/Mesajlaşma | download ≥ 0,5 Mbps |

---

## Kullanilan teknolojiler

- [Rust](https://www.rust-lang.org/) — tanilama motoru
- [Tauri](https://tauri.app/) — masaustu cercevesi
- [React](https://react.dev/) + TypeScript — kullanici arayuzu
- [sing-box](https://sing-box.sagernet.org/) — VPN tunelleme

---

## Lisans

GPL-3.0. Bkz. [LICENSE](LICENSE) ve [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Gizlilik ve güvenlik

Bkz. [PRIVACY.md](PRIVACY.md) ve [SECURITY.md](SECURITY.md).

---

*[Anton Korenyako](https://korenyako.github.io) tarafindan yapilmistir*
