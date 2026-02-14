#!/usr/bin/env python3
"""
Generate Rust brand mapping from Wireshark manuf.txt file.

Reads manuf.txt (Wireshark MAC vendor database) and generates
netok_core/src/brand_mapping.rs with a HashMap mapping OUI full names
to clean consumer brand names.

Three-tier cleaning:
1. Manual overrides for OEM factories and tricky names
2. Clean short names from Wireshark (already a brand)
3. Auto-clean: strip suffixes, noise words, city prefixes, title case

Usage:
    python scripts/process_manuf.py [manuf.txt path]
"""

import re
import sys
from pathlib import Path
from collections import OrderedDict


# ── Manual overrides: factory/legal name → consumer brand ──
# These cannot be derived automatically.
MANUAL_OVERRIDES: dict[str, str] = {
    # OEM / contract manufacturers
    "hon hai precision ind. co.,ltd.": "Foxconn",
    "hon hai precision industry co., ltd.": "Foxconn",
    "cloud network technology singapore pte. ltd.": "Foxconn",
    "pegatron corporation": "Pegatron",
    "wistron corporation": "Wistron",
    "wistron infocomm (zhongshan) corporation": "Wistron",
    "wistron neweb corporation": "Wistron",
    # Honor (Huawei subsidiary factories)
    "chongqing fugui electronics co.,ltd.": "Honor",
    "honor device co., ltd.": "Honor",
    "shenzhen honor electronic co.,ltd": "Honor",
    # ASUS variants
    "asustek computer inc.": "ASUS",
    "asus computer inc.": "ASUS",
    # OPPO (Guangdong prefix)
    "guangdong oppo mobile telecommunications corp.,ltd": "OPPO",
    "oppo digital, inc.": "OPPO",
    # Motorola (complex suffix)
    "motorola mobility llc, a lenovo company": "Motorola",
    "motorola (wuhan) mobility technologies communication co., ltd.": "Motorola",
    "motorola solutions inc.": "Motorola",
    # Intel
    "intel corporate": "Intel",
    # TP-Link
    "tp-link technologies co.,ltd.": "TP-Link",
    "tp-link corporation limited": "TP-Link",
    # HP variants
    "hewlett packard": "HP",
    "hewlett packard enterprise": "HP",
    "hewlett-packard company": "HP",
    "hp inc.": "HP",
    # Epson
    "seiko epson corporation": "Epson",
    # Amazon
    "amazon technologies inc.": "Amazon",
    "amazon.com, llc": "Amazon",
    "amazon.com services, inc.": "Amazon",
    # Vivo
    "vivo mobile communication co., ltd.": "Vivo",
    # Realme
    "realme chongqing mobile telecommunications corp.,ltd.": "Realme",
    # Xiaomi variants
    "xiaomi communications co ltd": "Xiaomi",
    "xiaomi inc.": "Xiaomi",
    "beijing xiaomi mobile software co., ltd": "Xiaomi",
    "beijing xiaomi electronics co., ltd.": "Xiaomi",
    # Samsung
    "samsung electronics co.,ltd": "Samsung",
    "samsung electro-mechanics(thailand)": "Samsung",
    "samsung electro mechanics co., ltd.": "Samsung",
    "samsung electro-mechanics co., ltd.": "Samsung",
    # LG
    "lg electronics (mobile communications)": "LG",
    "lg electronics": "LG",
    "lg innotek": "LG",
    "lg electronics inc.": "LG",
    # Huawei
    "huawei technologies co.,ltd": "Huawei",
    "huawei device co., ltd.": "Huawei",
    "huawei symantec technologies co.,ltd.": "Huawei",
    # ZTE
    "zte corporation": "ZTE",
    # TCL
    "tcl king electrical appliances (huizhou) co., ltd": "TCL",
    "tct mobile limited": "TCL",
    # Sony
    "sony corporation": "Sony",
    "sony interactive entertainment inc.": "Sony",
    "sony mobile communications inc": "Sony",
    # Google
    "google, inc.": "Google",
    "google llc": "Google",
    # Apple
    "apple, inc.": "Apple",
    # Microsoft
    "microsoft corporation": "Microsoft",
    # Nokia variants
    "nokia corporation": "Nokia",
    "nokia danmark a/s": "Nokia",
    "nokia shanghai bell co., ltd.": "Nokia",
    "nokia solutions and networks gmbh & co. kg": "Nokia",
    # Dell
    "dell inc.": "Dell",
    "dell technologies": "Dell",
    # Cisco
    "cisco systems, inc": "Cisco",
    "cisco meraki": "Cisco",
    "cisco spvtg": "Cisco",
    # Lenovo
    "lenovo mobile communication technology ltd.": "Lenovo",
    # Broadcom
    "broadcom limited": "Broadcom",
    "broadcom inc.": "Broadcom",
    # D-Link
    "d-link corporation": "D-Link",
    "d-link international": "D-Link",
    # Netgear
    "netgear": "Netgear",
    # Nintendo
    "nintendo co.,ltd": "Nintendo",
    # Roku
    "roku, inc.": "Roku",
    # OnePlus
    "oneplus technology (shenzhen) co., ltd": "OnePlus",
    # eero
    "eero inc.": "eero",
    # Hikvision (city prefix)
    "hangzhou hikvision digital technology co.,ltd.": "Hikvision",
    # Skyworth (city prefix)
    "shenzhen skyworth digital technology co., ltd": "Skyworth",
    # Tenda (city prefix)
    "shenzhen tenda technology co.,ltd.": "Tenda",
    # Espressif
    "espressif inc.": "Espressif",
    # Ubiquiti
    "ubiquiti inc": "Ubiquiti",
    "ubiquiti networks inc.": "Ubiquiti",
    # MikroTik
    "mikrotikls sia": "MikroTik",
    # Zyxel
    "zyxel communications corporation": "ZyXEL",
    # Raspberry Pi
    "raspberry pi trading ltd": "Raspberry Pi",
    "raspberry pi (trading) ltd": "Raspberry Pi",
    "raspberry pi ltd": "Raspberry Pi",
    # Tuya
    "tuya smart inc.": "Tuya",
    # Ruckus
    "ruckus wireless": "Ruckus",
    # Arista
    "arista networks": "Arista",
    # Texas Instruments
    "texas instruments": "Texas Instruments",
    # Juniper
    "juniper networks": "Juniper",
    # Hisense
    "hisense electric co.,ltd": "Hisense",
    "hisense broadband multimedia technologies co.,ltd": "Hisense",
    # Xerox
    "xerox corporation": "Xerox",
    # Brother
    "brother industries, ltd.": "Brother",
    # Canon
    "canon inc.": "Canon",
    # Murata
    "murata manufacturing co., ltd.": "Murata",
    # Itel
    "itel mobile limited": "itel",
    # Tecno
    "tecno mobile limited": "TECNO",
    # Infinix
    "infinix mobility limited": "Infinix",
    # Quectel
    "quectel wireless solutions co.,ltd.": "Quectel",
    # MediaTek
    "mediatek inc.": "MediaTek",
    # Realtek
    "realtek semiconductor corp.": "Realtek",
    # Qualcomm
    "qualcomm inc.": "Qualcomm",
    # NXP
    "nxp semiconductors": "NXP",
    # Silicon Labs
    "silicon laboratories": "Silicon Labs",
    # AzureWave
    "azurewave technology inc.": "AzureWave",
    # Arcadyan
    "arcadyan corporation": "Arcadyan",
    "arcadyan technology corporation": "Arcadyan",
    # Sagemcom
    "sagemcom broadband sas": "Sagemcom",
    # Fiberhome
    "fiberhome telecommunication technologies co.,ltd": "Fiberhome",
    # Keenetic
    "keenetic limited": "Keenetic",
    # Annapurna (Amazon subsidiary for networking chips)
    "annapurna labs": "Annapurna Labs",
    # Commscope
    "commscope": "CommScope",
    # Extreme Networks
    "extreme networks headquarters": "Extreme Networks",
    "extreme networks, inc.": "Extreme Networks",
    # Nortel
    "nortel networks": "Nortel",
    # New H3C
    "new h3c technologies co., ltd": "H3C",
    # Vantiva (formerly Technicolor)
    "vantiva usa llc": "Vantiva",
    # Mellanox (now NVIDIA)
    "mellanox technologies, inc.": "Mellanox",
    # Alcatel-Lucent
    "alcatel-lucent shanghai bell co., ltd": "Alcatel-Lucent",
    "alcatel-lucent ent": "Alcatel-Lucent",
    # Avaya
    "avaya inc": "Avaya",
    # Linksys
    "linksys": "Linksys",
    # Acer
    "acer, inc.": "Acer",
    # MSI
    "micro-star intl co., ltd.": "MSI",
    "micro-star international co., ltd.": "MSI",
    # Gigabyte
    "giga-byte technology co.,ltd.": "Gigabyte",
}

