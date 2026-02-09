import dnsProviders from '../data/dns-providers.json';

const ipv4Map = dnsProviders.ipv4 as Record<string, string>;
const ipv6Map = dnsProviders.ipv6 as Record<string, string>;

/**
 * Lookup DNS provider name by IP address.
 * Returns the provider name if found, null otherwise.
 */
export function lookupDnsProvider(ip: string): string | null {
  if (!ip) return null;

  const trimmed = ip.trim();

  // Check IPv4
  if (trimmed in ipv4Map) {
    return ipv4Map[trimmed];
  }

  // Check IPv6 (normalize to lowercase for comparison)
  const lowerIp = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(ipv6Map)) {
    if (key.toLowerCase() === lowerIp) {
      return value;
    }
  }

  return null;
}

/**
 * Get display name for Custom DNS based on entered IPs.
 * Prioritizes primary IPv4, then primary IPv6.
 * Returns the provider name if recognized, null for truly custom.
 */
export function getCustomDnsDisplayName(
  primary: string,
  primaryIpv6?: string | null
): string | null {
  // Try primary IPv4 first
  const ipv4Provider = lookupDnsProvider(primary);
  if (ipv4Provider) return ipv4Provider;

  // Try primary IPv6
  if (primaryIpv6) {
    const ipv6Provider = lookupDnsProvider(primaryIpv6);
    if (ipv6Provider) return ipv6Provider;
  }

  return null;
}
