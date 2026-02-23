<p align="center">
  <img src="logo.svg" width="120" alt="Netok 로고">
</p>

<p align="center">
  <a href="README.md">English</a> | <a href="README.de.md">Deutsch</a> | <a href="README.es.md">Español</a> | <a href="README.fa.md">فارسی</a> | <a href="README.fr.md">Français</a> | <a href="README.it.md">Italiano</a> | <a href="README.ja.md">日本語</a> | <b>한국어</b> | <a href="README.pl.md">Polski</a> | <a href="README.pt.md">Português</a> | <a href="README.ru.md">Русский</a> | <a href="README.tr.md">Türkçe</a> | <a href="README.uk.md">Українська</a> | <a href="README.zh.md">中文</a>
</p>

<h1 align="center">Netok</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/%EB%9D%BC%EC%9D%B4%EC%84%A0%EC%8A%A4-GPL--3.0-blue?style=flat-square" alt="라이선스: GPL-3.0"></a>
  <a href="https://github.com/korenyako/netok/releases"><img src="https://img.shields.io/github/downloads/korenyako/netok/total?style=flat-square&label=%EB%8B%A4%EC%9A%B4%EB%A1%9C%EB%93%9C" alt="총 다운로드"></a>
</p>

<p align="center">
  <b>사람의 언어로 전하는 네트워크 진단.</b><br>
  Netok은 컴퓨터에서 인터넷까지의 전체 경로를 보여주고,<br>
  오류 코드가 아닌 쉬운 말로 문제를 설명합니다.
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

> **참고:** 첫 실행 시 Windows에서 SmartScreen 경고가 표시될 수 있습니다 —
> 서명되지 않은 애플리케이션에서는 정상입니다. "실행"을 클릭하여 계속하세요.

---

## 사용 기술

- [Rust](https://www.rust-lang.org/) — 진단 엔진
- [Tauri](https://tauri.app/) — 데스크톱 프레임워크
- [React](https://react.dev/) + TypeScript — 사용자 인터페이스
- [sing-box](https://sing-box.sagernet.org/) — VPN 터널링

---

## 라이선스

GPL-3.0. [LICENSE](LICENSE) 및 [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md) 참조.

---

*[Anton Korenyako](https://korenyako.github.io) 제작*