# Short names from manuf col 2 that are already clean brand names.
# If the short name matches one of these, use it directly.
CLEAN_SHORT_NAMES: set[str] = {
    "Apple", "Cisco", "Intel", "Dell", "Microsoft", "Nokia", "Google",
    "Nintendo", "Sony", "HP", "Netgear", "Ubiquiti", "Espressif",
    "Avaya", "Ericsson", "Xerox", "Toshiba", "Oracle", "AMD",
    "Siemens", "Motorola", "Lenovo", "Panasonic", "Samsung",
    "Canon", "Brother", "Epson", "Fujitsu", "Huawei",
    "Arcadyan", "Commscope", "Linksys", "Roku",
}

# City/region prefixes to strip (lowercase).
CITY_PREFIXES: list[str] = [
    "shenzhen ", "hangzhou ", "beijing ", "guangdong ", "chongqing ",
    "shanghai ", "nanjing ", "guangzhou ", "zhejiang ", "jiangsu ",
    "sichuan ", "dongguan ", "xiamen ", "wuhan ", "tianjin ",
    "suzhou ", "qingdao ", "changsha ", "fuzhou ", "foshan ",
    "zhongshan ", "huizhou ", "hefei ",
]

# Legal suffixes to strip (order: longer/more specific first).
LEGAL_SUFFIXES: list[str] = [
    " co., ltd.",
    " co.,ltd.",
    " co., ltd",
    " co.,ltd",
    ", ltd.",
    ",ltd.",
    ", ltd",
    ",ltd",
    " ltd.",
    " ltd",
    " llc.",
    " llc",
    " inc.",
    " inc",
    " corp.",
    " corporation",
    " gmbh & co. kg",
    " gmbh",
    " s.a.s.",
    " s.a.s",
    " s.a.",
    " s.r.l.",
    " b.v.",
    " a/s",
    " ab",
    " ag",
    " plc",
    " pty",
    " sa",
    " sia",
    " oy",
    " as",
    " srl",
    " spa",
    " s.p.a.",
    " pte.",
    " pte",
    " limited",
]

