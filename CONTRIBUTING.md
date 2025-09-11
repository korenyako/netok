# Contributing Guidelines

Thanks for contributing! Please read docs/UI-SPEC.md and cite sections (§N) in issues/PRs. Keep changes small and focused. Avoid heavy dependencies without discussion.

## Internationalization (i18n)

### Adding New Strings

1. **Add to enum:** Add new variants to `S` enum in `/desktop/src/i18n.rs`
2. **Add translations:** Add entries to both `RU` and `EN` static maps
3. **Use in code:** Use `s(S::YourKey)` for simple strings, `t("YourKey", &[("arg", "value")])` for templated strings
4. **Test both languages:** Verify translations work in both Russian and English

### Translation Guidelines

- **Keys:** Use descriptive names (e.g., `AppName`, `InternetOk`, `SettingsGeneral`)
- **Consistency:** All UI strings must be translatable
- **Arguments:** Use `{key}` placeholders for dynamic content
- **Fallback:** English is the fallback language

### Language Toggle

- **Location:** Settings → General → Language
- **Implementation:** State-only toggle (no persistence yet)
- **Testing:** Switch between languages to verify all strings are translated

See UI-SPEC.md §13 for detailed i18n rules.
