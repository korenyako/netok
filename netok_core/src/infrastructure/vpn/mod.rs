//! VPN URI parsing and sing-box configuration generation.

pub mod config;
pub mod uri_parser;

pub use config::{generate_singbox_config, generate_singbox_config_with_log};
pub use uri_parser::{
    parse_vpn_uri, ShadowsocksParams, TrojanParams, VlessParams, VmessParams, VpnProtocol,
    WireGuardParams,
};