# Noise words to strip (as whole words, after suffix removal).
NOISE_WORDS: list[str] = [
    "technologies", "technology", "electronics", "electronic",
    "communications", "communication", "telecommunications",
    "devices", "device", "international", "enterprise",
    "semiconductor", "semiconductors", "computer", "computing",
    "systems", "system", "network", "networks", "networking",
    "multimedia", "digital", "mobile", "wireless", "broadband",
    "industrial", "trading", "electrical", "appliances", "company",
    "solutions", "services", "precision", "manufacturing",
    "industries", "products",
]


def parse_manuf(path: str) -> list[tuple[str, str, str]]:
    """Parse manuf.txt into (mac, short_name, full_name) tuples."""
    entries = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip("\n\r")
            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue
            # Must start with hex MAC
            if not re.match(r"^[0-9A-Fa-f]{2}:", line):
                continue

            parts = line.split("\t")
            if len(parts) < 3:
                continue

            mac = parts[0].strip()
            short_name = parts[1].strip()
            full_name = parts[2].strip()

            if mac and full_name:
                entries.append((mac, short_name, full_name))

    return entries


def auto_clean(full_name: str) -> str:
    """Auto-clean a vendor name: strip city, legal suffix, noise, title case."""
    name = full_name.strip()
    lower = name.lower()

    # Strip city/region prefixes
    for prefix in CITY_PREFIXES:
        if lower.startswith(prefix):
            name = name[len(prefix):]
            lower = name.lower()
            break  # Only strip one prefix

    # Strip legal suffixes (find the earliest matching suffix)
    for suffix in LEGAL_SUFFIXES:
        idx = lower.rfind(suffix)
        if idx >= 0:
            after = lower[idx + len(suffix):].strip()
            if not after or after in (".", ","):
                name = name[:idx]
                lower = name.lower()
                break

    # Remove parenthetical content: "(Huizhou)", "(Shenzhen)", etc.
    name = re.sub(r"\s*\([^)]*\)\s*", " ", name)

    # Strip noise words (whole words only, case-insensitive)
    for noise in NOISE_WORDS:
        # Word boundary matching
        pattern = r"\b" + re.escape(noise) + r"\b"
        name = re.sub(pattern, "", name, flags=re.IGNORECASE)

    # Clean up: collapse whitespace, trim punctuation
    name = re.sub(r"\s+", " ", name).strip()
    name = name.strip(" ,.-&")

    if not name:
        return full_name  # Safety: return original if cleanup ate everything

    # Title Case (but preserve known all-caps brands)
    return title_case(name)


