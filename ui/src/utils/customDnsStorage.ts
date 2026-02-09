/**
 * Storage utilities for Custom DNS configuration.
 * This persists the user's Custom DNS settings separately from backend detection,
 * allowing the UI to remember when Custom IP was explicitly used even if the
 * IPs match a known provider (like Google or Cloudflare).
 */

const CUSTOM_DNS_KEY = 'netok_custom_dns_config';

export interface CustomDnsConfig {
  primary: string;
  secondary: string;
  primaryIpv6: string | null;
  secondaryIpv6: string | null;
}

/**
 * Save Custom DNS configuration to localStorage.
 * Call this when user applies Custom DNS settings.
 */
export function saveCustomDnsConfig(config: CustomDnsConfig): void {
  try {
    localStorage.setItem(CUSTOM_DNS_KEY, JSON.stringify(config));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Load Custom DNS configuration from localStorage.
 * Returns null if no config is saved or on error.
 */
export function loadCustomDnsConfig(): CustomDnsConfig | null {
  try {
    const raw = localStorage.getItem(CUSTOM_DNS_KEY);
    if (raw) {
      return JSON.parse(raw) as CustomDnsConfig;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Clear Custom DNS configuration from localStorage.
 * Call this when user switches to a predefined provider or Auto.
 */
export function clearCustomDnsConfig(): void {
  try {
    localStorage.removeItem(CUSTOM_DNS_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Check if there's a saved Custom DNS configuration.
 */
export function hasCustomDnsConfig(): boolean {
  return loadCustomDnsConfig() !== null;
}

/**
 * Check if a DNS server IP matches the saved Custom DNS config.
 * This helps determine if current DNS was set via Custom IP.
 */
export function matchesCustomDnsConfig(primaryIp: string): boolean {
  const config = loadCustomDnsConfig();
  if (!config) return false;
  return config.primary === primaryIp;
}
