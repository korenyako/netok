use netok_core::{run_diagnostics, get_default_settings, Settings};
// use serde::{Deserialize, Serialize};

#[derive(thiserror::Error, Debug)]
pub enum BridgeError {
    #[error("invalid json: {0}")]
    InvalidJson(String),
}

pub fn get_settings_json() -> String {
    serde_json::to_string(&get_default_settings()).unwrap()
}

pub fn set_settings_json(json: &str) -> Result<Settings, BridgeError> {
    serde_json::from_str::<Settings>(json).map_err(|e| BridgeError::InvalidJson(e.to_string()))
}

pub fn run_diagnostics_json(settings_json: Option<&str>) -> Result<String, BridgeError> {
    let settings = match settings_json {
        Some(s) => set_settings_json(s)?,
        None => get_default_settings(),
    };
    let snapshot = run_diagnostics(&settings);
    Ok(serde_json::to_string(&snapshot).unwrap())
}
