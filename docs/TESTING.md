# Manual Testing Plan — Netok

## Introduction

This document contains scenarios for manually testing the Netok application under various network conditions. The goal is to verify that the app correctly identifies problems and shows clear messages to the user.

**When to use:**
- Before releasing a new version
- After changes to the diagnostics module (`netok_core/src/diagnostics.rs`)
- When adding new error messages

---

## Test Preparation

### Required

- [ ] Netok application running
- [ ] Administrator privileges (for DNS changes)
- [ ] Access to router (for some scenarios)
- [ ] Ability to move away from router (for weak signal test)

### Recommended

- Test on real hardware (not in a VM)
- Have mobile internet as backup
- Take screenshots of results

---

## Test Checklist

### Status Legend

| Status | Meaning |
|--------|---------|
| ✅ | Test passed |
| ❌ | Test failed |
| ⚠️ | Partially working |
| ⏳ | Not tested |

---

### Error Scenarios

| # | Scenario | How to reproduce (Windows) | Expected message (RU) | Expected message (EN) | Result |
|---|----------|----------------------------|----------------------|----------------------|--------|
| 1 | **Wi-Fi adapter disabled** | Tray → network icon → Wi-Fi → Off. Or: Device Manager → Network adapters → Right-click Wi-Fi → Disable | Адаптер Wi-Fi выключен. Включите Wi-Fi в настройках Windows. | Wi-Fi adapter is disabled. Turn on Wi-Fi in Windows settings. | ⏳ |
| 2 | **Wi-Fi on but not connected** | Settings → Network → Wi-Fi → current network → Forget. Or: turn off router | Нет подключения к Wi-Fi. Выберите сеть и подключитесь. | Not connected to Wi-Fi. Select a network and connect. | ⏳ |
| 3 | **Connected to Wi-Fi, router not responding** | Unplug router (Wi-Fi on laptop will stay "connected" for a few seconds) | Роутер не отвечает. Проверьте, включён ли роутер и горят ли на нём индикаторы. | Router is not responding. Check if your router is powered on and its lights are on. | ⏳ |
| 4 | **Router works, no internet** | Unplug WAN cable from router. Or: ask ISP to temporarily disconnect | Роутер работает, но интернет отсутствует. Проверьте кабель от провайдера или позвоните в поддержку. | Router is working, but there's no internet. Check the cable from your provider or contact support. | ⏳ |
| 5 | **DNS not working** | Control Panel → Network → Adapter Properties → IPv4 → Use DNS: `1.2.3.4` | Не удаётся найти адреса сайтов. Попробуйте сменить DNS на автоматический или используйте Cloudflare (1.1.1.1). | Cannot resolve website addresses. Try switching DNS to automatic or use Cloudflare (1.1.1.1). | ⏳ |
| 6 | **DNS works, HTTP blocked** | Windows Firewall → Outbound Rules → Block ports 80 and 443. Or: VPN with kill-switch → disconnect VPN | Интернет частично работает. Сайты недоступны, но DNS отвечает. Проверьте настройки VPN или брандмауэра. | Internet is partially working. Websites are unavailable, but DNS responds. Check your VPN or firewall settings. | ⏳ |
| 7 | **Weak Wi-Fi signal** | Move to a distant room / behind several walls from the router | Слабый сигнал Wi-Fi. Подойдите ближе к роутеру или проверьте, нет ли помех. | Weak Wi-Fi signal. Move closer to your router or check for interference. | ⏳ |
| 8 | **Everything works normally** | Normal home network connection | Интернет работает. | Internet is working. | ⏳ |

---

### Edge Cases

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 9 | **Ethernet instead of Wi-Fi** | Plug cable directly into laptop | Shows "Ethernet" instead of "Wi-Fi", diagnostics work | ⏳ |
| 10 | **Multiple network adapters** | VPN + Wi-Fi simultaneously | Detects active adapter, shows correct IP | ⏳ |
| 11 | **Very slow internet** | Throttle speed via router (QoS) to 100 Kbps | Diagnostics complete (may take longer), shows status | ⏳ |
| 12 | **Public Wi-Fi with captive portal** | Connect to Wi-Fi in a cafe/airport without authorization | Shows internet unavailable, suggests opening authorization page | ⏳ |

---

