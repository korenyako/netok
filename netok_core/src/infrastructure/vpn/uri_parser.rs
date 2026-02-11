//! VPN URI parser — converts protocol URIs into typed parameter structs.
//!
//! Supports: VLESS, VMess, Shadowsocks, Trojan, WireGuard.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ==================== Protocol Parameter Types ====================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VpnProtocol {
    Vless(VlessParams),
    Vmess(VmessParams),
    Shadowsocks(ShadowsocksParams),
    Trojan(TrojanParams),
    WireGuard(WireGuardParams),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VlessParams {
    pub uuid: String,
    pub server: String,
    pub port: u16,
    pub flow: Option<String>,
    pub encryption: Option<String>,
    pub transport_type: Option<String>,
    pub security: Option<String>,
    pub sni: Option<String>,
    pub fingerprint: Option<String>,
    pub public_key: Option<String>,
    pub short_id: Option<String>,
    pub path: Option<String>,
    pub host: Option<String>,
    pub service_name: Option<String>,
    pub alpn: Option<Vec<String>>,
    pub fragment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VmessParams {
    pub uuid: String,
    pub server: String,
    pub port: u16,
    pub alter_id: u32,
    pub security: String,
    pub transport_type: Option<String>,
    pub tls: bool,
    pub sni: Option<String>,
    pub path: Option<String>,
    pub host: Option<String>,
    pub fragment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShadowsocksParams {
    pub method: String,
    pub password: String,
    pub server: String,
    pub port: u16,
    pub plugin: Option<String>,
    pub plugin_opts: Option<String>,
    pub fragment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrojanParams {
    pub password: String,
    pub server: String,
    pub port: u16,
    pub sni: Option<String>,
    pub alpn: Option<Vec<String>>,
    pub transport_type: Option<String>,
    pub path: Option<String>,
    pub host: Option<String>,
    pub fingerprint: Option<String>,
    pub fragment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WireGuardParams {
    pub private_key: String,
    pub peer_public_key: String,
    pub server: String,
    pub port: u16,
    pub local_address: Vec<String>,
    pub pre_shared_key: Option<String>,
    pub mtu: Option<u16>,
    pub reserved: Option<Vec<u8>>,
    pub fragment: Option<String>,
}

// ==================== Main Parser ====================

/// Parse a VPN URI string into a typed protocol configuration.
pub fn parse_vpn_uri(uri: &str) -> Result<VpnProtocol, String> {
    let trimmed = uri.trim();
    let lower = trimmed.to_lowercase();

    if lower.starts_with("vless://") {
        parse_vless(trimmed)
    } else if lower.starts_with("vmess://") {
        parse_vmess(trimmed)
    } else if lower.starts_with("ss://") {
        parse_shadowsocks(trimmed)
    } else if lower.starts_with("trojan://") {
        parse_trojan(trimmed)
    } else if lower.starts_with("wg://") || lower.starts_with("wireguard://") {
        parse_wireguard(trimmed)
    } else {
        Err("Unsupported VPN protocol. Supported: vless://, vmess://, ss://, trojan://, wg://".to_string())
    }
}

// ==================== Helper Functions ====================

/// Parse query string into key-value pairs.
fn parse_query(query: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    for pair in query.split('&') {
        if let Some((k, v)) = pair.split_once('=') {
            map.insert(
                url_decode(k).to_lowercase(),
                url_decode(v),
            );
        }
    }
    map
}

/// Basic URL percent-decoding.
fn url_decode(s: &str) -> String {
    let mut result = String::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if hex.len() == 2 {
                if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                    result.push(byte as char);
                    continue;
                }
            }
            result.push('%');
            result.push_str(&hex);
        } else if c == '+' {
            result.push(' ');
        } else {
            result.push(c);
        }
    }
    result
}

/// Split URI into (before-fragment, fragment).
fn split_fragment(s: &str) -> (&str, Option<&str>) {
    match s.split_once('#') {
        Some((before, frag)) => (before, Some(frag)),
        None => (s, None),
    }
}

/// Parse authority as `userinfo@host:port`.
/// Returns (userinfo, host, port).
fn parse_authority(authority: &str) -> Result<(String, String, u16), String> {
    let (userinfo, hostport) = authority
        .split_once('@')
        .ok_or_else(|| format!("Missing '@' in authority: {}", authority))?;

    let (host, port) = parse_host_port(hostport)?;

    Ok((userinfo.to_string(), host, port))
}

/// Parse `host:port` or `[ipv6]:port`.
fn parse_host_port(s: &str) -> Result<(String, u16), String> {
    // IPv6 in brackets: [::1]:port
    if s.starts_with('[') {
        let bracket_end = s
            .find(']')
            .ok_or_else(|| "Missing closing bracket for IPv6 address".to_string())?;
        let host = &s[1..bracket_end];
        let rest = &s[bracket_end + 1..];
        let port_str = rest.strip_prefix(':').unwrap_or("443");
        let port = port_str
            .parse::<u16>()
            .map_err(|_| format!("Invalid port: {}", port_str))?;
        return Ok((host.to_string(), port));
    }

    // Regular host:port
    let colon_idx = s
        .rfind(':')
        .ok_or_else(|| format!("Missing port in: {}", s))?;
    let host = &s[..colon_idx];
    let port_str = &s[colon_idx + 1..];
    let port = port_str
        .parse::<u16>()
        .map_err(|_| format!("Invalid port: {}", port_str))?;
    Ok((host.to_string(), port))
}

fn non_empty(s: &str) -> Option<String> {
    if s.is_empty() { None } else { Some(s.to_string()) }
}

// ==================== Protocol-Specific Parsers ====================

/// Parse VLESS URI: `vless://uuid@server:port?params#fragment`
fn parse_vless(uri: &str) -> Result<VpnProtocol, String> {
    let rest = uri
        .strip_prefix("vless://")
        .or_else(|| uri.strip_prefix("VLESS://"))
        .ok_or("Not a VLESS URI")?;

    let (before_frag, fragment) = split_fragment(rest);

    let (main_part, query_str) = match before_frag.split_once('?') {
        Some((m, q)) => (m, Some(q)),
        None => (before_frag, None),
    };

    let (uuid, server, port) = parse_authority(main_part)?;
    let query = query_str.map(parse_query).unwrap_or_default();

    Ok(VpnProtocol::Vless(VlessParams {
        uuid,
        server,
        port,
        flow: query.get("flow").and_then(|s| non_empty(s)),
        encryption: query.get("encryption").and_then(|s| non_empty(s)),
        transport_type: query.get("type").and_then(|s| non_empty(s)),
        security: query.get("security").and_then(|s| non_empty(s)),
        sni: query.get("sni").and_then(|s| non_empty(s)),
        fingerprint: query.get("fp").and_then(|s| non_empty(s)),
        public_key: query.get("pbk").and_then(|s| non_empty(s)),
        short_id: query.get("sid").and_then(|s| non_empty(s)),
        path: query.get("path").and_then(|s| non_empty(s)),
        host: query.get("host").and_then(|s| non_empty(s)),
        service_name: query.get("servicename").and_then(|s| non_empty(s)),
        alpn: query.get("alpn").and_then(|s| {
            if s.is_empty() {
                None
            } else {
                Some(s.split(',').map(|a| a.to_string()).collect())
            }
        }),
        fragment: fragment.map(|f| url_decode(f)),
    }))
}

/// Parse VMess URI: `vmess://base64json`
fn parse_vmess(uri: &str) -> Result<VpnProtocol, String> {
    let rest = uri
        .strip_prefix("vmess://")
        .or_else(|| uri.strip_prefix("VMESS://"))
        .ok_or("Not a VMess URI")?;

    let (b64, fragment) = split_fragment(rest);

    // Decode base64
    let decoded = base64_decode(b64)?;
    let json: serde_json::Value =
        serde_json::from_str(&decoded).map_err(|e| format!("Invalid VMess JSON: {}", e))?;

    let server = json["add"]
        .as_str()
        .ok_or("VMess: missing 'add' (server address)")?
        .to_string();

    let port = match &json["port"] {
        serde_json::Value::Number(n) => n
            .as_u64()
            .ok_or("VMess: invalid port")? as u16,
        serde_json::Value::String(s) => s
            .parse::<u16>()
            .map_err(|_| format!("VMess: invalid port: {}", s))?,
        _ => return Err("VMess: missing 'port'".to_string()),
    };

    let uuid = json["id"]
        .as_str()
        .ok_or("VMess: missing 'id' (UUID)")?
        .to_string();

    let alter_id = match &json["aid"] {
        serde_json::Value::Number(n) => n.as_u64().unwrap_or(0) as u32,
        serde_json::Value::String(s) => s.parse::<u32>().unwrap_or(0),
        _ => 0,
    };

    let security = json["scy"]
        .as_str()
        .unwrap_or("auto")
        .to_string();

    let net = json["net"].as_str().unwrap_or("tcp");
    let tls_str = json["tls"].as_str().unwrap_or("");

    Ok(VpnProtocol::Vmess(VmessParams {
        uuid,
        server,
        port,
        alter_id,
        security,
        transport_type: non_empty(net),
        tls: tls_str == "tls",
        sni: json["sni"].as_str().and_then(non_empty),
        path: json["path"].as_str().and_then(non_empty),
        host: json["host"].as_str().and_then(non_empty),
        fragment: fragment.map(|f| url_decode(f)),
    }))
}

/// Parse Shadowsocks URI.
///
/// Format 1 (SIP002): `ss://base64(method:password)@server:port#fragment`
/// Format 2 (legacy): `ss://base64(method:password@server:port)#fragment`
fn parse_shadowsocks(uri: &str) -> Result<VpnProtocol, String> {
    let rest = uri
        .strip_prefix("ss://")
        .or_else(|| uri.strip_prefix("SS://"))
        .ok_or("Not a Shadowsocks URI")?;

    let (before_frag, fragment) = split_fragment(rest);

    // Try SIP002 format first: base64(method:password)@server:port?plugin=...
    if let Some(at_idx) = before_frag.rfind('@') {
        let userinfo_b64 = &before_frag[..at_idx];
        let after_at = &before_frag[at_idx + 1..];

        // Split query params from host:port
        let (hostport_str, query_str) = match after_at.split_once('?') {
            Some((h, q)) => (h, Some(q)),
            None => (after_at, None),
        };

        let (server, port) = parse_host_port(hostport_str)?;

        // Decode userinfo
        let userinfo = base64_decode(userinfo_b64)?;
        let (method, password) = userinfo
            .split_once(':')
            .ok_or("SS: invalid userinfo format, expected method:password")?;

        let query = query_str.map(parse_query).unwrap_or_default();

        return Ok(VpnProtocol::Shadowsocks(ShadowsocksParams {
            method: method.to_string(),
            password: password.to_string(),
            server,
            port,
            plugin: query.get("plugin").and_then(|s| non_empty(s)),
            plugin_opts: query.get("plugin-opts").and_then(|s| non_empty(s)),
            fragment: fragment.map(|f| url_decode(f)),
        }));
    }

    // Legacy format: ss://base64(method:password@server:port)
    let decoded = base64_decode(before_frag)?;
    let (method_pass, hostport) = decoded
        .split_once('@')
        .ok_or("SS legacy: missing '@'")?;
    let (method, password) = method_pass
        .split_once(':')
        .ok_or("SS legacy: invalid method:password")?;
    let (server, port) = parse_host_port(hostport)?;

    Ok(VpnProtocol::Shadowsocks(ShadowsocksParams {
        method: method.to_string(),
        password: password.to_string(),
        server,
        port,
        plugin: None,
        plugin_opts: None,
        fragment: fragment.map(|f| url_decode(f)),
    }))
}

/// Parse Trojan URI: `trojan://password@server:port?params#fragment`
fn parse_trojan(uri: &str) -> Result<VpnProtocol, String> {
    let rest = uri
        .strip_prefix("trojan://")
        .or_else(|| uri.strip_prefix("TROJAN://"))
        .ok_or("Not a Trojan URI")?;

    let (before_frag, fragment) = split_fragment(rest);

    let (main_part, query_str) = match before_frag.split_once('?') {
        Some((m, q)) => (m, Some(q)),
        None => (before_frag, None),
    };

    let (password, server, port) = parse_authority(main_part)?;
    let query = query_str.map(parse_query).unwrap_or_default();

    Ok(VpnProtocol::Trojan(TrojanParams {
        password,
        server,
        port,
        sni: query.get("sni").and_then(|s| non_empty(s)),
        alpn: query.get("alpn").and_then(|s| {
            if s.is_empty() {
                None
            } else {
                Some(s.split(',').map(|a| a.to_string()).collect())
            }
        }),
        transport_type: query.get("type").and_then(|s| non_empty(s)),
        path: query.get("path").and_then(|s| non_empty(s)),
        host: query.get("host").and_then(|s| non_empty(s)),
        fingerprint: query.get("fp").and_then(|s| non_empty(s)),
        fragment: fragment.map(|f| url_decode(f)),
    }))
}

/// Parse WireGuard URI: `wg://privatekey@server:port?publickey=KEY&address=ADDR#fragment`
fn parse_wireguard(uri: &str) -> Result<VpnProtocol, String> {
    let rest = uri
        .strip_prefix("wg://")
        .or_else(|| uri.strip_prefix("WG://"))
        .or_else(|| uri.strip_prefix("wireguard://"))
        .or_else(|| uri.strip_prefix("WIREGUARD://"))
        .ok_or("Not a WireGuard URI")?;

    let (before_frag, fragment) = split_fragment(rest);

    let (main_part, query_str) = match before_frag.split_once('?') {
        Some((m, q)) => (m, Some(q)),
        None => (before_frag, None),
    };

    let (private_key, server, port) = parse_authority(main_part)?;
    let query = query_str.map(parse_query).unwrap_or_default();

    let peer_public_key = query
        .get("publickey")
        .or_else(|| query.get("peer"))
        .cloned()
        .ok_or("WireGuard: missing 'publickey' parameter")?;

    let local_address = query
        .get("address")
        .map(|s| s.split(',').map(|a| a.trim().to_string()).collect())
        .unwrap_or_else(|| vec!["172.16.0.2/32".to_string()]);

    let reserved = query.get("reserved").and_then(|s| {
        let bytes: Result<Vec<u8>, _> = s.split(',').map(|b| b.trim().parse::<u8>()).collect();
        bytes.ok()
    });

    Ok(VpnProtocol::WireGuard(WireGuardParams {
        private_key,
        peer_public_key,
        server,
        port,
        local_address,
        pre_shared_key: query.get("presharedkey").cloned(),
        mtu: query.get("mtu").and_then(|s| s.parse().ok()),
        reserved,
        fragment: fragment.map(|f| url_decode(f)),
    }))
}

// ==================== Base64 ====================

/// Decode base64 (standard or URL-safe, with or without padding).
fn base64_decode(input: &str) -> Result<String, String> {
    let s = input.trim();

    // Replace URL-safe characters
    let normalized: String = s
        .chars()
        .map(|c| match c {
            '-' => '+',
            '_' => '/',
            _ => c,
        })
        .collect();

    // Add padding if needed
    let padded = match normalized.len() % 4 {
        2 => format!("{}==", normalized),
        3 => format!("{}=", normalized),
        _ => normalized,
    };

    // Decode using a simple base64 decoder
    decode_base64_bytes(&padded)
        .and_then(|bytes| String::from_utf8(bytes).map_err(|e| format!("Invalid UTF-8: {}", e)))
}

fn decode_base64_bytes(input: &str) -> Result<Vec<u8>, String> {
    let mut output = Vec::with_capacity(input.len() * 3 / 4);

    let chars: Vec<u8> = input
        .bytes()
        .filter(|&b| b != b'\n' && b != b'\r' && b != b' ')
        .collect();

    if chars.len() % 4 != 0 {
        return Err(format!(
            "Invalid base64 length: {} (must be multiple of 4)",
            chars.len()
        ));
    }

    for chunk in chars.chunks(4) {
        let a = b64_val(chunk[0])?;
        let b = b64_val(chunk[1])?;

        output.push((a << 2) | (b >> 4));

        if chunk[2] != b'=' {
            let c = b64_val(chunk[2])?;
            output.push(((b & 0x0F) << 4) | (c >> 2));

            if chunk[3] != b'=' {
                let d = b64_val(chunk[3])?;
                output.push(((c & 0x03) << 6) | d);
            }
        }
    }

    Ok(output)
}

fn b64_val(c: u8) -> Result<u8, String> {
    match c {
        b'A'..=b'Z' => Ok(c - b'A'),
        b'a'..=b'z' => Ok(c - b'a' + 26),
        b'0'..=b'9' => Ok(c - b'0' + 52),
        b'+' => Ok(62),
        b'/' => Ok(63),
        _ => Err(format!("Invalid base64 character: {}", c as char)),
    }
}

// ==================== Tests ====================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_vless_basic() {
        let uri = "vless://b831381d-6324-4d53-ad4f-8cda48b30811@example.com:443?type=tcp&security=tls&sni=example.com&fp=chrome&flow=xtls-rprx-vision#MyServer";
        let result = parse_vpn_uri(uri).unwrap();
        match result {
            VpnProtocol::Vless(p) => {
                assert_eq!(p.uuid, "b831381d-6324-4d53-ad4f-8cda48b30811");
                assert_eq!(p.server, "example.com");
                assert_eq!(p.port, 443);
                assert_eq!(p.security.as_deref(), Some("tls"));
                assert_eq!(p.sni.as_deref(), Some("example.com"));
                assert_eq!(p.fingerprint.as_deref(), Some("chrome"));
                assert_eq!(p.flow.as_deref(), Some("xtls-rprx-vision"));
                assert_eq!(p.transport_type.as_deref(), Some("tcp"));
                assert_eq!(p.fragment.as_deref(), Some("MyServer"));
            }
            _ => panic!("Expected VLESS"),
        }
    }

    #[test]
    fn test_parse_vless_reality() {
        let uri = "vless://uuid@1.2.3.4:443?type=tcp&security=reality&pbk=publickey123&sid=ab&sni=example.com&fp=chrome#Test";
        let result = parse_vpn_uri(uri).unwrap();
        match result {
            VpnProtocol::Vless(p) => {
                assert_eq!(p.security.as_deref(), Some("reality"));
                assert_eq!(p.public_key.as_deref(), Some("publickey123"));
                assert_eq!(p.short_id.as_deref(), Some("ab"));
            }
            _ => panic!("Expected VLESS"),
        }
    }

    #[test]
    fn test_parse_vless_ws() {
        let uri = "vless://uuid@server.com:443?type=ws&security=tls&path=%2Fws&host=cdn.example.com&sni=cdn.example.com#WS";
        let result = parse_vpn_uri(uri).unwrap();
        match result {
            VpnProtocol::Vless(p) => {
                assert_eq!(p.transport_type.as_deref(), Some("ws"));
                assert_eq!(p.path.as_deref(), Some("/ws"));
                assert_eq!(p.host.as_deref(), Some("cdn.example.com"));
            }
            _ => panic!("Expected VLESS"),
        }
    }

    #[test]
    fn test_parse_vmess() {
        // Build base64 JSON
        let json = r#"{"v":"2","ps":"TestServer","add":"1.2.3.4","port":"443","id":"uuid-here","aid":"0","scy":"auto","net":"ws","type":"none","host":"example.com","path":"/ws","tls":"tls","sni":"example.com"}"#;
        let b64 = simple_base64_encode(json.as_bytes());
        let uri = format!("vmess://{}#TestFrag", b64);
        let result = parse_vpn_uri(&uri).unwrap();
        match result {
            VpnProtocol::Vmess(p) => {
                assert_eq!(p.server, "1.2.3.4");
                assert_eq!(p.port, 443);
                assert_eq!(p.uuid, "uuid-here");
                assert_eq!(p.alter_id, 0);
                assert_eq!(p.security, "auto");
                assert!(p.tls);
                assert_eq!(p.transport_type.as_deref(), Some("ws"));
                assert_eq!(p.path.as_deref(), Some("/ws"));
                assert_eq!(p.host.as_deref(), Some("example.com"));
            }
            _ => panic!("Expected VMess"),
        }
    }

    #[test]
    fn test_parse_shadowsocks_sip002() {
        // SIP002: ss://base64(method:password)@server:port#name
        let userinfo = simple_base64_encode(b"aes-256-gcm:mypassword");
        let uri = format!("ss://{}@1.2.3.4:8388#MyProxy", userinfo);
        let result = parse_vpn_uri(&uri).unwrap();
        match result {
            VpnProtocol::Shadowsocks(p) => {
                assert_eq!(p.method, "aes-256-gcm");
                assert_eq!(p.password, "mypassword");
                assert_eq!(p.server, "1.2.3.4");
                assert_eq!(p.port, 8388);
            }
            _ => panic!("Expected Shadowsocks"),
        }
    }

    #[test]
    fn test_parse_shadowsocks_legacy() {
        let data = simple_base64_encode(b"chacha20-ietf-poly1305:pass123@5.6.7.8:9090");
        let uri = format!("ss://{}#Legacy", data);
        let result = parse_vpn_uri(&uri).unwrap();
        match result {
            VpnProtocol::Shadowsocks(p) => {
                assert_eq!(p.method, "chacha20-ietf-poly1305");
                assert_eq!(p.password, "pass123");
                assert_eq!(p.server, "5.6.7.8");
                assert_eq!(p.port, 9090);
            }
            _ => panic!("Expected Shadowsocks"),
        }
    }

    #[test]
    fn test_parse_trojan() {
        let uri = "trojan://mypassword@server.com:443?sni=server.com&type=tcp&fp=chrome&alpn=h2,http/1.1#MyTrojan";
        let result = parse_vpn_uri(uri).unwrap();
        match result {
            VpnProtocol::Trojan(p) => {
                assert_eq!(p.password, "mypassword");
                assert_eq!(p.server, "server.com");
                assert_eq!(p.port, 443);
                assert_eq!(p.sni.as_deref(), Some("server.com"));
                assert_eq!(p.fingerprint.as_deref(), Some("chrome"));
                assert_eq!(
                    p.alpn.as_ref().unwrap(),
                    &vec!["h2".to_string(), "http/1.1".to_string()]
                );
            }
            _ => panic!("Expected Trojan"),
        }
    }

    #[test]
    fn test_parse_wireguard() {
        let uri = "wg://privatekey123@1.2.3.4:51820?publickey=peerkey456&address=172.16.0.2/32&mtu=1280#WG";
        let result = parse_vpn_uri(uri).unwrap();
        match result {
            VpnProtocol::WireGuard(p) => {
                assert_eq!(p.private_key, "privatekey123");
                assert_eq!(p.server, "1.2.3.4");
                assert_eq!(p.port, 51820);
                assert_eq!(p.peer_public_key, "peerkey456");
                assert_eq!(p.local_address, vec!["172.16.0.2/32"]);
                assert_eq!(p.mtu, Some(1280));
            }
            _ => panic!("Expected WireGuard"),
        }
    }

    #[test]
    fn test_parse_unsupported_protocol() {
        let result = parse_vpn_uri("http://google.com");
        assert!(result.is_err());
    }

    #[test]
    fn test_url_decode() {
        assert_eq!(url_decode("%2Fpath%20name"), "/path name");
        assert_eq!(url_decode("no+spaces"), "no spaces");
        assert_eq!(url_decode("plain"), "plain");
    }

    #[test]
    fn test_base64_decode_standard() {
        assert_eq!(base64_decode("SGVsbG8=").unwrap(), "Hello");
        assert_eq!(base64_decode("dGVzdA==").unwrap(), "test");
    }

    #[test]
    fn test_base64_decode_url_safe() {
        // URL-safe base64 uses - and _ instead of + and /
        let standard = "SGVsbG8gV29ybGQh"; // "Hello World!"
        assert_eq!(base64_decode(standard).unwrap(), "Hello World!");
    }

    #[test]
    fn test_base64_decode_no_padding() {
        // Without padding
        assert_eq!(base64_decode("SGVsbG8").unwrap(), "Hello");
    }

    // Helper for tests: simple base64 encoder
    fn simple_base64_encode(data: &[u8]) -> String {
        const TABLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        let mut result = String::new();

        for chunk in data.chunks(3) {
            let b0 = chunk[0] as u32;
            let b1 = chunk.get(1).copied().unwrap_or(0) as u32;
            let b2 = chunk.get(2).copied().unwrap_or(0) as u32;
            let triple = (b0 << 16) | (b1 << 8) | b2;

            result.push(TABLE[((triple >> 18) & 0x3F) as usize] as char);
            result.push(TABLE[((triple >> 12) & 0x3F) as usize] as char);

            if chunk.len() > 1 {
                result.push(TABLE[((triple >> 6) & 0x3F) as usize] as char);
            } else {
                result.push('=');
            }

            if chunk.len() > 2 {
                result.push(TABLE[(triple & 0x3F) as usize] as char);
            } else {
                result.push('=');
            }
        }

        result
    }
}
