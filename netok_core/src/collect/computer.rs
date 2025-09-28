use hostname::get as get_hostname;
use crate::model::{ComputerNode, ConnectionType};
use crate::collect::active_interface::get_active_interface;

#[cfg(windows)]
use crate::collect::win_wlan::wlan_conn_info_for_interface_guid;

pub fn collect_computer() -> ComputerNode {
    let hostname = get_hostname()
        .ok()
        .and_then(|s| s.into_string().ok());

    // Get the active network interface with enriched information
    let active_interface = get_active_interface();

    // Windows-specific Wi-Fi information collection
    let mut rssi_dbm = active_interface.rssi_dbm;
    let mut wifi_ssid = None;
    let mut wifi_bssid = None;
    
    #[cfg(windows)]
    {
        if active_interface.connection_type == ConnectionType::Wifi {
            if let Some(guid_str) = active_interface.interface_name.as_deref() {
                // SAFETY: WLAN API is unsafe; we encapsulate inside function
                if let Some(info) = unsafe { wlan_conn_info_for_interface_guid(guid_str) } {
                    // RSSI приоритетно из BSS, иначе аппроксимация из quality
                    if rssi_dbm.is_none() {
                        if let Some(v) = info.rssi_dbm {
                            rssi_dbm = Some(v);
                        } else if let Some(q) = info.quality_0_100 {
                            rssi_dbm = Some((q as i32 / 2) - 100);
                        }
                    }
                    wifi_ssid = info.ssid;
                    wifi_bssid = info.bssid;
                    
                    if let Some(rssi_val) = rssi_dbm {
                        eprintln!("[Netok core] Wi-Fi RSSI for {}: {} dBm", guid_str, rssi_val);
                    }
                }
            }
        }
    }

    ComputerNode {
        hostname,
        model: None, // Will be implemented later
        interface_name: active_interface.interface_name,
        adapter_friendly: active_interface.adapter_friendly,
        adapter_model: active_interface.adapter_model,
        connection_type: active_interface.connection_type,
        local_ip: active_interface.local_ip,
        rssi_dbm,
        wifi_ssid,
        wifi_bssid,
        oper_up: active_interface.oper_up,
    }
}