def title_case(s: str) -> str:
    """Title case, preserving certain patterns."""
    words = s.split()
    result = []
    for word in words:
        # If it's all uppercase and short (≤4 chars), keep as-is (acronym)
        if word.isupper() and len(word) <= 4:
            result.append(word)
        # If it has internal caps (e.g., "MediaTek"), keep as-is
        elif any(c.isupper() for c in word[1:]) and any(c.islower() for c in word):
            result.append(word)
        else:
            result.append(word[0].upper() + word[1:].lower() if word else word)
    return " ".join(result)


def build_brand_map(entries: list[tuple[str, str, str]]) -> dict[str, str]:
    """Build deduplicated full_name → clean_brand mapping."""
    brand_map: dict[str, str] = {}

    for _mac, short_name, full_name in entries:
        full_lower = full_name.lower().strip()

        if full_lower in brand_map:
            continue  # Already mapped

        # Tier 1: Manual override
        if full_lower in MANUAL_OVERRIDES:
            brand_map[full_lower] = MANUAL_OVERRIDES[full_lower]
            continue

        # Tier 2: Clean short name from Wireshark
        if short_name in CLEAN_SHORT_NAMES:
            brand_map[full_lower] = short_name
            continue

        # Tier 3: Auto-clean
        cleaned = auto_clean(full_name)

        # Skip entries with quotes (problematic in Rust string literals)
        if '"' in full_lower or '"' in cleaned:
            continue

        # Skip results that are too short or empty
        if len(cleaned) < 2:
            continue

        # Only add if the cleaned version is different and shorter
        if cleaned != full_name and len(cleaned) < len(full_name):
            brand_map[full_lower] = cleaned
        # Even if same length, add if it's cleaner (title case)
        elif cleaned != full_name:
            brand_map[full_lower] = cleaned

    return brand_map


