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
fn run_diagnostics(settings_json: Option<String>) -> Result<String, String> {
    netok_bridge::run_diagnostics_json(settings_json.as_deref()).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_settings, set_settings, run_diagnostics])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
