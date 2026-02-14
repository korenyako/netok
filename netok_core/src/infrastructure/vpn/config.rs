//! sing-box configuration generator.
//!
//! Converts parsed VPN protocol parameters into a complete sing-box JSON config
//! suitable for TUN mode operation.

use serde_json::{json, Value};

use super::uri_parser::*;

/// Generate a complete sing-box config JSON for the given VPN protocol.
pub fn generate_singbox_config(protocol: &VpnProtocol) -> Result<Value, String> {
    let outbound = match protocol {
        VpnProtocol::Vless(p) => generate_vless_outbound(p),
        VpnProtocol::Vmess(p) => generate_vmess_outbound(p),
        VpnProtocol::Shadowsocks(p) => generate_ss_outbound(p),
        VpnProtocol::Trojan(p) => generate_trojan_outbound(p),
        VpnProtocol::WireGuard(p) => generate_wireguard_outbound(p),
    }?;

    // sing-box 1.12+ config format
    Ok(json!({
        "log": {
            "level": "warn",
            "timestamp": true
        },
        "dns": {
            "servers": [
                {
                    "tag": "remote-dns",
                    "type": "https",
                    "server": "1.1.1.1",
                    "detour": "proxy"
                },
                {
                    "tag": "local-dns",
                    "type": "local",
                    "detour": "direct"
                }
            ],
            "rules": [
                {
                    "outbound": ["any"],
                    "server": "local-dns"
                }
            ]
        },
        "inbounds": [{
            "type": "tun",
            "tag": "tun-in",
            "address": ["172.19.0.1/30"],
            "auto_route": true,
            "strict_route": true,
            "stack": "system",
            "sniff": true,
            "sniff_override_destination": true
        }],
        "outbounds": [
            outbound,
            { "type": "direct", "tag": "direct" }
        ],
        "route": {
            "rules": [
                { "protocol": "dns", "action": "hijack-dns" }
            ],
            "auto_detect_interface": true,
            "final": "proxy"
        }
    }))
}

// ==================== Protocol-Specific Outbound Generators ====================

fn generate_vless_outbound(p: &VlessParams) -> Result<Value, String> {
    let mut outbound = json!({
        "type": "vless",
        "tag": "proxy",
        "server": p.server,
        "server_port": p.port,
        "uuid": p.uuid,
    });

    if let Some(ref flow) = p.flow {
        outbound["flow"] = json!(flow);
    }

    // TLS / Reality
    let security = p.security.as_deref().unwrap_or("none");
    if security == "tls" || security == "reality" {
        let mut tls = json!({ "enabled": true });

        if let Some(ref sni) = p.sni {
            tls["server_name"] = json!(sni);
        }

        if security == "reality" {
            let mut reality = json!({ "enabled": true });
            if let Some(ref pk) = p.public_key {
                reality["public_key"] = json!(pk);
            }
            if let Some(ref sid) = p.short_id {
                reality["short_id"] = json!(sid);
            }
            tls["reality"] = reality;
        }

        if let Some(ref fp) = p.fingerprint {
            tls["utls"] = json!({ "enabled": true, "fingerprint": fp });
        }

        if let Some(ref alpn) = p.alpn {
            tls["alpn"] = json!(alpn);
        }

        outbound["tls"] = tls;
    }

    // Transport
    add_transport(
        &mut outbound,
        p.transport_type.as_deref(),
        p.path.as_deref(),
        p.host.as_deref(),
        p.service_name.as_deref(),
    );

    Ok(outbound)
}

fn generate_vmess_outbound(p: &VmessParams) -> Result<Value, String> {
    let mut outbound = json!({
        "type": "vmess",
        "tag": "proxy",
        "server": p.server,
        "server_port": p.port,
        "uuid": p.uuid,
        "alter_id": p.alter_id,
        "security": p.security,
    });

    if p.tls {
        let mut tls = json!({ "enabled": true });
        if let Some(ref sni) = p.sni {
            tls["server_name"] = json!(sni);
        }
        outbound["tls"] = tls;
    }

    // Transport
    add_transport(
        &mut outbound,
        p.transport_type.as_deref(),
        p.path.as_deref(),
        p.host.as_deref(),
        None,
    );

    Ok(outbound)
}

