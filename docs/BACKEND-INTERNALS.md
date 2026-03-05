# Backend Internals — Rust Implementation Details

Technical reference for Netok's Rust backend. Describes exact system APIs, commands, and methods used.

---

## 1. Wi-Fi Security Checks

All checks live in `netok_core/src/infrastructure/security.rs`, orchestrated by `check_wifi_security()`. Four checks run sequentially; overall status = worst of the four.

### 1.1 Encryption Check (`check_encryption`)

**Platform:** Windows only (others return `Warning / unsupported_platform`).

**API:** Windows WLAN API (`windows` crate v0.58, `Win32::NetworkManagement::WiFi`).

**Call sequence:**

1. `WlanOpenHandle(2, ...)` — WLAN client session (version 2 = Vista+)
2. `WlanEnumInterfaces(...)` — list all WLAN interfaces
3. Skip interfaces where `isState != wlan_interface_state_connected`
4. `WlanQueryInterface(..., wlan_intf_opcode_current_connection, ...)` — get `WLAN_CONNECTION_ATTRIBUTES`
5. Read `wlanSecurityAttributes.dot11AuthAlgorithm` + `dot11CipherAlgorithm`

**Mapping:**

| Auth Algorithm | Cipher | Result |
|---|---|---|
| `DOT11_AUTH_ALGO_80211_OPEN` | `NONE` | Open (Danger) |
| `DOT11_AUTH_ALGO_80211_OPEN` | any other | WPA2 (Safe, assumes OWE) |
| `DOT11_AUTH_ALGO_80211_SHARED_KEY` | — | WEP (Warning) |
| `DOT11_AUTH_ALGO_WPA` / `WPA_PSK` | — | WPA (Warning) |
| `DOT11_AUTH_ALGO_RSNA` / `RSNA_PSK` | — | WPA2 (Safe) |
| Raw value 9 or 10 | — | WPA3 (Safe) |

6. `WlanFreeMemory()` on all allocated pointers; RAII guard closes the handle.

### 1.2 Evil Twin Detection (`check_evil_twin`)

**Platform:** Windows only (others return `Safe`).

**API:** Same WLAN API + `WlanGetNetworkBssList()`.

**Mechanism:**

1. Open WLAN handle, enumerate interfaces, find connected one.
2. `WlanQueryInterface(wlan_intf_opcode_current_connection)` — extract connected SSID from `wlanAssociationAttributes.dot11Ssid.ucSSID`.
3. `WlanGetNetworkBssList(..., dot11_BSS_type_infrastructure, security_enabled=true)` — get all visible BSS entries. Retries with `security_enabled=false` on failure.
4. For each `WLAN_BSS_ENTRY` matching the connected SSID:
   - Check **bit 4 (0x0010)** of `usCapabilityInformation` — IEEE 802.11 Privacy bit.
   - Set = encrypted AP, clear = open AP.
5. If among all BSSIDs with the same SSID at least one is open AND at least one is encrypted → `Warning`.

**Note:** This is a heuristic. A legitimate open guest AP on the same SSID would also trigger it.

### 1.3 ARP Spoofing Detection (`check_arp_spoofing`)

**Platform:** Windows only (others return empty ARP table → `Safe`).

**Mechanism:**

1. `get_default_gateway()` — spawns `cmd.exe /C route print 0.0.0.0`, parses the `0.0.0.0  0.0.0.0  <gateway>` line.
2. `get_all_arp_entries()` — PowerShell `Get-NetNeighbor -AddressFamily IPv4`.
3. Build `HashMap<MAC, Vec<IP>>` — maps each MAC to all IPs in the ARP table.
4. Skip broadcast/multicast (`FF:FF:FF:FF:FF:FF`, `00:00:00:00:00:00`).
5. For any MAC with 2+ IPs:
   - Gateway IP among them → `Danger` (`"gateway_mac_duplicate:{mac}"`)
   - Otherwise → `Warning` (`"mac_duplicate:{mac}"`)
6. No duplicates → `Safe`.

### 1.4 DNS Hijacking Detection (`check_dns_hijacking`)

**Platform:** Cross-platform.

**Test domain:** `example.com`

