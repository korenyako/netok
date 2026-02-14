use std::path::PathBuf;
use std::sync::{Arc, Mutex};

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};

// Re-export types from netok_bridge
pub use netok_bridge::{DnsProviderType, IpInfoResponse, SingleNodeResult, Snapshot};

// ==================== VPN State ====================

struct VpnProcessState {
    elevated_pid: Option<u32>,
    state: netok_bridge::VpnConnectionState,
    config_path: Option<PathBuf>,
}

impl Default for VpnProcessState {
    fn default() -> Self {
        Self {
            elevated_pid: None,
            state: netok_bridge::VpnConnectionState::Disconnected,
            config_path: None,
        }
    }
}

// ==================== Windows Elevation ====================

#[cfg(target_os = "windows")]
mod win_elevation {
    use std::path::Path;

    /// Spawn a process elevated (with UAC prompt) and return its PID.
    pub fn spawn_elevated(exe_path: &Path, args: &str, working_dir: &Path) -> Result<u32, String> {
        use std::ffi::OsStr;
        use std::mem;
        use std::os::windows::ffi::OsStrExt;

        use windows::core::PCWSTR;
        use windows::Win32::Foundation::CloseHandle;
        use windows::Win32::System::Threading::GetProcessId;
        use windows::Win32::UI::Shell::{
            ShellExecuteExW, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOW,
        };

        fn to_wide_null(s: &str) -> Vec<u16> {
            OsStr::new(s)
                .encode_wide()
                .chain(std::iter::once(0))
                .collect()
        }

        let verb = to_wide_null("runas");
        let file = to_wide_null(&exe_path.to_string_lossy());
        let params = to_wide_null(args);
        let dir = to_wide_null(&working_dir.to_string_lossy());

        let mut sei: SHELLEXECUTEINFOW = unsafe { mem::zeroed() };
        sei.cbSize = mem::size_of::<SHELLEXECUTEINFOW>() as u32;
        sei.fMask = SEE_MASK_NOCLOSEPROCESS;
        sei.lpVerb = PCWSTR(verb.as_ptr());
        sei.lpFile = PCWSTR(file.as_ptr());
        sei.lpParameters = PCWSTR(params.as_ptr());
        sei.lpDirectory = PCWSTR(dir.as_ptr());
        sei.nShow = 0; // SW_HIDE

        unsafe { ShellExecuteExW(&mut sei) }.map_err(|e| {
            format!(
                "Failed to launch elevated process (UAC denied or error): {}",
                e
            )
        })?;

        let hprocess = sei.hProcess;
        if hprocess.is_invalid() {
            return Err("Process handle is invalid".to_string());
        }

        let pid = unsafe { GetProcessId(hprocess) };
        // Close the handle — we track by PID
        let _ = unsafe { CloseHandle(hprocess) };

        if pid == 0 {
            return Err("Failed to get process ID".to_string());
        }

        Ok(pid)
    }

    /// Check if a process with the given PID is still running.
    pub fn is_process_alive(pid: u32) -> bool {
        use windows::Win32::Foundation::CloseHandle;
        use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};

        let handle = unsafe { OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid) };
        match handle {
            Ok(h) => {
                let _ = unsafe { CloseHandle(h) };
                true
            }
            Err(_) => false,
        }
    }

    /// Kill a process by PID using taskkill.
    pub fn kill_process(pid: u32) -> Result<(), String> {
        use std::process::Command;

        let output = Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string()])
            .output()
            .map_err(|e| format!("Failed to execute taskkill: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            let stderr = String::from_utf8_lossy(&output.stderr);
            // Process already exited — not an error
            if stderr.contains("not found") {
                Ok(())
            } else {
                Err(format!("taskkill failed: {}", stderr))
            }
        }
    }
}

// ==================== Existing Commands ====================

#[tauri::command]
fn get_settings() -> String {
    netok_bridge::get_settings_json()
}

