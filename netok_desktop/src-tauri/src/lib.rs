// Re-export types from netok_bridge
pub use netok_bridge::{Snapshot, NodeResult, Speed};

mod commands;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_settings, set_settings, run_diagnostics, commands::get_snapshot, commands::get_snapshot_json_debug, commands::set_dns, commands::flush_dns_cache])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