**Two-resolver comparison:**

1. **System resolver:** `std::net::ToSocketAddrs` on `"example.com:80"` — uses OS resolver stack. Collects all IPv4 addresses.
2. **Trusted resolver:** Hand-built raw DNS A query via `UdpSocket` to `1.1.1.1:53` (3-second read timeout), response parsed manually.

**Raw DNS packet structure (`build_dns_query`):**
- Transaction ID: `0x1234`
- Flags: `0x0100` (standard query, recursion desired)
- Question count: 1, all other counts: 0
- DNS-encoded domain name (length-prefixed labels + null terminator)
- QTYPE=A (`0x0001`), QCLASS=IN (`0x0001`)

**Response parser (`parse_dns_response`):** Skips header + question section, walks answer RRs, extracts A records (`rtype == 1`, `rdlength == 4`).

**Comparison:**
- IP sets overlap → `Safe`
- No overlap, both non-empty → `Warning` (`"system:{ips} trusted:{ips}"`)
- Either empty → `Safe` (avoids false positives on network failure)

---

## 2. Speed Test

The Rust backend has scaffolded fields (`speed_down_mbps`, `speed_up_mbps` in `domain.rs` and `types.rs`) but they are always `None`. The speed test is implemented entirely on the frontend side using the NDT7 protocol over WebSocket (M-Lab).

See [SPEED-TEST-INTERNALS.md](SPEED-TEST-INTERNALS.md) for full details: protocol, metrics, practical task thresholds, warnings, and UI components.

---

## 3. Diagnostic Chain

Driven by `run_diagnostics()` in `diagnostics.rs`. Each node is checked sequentially. The bridge also exposes individual node functions (`check_computer_node`, `check_network_node`, `check_router_node`, `check_internet_node`) for progressive UI updates via `tokio::task::spawn_blocking`.

### 3.1 Computer Node (`check_computer`)

**What is checked:** Hostname and private IP address.

**Implementation (`get_computer_info()`):**

1. `hostname::get()` — OS hostname (`gethostname` on Unix, `GetComputerNameW` on Windows).
2. `get_wifi_info()` → WLAN API → `strInterfaceDescription` (adapter name, e.g. "Intel(R) Wi-Fi 6 AX201 160MHz").
3. `get_if_addrs::get_if_addrs()` — enumerates non-loopback interfaces, filters private IPv4 (RFC 1918 + 169.254.x.x).
4. If Wi-Fi adapter is connected, uses its description. Otherwise uses first available interface.

**Status:** Ok if hostname present, Warn if `None`.

### 3.2 Network Node (`check_network`)

**What is checked:** Connection type, Wi-Fi metadata (SSID, signal, channel, speed, standard, encryption).

**Connection type detection (`detect_connection_type`):** String matching on adapter name:
- "wi-fi", "wifi", "wlan", "802.11", "wireless" → Wifi
- "ethernet", "eth", starts with "en" → Ethernet
- "usb" → Usb
- "mobile", "cellular", "wwan", "lte" → Mobile

**Wi-Fi details via WLAN API (`get_wifi_info()`):**

| API Call | Data Extracted |
|---|---|
| `WlanQueryInterface(wlan_intf_opcode_current_connection)` | SSID (`dot11Ssid.ucSSID`), signal quality (`wlanSignalQuality`, 0–100), TX rate (`ulTxRate` kbps), BSSID (`dot11Bssid`), PHY type (`dot11PhyType`) |
| `WlanGetNetworkBssList` (matched by BSSID) | Center frequency (`ulChCenterFrequency` kHz) |

**Derived values:**
- RSSI: `-90 + quality/2` dBm
- Link speed: `ulTxRate / 1000` Mbps
- Channel: 2412–2472 MHz → `(freq-2407)/5`, 5000–5895 MHz → `(freq-5000)/5`
- Band: 2400–2500 → "2.4 GHz", 5000–5900 → "5 GHz", 5925–7125 → "6 GHz"
- Wi-Fi standard: from `dot11PhyType` raw enum value

**Status:** Disabled/Disconnected → Fail, Unknown → Warn, else Ok.

### 3.3 Router Node (`check_router`)

