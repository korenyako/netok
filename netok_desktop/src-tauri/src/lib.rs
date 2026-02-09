use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

// Re-export types from netok_bridge
pub use netok_bridge::{DnsProviderType, IpInfoResponse, SingleNodeResult, Snapshot};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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
async fn test_dns_server(server_ip: String) -> Result<bool, String> {
    netok_bridge::test_dns_server_reachable(server_ip)
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

// ==================== System Tray ====================

fn build_tray_menu(app: &tauri::AppHandle, lang: &str) -> Result<Menu<tauri::Wry>, Box<dyn std::error::Error>> {
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_settings,
            set_settings,
            run_diagnostics,
            set_dns,
            get_dns_provider,
            test_dns_server,
            run_all,
            check_computer,
            check_network,
            check_router,
            check_internet,
            lookup_ip_location,
            update_tray_language
        ])
        .setup(|app| {
            create_tray(app)?;
            Ok(())
        })
        .on_window_event(|window, event| {
            // Intercept native close (Alt+F4, taskbar close) — hide to tray instead
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
