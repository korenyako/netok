<p align="center">
  <img src="logo.svg" width="120" alt="Netok 로고">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <b>한국어</b> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-GPL--3.0-blue?style=for-the-badge" alt="라이선스: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=for-the-badge" alt="총 다운로드"></a>
</p>

<p align="center">
  <b>사람의 언어로 전하는 네트워크 진단.</b><br>
  네트워크 진단, DNS 보호, VPN을 위한 데스크톱 앱.<br>
  컴퓨터에서 인터넷까지의 전체 연결 경로를 확인하고,<br>
  DNS 공급자를 원클릭으로 전환하고, VPN으로 연결하세요 —<br>
  오류 코드가 아닌 쉬운 말로 설명합니다.<br>
  Built with Rust + Tauri + React.
</p>

<p align="center">
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/badge/Windows-%EC%A4%80%EB%B9%84%20%EC%99%84%EB%A3%8C-brightgreen?style=for-the-badge&logo=windows&logoColor=white" alt="Windows: 준비 완료"></a>
  <img src="https://img.shields.io/badge/Android-%EA%B0%9C%EB%B0%9C%20%EC%A4%91-orange?style=for-the-badge&logo=android&logoColor=white" alt="Android: 개발 중">
  <img src="https://img.shields.io/badge/macOS-%EA%B3%84%ED%9A%8D%20%EC%A4%91-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="macOS: 계획 중">
  <img src="https://img.shields.io/badge/iOS-%EA%B3%84%ED%9A%8D%20%EC%A4%91-lightgrey?style=for-the-badge&logo=apple&logoColor=white" alt="iOS: 계획 중">
</p>

## 왜 Netok인가

대부분의 네트워크 도구는 엔지니어를 위해 만들어졌습니다. Netok은 그 외 모든 사람을 위해 만들어졌습니다.

인터넷이 작동하지 않을 때, `DNS_PROBE_FINISHED_NXDOMAIN`이 무슨 뜻인지
알 필요가 없어야 합니다. Netok이 이해하기 쉽게 번역해 줍니다:
무엇이 고장났는지, 어디서, 어떻게 하면 되는지.

---

## 기능

<table>
<tr>
<td align="center" width="33%">
<h3>🩺 진단</h3>
<p>컴퓨터 → Wi-Fi → 라우터 → 인터넷 — 단계별 연결 확인</p>
</td>
<td align="center" width="33%">
<h3>💬 쉬운 언어</h3>
<p>전문 용어 없이 — 무엇이 문제이고 어떻게 고치는지 명확한 답변</p>
</td>
<td align="center" width="33%">
<h3>🛡️ DNS 보호</h3>
<p>Cloudflare, AdGuard, CleanBrowsing 또는 사용자 정의 서버</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🔐 VPN</h3>
<p>VLESS, VMess, Shadowsocks, Trojan, WireGuard (sing-box 경유)</p>
</td>
<td align="center">
<h3>💻 장치 검색</h3>
<p>로컬 네트워크를 스캔하고 브랜드별로 장치 식별</p>
</td>
<td align="center">
<h3>⚡ 속도 테스트</h3>
<p>원시 숫자가 아닌 이해하기 쉬운 평가</p>
</td>
</tr>
<tr>
<td align="center">
<h3>🛜 Wi-Fi 보안</h3>
<p>암호화 취약점 및 네트워크 위협 감지</p>
</td>
<td align="center">
<h3>🌍 15개 언어</h3>
<p>RTL 스크립트를 포함한 완전한 현지화</p>
</td>
<td align="center">
<h3>🌒 테마</h3>
<p>시스템 설정을 지원하는 라이트 및 다크 모드</p>
</td>
</tr>
</table>

---

## 다운로드

<p>
  <a href="https://github.com/korenyako/netok/releases/latest"><img src="https://img.shields.io/github/v/release/korenyako/netok?label=Windows%EC%9A%A9%20%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C&style=for-the-badge&logo=windows&logoColor=white" alt="Windows용 다운로드"></a>
</p>

### Windows SmartScreen 관련 참고 사항

Netok은 아직 코드 서명되지 않았습니다. 첫 실행 시 Windows에서 SmartScreen 경고를 표시할 수 있습니다 — 서명되지 않은 애플리케이션에서는 정상적인 현상입니다. "추가 정보" → "실행"을 클릭하여 계속하세요.

