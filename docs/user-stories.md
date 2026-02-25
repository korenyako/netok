# Netok — User Stories & Research

Real-world examples of people struggling with network problems that Netok solves.

---

## 1. "Is it my Xbox or my internet?"

**Source:** [r/techsupport](https://www.reddit.com/r/techsupport/comments/1j04xqt/is_there_a_tool_i_can_use_to_monitor_my_internet/)
**Problem:** Internet drops for 5-10 seconds every hour on wireless Xbox. User can't tell if it's the device, Wi-Fi, or ISP.
**What they asked for:** A tool to monitor internet over 1-2 hours and tell them where the problem is.
**What people suggested:** kismet, linssid, Fing, NetWorx, GlassWire, router logs — all technical tools.

### Why this is a Netok user
- Non-technical person with a real problem
- Needs a simple answer: "where is the problem?"
- Doesn't want to learn dB levels, channel frequencies, or read router logs
- Netok's Computer → Wi-Fi → Router → Internet chain directly answers this question

### Feature opportunity
Background monitoring with notifications:
> "Your connection dropped 3 times in the last hour. The problem is between Wi-Fi and Router."

---

## 2. "I just want to switch DNS without thinking"

**Source:** [r/macapps](https://www.reddit.com/r/macapps/comments/1iwflbm/dns_easy_switcher/)
**Problem:** User switches between home, office, and public Wi-Fi. Wants DNS to adapt automatically — custom DNS for privacy at home, network-provided DNS at work/public.
**What they asked for:** One-click switching between DHCP-assigned and custom DNS, ideally automatic per network.
**Context:** Comment on DNS Easy Switcher app — user appreciates simple DNS management but wants it smarter.

### Why this is a Netok user
- Wants DNS control without technical complexity
- Already understands the value of custom DNS for privacy
- Netok already has System DNS ↔ AdGuard/Cloudflare/Custom switching built in

### Feature opportunity
Auto-switching DNS profiles per network:
> "Home Wi-Fi detected → AdGuard DNS enabled"
> "Office network detected → System DNS restored"

### Current Netok coverage
✅ Manual switching between System DNS and protected providers
❌ Automatic switching when network changes

---

*Add more stories below as you find them.*
