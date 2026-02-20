# Third-Party Licenses

This file lists third-party components distributed with Netok and their respective licenses.

---

## Binaries

### sing-box

- **Description:** Universal proxy platform used for VPN tunneling
- **License:** GPL-3.0-or-later
- **Copyright:** (c) 2022 nekohasekai
- **Source:** <https://github.com/SagerNet/sing-box>
- **Usage:** Bundled as a sidecar binary (`netok_desktop/src-tauri/binaries/`)

### Wintun

- **Description:** Layer 3 TUN driver for Windows, used by sing-box
- **License:** Prebuilt binaries license (see below)
- **Copyright:** (c) WireGuard LLC
- **Source:** <https://www.wintun.net/>
- **Usage:** Distributed alongside sing-box, accessed only via the Permitted API (`wintun.h`)
- **License terms:** <https://github.com/WireGuard/wintun/blob/master/prebuilt-binaries-license.txt>

> `wintun.dll` is distributed under the Wintun prebuilt binaries license which permits
> redistribution alongside other software that uses Wintun only via the Permitted API.

---

## Fonts

### Inter

- **Description:** Variable sans-serif typeface, primary UI font
- **License:** SIL Open Font License 1.1
- **Copyright:** (c) 2016-2024 The Inter Project Authors
- **Source:** <https://rsms.me/inter/>

### Martian Mono

- **Description:** Variable monospace typeface
- **License:** SIL Open Font License 1.1
- **Copyright:** (c) 2022 Evil Martians
- **Source:** <https://github.com/evilmartians/mono>

### Noto Sans Arabic

- **Description:** Variable Arabic typeface for i18n support
- **License:** SIL Open Font License 1.1
- **Copyright:** (c) Google LLC
- **Source:** <https://fonts.google.com/noto/specimen/Noto+Sans+Arabic>

---

## Data

### IEEE OUI Database

- **Description:** MAC address vendor lookup table (auto-generated)
- **Source:** <https://standards-oui.ieee.org/oui/oui.csv>
- **Usage:** Embedded in `netok_core/src/oui_database.rs` for device identification
- **Terms:** Public data from IEEE Registration Authority

---

## License Texts

### SIL Open Font License 1.1

See <https://openfontlicense.org/> for the full license text.

### GNU General Public License v3

See <https://www.gnu.org/licenses/gpl-3.0.html> for the full license text.