fn generate_ss_outbound(p: &ShadowsocksParams) -> Result<Value, String> {
    let mut outbound = json!({
        "type": "shadowsocks",
        "tag": "proxy",
        "server": p.server,
        "server_port": p.port,
        "method": p.method,
        "password": p.password,
    });

    if let Some(ref plugin) = p.plugin {
        outbound["plugin"] = json!(plugin);
        if let Some(ref opts) = p.plugin_opts {
            outbound["plugin_opts"] = json!(opts);
        }
    }

    Ok(outbound)
}

fn generate_trojan_outbound(p: &TrojanParams) -> Result<Value, String> {
    let mut outbound = json!({
        "type": "trojan",
        "tag": "proxy",
        "server": p.server,
        "server_port": p.port,
        "password": p.password,
    });

    // Trojan always uses TLS
    let mut tls = json!({ "enabled": true });
    if let Some(ref sni) = p.sni {
        tls["server_name"] = json!(sni);
    }
    if let Some(ref fp) = p.fingerprint {
        tls["utls"] = json!({ "enabled": true, "fingerprint": fp });
    }
    if let Some(ref alpn) = p.alpn {
        tls["alpn"] = json!(alpn);
    }
    outbound["tls"] = tls;

    // Transport
    add_transport(
        &mut outbound,
        p.transport_type.as_deref(),
        p.path.as_deref(),
        p.host.as_deref(),
        None,
    );

    Ok(outbound)
}

fn generate_wireguard_outbound(p: &WireGuardParams) -> Result<Value, String> {
    let mut outbound = json!({
        "type": "wireguard",
        "tag": "proxy",
        "server": p.server,
        "server_port": p.port,
        "private_key": p.private_key,
        "peer_public_key": p.peer_public_key,
        "local_address": p.local_address,
    });

    if let Some(ref psk) = p.pre_shared_key {
        outbound["pre_shared_key"] = json!(psk);
    }

    if let Some(mtu) = p.mtu {
        outbound["mtu"] = json!(mtu);
    }

    if let Some(ref reserved) = p.reserved {
        outbound["reserved"] = json!(reserved);
    }

    Ok(outbound)
}

// ==================== Shared Helpers ====================

/// Add transport configuration to an outbound if the transport type is not "tcp".
fn add_transport(
    outbound: &mut Value,
    transport_type: Option<&str>,
    path: Option<&str>,
    host: Option<&str>,
    service_name: Option<&str>,
) {
    let tt = transport_type.unwrap_or("tcp");
    if tt == "tcp" {
        return;
    }

    let mut transport = json!({ "type": tt });

    match tt {
        "ws" => {
            if let Some(p) = path {
                transport["path"] = json!(p);
            }
            if let Some(h) = host {
                transport["headers"] = json!({ "Host": h });
            }
        }
        "grpc" => {
            if let Some(sn) = service_name {
                transport["service_name"] = json!(sn);
            }
        }
        "http" | "h2" => {
            if let Some(p) = path {
                transport["path"] = json!(p);
            }
            if let Some(h) = host {
                transport["host"] = json!([h]);
            }
        }
        _ => {}
    }

    outbound["transport"] = transport;
}

// ==================== Tests ====================

#[cfg(test)]
mod tests {
    use super::*;
    use crate::infrastructure::vpn::uri_parser::parse_vpn_uri;

    #[test]
    fn test_vless_config_structure() {
        let uri =
            "vless://test-uuid@1.2.3.4:443?type=tcp&security=tls&sni=example.com&fp=chrome#Test";
        let protocol = parse_vpn_uri(uri).unwrap();
        let config = generate_singbox_config(&protocol).unwrap();

        // Check top-level structure
        assert!(config["log"].is_object());
        assert!(config["dns"].is_object());
        assert!(config["inbounds"].is_array());
        assert!(config["outbounds"].is_array());
        assert!(config["route"].is_object());

        // Check inbound is TUN
        assert_eq!(config["inbounds"][0]["type"], "tun");
        assert_eq!(config["inbounds"][0]["auto_route"], true);

        // Check outbound
        assert_eq!(config["outbounds"][0]["type"], "vless");
        assert_eq!(config["outbounds"][0]["server"], "1.2.3.4");
        assert_eq!(config["outbounds"][0]["server_port"], 443);
        assert_eq!(config["outbounds"][0]["uuid"], "test-uuid");
        assert_eq!(config["outbounds"][0]["tls"]["enabled"], true);
        assert_eq!(config["outbounds"][0]["tls"]["server_name"], "example.com");
        assert_eq!(
            config["outbounds"][0]["tls"]["utls"]["fingerprint"],
            "chrome"
        );

        // Check direct outbound (no dns-out in 1.12+)
        assert_eq!(config["outbounds"][1]["type"], "direct");

        // Check route uses hijack-dns action
        assert_eq!(config["route"]["final"], "proxy");
        assert_eq!(config["route"]["auto_detect_interface"], true);
        assert_eq!(config["route"]["rules"][0]["action"], "hijack-dns");
    }