def generate_rust(brand_map: dict[str, str], output_path: str):
    """Generate Rust brand_mapping.rs file."""
    # Sort by key for stable output
    sorted_entries = sorted(brand_map.items())

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("//! Brand mapping from OUI vendor names to clean consumer brand names.\n")
        f.write("//!\n")
        f.write("//! Auto-generated by `scripts/process_manuf.py` from Wireshark manuf.txt.\n")
        f.write(f"//! Total mappings: {len(sorted_entries)}\n")
        f.write("//!\n")
        f.write("//! Two-layer approach:\n")
        f.write("//! 1. Static HashMap lookup for known vendor names\n")
        f.write("//! 2. Fallback cleanup for unknown vendors (strip suffixes, title case)\n")
        f.write("\n")
        f.write("use std::collections::HashMap;\n")
        f.write("use std::sync::LazyLock;\n")
        f.write("\n")
        f.write("/// Mapping from lowercase OUI full vendor name to clean brand name.\n")
        # Count entries without quotes
        valid_entries = [(k, v) for k, v in sorted_entries if '"' not in k and '"' not in v]
        f.write("static BRAND_MAP: LazyLock<HashMap<&'static str, &'static str>> = LazyLock::new(|| {\n")
        f.write(f"    let mut map = HashMap::with_capacity({len(valid_entries)});\n")

        for full_lower, brand in sorted_entries:
            # Skip entries with double quotes (can't safely embed in Rust)
            if '"' in full_lower or '"' in brand:
                continue
            f.write(f'    map.insert("{full_lower}", "{brand}");\n')

        f.write("    map\n")
        f.write("});\n")
        f.write("\n")

        # Fallback cleanup constants
        f.write("/// Legal/corporate suffixes to strip in fallback cleanup.\n")
        f.write("const LEGAL_SUFFIXES: &[&str] = &[\n")
        for s in LEGAL_SUFFIXES:
            f.write(f'    "{s}",\n')
        f.write("];\n\n")

        f.write("/// Noise words to strip after removing legal suffixes.\n")
        f.write("const NOISE_WORDS: &[&str] = &[\n")
        for w in NOISE_WORDS:
            f.write(f'    "{w}",\n')
        f.write("];\n\n")

        f.write("/// City/region prefixes to strip.\n")
        f.write("const CITY_PREFIXES: &[&str] = &[\n")
        for p in CITY_PREFIXES:
            f.write(f'    "{p}",\n')
        f.write("];\n\n")

        # Main function
        f.write("""/// Map a raw OUI vendor name to a clean consumer brand name.
///
/// 1. Try exact match in the curated brand map (generated from manuf.txt)
/// 2. Fallback: auto-clean the vendor name
pub fn map_vendor_to_brand(vendor: &str) -> String {
    let key = vendor.to_lowercase();
    let trimmed = key.trim();

    // Layer 1: exact mapping from generated database
    if let Some(brand) = BRAND_MAP.get(trimmed) {
        return brand.to_string();
    }

    // Layer 2: fallback cleanup
    clean_vendor_name(vendor)
}

/// Auto-clean a vendor name: strip city prefix, legal suffix, noise words, title case.
fn clean_vendor_name(vendor: &str) -> String {
    let mut name = vendor.to_lowercase();

    // Strip city/region prefixes
    for prefix in CITY_PREFIXES {
        if name.starts_with(prefix) {
            name = name[prefix.len()..].to_string();
            break;
        }
    }

    // Strip legal suffixes
    for suffix in LEGAL_SUFFIXES {
        if let Some(pos) = name.rfind(suffix) {
            let after = name[pos + suffix.len()..].trim();
            if after.is_empty() || after == "." || after == "," {
                name = name[..pos].to_string();
                break;
            }
        }
    }

    // Remove parenthetical content
    while let Some(open) = name.find('(') {
        if let Some(close) = name[open..].find(')') {
            name = format!("{}{}", &name[..open], &name[open + close + 1..]);
        } else {
            break;
        }
    }

    // Strip noise words (word-level matching)
    let words: Vec<&str> = name.split_whitespace().collect();
    let filtered: Vec<&str> = words
        .into_iter()
        .filter(|w| !NOISE_WORDS.contains(w))
        .collect();
    name = filtered.join(" ");

    // Clean up whitespace and trailing punctuation
    let name = name.split_whitespace().collect::<Vec<&str>>().join(" ");
    let name = name.trim_end_matches(|c: char| c == ',' || c == '.' || c == ' ' || c == '-');

    if name.is_empty() {
        return vendor.to_string();
    }

    to_title_case(name)
}

/// Convert a string to Title Case, preserving short all-caps acronyms.
fn to_title_case(s: &str) -> String {
    s.split_whitespace()
        .map(|word| {
            // Keep short all-caps words as acronyms (e.g., "ZTE", "HP", "AMD")
            if word.len() <= 4 && word.chars().all(|c| c.is_uppercase() || !c.is_alphabetic()) {
                return word.to_uppercase();
            }
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => {
                    let upper: String = c.to_uppercase().collect();
                    upper + chars.as_str()
                }
            }
        })
        .collect::<Vec<String>>()
        .join(" ")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_known_brand_honor() {
        assert_eq!(
            map_vendor_to_brand("Chongqing Fugui Electronics Co.,Ltd."),
            "Honor"
        );
    }

    #[test]
    fn test_known_brand_tp_link() {
        assert_eq!(
            map_vendor_to_brand("Tp-Link Technologies Co.,Ltd."),
            "TP-Link"
        );
    }

    #[test]
    fn test_known_brand_asus() {
        assert_eq!(map_vendor_to_brand("ASUSTek COMPUTER INC."), "ASUS");
    }

    #[test]
    fn test_known_brand_case_insensitive() {
        assert_eq!(map_vendor_to_brand("apple, inc."), "Apple");
        assert_eq!(map_vendor_to_brand("APPLE, INC."), "Apple");
    }

    #[test]
    fn test_fallback_strips_suffix_and_noise() {
        // "Corporation" is a legal suffix, "Networks" is a noise word
        let result = map_vendor_to_brand("Acme Networks Corporation");
        assert_eq!(result, "Acme");
    }

    #[test]
    fn test_fallback_title_case() {
        // "INC." stripped as legal suffix, remaining words title-cased
        let result = map_vendor_to_brand("SOME RANDOM VENDOR INC.");
        assert_eq!(result, "Some Random Vendor");
    }

    #[test]
    fn test_fallback_city_prefix() {
        let result = map_vendor_to_brand("Shenzhen Superstar Technology Co., Ltd.");
        assert_eq!(result, "Superstar");
    }
}
""")

    print(f"Generated {output_path}")
    print(f"  Total mappings: {len(sorted_entries)}")