### Speed Test (NDT7)

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 13 | **Normal speed** | Run speed test on a good connection | Shows download/upload/ping/latency/jitter, task checklist (4K, gaming, etc.) | ⏳ |
| 14 | **Slow connection** | Throttle speed to <10 Mbps (QoS or tethering) | "Low speed" warning, 4K/HD video tasks fail | ⏳ |
| 15 | **Repeat run (cooldown)** | Run test again immediately after completion | 60-second cooldown, button disabled | ⏳ |
| 16 | **No internet** | Disconnect internet before test | Test doesn't start (checks diagnosticsStore) | ⏳ |

---

### Wi-Fi Security

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 17 | **WPA2 network, normal** | Connect to a regular WPA2 network | Encryption: Safe (WPA2), all 4 checks pass | ⏳ |
| 18 | **Open network** | Connect to an open Wi-Fi network | Encryption: Danger (Open) | ⏳ |
| 19 | **ARP spoofing** | Artificially create a duplicate MAC in ARP table | ARP Spoofing: Warning or Danger | ⏳ |
| 20 | **DNS hijacking** | Set custom DNS that intercepts example.com | DNS Hijacking: Warning | ⏳ |

---

### DNS Management

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 21 | **Switch DNS to Cloudflare** | Security → DNS → select Cloudflare 1.1.1.1 | DNS changes, test shows reachable | ⏳ |
| 22 | **Restore system DNS** | Security → DNS → select Auto | DNS reverts to DHCP | ⏳ |
| 23 | **Custom DNS** | Security → DNS → Custom → enter IP | IPv4 validation, apply, test | ⏳ |
| 24 | **Flush DNS cache** | Press "Flush DNS" | Runs `ipconfig /flushdns`, success notification | ⏳ |

---

### Network Device Scan

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 25 | **Home network scan** | Tools → Device Scan → start | Shows devices with IP, MAC, vendor, device type | ⏳ |
| 26 | **Empty network** | Disconnect all devices except current | Shows only router and current device | ⏳ |

---

### VPN Tunnel

| # | Scenario | How to reproduce | Expected behavior | Result |
|---|----------|-----------------|-------------------|--------|
| 27 | **Add VPN key** | Security → VPN → Add → paste VLESS/VMess URI | URI validation, shows server | ⏳ |
| 28 | **Connect to VPN** | Security → VPN → Connect | sing-box starts (elevated), IP changes | ⏳ |
| 29 | **Disconnect VPN** | Security → VPN → Disconnect | sing-box stops, IP reverts | ⏳ |
| 30 | **Invalid key** | Enter an invalid string | Validation error, clear message | ⏳ |

---

## Reverting Changes After Testing

### Restore DNS to automatic

1. Control Panel → Network and Sharing Center
2. Change adapter settings
3. Right-click active adapter → Properties
4. IPv4 → Properties
5. Select "Obtain DNS server address automatically"
6. OK → OK

### Enable Wi-Fi adapter

1. Device Manager (Win+X → Device Manager)
2. Network adapters
3. Right-click Wi-Fi adapter → Enable device

### Unblock firewall ports

1. Windows Firewall with Advanced Security
2. Outbound Rules
3. Find test rules you created → Delete

### Turn on router

1. Plug router back in
2. Wait 1-2 minutes for full boot
3. Reconnect WAN cable if it was disconnected

---

## Test Report Template

```markdown
## Test Report

**Date:** YYYY-MM-DD
**Version:** X.Y.Z
**Tester:** Name
**OS:** Windows 11 / 10

### Results

| Scenario | Status | Comment |
|----------|--------|---------|
| 1. Wi-Fi adapter disabled | ✅/❌/⚠️ | |
| 2. Wi-Fi not connected | ✅/❌/⚠️ | |
| ... | | |

### Issues Found

1. **[Severity]** Issue description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior

### Overall Verdict

[ ] Ready for release
[ ] Fixes required
```

---

## Test History

| Date | Version | Tester | Passed | Failed | Notes |
|------|---------|--------|--------|--------|-------|
| — | — | — | — | — | Initial test plan |

---

## Related Documents

- [CLAUDE.md](../CLAUDE.md) — development guide
- [UI-SPEC.md](UI-SPEC.md) — UI specification
- [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) — implementation plan
- [BACKEND-INTERNALS.md](BACKEND-INTERNALS.md) — backend technical reference
- [SPEED-TEST-INTERNALS.md](SPEED-TEST-INTERNALS.md) — speed test technical reference