    #[test]
    fn test_vless_reality_config() {
        let uri = "vless://uuid@1.2.3.4:443?type=tcp&security=reality&pbk=pk123&sid=ab&sni=example.com&fp=chrome#Test";
        let protocol = parse_vpn_uri(uri).unwrap();
        let config = generate_singbox_config(&protocol).unwrap();

        let tls = &config["outbounds"][0]["tls"];
        assert_eq!(tls["enabled"], true);
        assert_eq!(tls["reality"]["enabled"], true);
        assert_eq!(tls["reality"]["public_key"], "pk123");
        assert_eq!(tls["reality"]["short_id"], "ab");
    }

    #[test]
    fn test_vless_ws_config() {
        let uri = "vless://uuid@1.2.3.4:443?type=ws&security=tls&path=%2Fws&host=cdn.example.com&sni=cdn.example.com#WS";
        let protocol = parse_vpn_uri(uri).unwrap();
        let config = generate_singbox_config(&protocol).unwrap();

        let transport = &config["outbounds"][0]["transport"];
        assert_eq!(transport["type"], "ws");
        assert_eq!(transport["path"], "/ws");
        assert_eq!(transport["headers"]["Host"], "cdn.example.com");
    }

    #[test]
    fn test_trojan_config() {
        let uri =
            "trojan://password@server.com:443?sni=server.com&fp=chrome&alpn=h2,http/1.1#Trojan";
        let protocol = parse_vpn_uri(uri).unwrap();
        let config = generate_singbox_config(&protocol).unwrap();

        let outbound = &config["outbounds"][0];
        assert_eq!(outbound["type"], "trojan");
        assert_eq!(outbound["password"], "password");
        assert_eq!(outbound["tls"]["enabled"], true);
        assert_eq!(outbound["tls"]["server_name"], "server.com");
    }

    #[test]
    fn test_shadowsocks_config() {
        let protocol = VpnProtocol::Shadowsocks(ShadowsocksParams {
            method: "aes-256-gcm".to_string(),
            password: "mypass".to_string(),
            server: "1.2.3.4".to_string(),
            port: 8388,
            plugin: None,
            plugin_opts: None,
            fragment: None,
        });
        let config = generate_singbox_config(&protocol).unwrap();

        let outbound = &config["outbounds"][0];
        assert_eq!(outbound["type"], "shadowsocks");
        assert_eq!(outbound["method"], "aes-256-gcm");
        assert_eq!(outbound["password"], "mypass");
    }

    #[test]
    fn test_wireguard_config() {
        let protocol = VpnProtocol::WireGuard(WireGuardParams {
            private_key: "privkey".to_string(),
            peer_public_key: "pubkey".to_string(),
            server: "1.2.3.4".to_string(),
            port: 51820,
            local_address: vec!["172.16.0.2/32".to_string()],
            pre_shared_key: Some("psk".to_string()),
            mtu: Some(1280),
            reserved: None,
            fragment: None,
        });
        let config = generate_singbox_config(&protocol).unwrap();

        let outbound = &config["outbounds"][0];
        assert_eq!(outbound["type"], "wireguard");
        assert_eq!(outbound["private_key"], "privkey");
        assert_eq!(outbound["peer_public_key"], "pubkey");
        assert_eq!(outbound["mtu"], 1280);
        assert_eq!(outbound["pre_shared_key"], "psk");
    }

    #[test]
    fn test_config_serializable() {
        let uri = "vless://uuid@1.2.3.4:443?type=tcp&security=tls&sni=example.com#Test";
        let protocol = parse_vpn_uri(uri).unwrap();
        let config = generate_singbox_config(&protocol).unwrap();

        // Must be valid JSON
        let json_str = serde_json::to_string_pretty(&config).unwrap();
        assert!(!json_str.is_empty());
        // Must roundtrip
        let _parsed: Value = serde_json::from_str(&json_str).unwrap();
    }
}
