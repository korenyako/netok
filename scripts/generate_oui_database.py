#!/usr/bin/env python3
"""
Generate Rust OUI database from IEEE CSV file.

Downloads the latest OUI database from IEEE and converts it to Rust code.
"""

import csv
import sys
from pathlib import Path
from typing import List, Tuple


def parse_oui_csv(csv_path: str) -> List[Tuple[str, str]]:
    """Parse OUI CSV file and extract OUI prefix and vendor name."""
    entries = []

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row in reader:
            # Get OUI assignment (MAC prefix)
            oui = row.get('Assignment', '').strip().upper()

            # Get organization name
            vendor = row.get('Organization Name', '').strip()

            # Skip invalid entries
            if not oui or not vendor:
                continue

            # Remove any non-hex characters from OUI
            oui_clean = ''.join(c for c in oui if c in '0123456789ABCDEF')

            # Skip if not valid hex
            if len(oui_clean) < 6:
                continue

            # Clean vendor name - remove quotes and extra whitespace
            # We'll use them in raw strings, so no need to escape
            vendor_clean = vendor.replace('"', "'").strip()

            # Truncate very long vendor names
            if len(vendor_clean) > 80:
                vendor_clean = vendor_clean[:77] + "..."

            entries.append((oui_clean, vendor_clean))

    return entries


def generate_rust_code(entries: List[Tuple[str, str]], output_path: str):
    """Generate Rust code with OUI database."""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("/// Full IEEE OUI database.\n")
        f.write("/// Auto-generated from IEEE Registration Authority data.\n")
        f.write("///\n")
        f.write(f"/// Total entries: {len(entries)}\n")
        f.write("/// Format: (OUI prefix as 6+ hex chars, Vendor name)\n")
        f.write("///\n")
        f.write("/// This database is embedded at compile time for offline operation.\n")
        f.write("/// Source: https://standards-oui.ieee.org/oui/oui.csv\n")
        f.write("#[allow(clippy::excessive_precision)]\n")
        f.write("pub const OUI_DATABASE: &[(&str, &str)] = &[\n")

        for oui, vendor in entries:
            # No escaping needed - quotes already replaced with apostrophes
            f.write(f'    ("{oui}", "{vendor}"),\n')

        f.write("];\n")

    print(f"Generated Rust code with {len(entries)} OUI entries")
    print(f"Output: {output_path}")


def main():
    # Paths
    csv_path = "/tmp/oui.csv"
    output_path = "/home/user/netok/netok_core/src/oui_database.rs"

    print("Parsing IEEE OUI database...")
    entries = parse_oui_csv(csv_path)

    print(f"Found {len(entries)} valid OUI entries")

    print("Generating Rust code...")
    generate_rust_code(entries, output_path)

    print("Done! ✅")
    print(f"\nDatabase statistics:")
    print(f"  Total entries: {len(entries)}")

    # Count unique vendors
    unique_vendors = len(set(vendor for _, vendor in entries))
    print(f"  Unique vendors: {unique_vendors}")

    # Sample entries
    print(f"\nSample entries:")
    for i, (oui, vendor) in enumerate(entries[:5]):
        print(f"  {oui} → {vendor}")


if __name__ == "__main__":
    main()