def main():
    # Determine paths
    script_dir = Path(__file__).parent
    project_root = script_dir.parent

    manuf_path = sys.argv[1] if len(sys.argv) > 1 else str(project_root / "manuf.txt")
    output_path = str(project_root / "netok_core" / "src" / "brand_mapping.rs")

    print(f"Reading manuf.txt from: {manuf_path}")
    entries = parse_manuf(manuf_path)
    print(f"  Parsed {len(entries)} MAC entries")

    # Count unique full names
    unique_full = set(e[2].lower().strip() for e in entries)
    print(f"  Unique vendor names: {len(unique_full)}")

    print("Building brand map...")
    brand_map = build_brand_map(entries)
    print(f"  Generated {len(brand_map)} brand mappings")

    # Show sample transformations
    print("\nSample transformations:")
    samples = [
        "Apple, Inc.",
        "Huawei Technologies Co.,Ltd",
        "Samsung Electronics Co.,Ltd",
        "Chongqing Fugui Electronics Co.,Ltd.",
        "ASUSTek COMPUTER INC.",
        "Tp-Link Technologies Co.,Ltd.",
        "Hon Hai Precision Ind. Co.,Ltd.",
        "Guangdong Oppo Mobile Telecommunications Corp.,Ltd",
        "Intel Corporate",
        "Hangzhou Hikvision Digital Technology Co.,Ltd.",
        "zte corporation",
        "vivo Mobile Communication Co., Ltd.",
        "Motorola Mobility LLC, a Lenovo Company",
        "LG Electronics (Mobile Communications)",
        "Shenzhen Skyworth Digital Technology CO., Ltd",
        "Fiberhome Telecommunication Technologies Co.,LTD",
        "Xiaomi Communications Co Ltd",
        "Cloud Network Technology Singapore Pte. Ltd.",
        "Seiko Epson Corporation",
        "Amazon Technologies Inc.",
    ]
    for s in samples:
        key = s.lower().strip()
        if key in brand_map:
            result = brand_map[key]
            tag = "mapped"
        else:
            result = auto_clean(s)
            tag = "auto"
        print(f"  [{tag}] {s:55s} -> {result}")

    print(f"\nGenerating Rust code...")
    generate_rust(brand_map, output_path)

    # Stats
    manual_count = sum(1 for k in brand_map if k in MANUAL_OVERRIDES)
    print(f"\nStats:")
    print(f"  Manual overrides used: {manual_count}")
    print(f"  Auto-cleaned: {len(brand_map) - manual_count}")
    print(f"  Total unique vendors in manuf.txt: {len(unique_full)}")
    print(f"  Mapped: {len(brand_map)} ({100*len(brand_map)/len(unique_full):.1f}%)")


if __name__ == "__main__":
    main()
