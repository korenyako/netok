# Netok Internationalization (i18n)

## Overview

Netok uses a lightweight JSON-based i18n system with hardcoded fallbacks. This directory contains translation files for all supported languages.

## Structure

```json
i18n/
├── README.md      # This file
├── en.json        # English translations
└── ru.json        # Russian translations (default)
```

## Translation Files

### Format

All translation files use JSON format with flat key-value pairs:

```json
{
  "AppName": "Netok",
  "Loading": "Loading...",
  "Settings": "Settings",
  "SpeedValue": "Speed: {down}/{up} Mbps"
}
```

### Keys Convention

- **PascalCase**: All keys use PascalCase (e.g., `AppName`, `InternetOk`)
- **Descriptive**: Keys describe the UI element or action (e.g., `DnsCustomPlaceholder`)
- **Categorized**: Related keys share prefixes:
  - `Node*`: Node titles (e.g., `NodeComputer`, `NodeNetwork`)
  - `Fact*`: Data fact keys for matching (e.g., `FactSignal`, `FactType`)
  - `Network*`: Network type labels (e.g., `NetworkWifi`, `NetworkCable`)
  - `Settings*`: Settings section names (e.g., `SettingsGeneral`, `SettingsDns`)

### Placeholders

Use `{key}` syntax for dynamic values:

- `{down}` and `{up}` for speed values
- `{grade}` and `{dbm}` for signal strength
- `{country}` and `{city}` for location

## Usage in Code

### Import Functions

```rust
use i18n::{s, S, t, is_fact_key, set_lang};
```

### Simple Strings

```rust
// Use s() function with enum keys
text(s(S::AppName))
text(s(S::Settings))
button(s(S::Refresh))
```

### Templated Strings

```rust
// Use t() function with placeholders
let speed_text = t("SpeedValue", &[("down", "100"), ("up", "50")]);
let signal_text = t("SignalValue", &[("grade", "excellent"), ("dbm", "-45")]);
```

### Fact Key Matching

```rust
// Use is_fact_key() for data matching across languages
if is_fact_key(fact_name, S::FactSignal) {
    // Handle signal data
}
```

### Language Switching

```rust
// Set language (updates UI immediately)
set_lang("en");  // English
set_lang("ru");  // Russian (default)
```

## Adding New Languages

1. **Create translation file**: `i18n/xx.json` (where xx is language code)
2. **Copy from English**: Use `en.json` as template
3. **Translate values**: Keep keys unchanged, translate only values
4. **Update code**: Add language option to UI if needed

Example for German (`de.json`):

```json
{
  "AppName": "Netok",
  "Loading": "Laden...",
  "Settings": "Einstellungen",
  "SpeedValue": "Geschwindigkeit: {down}/{up} Mbps"
}
```

## Adding New Strings

1. **Add to enum**: Add new variant to `S` enum in `/desktop/src/i18n.rs`
2. **Add translations**: Add entries to both `RU` and `EN` static maps
3. **Update JSON files**: Add corresponding entries to all JSON files
4. **Use in code**: Use `s(S::YourNewKey)` in UI code

Example:

```rust
// 1. In i18n.rs enum S
NewFeature,

// 2. In RU static map
m.insert(S::NewFeature, "Новая функция");

// 3. In EN static map  
m.insert(S::NewFeature, "New Feature");

// 4. In JSON files
"NewFeature": "New Feature"  // en.json
"NewFeature": "Новая функция"  // ru.json

// 5. In UI code
text(s(S::NewFeature))
```

## Translation Guidelines

### Russian (ru.json)

- **Tone**: Professional but friendly
- **Terminology**: Use established IT terms where appropriate
- **Consistency**: Match Windows/macOS terminology for system elements
- **Punctuation**: Use Russian typography rules (ellipsis: `...`)

### English (en.json)

- **Tone**: Clear and concise
- **Terminology**: Standard technical terms
- **Consistency**: Follow platform conventions
- **Punctuation**: Standard English punctuation

### General Rules

- **Preserve placeholders**: Keep `{key}` syntax unchanged
- **Context awareness**: Consider UI space constraints
- **User perspective**: Write from user's point of view
- **No technical jargon**: Keep language accessible

## Validation

### Pre-commit Hook

A git pre-commit hook prevents hardcoded Cyrillic text in `desktop/src/`:

```bash
# Validates no Russian text in UI code
rg "[А-Яа-я]" desktop/src --type rust
```

### Testing

```bash
# Run i18n tests
cd desktop && cargo test test_i18n

# Test language switching in app
cargo run
# Go to Settings → General → Language
```

## Fallback Behavior

1. **Current language**: Try current language first (set via `set_lang()`)
2. **English fallback**: If key missing, fall back to English
3. **Error display**: If missing in both, show `!MISSING: key!`

## Architecture Notes

- **Performance**: Translations loaded once at startup
- **Memory**: Hardcoded strings in binary, JSON for extensibility  
- **Thread safety**: Uses `Mutex` for language switching
- **Type safety**: Enum keys prevent typos and missing translations

## See Also

- [docs/UI-SPEC.md §13](../docs/UI-SPEC.md) - UI specification for i18n
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Translation contribution guidelines
- `/desktop/src/i18n.rs` - Implementation code
