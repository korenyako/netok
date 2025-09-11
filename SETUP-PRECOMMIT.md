# Pre-commit Hook Setup

## Overview

The Netok repository includes a git pre-commit hook that prevents hardcoded Cyrillic text from being committed to `desktop/src/`. This ensures all user-visible strings use the i18n system.

## Files Created

- `.git/hooks/pre-commit` - Unix/Linux shell script
- `.git/hooks/pre-commit.ps1` - PowerShell script (Windows)
- `.git/hooks/pre-commit.bat` - Windows batch wrapper

## What It Checks

1. **Cyrillic Text Detection**: Scans staged Rust files in `desktop/src/` for hardcoded Cyrillic characters (`[А-Яа-я]`)
2. **JSON Validation**: Validates syntax of `i18n/*.json` files if being committed
3. **Smart Exclusions**: Automatically skips legitimate uses:
   - Translation strings in `desktop/src/i18n.rs`
   - Test file `desktop/src/main.rs` (contains i18n tests)
   - Comments (`//` and `/* */`)
4. **Helpful Error Messages**: Provides clear guidance on how to fix issues

## Example Error Output

```
❌ COMMIT BLOCKED: Hardcoded Cyrillic text found in:
   desktop/src/main.rs
   Problematic lines:
     42: text("Настройки")
     67: if k == "Сигнал" {

📋 SOLUTION:
   1. Replace hardcoded Russian text with i18n keys:
      ❌ text("Настройки") → ✅ text(s(S::Settings))
      ❌ k == "Сигнал"    → ✅ is_fact_key(k, S::FactSignal)

📚 DOCUMENTATION:
   • docs/UI-SPEC.md §13 - i18n guidelines
   • i18n/README.md - detailed i18n documentation
   • CONTRIBUTING.md - translation workflow
```

## Manual Testing

To test if you have hardcoded Cyrillic text:

### Windows (PowerShell)
```powershell
Get-ChildItem desktop/src -Recurse -Include "*.rs" | Select-String "[А-Яа-я]"
```

### Unix/Linux/macOS
```bash
grep -r "[А-Яа-я]" desktop/src --include="*.rs"
# or with ripgrep
rg "[А-Яа-я]" desktop/src --type rust
```

## Bypass (Emergency)

If you need to bypass the hook temporarily:

```bash
git commit --no-verify -m "Emergency commit"
```

**⚠️ Warning**: Only use `--no-verify` for emergencies. The hook exists to maintain code quality.

## Troubleshooting

### Hook Not Running
1. Check if file exists: `ls -la .git/hooks/pre-commit*`
2. On Unix systems, ensure executable: `chmod +x .git/hooks/pre-commit`
3. On Windows, ensure PowerShell execution policy allows scripts

### Legitimate Exclusions
The hook automatically allows:
- **Translation strings in `i18n.rs`** - Part of the translation system
- **Test file `main.rs`** - Contains i18n tests with expected Russian strings
- **Comments in Russian** - Documentation and explanations

### Rare False Positives
If you encounter false positives, check:
- **String interpolation** - Ensure proper `t()` function usage
- **Dynamic strings** - Should use i18n keys, not hardcoded text
- **Error messages** - Should be localized anyway

### Hook Doesn't Trigger
- Hooks only run on `git commit`, not `git add`
- Hooks don't run if no files are staged
- Check that you're not using `git commit --no-verify`

## Maintenance

The hook is automatically included when cloning the repository. No additional setup required for team members.

To update the hook, modify the files in `.git/hooks/` and ensure all team members pull the latest version.