#[tauri::command]
fn set_settings(json: String) -> Result<(), String> {
    netok_bridge::set_settings_json(&json)
        .map(|_| ())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn run_diagnostics() -> Result<netok_bridge::Snapshot, String> {
    netok_bridge::run_diagnostics_struct()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_dns(provider: DnsProviderType) -> Result<(), String> {
    netok_bridge::set_dns_provider(provider)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_dns_provider() -> Result<DnsProviderType, String> {
    netok_bridge::get_dns_provider()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_dns_servers() -> Result<Vec<String>, String> {
    netok_bridge::get_dns_servers()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn test_dns_server(server_ip: String) -> Result<bool, String> {
    netok_bridge::test_dns_server_reachable(server_ip)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn run_all() -> Result<serde_json::Value, String> {
    let data = serde_json::json!({
        "hostname": "test-hostname",
        "local_ip": "192.168.1.100",
        "isp": "Test ISP",
        "public_ip": "203.0.113.1",
        "status": "connected"
    });
    Ok(data)
}

// ==================== IP Geolocation ====================

#[tauri::command]
async fn lookup_ip_location(ip: String) -> Result<IpInfoResponse, String> {
    netok_bridge::lookup_ip_location(ip)
        .await
        .map_err(|e| e.to_string())
}

// ==================== Progressive Diagnostics Commands ====================

#[tauri::command]
async fn check_computer() -> Result<SingleNodeResult, String> {
    netok_bridge::check_computer_node()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_network(adapter: Option<String>) -> Result<SingleNodeResult, String> {
    netok_bridge::check_network_node(adapter)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_router() -> Result<SingleNodeResult, String> {
    netok_bridge::check_router_node()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_internet() -> Result<SingleNodeResult, String> {
    netok_bridge::check_internet_node()
        .await
        .map_err(|e| e.to_string())
}

// ==================== Device Scan ====================

#[tauri::command]
async fn scan_network_devices() -> Result<Vec<netok_bridge::NetworkDevice>, String> {
    netok_bridge::scan_network_devices().await
}

// ==================== WiFi Security ====================

#[tauri::command]
async fn check_wifi_security() -> Result<netok_bridge::WiFiSecurityReport, String> {
    netok_bridge::check_wifi_security().await
}

// ==================== VPN Commands ====================

#[tauri::command]
async fn validate_vpn_key(raw_uri: String) -> Result<netok_bridge::VpnKeyValidation, String> {
    netok_bridge::validate_vpn_key(raw_uri).await
}

/// Resolve the sing-box sidecar binary path.
/// Checks resource dir (production), then src-tauri/binaries/ (dev mode).
fn get_singbox_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let exe_name = if cfg!(target_os = "windows") {
        "sing-box-x86_64-pc-windows-msvc.exe"
    } else if cfg!(target_os = "macos") {
        "sing-box-aarch64-apple-darwin"
    } else {
        "sing-box-x86_64-unknown-linux-gnu"
    };

    // 1. Resource dir (production bundle)
    if let Ok(resource_dir) = app.path().resource_dir() {
        let path = resource_dir.join("binaries").join(exe_name);
        if path.exists() {
            return Ok(path);
        }
    }

    // 2. src-tauri/binaries/ (dev mode — CARGO_MANIFEST_DIR set at compile time)
    let dev_path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("binaries")
        .join(exe_name);
    if dev_path.exists() {
        return Ok(dev_path);
    }

    Err(format!(
        "sing-box binary not found. Place {} in src-tauri/binaries/",
        exe_name
    ))
}

/// Get the path for the sing-box config file in app data dir.
fn get_config_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&data_dir).map_err(|e| format!("Failed to create data dir: {}", e))?;

    Ok(data_dir.join("singbox-config.json"))
}

#[tauri::command]
async fn connect_vpn(
    app: tauri::AppHandle,
    vpn_state: tauri::State<'_, Arc<Mutex<VpnProcessState>>>,
    raw_uri: String,
) -> Result<(), String> {
    // Step 1: Generate sing-box config from URI
    let config_json = netok_bridge::generate_vpn_config(&raw_uri)?;

    // Step 2: Write config to disk
    let config_path = get_config_path(&app)?;
    std::fs::write(&config_path, &config_json)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    // Step 3: Resolve sing-box binary path
    let singbox_path = get_singbox_path(&app)?;

    // Step 4: Set state to Connecting
    {
        let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
        state.state = netok_bridge::VpnConnectionState::Connecting;
        state.config_path = Some(config_path.clone());
    }

    // Step 5: Spawn elevated process (Windows only)
    #[cfg(target_os = "windows")]
    {
        let args = format!("run -c \"{}\"", config_path.to_string_lossy());
        let working_dir = config_path.parent().unwrap().to_path_buf();
        let singbox_path_clone = singbox_path;

        let pid_result = tokio::task::spawn_blocking(move || {
            win_elevation::spawn_elevated(&singbox_path_clone, &args, &working_dir)
        })
        .await
        .map_err(|e| format!("Task error: {}", e))?;

        match pid_result {
            Ok(pid) => {
                eprintln!("[VPN] sing-box started with PID: {}", pid);

                // Store PID
                {
                    let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
                    state.elevated_pid = Some(pid);
                }

                // Step 6: Wait for sing-box to initialize TUN interface
                tokio::time::sleep(std::time::Duration::from_secs(3)).await;

                // Step 7: Verify process is still alive
                let alive =
                    tokio::task::spawn_blocking(move || win_elevation::is_process_alive(pid))
                        .await
                        .map_err(|e| e.to_string())?;

                if !alive {
                    let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
                    state.state = netok_bridge::VpnConnectionState::Error {
                        message: "sing-box process exited immediately after start".to_string(),
                    };
                    state.elevated_pid = None;
                    return Err("sing-box process exited immediately".to_string());
                }

                // Step 8: Verify IP changed
                let vpn_ip = netok_bridge::verify_vpn_ip().await.ok().flatten();

                // Step 9: Update state to Connected
                {
                    let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
                    state.state = netok_bridge::VpnConnectionState::Connected {
                        original_ip: None,
                        vpn_ip,
                    };
                }

                // Step 10: Spawn background monitor
                let vpn_state_inner = vpn_state.inner().clone();
                let app_clone = app.clone();
                tauri::async_runtime::spawn(async move {
                    monitor_vpn_process(pid, vpn_state_inner, app_clone).await;
                });

                Ok(())
            }
            Err(e) => {
                let mut state = vpn_state.lock().map_err(|err| err.to_string())?;
                if e.contains("UAC denied") || e.contains("cancelled") {
                    state.state = netok_bridge::VpnConnectionState::ElevationDenied;
                } else {
                    state.state = netok_bridge::VpnConnectionState::Error { message: e.clone() };
                }
                state.elevated_pid = None;
                Err(e)
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
        state.state = netok_bridge::VpnConnectionState::Error {
            message: "VPN is only supported on Windows currently".to_string(),
        };
        Err("VPN is only supported on Windows currently".to_string())
    }
}

#[tauri::command]
async fn disconnect_vpn(
    vpn_state: tauri::State<'_, Arc<Mutex<VpnProcessState>>>,
) -> Result<(), String> {
    let (pid, config_path) = {
        let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
        state.state = netok_bridge::VpnConnectionState::Disconnecting;
        (state.elevated_pid, state.config_path.clone())
    };

    // Kill the process
    #[cfg(target_os = "windows")]
    if let Some(pid) = pid {
        eprintln!("[VPN] Killing sing-box PID: {}", pid);
        tokio::task::spawn_blocking(move || win_elevation::kill_process(pid))
            .await
            .map_err(|e| format!("Task error: {}", e))??;
    }

    // Clean up config file
    if let Some(ref path) = config_path {
        let _ = std::fs::remove_file(path);
    }

    // Update state
    {
        let mut state = vpn_state.lock().map_err(|e| e.to_string())?;
        state.state = netok_bridge::VpnConnectionState::Disconnected;
        state.elevated_pid = None;
        state.config_path = None;
    }

    eprintln!("[VPN] Disconnected");
    Ok(())
}

#[tauri::command]
fn get_vpn_status(
    vpn_state: tauri::State<'_, Arc<Mutex<VpnProcessState>>>,
) -> Result<netok_bridge::VpnStatus, String> {
    let state = vpn_state.lock().map_err(|e| e.to_string())?;
    Ok(netok_bridge::VpnStatus {
        state: state.state.clone(),
    })
}

/// Monitor the VPN process in the background.
/// Updates state and emits event when process exits unexpectedly.
async fn monitor_vpn_process(pid: u32, state: Arc<Mutex<VpnProcessState>>, app: tauri::AppHandle) {
    loop {
        tokio::time::sleep(std::time::Duration::from_secs(2)).await;

        #[cfg(target_os = "windows")]
        let alive = {
            let pid_copy = pid;
            tokio::task::spawn_blocking(move || win_elevation::is_process_alive(pid_copy))
                .await
                .unwrap_or(false)
        };

        #[cfg(not(target_os = "windows"))]
        let alive = false;

        if !alive {
            if let Ok(mut s) = state.lock() {
                match s.state {
                    netok_bridge::VpnConnectionState::Disconnecting
                    | netok_bridge::VpnConnectionState::Disconnected => {
                        // Expected exit
                        break;
                    }
                    _ => {
                        eprintln!("[VPN] Process {} exited unexpectedly", pid);
                        s.state = netok_bridge::VpnConnectionState::Error {
                            message: "VPN process stopped unexpectedly".to_string(),
                        };
                        s.elevated_pid = None;

                        // Clean up config
                        if let Some(ref path) = s.config_path {
                            let _ = std::fs::remove_file(path);
                        }
                        s.config_path = None;

                        // Emit event to frontend
                        let status = netok_bridge::VpnStatus {
                            state: s.state.clone(),
                        };
                        let _ = app.emit("vpn-state-changed", &status);
                        break;
                    }
                }
            } else {
                break;
            }
        }
    }
}

// ==================== System Tray ====================

fn build_tray_menu(
    app: &tauri::AppHandle,
    lang: &str,
) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
    let (open_label, quit_label) = match lang {
        "ru" => ("Открыть Netok", "Выйти"),
        "de" => ("Netok öffnen", "Beenden"),
        "es" => ("Abrir Netok", "Salir"),
        "fr" => ("Ouvrir Netok", "Quitter"),
        "it" => ("Apri Netok", "Esci"),
        "pt" => ("Abrir Netok", "Sair"),
        "tr" => ("Netok'u Aç", "Çıkış"),
        "fa" => ("باز کردن Netok", "خروج"),
        "zh" => ("打开 Netok", "退出"),
        "ja" => ("Netok を開く", "終了"),
        "ko" => ("Netok 열기", "종료"),
        "uk" => ("Відкрити Netok", "Вийти"),
        "pl" => ("Otwórz Netok", "Zamknij"),
        _ => ("Open Netok", "Quit"),
    };

    let open_item = MenuItem::with_id(app, "open", open_label, true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", quit_label, true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&open_item, &quit_item])?;
    Ok(menu)
}

fn show_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn create_tray(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();
    let menu = build_tray_menu(handle, "ru")?;

    let icon = tauri::include_image!("icons/32x32.png");

    TrayIconBuilder::with_id("main")
        .icon(icon)
        .tooltip("Netok")
        .menu(&menu)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => show_main_window(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

#[tauri::command]
fn update_tray_language(app: tauri::AppHandle, lang: String) -> Result<(), String> {
    let tray = app.tray_by_id("main").ok_or("Tray not found")?;
    let menu = build_tray_menu(&app, &lang).map_err(|e| e.to_string())?;
    tray.set_menu(Some(menu)).map_err(|e| e.to_string())?;
    Ok(())
}

// ==================== App Entry ====================

/// Kill any orphaned sing-box processes left from a previous crash or Ctrl+C.
fn kill_orphaned_singbox() {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        let output = Command::new("taskkill")
            .args(["/F", "/IM", "sing-box-x86_64-pc-windows-msvc.exe"])
            .output();
        if let Ok(out) = output {
            if out.status.success() {
                eprintln!("[VPN] Killed orphaned sing-box process");
            }
        }
    }
}

/// Kill VPN process if running (cleanup helper).
fn cleanup_vpn(vpn_state: &Mutex<VpnProcessState>) {
    if let Ok(state) = vpn_state.lock() {
        #[cfg(target_os = "windows")]
        if let Some(pid) = state.elevated_pid {
            eprintln!("[VPN] Cleaning up: killing PID {}", pid);
            let _ = win_elevation::kill_process(pid);
        }

        if let Some(ref path) = state.config_path {
            let _ = std::fs::remove_file(path);
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .manage(Arc::new(Mutex::new(VpnProcessState::default())))
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            run_diagnostics,
            set_dns,
            get_dns_provider,
            get_dns_servers,
            test_dns_server,
            run_all,
            check_computer,
            check_network,
            check_router,
            check_internet,
            lookup_ip_location,
            update_tray_language,
            scan_network_devices,
            check_wifi_security,
            validate_vpn_key,
            connect_vpn,
            disconnect_vpn,
            get_vpn_status
        ])
        .setup(|app| {
            kill_orphaned_singbox();
            create_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                if let Some(vpn_state) = app_handle.try_state::<Arc<Mutex<VpnProcessState>>>() {
                    cleanup_vpn(vpn_state.inner());
                }
            }
        });
}