**What is checked:** Default gateway IP, MAC, vendor.

**Gateway IP (`get_default_gateway()`):**
- **Windows:** `cmd.exe /C route print 0.0.0.0` — parses `0.0.0.0  0.0.0.0  <gateway>` line (3rd token)
- **Linux:** `ip route show default` — parses `default via <gateway>`
- **macOS:** `netstat -nr` — parses lines starting with "default" or "0.0.0.0"

**Router MAC (`get_router_mac`):** PowerShell `Get-NetNeighbor -IPAddress {gateway_ip}` → `LinkLayerAddress`. Normalizes `AA-BB-CC-DD-EE-FF` → `AA:BB:CC:DD:EE:FF`.

**Vendor lookup (`lookup_vendor_by_mac`):** OUI prefix (6–10 hex digits) against compiled-in `OUI_DATABASE` static array (30,000+ entries). Tries 6-char, then 7-char, then 8-char+ prefixes (longest match).

**Status:** Ok if gateway IP found, Warn if `None`.

### 3.4 Internet Node (`check_internet`)

**What is checked:** DNS resolution and HTTPS reachability. Run **in parallel** via `std::thread::scope`.

**DNS check (`test_dns()`):**
- `trust_dns_resolver::Resolver` with system config, 1-second timeout
- Primary: `resolver.lookup_ip("one.one.one.one")`
- Fallback: `resolver.lookup_ip("dns.google")`

**HTTP check (`test_http()`):**
- `reqwest::blocking::Client` with 2-second timeout
- Primary: `GET https://www.cloudflare.com/cdn-cgi/trace`
- Fallback: `GET https://example.com`

**Status:** Both ok → Ok, one ok → Warn (partial connectivity), both fail → Fail.

**Latency:** Wall-clock time of the parallel pair (dominated by the slower check).

---

## 4. Supporting Systems

### PowerShell Execution (`run_powershell`)

All PowerShell commands are invoked via `run_powershell()` in `netok_core/src/infrastructure/mod.rs`:
- Prepends `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; [System.Threading.Thread]::CurrentThread.CurrentUICulture = 'en-US';` to every command
- Uses `CREATE_NO_WINDOW` (0x08000000) flag to prevent console window flashing
- Handles UTF-16 LE output from GUI-subsystem apps

### Active Adapter Discovery (`get_active_adapter_name`)

Windows-only, tries PowerShell commands in priority order:
1. Match Wi-Fi adapter's `InterfaceDescription` to a friendly alias via `Get-NetAdapter`
2. Lowest-metric physical adapter via `Get-NetIPInterface` + `Get-NetAdapter`
3. Fastest "Up" non-virtual adapter via `Get-NetAdapter | Sort-Object LinkSpeed`
4. Last resort: lowest-metric connected interface alias

### Network Device Scan (`scan_network_devices_with_progress`)

Separate from the 4-node chain. Five phases:
1. **Ping sweep** — batches of 20 parallel `ping.exe -n 1 -w 200 {ip}` across the /24 subnet (254 hosts)
2. **ARP table read** — PowerShell `Get-NetNeighbor -AddressFamily IPv4`, filtered for reachable entries
3. **OUI lookup + classification** — vendor lookup, randomized MAC detection (2nd hex digit in 2/6/A/E), device type from vendor keyword matching
4. **Reverse DNS** — `trust_dns_resolver` PTR lookups, 500ms timeout, parallel via `std::thread::scope`
5. **mDNS enrichment** — `mdns_sd::ServiceDaemon` browses 10 service types (`_airplay._tcp.local.`, `_googlecast._tcp.local.`, `_smb._tcp.local.`, etc.) for 3 seconds

### DNS Management

- **Get current:** PowerShell `Get-DnsClientServerAddress -InterfaceAlias '{adapter}' -AddressFamily IPv4`
- **Set:** `netsh interface ip set dns "{adapter}" static {ip}` + `netsh interface ip add dns "{adapter}" {ip} index=2` (+ IPv6 equivalents)
- **Flush:** `ipconfig /flushdns`
- **Test server:** `trust_dns_resolver::Resolver` pointed at specific IP:53 via UDP, 5-second timeout, resolves `google.com`