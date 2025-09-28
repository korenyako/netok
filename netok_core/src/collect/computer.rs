use hostname::get as get_hostname;
use crate::model::ComputerNode;
use crate::collect::active_interface::get_active_interface;

pub fn collect_computer() -> ComputerNode {
    let hostname = get_hostname()
        .ok()
        .and_then(|s| s.into_string().ok());

    // Get the active network interface with enriched information
    let active_interface = get_active_interface();

    ComputerNode {
        hostname,
        model: None, // Will be implemented later
        interface_name: active_interface.interface_name,
        adapter_friendly: active_interface.adapter_friendly,
        adapter_model: active_interface.adapter_model,
        connection_type: active_interface.connection_type,
        local_ip: active_interface.local_ip,
        rssi_dbm: active_interface.rssi_dbm,
    }
}
