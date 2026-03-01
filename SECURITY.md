# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in Netok, please report it responsibly. **Do not open a public issue.**

### How to Report

Use [GitHub Security Advisories](https://github.com/korenyako/netok/security/advisories/new) to report vulnerabilities privately. This ensures the report is only visible to the project maintainer until a fix is available.

Alternatively, contact the maintainer directly at **anton.korenyako@gmail.com** with the subject line **"Netok Security Report"**.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Affected version(s)
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** within 48 hours
- **Initial assessment:** within 7 days
- **Fix or mitigation:** as soon as practical, targeting 30 days for critical issues

### After Resolution

Once a fix is released, the vulnerability will be disclosed publicly with credit to the reporter (unless anonymity is requested).

## Scope

### In scope

- Netok desktop application (all platforms)
- Build and release pipeline (GitHub Actions workflows)
- Dependencies with known vulnerabilities that affect Netok

### Out of scope

- Third-party services (ipinfo.io, M-Lab, Cloudflare) — report to them directly
- Social engineering attacks on project maintainers
- Issues in upstream dependencies that do not affect Netok's functionality

## Safe Harbor

We consider security research conducted in good faith to be authorized. We will not pursue legal action against researchers who:

- Act in good faith and follow this disclosure policy
- Avoid privacy violations, data destruction, and service disruption
- Report findings promptly and allow reasonable time for remediation

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest release | Yes |
| Previous releases | Security fixes only |
