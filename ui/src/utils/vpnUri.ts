/** Extract server host (IP or hostname) from a VPN URI key. */
export function extractServerHost(key: string): string | null {
  const trimmed = key.trim();

  // vmess:// uses base64-encoded JSON with an "add" field
  if (trimmed.toLowerCase().startsWith('vmess://')) {
    try {
      const b64 = trimmed.slice('vmess://'.length).split('#')[0];
      const json = JSON.parse(atob(b64));
      if (json.add) return json.add;
    } catch {
      // fall through
    }
    return null;
  }

  // ss:// legacy format: ss://BASE64(method:password@host:port)#tag
  // The @ is inside the base64, not visible in the raw URI
  if (trimmed.toLowerCase().startsWith('ss://') && trimmed.indexOf('@') === -1) {
    try {
      const b64 = trimmed.slice('ss://'.length).split('#')[0];
      const decoded = atob(b64);
      const atPos = decoded.indexOf('@');
      if (atPos !== -1) {
        const afterAt = decoded.slice(atPos + 1);
        const hostPort = afterAt.split(/[?#]/)[0];
        const colonIdx = hostPort.lastIndexOf(':');
        if (colonIdx === -1) return hostPort || null;
        return hostPort.slice(0, colonIdx) || null;
      }
    } catch {
      // fall through
    }
    return null;
  }

  // Most protocols: scheme://userinfo@host:port/...
  // vless, ss, trojan, wg, wireguard, ssconf
  const atIdx = trimmed.indexOf('@');
  if (atIdx === -1) return null;

  const afterAt = trimmed.slice(atIdx + 1);
  // Remove query (?...) and fragment (#...) first
  const hostPort = afterAt.split(/[?#]/)[0];

  // Handle IPv6 in brackets: [::1]:port
  const bracketMatch = hostPort.match(/^\[([^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1];

  // host:port or just host
  const colonIdx = hostPort.lastIndexOf(':');
  if (colonIdx === -1) return hostPort || null;
  return hostPort.slice(0, colonIdx) || null;
}
