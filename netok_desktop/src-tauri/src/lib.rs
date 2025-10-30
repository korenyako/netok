// Re-export types from netok_bridge
pub use netok_bridge::{Snapshot, NodeResult, Speed};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn get_settings() -> String {
    netok_bridge::get_settings_json()
}

#[tauri::command]
fn set_settings(json: String) -> Result<(), String> {
    netok_bridge::set_settings_json(&json).map(|_| ()).map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_diagnostics() -> Result<netok_bridge::Snapshot, String> {
    netok_bridge::run_diagnostics_struct()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn run_all() -> Result<serde_json::Value, String> {
    // Simple test JSON with hostname, local_ip, isp, etc.
    let data = serde_json::json!({
        "hostname": "test-hostname",
        "local_ip": "192.168.1.100",
        "isp": "Test ISP",
        "public_ip": "203.0.113.1",
        "status": "connected"
    });
    Ok(data)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_settings, set_settings, run_diagnostics, run_all])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
