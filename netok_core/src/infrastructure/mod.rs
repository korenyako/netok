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
pub mod mdns;
pub mod security;
pub mod vpn;
pub mod wifi;

/// Create a [`std::process::Command`] that hides the console window on Windows.
///
/// In release builds the app uses `windows_subsystem = "windows"`, so child
/// processes would create visible console windows without `CREATE_NO_WINDOW`.
#[cfg(target_os = "windows")]
pub fn hidden_cmd(program: &str) -> std::process::Command {
    use std::os::windows::process::CommandExt;
    let mut cmd = std::process::Command::new(program);
    cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    cmd
}

// Re-export commonly used functions
pub use arp::{get_router_mac, ping_sweep};
pub use connection::detect_connection_type;
pub use dns::{build_dns_commands, get_current_dns, reverse_dns_lookup, set_dns};
pub use gateway::get_default_gateway;
pub use mdns::mdns_discover;
pub use security::check_wifi_security;
pub use wifi::get_wifi_info;
