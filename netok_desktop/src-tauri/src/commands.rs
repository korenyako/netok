use netok_core::{run_diagnostics, get_default_settings, DiagnosticsSnapshot};

#[tauri::command]
pub fn get_snapshot() -> Result<DiagnosticsSnapshot, String> {
    let settings = get_default_settings();
    Ok(run_diagnostics(&settings))
}