이 애플리케이션은 GitHub Actions를 통해 소스 코드에서 자동으로 빌드됩니다. [릴리스 워크플로](https://github.com/korenyako/netok/releases)를 확인하고 체크섬을 비교하여 빌드를 검증할 수 있습니다.

---

## 내부 구조

### 진단 체인

체인의 각 노드는 독립적인 검사를 수행합니다 — 라우터 관리자 접근이 필요 없습니다:

**컴퓨터** — `hostname::get()`으로 머신 이름 취득, `get_if_addrs`로 네트워크 인터페이스, Windows WLAN API로 어댑터 세부 정보.

**Wi-Fi** — Windows WLAN API (`WlanQueryInterface`): SSID, 신호 품질을 dBm으로 변환 (`-90 + quality/2`), TX 속도, PHY 타입 → Wi-Fi 표준, `ulChCenterFrequency`에서 채널 및 대역 (2.4/5/6 GHz). 연결 유형은 어댑터 이름 패턴 매칭으로 감지.

**라우터** — 게이트웨이 IP는 `route print` (Windows), `ip route` (Linux) 또는 `netstat -nr` (macOS)에서 파싱. MAC 주소는 `Get-NetNeighbor` 경유. 제조사는 Wireshark 제조사 데이터베이스에서 컴파일된 30,000개 이상의 항목에 대한 최장 접두사 OUI 조회로 식별.

**인터넷** — 두 가지 검사를 병렬 실행: `trust_dns_resolver`를 통한 DNS 해석 (`one.one.one.one` 시도, 폴백 `dns.google`) 및 `reqwest`를 통한 HTTP 도달성 (Cloudflare trace 시도, 폴백 `example.com`). 둘 다 통과 → OK, 하나 통과 → Partial, 둘 다 실패 → Fail.

### Wi-Fi 보안

네 가지 순차 검사, 모두 Windows WLAN API 경유:

**암호화** — `dot11AuthAlgorithm` + `dot11CipherAlgorithm` 읽기, Open (위험) / WEP, WPA (경고) / WPA2, WPA3 (안전)으로 매핑.

**Evil Twin 감지** — `WlanGetNetworkBssList`를 통해 연결된 SSID와 일치하는 모든 BSSID 획득. 각 AP의 IEEE 802.11 Privacy 비트 확인. 동일 SSID에 개방형과 암호화된 액세스 포인트가 모두 있으면 → 경고.

**ARP 스푸핑 감지** — `Get-NetNeighbor`를 통해 전체 ARP 테이블 읽기, MAC → IP 매핑 구축. 비-브로드캐스트 MAC이 게이트웨이를 포함한 여러 IP에 매핑되면 → 위험.

**DNS 하이재킹 감지** — `example.com`을 시스템 리졸버 AND `1.1.1.1`에 대한 raw UDP 쿼리로 해석. IP 집합이 겹치지 않으면 → 경고.

전체 보안 상태 = 네 가지 검사 중 최악의 결과.

### 속도 테스트

프론트엔드 기반, M-Lab의 NDT7 (Network Diagnostic Tool v7)을 WebSocket으로 사용:

- M-Lab locate API를 통한 서버 발견 (가장 가까운 서버, 5분 캐시)
- 다운로드/업로드 단계 각 약 10초
- **Ping**: 3회 WebSocket 연결/종료 RTT 주기의 중앙값
- **Latency**: 부하 상태의 `TCPInfo.SmoothedRTT` 평균
- **Jitter**: SmoothedRTT 샘플의 평균 절대 연속 차이
- **Bufferbloat 감지**: latency > 3× idle ping

결과는 실용적 작업에 매핑:

| 작업 | 통과 조건 |
|------|-----------|
| 4K 비디오 | download ≥ 25 Mbps |
| 온라인 게임 | ping ≤ 50 ms 그리고 jitter ≤ 30 ms |
| 영상 통화 | download ≥ 3 Mbps 그리고 ping ≤ 100 ms |
| HD 비디오 | download ≥ 10 Mbps |
| 음악/팟캐스트 | download ≥ 1 Mbps |
| SNS/웹 | download ≥ 3 Mbps |
| 이메일/메신저 | download ≥ 0.5 Mbps |

---

## 사용 기술

- [Rust](https://www.rust-lang.org/) — 진단 엔진
- [Tauri](https://tauri.app/) — 데스크톱 프레임워크
- [React](https://react.dev/) + TypeScript — 사용자 인터페이스
- [sing-box](https://sing-box.sagernet.org/) — VPN 터널링

---

## 라이선스

GPL-3.0. [LICENSE](LICENSE) 및 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) 참조.

## 개인정보 및 보안

[PRIVACY.md](PRIVACY.md) 및 [SECURITY.md](SECURITY.md) 참조.

---

*[Anton Korenyako](https://korenyako.github.io) 제작*
