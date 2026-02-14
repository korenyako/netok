//! Platform-specific infrastructure implementations.
//!
//! This module contains OS-specific code for network operations:
//! - Wi-Fi information retrieval
//! - Gateway/router discovery
//! - ARP lookups
//! - DNS configuration
//!
//! Each submodule provides platform-specific implementations via `#[cfg(...)]`.

pub mod adapter;
pub mod arp;
pub mod connection;
pub mod dns;
pub mod gateway;
pub mod security;
pub mod vpn;
pub mod wifi;

// Re-export commonly used functions
pub use arp::{get_router_mac, ping_sweep};
pub use connection::detect_connection_type;
pub use dns::{get_current_dns, reverse_dns_lookup, set_dns};
pub use gateway::get_default_gateway;
pub use security::check_wifi_security;
pub use wifi::get_wifi_info;
