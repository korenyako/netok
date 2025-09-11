use iced::{
    executor, theme,
    widget::{button, column, container, horizontal_space, radio, row, scrollable, text, text_input, Space, svg, canvas, Canvas},
    time, event,
    Alignment, Application, Command, Element, Length, Settings, Theme, Color, Point, Size,
};

// Импорт API ядра (проверьте имя пакета core в Cargo.toml)
use netok_core::{
    compose_top_banner, dns, run_all_with_timeouts, tools, DnsMode, NodeKind, Overall, Snapshot, Status,
};

mod i18n;
use i18n::{s, S, set_lang, t, is_fact_key};
use serde::{Deserialize, Serialize};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_i18n_basic() {
        // Test Russian (default)
        assert_eq!(s(S::AppName), "Netok");
        assert_eq!(s(S::Loading), "Проверяю...");
        assert_eq!(s(S::Settings), "Настройки");
        
        // Switch to English
        set_lang("en");
        assert_eq!(s(S::AppName), "Netok");
        assert_eq!(s(S::Loading), "Checking…");
        assert_eq!(s(S::Settings), "Settings");
        
        // Switch back to Russian
        set_lang("ru");
        assert_eq!(s(S::Settings), "Настройки");
    }

    #[test]
    fn test_i18n_templated() {
        // Test Russian templated strings
        set_lang("ru");
        let result = t("SpeedValue", &[("down", "100"), ("up", "50")]);
        assert_eq!(result, "Скорость: 100/50 Мбит/с");
        
        // Test English templated strings
        set_lang("en");
        let result = t("SpeedValue", &[("down", "100"), ("up", "50")]);
        assert_eq!(result, "Speed: 100/50 Mbps");
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum Language {
    Ru,
    En,
}

enum Route {
    Main,
    Settings,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum DnsModeUI {
    Auto,
    Cloudflare,
    Google,
    Custom,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum SettingsSection {
    General,
    Network,
    Dns,
    Appearance,
    Tools,
    About,
}

use iced::window;

#[derive(Debug, Serialize, Deserialize)]
struct AppConfig {
    width: u32,
    height: u32,
    x: i32,
    y: i32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self { width: 300, height: 480, x: 0, y: 0 }
    }
}

pub fn main() -> iced::Result {
    // Initialize tracing subscriber for logging
    tracing_subscriber::fmt()
        .with_env_filter(tracing_subscriber::EnvFilter::from_default_env())
        .init();

    let cfg: AppConfig = confy::load("netok", None).unwrap_or_default();
    NetokApp::run(Settings {
        window: window::Settings {
            size: Size::new(cfg.width as f32, cfg.height as f32),
            min_size: Some(Size::new(240.0, 360.0)),
            position: window::Position::Specific(Point::new(cfg.x as f32, cfg.y as f32)),
            ..window::Settings::default()
        },
        antialiasing: true,
        ..Settings::default()
    })
}

struct NetokApp {
    loading: bool,
    snapshot: Option<Snapshot>,
    route: Route,
    geodata_enabled: bool,
    language: Language,
    active_settings_section: SettingsSection,
    dns_mode: DnsModeUI,
    custom_dns: String,
    last_ssid: Option<String>,
    last_rssi: Option<i32>,
}

#[derive(Debug, Clone)]
enum Message {
    Refresh,
    SnapshotReady(Snapshot),
    OpenSettings,
    BackToMain,
    LanguageChanged(Language),
    SettingsSectionChanged(SettingsSection),
    DnsModeChanged(DnsModeUI),
    CustomDnsChanged(String),
    ApplyDns,
    ToggleGeodata,
    ShortSpeedTest,
    ClearDnsCache,
    OpenCaptive,
    OpenRouter,
    CopyDiagnostics,
    DnsApplied,
    DnsError,
    SpeedTestResult,
    DnsCacheCleared,
    DnsCacheClearError,
    CaptiveOpened,
    RouterOpened(String),
    DiagnosticsCopied,
    CopyToClipboard(String),
    OpenUrl(String),
    Tick(std::time::Instant),
    EventOccurred(event::Event),
}

impl Application for NetokApp {
    type Executor = executor::Default;
    type Message = Message;
    type Theme = Theme;
    type Flags = ();

    fn new(_flags: ()) -> (Self, Command<Message>) {
        let app = Self {
            loading: true,
            snapshot: None,
            route: Route::Main,
            geodata_enabled: true,
            language: Language::Ru, // Default to Russian
            active_settings_section: SettingsSection::General,
            dns_mode: DnsModeUI::Auto,
            custom_dns: String::new(),
            last_ssid: None,
            last_rssi: None,
        };
        // Первый запуск — тянем снапшот
        let cmd = Command::perform(run_all_with_timeouts(Some(true)), Message::SnapshotReady);
        (app, cmd)
    }

    fn title(&self) -> String {
        s(S::AppName).into()
    }

    fn theme(&self) -> Theme {
        Theme::Dark
    }

    fn subscription(&self) -> iced::Subscription<Message> {
        let mut subs = Vec::new();

        if self.loading {
            subs.push(time::every(std::time::Duration::from_millis(16)).map(Message::Tick));
        }

        // Subscribe to window events for saving state
        subs.push(event::listen().map(Message::EventOccurred));

        iced::Subscription::batch(subs)
    }

    fn update(&mut self, message: Message) -> Command<Message> {
        match message {
            Message::Refresh => {
                self.loading = true;
                // Reset animation progress on new refresh
                return Command::perform(
                    run_all_with_timeouts(Some(self.geodata_enabled)),
                    Message::SnapshotReady,
                );
            }
            Message::SnapshotReady(mut snapshot) => {
                if let Some(node) = snapshot.nodes.iter_mut().find(|n| n.kind == NodeKind::Network) {
                    let mut has_ssid = false;
                    let mut has_rssi = false;

                    for (k, v) in &node.facts {
                        if k == "SSID" { // Per UI-SPEC §10, SSID can be stale
                            has_ssid = true;
                            self.last_ssid = Some(v.clone());
                        }
                        if is_fact_key(k, S::FactSignal) {
                            // Пытаемся распарсить RSSI из факта
                            let cleaned = v.split('(').nth(1).unwrap_or("").trim_end_matches(" dBm)");
                            if let Ok(val) = cleaned.parse::<i32>() {
                                has_rssi = true;
                                self.last_rssi = Some(val);
                            }
                        }
                    }

                    if !has_ssid {
                        if let Some(last_ssid) = &self.last_ssid {
                            node.facts.push(("SSID".to_string(), last_ssid.clone()));
                        }
                    }

                    if !has_rssi {
                        if let Some(last_rssi) = self.last_rssi {
                            let grade = wifi_signal_grade(last_rssi);
                            node.facts.push((s(S::FactSignal).to_string(), format!("{} ({} dBm)", s(grade), last_rssi)));
                        }
                    }
                }

                self.snapshot = Some(snapshot);
                self.loading = false;
            }
            Message::OpenSettings => {
                self.route = Route::Settings;
            }
            Message::BackToMain => {
                self.route = Route::Main;
            }
            Message::LanguageChanged(lang) => {
                self.language = lang;
                i18n::set_lang(if matches!(lang, Language::Ru) { "ru" } else { "en" });
            }
            Message::SettingsSectionChanged(section) => {
                self.active_settings_section = section;
            }
            Message::DnsModeChanged(mode) => {
                self.dns_mode = mode;
            }
            Message::CustomDnsChanged(dns) => {
                self.custom_dns = dns;
            }
            Message::ApplyDns => {
                let mode = match self.dns_mode {
                    DnsModeUI::Auto => DnsMode::Auto,
                    DnsModeUI::Cloudflare => DnsMode::Cloudflare,
                    DnsModeUI::Google => DnsMode::Google,
                    DnsModeUI::Custom => DnsMode::Custom(self.custom_dns.clone()),
                };
                return Command::perform(
                    async move {
                        dns::set(mode).await?;
                        dns::flush().await
                    },
                    |result| match result {
                        Ok(_) => Message::DnsApplied,
                        Err(_) => Message::DnsError,
                    },
                );
            }
            Message::ToggleGeodata => {
                self.geodata_enabled = !self.geodata_enabled;
            }
            Message::ShortSpeedTest => {
                return Command::perform(tools::short_speedtest(), |result| match result {
                    Ok((_down, _up)) => Message::SpeedTestResult,
                    Err(_) => Message::SpeedTestResult,
                });
            }
            Message::ClearDnsCache => {
                return Command::perform(dns::flush(), |result| match result {
                    Ok(_) => Message::DnsCacheCleared,
                    Err(_) => Message::DnsCacheClearError,
                });
            }
            Message::OpenCaptive => {
                return Command::perform(tools::open_captive(), |result| match result {
                    Ok(_) => Message::CaptiveOpened,
                    Err(_) => Message::SpeedTestResult,
                });
            }
            Message::OpenRouter => {
                return Command::perform(tools::open_router(), |result| match result {
                    Ok(ip) => Message::RouterOpened(ip),
                    Err(_) => Message::DnsError, // Generic error
                });
            }
            Message::CopyDiagnostics => {
                return Command::perform(tools::copy_report(), |result| match result {
                    Ok(_) => Message::DiagnosticsCopied,
                    Err(_) => Message::DnsError, // Generic error
                });
            }
            Message::DnsApplied => {
                // Show toast "Done"
            }
            Message::DnsError => {
                // Показать toast с ошибкой
            }
            Message::SpeedTestResult => {
                // Показать результат (пустой кортеж, чтобы не было ворнинга)
            }
            Message::DnsCacheCleared => {
                // Show toast "Cache cleared"
            }
            Message::DnsCacheClearError => {
                // Show toast "Cache clear error"
            }
            Message::CaptiveOpened => {
                // Show toast "Captive opened"
            }
            Message::RouterOpened(ip) => {
                // Show toast "Router opened"
                // и открыть URL
                return Command::perform(
                    async move {
                        let _ = open_url(&format!("http://{}/", ip));
                    },
                    |_| Message::Refresh, // эффективный no-op
                );
            }
            Message::DiagnosticsCopied => {
                // Show toast "Diagnostics copied"
            }
            Message::CopyToClipboard(s) => {
                // Best-effort копирование в буфер обмена
                let _ = Command::perform(
                    async move {
                        if let Ok(mut cb) = arboard::Clipboard::new() {
                            let _ = cb.set_text(s);
                        }
                    },
                    |_| Message::Refresh,
                );
            }
            Message::OpenUrl(url) => {
                // Открыть URL платформенно-зависимо
                return Command::perform(
                    async move {
                        let _ = open_url(&url);
                    },
                    |_| Message::Refresh,
                );
            }
            Message::Tick(_) => {
                // This message will now trigger a redraw, which is all we need for the animation.
            }
            Message::EventOccurred(event) => {
                if let event::Event::Window(_, window::Event::Resized { width, height }) = event {
                    let cfg = AppConfig { width, height, x: 0, y: 0 }; // Position will be updated by Moved event
                    let _ = confy::store("netok", None, cfg);
                }
                if let event::Event::Window(_, window::Event::Moved { x, y }) = event {
                    let mut cfg: AppConfig = confy::load("netok", None).unwrap_or_default();
                    cfg.x = x;
                    cfg.y = y;
                    let _ = confy::store("netok", None, cfg);
                }
            }
        }
        Command::none()
    }

    fn view(&self) -> Element<'_, Message> {
        match self.route {
            Route::Main => self.view_main(),
            Route::Settings => self.view_settings(),
        }
    }
}

impl NetokApp {
    fn view_main(&self) -> Element<'_, Message> {
        // Верхние строки
        let (internet_line, speed_line) = top_lines(self.snapshot.as_ref());

        let header = column![text(internet_line).size(13), text(speed_line).size(13),].spacing(4);
        
        // Центральный «путь» - pass loading and animation state
        let nodes = nodes_view(self.snapshot.as_ref(), self.loading);

        // Низ: кнопки
        let refresh_btn: Element<Message> = if self.loading {
            button(s(S::Refreshing)).padding([8, 16]).width(120).into()
        } else {
            button(s(S::Refresh))
                .on_press(Message::Refresh)
                .padding([8, 16])
                .width(120)
                .into()
        };

        let bottom = row![
            refresh_btn,
            horizontal_space(),
            button(s(S::Settings))
                .on_press(Message::OpenSettings)
                .padding([8, 16])
                .width(120),
        ].spacing(12);

        container(
            column![
                // 1. Header (fixed)
                container(header).padding([12, 16]),
                // 2. Scrollable content (fills remaining space)
                scrollable(
                    container(nodes)
                        .padding([8, 16])
                        .width(Length::Fill)
                )
                .height(Length::Fill),
                // 3. Footer (fixed)
                container(bottom).padding([8, 16]).width(Length::Fill)
            ]
            .spacing(8),
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }

    fn view_settings(&self) -> Element<'_, Message> {
        let back_btn: Element<Message> = button(s(S::Back))
            .on_press(Message::BackToMain)
            .padding([8, 16])
            .width(Length::Fixed(120.0))
            .into();

        let sidebar = settings_sidebar(self.active_settings_section);
        let content = self.settings_content();

        container(
            row![
                sidebar,
                container(content)
                    .padding(16)
                    .width(Length::Fill)
                    .height(Length::Fill)
            ]
            .spacing(8)
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }

    fn settings_content(&self) -> Element<'_, Message> {
        let content = match self.active_settings_section {
            SettingsSection::General => self.general_settings(),
            SettingsSection::Network => self.network_settings(),
            SettingsSection::Dns => self.dns_settings(),
            SettingsSection::Appearance => self.appearance_settings(),
            SettingsSection::Tools => self.tools_settings(),
            SettingsSection::About => self.about_settings(),
        };

        container(
            column![
                container(content).padding([0, 16]),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }

    fn general_settings(&self) -> Element<'_, Message> {
        let language_section = column![
            text(s(S::Language)).size(18),
            radio(
                s(S::LanguageRu),
                Language::Ru,
                Some(self.language),
                Message::LanguageChanged
            ),
            radio(
                s(S::LanguageEn),
                Language::En,
                Some(self.language),
                Message::LanguageChanged
            ),
        ]
        .spacing(8);

        let geodata_toggle = row![
            text(s(S::ShowGeodata)),
            horizontal_space(),
            button(if self.geodata_enabled {
                s(S::Enabled)
            } else {
                s(S::Disabled)
            })
            .on_press(Message::ToggleGeodata)
            .padding([4, 8])
            .width(Length::Fixed(100.0))
        ]
        .align_items(Alignment::Center);

        scrollable(
            column![
                container(language_section).padding([0, 16]),
                Space::with_height(Length::Fixed(16.0)),
                container(geodata_toggle).padding([0, 16]),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }

    fn network_settings(&self) -> Element<'_, Message> {
        scrollable(
            column![
                text(s(S::Tbd)).size(18),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }

    fn dns_settings(&self) -> Element<'_, Message> {
        let dns_section = column![
            text(s(S::Dns)).size(18),
            radio(
                s(S::DnsAuto),
                DnsModeUI::Auto,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
            radio(
                s(S::DnsCloudflare),
                DnsModeUI::Cloudflare,
                Some(self.dns_mode), 
                Message::DnsModeChanged
            ),
            radio(
                s(S::DnsGoogle),
                DnsModeUI::Google,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
            radio(
                s(S::DnsCustom),
                DnsModeUI::Custom,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
        ]
        .spacing(8);

        let custom_dns_input = if matches!(self.dns_mode, DnsModeUI::Custom) {
            text_input(s(S::DnsCustomPlaceholder), &self.custom_dns)
                .on_input(Message::CustomDnsChanged)
                .padding(8)
        } else {
            text_input("", "").padding(8)
        };

        let apply_dns_btn = button(s(S::ApplyDns))
            .on_press(Message::ApplyDns)
            .padding([8, 16])
            .width(Length::Fixed(200.0));

        let dns_block = column![dns_section, custom_dns_input, apply_dns_btn].spacing(12);

        scrollable(
            column![
                container(dns_block).padding([0, 16]),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }

    fn appearance_settings(&self) -> Element<'_, Message> {
        scrollable(
            column![
                text(s(S::Tbd)).size(18),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }

    fn tools_settings(&self) -> Element<'_, Message> {
        let action_buttons = column![
            button(s(S::ShortSpeedtest))
                .on_press(Message::ShortSpeedTest)
                .padding([8, 16])
                .width(Length::Fixed(200.0)),
            button(s(S::ClearDnsCache))
                .on_press(Message::ClearDnsCache)
                .padding([8, 16])
                .width(Length::Fixed(200.0)),
            button(s(S::OpenCaptive))
                .on_press(Message::OpenCaptive)
                .padding([8, 16])
                .width(Length::Fixed(200.0)),
            button(s(S::OpenRouterPage))
                .on_press(Message::OpenRouter)
                .padding([8, 16])
                .width(Length::Fixed(200.0)),
            button(s(S::CopyDiagnostics))
                .on_press(Message::CopyDiagnostics)
                .padding([8, 16])
                .width(Length::Fixed(200.0)),
        ]
        .spacing(8);

        scrollable(
            column![
                container(action_buttons).padding([0, 16]),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }

    fn about_settings(&self) -> Element<'_, Message> {
        scrollable(
            column![
                text(s(S::Tbd)).size(18),
            ]
            .spacing(8)
            .width(Length::Fill)
        )
        .height(Length::Fill)
        .into()
    }
}

fn settings_sidebar(active_section: SettingsSection) -> Element<'static, Message> {
    let sections = [
        (SettingsSection::General, s(S::SettingsGeneral)),
        (SettingsSection::Network, s(S::SettingsNetwork)),
        (SettingsSection::Dns, s(S::SettingsDns)),
        (SettingsSection::Appearance, s(S::SettingsAppearance)),
        (SettingsSection::Tools, s(S::SettingsTools)),
        (SettingsSection::About, s(S::SettingsAbout)),
    ];

    let buttons = sections.iter().fold(column![].spacing(4), |col, (section, label)| {
        let is_active = *section == active_section;
        let btn_style = if is_active { theme::Button::Primary } else { theme::Button::Text };

        col.push(
            button(text(*label).width(Length::Fill))
                .style(btn_style)
                .on_press(Message::SettingsSectionChanged(*section))
                .padding(8)
                .width(Length::Fill),
        )
    });

    container(buttons)
        .width(Length::Fixed(160.0)) // Per UI-SPEC §2
        .height(Length::Fill)
        .padding(16)
        .into()
}

// ---------- helpers ----------

fn top_lines(snap: Option<&Snapshot>) -> (String, String) {
    let tb = snap.map(compose_top_banner);
    let internet_line = match tb.as_ref().map(|t| t.overall) {
        Some(Overall::Ok) => s(S::InternetOk).into(),
        Some(Overall::DnsProblem) => s(S::InternetPartial).into(),
        Some(Overall::NoGateway) => s(S::InternetDown).into(),
        Some(Overall::ProviderIssue) => s(S::InternetDown).into(),
        None => s(S::Loading).into(),
    };
    let speed_line = tb
        .as_ref()
        .and_then(|t| t.speed)
        .map(|(d, u)| s(S::SpeedValue).replace("{down}", &d.to_string()).replace("{up}", &u.to_string()))
        .unwrap_or_else(|| format!("{}: {}", s(S::Speed), s(S::Unknown)));
    (internet_line, speed_line)
}

// Указываем явный lifetime, чтобы не было ворнингов о скрытой 'a
fn nodes_view<'a>(snap: Option<&'a Snapshot>, loading: bool) -> Element<'a, Message> {
    let order = [
        NodeKind::Computer,
        NodeKind::Network,
        NodeKind::Router,
        NodeKind::Internet,
    ];

    let mut col = column![].spacing(12);

    for kind in order {
        let (status, facts): (Status, &[(String, String)]) = match snap {
            Some(s) => match s.nodes.iter().find(|n| n.kind == kind) {
                Some(n) => (n.status, n.facts.as_slice()),
                None => (Status::Unknown, &[]),
            },
            None => (Status::Unknown, &[]),
        };

        let bead = bead_view(status, loading);
        let node_icon = icon_view(kind);
        let mut facts_col = column![];

        match kind {
            NodeKind::Network => {
                // Определяем тип и SSID
                let mut net_type: Option<&str> = None; // "Wi-Fi", "кабель", "usb-модем"...
                let mut ssid: Option<String> = None;
                let mut rssi: Option<i32> = None;
                let mut link: Option<String> = None;
                for (k, v) in facts {
                    if is_fact_key(k, S::FactType) {
                        net_type = Some(v.as_str());
                    }
                    if k == "SSID" {
                        ssid = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactSignal) {
                        if let Some(start) = v.find('(') {
                            if let Some(end) = v.find(" dBm)") {
                                if let Ok(val) = v[start + 1..end].trim().parse::<i32>() {
                                    rssi = Some(val);
                                }
                            }
                        }
                    }
                    if is_fact_key(k, S::FactLink) {
                        link = Some(v.clone());
                    }
                }
                let net_type_lc = net_type.map(|s| s.to_lowercase());
                let is_wifi = matches!(net_type_lc.as_deref(), Some(t) if t.contains("wi-fi") || t.contains("wifi"));
                let is_cable = matches!(net_type_lc.as_deref(), Some(t) if t.contains("кабель") || t.contains("ethernet") || t.contains("cable"));

                let title = match (net_type_lc.as_deref(), ssid) {
                    (Some(t), Some(name)) if t.contains("wi-fi") || t.contains("wifi") => format!("{} {} {}", s(S::NodeNetwork), s(S::NetworkWifi), name),
                    (Some(t), None) if t.contains("wi-fi") || t.contains("wifi") => {
                        format!("{} {} ({})", s(S::NodeNetwork), s(S::NetworkWifi), s(S::Unknown))
                    }
                    (Some(t), _) if t.contains("кабель") || t.contains("ethernet") || t.contains("cable") => {
                        format!("{} {}", s(S::NodeNetwork), s(S::NetworkCable))
                    }
                    (Some(t), _) if t.contains("usb") && (t.contains("модем") || t.contains("modem")) => {
                        format!("{} {}", s(S::NodeNetwork), s(S::NetworkUsbModem))
                    }
                    (Some(t), _) if t.contains("bt") || t.contains("bluetooth") => {
                        format!("{} {}", s(S::NodeNetwork), s(S::NetworkBluetooth))
                    }
                    (Some(t), _) if t.contains("мобиль") && (t.contains("модем") || t.contains("mobile")) => {
                        format!("{} {}", s(S::NodeNetwork), s(S::NetworkMobileModem))
                    }
                    _ => format!("{} ({})", s(S::NodeNetwork), s(S::Unknown)),
                };
                facts_col = facts_col.push(text(title).size(16)); // Node title

                if is_wifi {
                    // Per UI-SPEC §10, only show signal for Wi-Fi.
                    let signal_text = rssi.map(|dbm| {
                            let grade = wifi_signal_grade(dbm);
                            s(S::SignalValue).replace("{grade}", s(grade)).replace("{dbm}", &dbm.to_string())
                        })
                        .unwrap_or_else(|| s(S::Unknown).to_string());
                    facts_col = facts_col.push(text(format!("{}: {}", s(S::Signal), signal_text)).size(13));
                } else if is_cable {
                    // Per UI-SPEC §10, only show link speed for cable.
                    if let Some(l) = link {
                        let l = if let Some(val) = l.strip_suffix(" Mbps") {
                            format!("{} Мбит/с", val)
                        } else if let Some(val) = l.strip_suffix(" Gbps") {
                            format!("{} Гбит/с", val)
                        } else {
                            l
                        };
                        facts_col = facts_col.push(text(format!("{}: {}", s(S::Link), l)).size(13));
                    } else {
                        facts_col = facts_col.push(text(format!("{}: {}", s(S::Link), s(S::Unknown))).size(13));
                    }
                } else {
                    // Ничего не выводим для других типов
                }
            }
            NodeKind::Computer => {
                let mut name: Option<String> = None;
                let mut adapter: Option<String> = None;
                let mut ip_local: Option<String> = None;
                for (k, v) in facts {
                    if is_fact_key(k, S::FactName) || is_fact_key(k, S::FactHost) || is_fact_key(k, S::FactHostname) {
                        name = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactNetAdapter) {
                        adapter = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactLocalIp) || is_fact_key(k, S::FactIp) {
                        ip_local = Some(v.clone());
                    }
                }
                let title = match name {
                    Some(n) => format!("{} {}", s(S::NodeComputer), n),
                    None => s(S::NodeComputer).to_string(),
                };
                facts_col = facts_col.push(text(title).size(16)); // Node title

                // Per UI-SPEC §10, hide row if data is missing.
                if let Some(adapter_name) = adapter {
                    let adapter_line = format!("{}: {}", s(S::NetAdapter), adapter_name);
                    facts_col = facts_col.push(text(adapter_line).size(13));
                }

                // Per UI-SPEC §10, hide row if data is missing.
                if let Some(ip_val) = ip_local.filter(|s| !s.trim().is_empty()) {
                    let ip_display = ip_val.clone();
                    let mut line = row![text(format!("{}: {}", s(S::LocalIp), ip_display)).size(13)]
                        .align_items(Alignment::Center);
                    
                    line = line.push(Space::with_width(Length::Fixed(8.0)));
                    line = line.push(button(icon("desktop/assets/copy.svg"))
                        .style(theme::Button::Text)
                        .on_press(Message::CopyToClipboard(ip_val))
                        .padding(0)
                    );
                    facts_col = facts_col.push(line);
                } else {
                    // If no IP, show "unknown" without a copy button.
                    facts_col = facts_col.push(text(format!("{}: {}", s(S::LocalIp), s(S::Unknown))).size(13));
                }
            }
            NodeKind::Router => {
                let mut model: Option<String> = None;
                let mut ip_local: Option<String> = None;
                for (k, v) in facts {
                    if is_fact_key(k, S::FactModel) {
                        model = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactLocalIp) || k == "Gateway" || is_fact_key(k, S::FactIp) {
                        ip_local = Some(v.clone());
                    }
                }
                let title = match model {
                    Some(m) => format!("{} {}", s(S::NodeRouter), m),
                    None => s(S::NodeRouter).to_string(),
                };
                facts_col = facts_col.push(text(title).size(16)); // Node title

                if let Some(ip_val) = ip_local.filter(|s| !s.trim().is_empty()) {
                    let ip_display = ip_val.clone();
                    let mut line = row![text(format!("{}: {}", s(S::LocalIp), ip_display)).size(13)]
                        .align_items(Alignment::Center);
                    
                    line = line.push(Space::with_width(Length::Fixed(8.0)));
                    line = line.push(button(icon("desktop/assets/copy.svg"))
                        .style(theme::Button::Text)
                        .on_press(Message::CopyToClipboard(ip_val.clone()))
                        .padding(0)
                    );
                    line = line.push(Space::with_width(Length::Fixed(4.0)));
                    line = line.push(button(icon("desktop/assets/external-link.svg"))
                        .style(theme::Button::Text)
                        .on_press(Message::OpenRouter)
                        .padding(0)
                    );
                    facts_col = facts_col.push(line);
                } else {
                    let line = row![
                        text(format!("{}: {}", s(S::LocalIp), s(S::Unknown))).size(13),
                    ];
                    facts_col = facts_col.push(line);
                }
            }
            NodeKind::Internet => {
                let mut provider: Option<String> = None;
                let mut public_ip: Option<String> = None;
                let mut country: Option<String> = None;
                let mut geo_city: Option<String> = None;
                for (k, v) in facts {
                    if is_fact_key(k, S::FactProvider) || is_fact_key(k, S::FactIsp) {
                        provider = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactPublicIp) || is_fact_key(k, S::FactIp) {
                        public_ip = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactCountry) {
                        country = Some(v.clone());
                    }
                    if is_fact_key(k, S::FactCity) {
                        geo_city = Some(v.clone());
                    }
                }
                let title = match provider {
                    Some(p) => format!("{} {}", s(S::NodeInternet), p),
                    None => s(S::NodeInternet).to_string(),
                };
                facts_col = facts_col.push(text(title).size(16)); // Node title

                if let Some(ip_val) = public_ip.filter(|s| !s.trim().is_empty()) {
                    let ip_display = ip_val.clone();
                    let mut line = row![text(format!("{}: {}", s(S::PublicIp), ip_display)).size(13)]
                        .align_items(Alignment::Center);
                    
                    line = line.push(Space::with_width(Length::Fixed(8.0)));
                    line = line.push(button(icon("desktop/assets/copy.svg"))
                        .style(theme::Button::Text)
                        .on_press(Message::CopyToClipboard(ip_val))
                        .padding(0)
                    );
                    facts_col = facts_col.push(line);
                } else {
                    facts_col = facts_col.push(text(format!("{}: {}", s(S::PublicIp), s(S::Unknown))).size(13));
                }

                if country.is_some() || geo_city.is_some() {
                    let location = match (country, geo_city) {
                        (Some(cn), Some(ct)) => s(S::LocationValue).replace("{country}", &cn).replace("{city}", &ct),
                        (Some(cn), None) => cn,
                        (None, Some(ct)) => ct,
                        (None, None) => unreachable!(), // Covered by the outer if.
                    };
                    facts_col = facts_col.push(text(location).size(13));
                }
            }
        }

        col = col.push(
            row![
                bead,
                Space::with_width(Length::Fixed(12.0)),
                node_icon,
                Space::with_width(Length::Fixed(12.0)),
                facts_col
            ]
            .align_items(Alignment::Center),
        );
    }

    col.into()
}

fn icon_view(kind: NodeKind) -> Element<'static, Message> {
    let icon_path = match kind {
        NodeKind::Computer => "desktop/assets/computer.svg",
        NodeKind::Network => "desktop/assets/wifi.svg",
        NodeKind::Router => "desktop/assets/router.svg",
        NodeKind::Internet => "desktop/assets/globe.svg",
    };
    icon(icon_path)
}

fn icon(path: &str) -> Element<'static, Message> {
    svg(svg::Handle::from_path(path))
        .width(16)
        .height(16)
        .style(theme::Svg::custom_fn(|theme| svg::Appearance {
            color: Some(theme.palette().text),
        }))
        .into()
}

#[derive(Debug)]
struct Bead {
    status: Status,
    loading: bool,
    animation_progress: f32,
}

impl<M> canvas::Program<M> for Bead {
    type State = ();

    fn draw(&self, _state: &Self::State, renderer: &iced::Renderer, _theme: &Theme, bounds: iced::Rectangle, _cursor: iced::mouse::Cursor) -> Vec<canvas::Geometry> {
        let mut frame = canvas::Frame::new(renderer, bounds.size());
        let center = frame.center();
        let radius = bounds.width / 2.0;

        // Draw pulsing outline if loading
        if self.loading {
            let pulse_radius = radius + (2.0 * (std::f32::consts::PI * self.animation_progress).sin().abs());
            let pulse_alpha = 1.0 - (std::f32::consts::PI * self.animation_progress).sin().abs();
            let outline = canvas::Path::circle(center, pulse_radius);
            frame.stroke(
                &outline,
                canvas::Stroke::default()
                    .with_color(Color::from_rgba8(0x3B, 0x82, 0xF6, pulse_alpha)) // Blue with alpha
                    .with_width(1.5),
            );
        }

        // Draw main bead
        let bead = canvas::Path::circle(center, radius);
        frame.fill(&bead, bead_color(self.status));

        vec![frame.into_geometry()]
    }
}

fn bead_view<'a>(status: Status, loading: bool) -> Element<'a, Message> {
    let bead_program = Bead {
        status,
        loading,
        animation_progress: if loading {
            // Use system time to create a value between 0.0 and 1.0 for the animation cycle
            let now_ms = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis();
            (now_ms % 1000) as f32 / 1000.0
        } else { 0.0 },
    };
    Canvas::new(bead_program)
        .width(12)
        .height(12)
        .into()
}

fn bead_color(status: Status) -> iced::Color {
    match status {
        Status::Good => iced::Color::from_rgb8(0x22, 0xC5, 0x5E),    // Green
        Status::Partial => iced::Color::from_rgb8(0xF5, 0x9E, 0x0B), // Orange
        Status::Bad => iced::Color::from_rgb8(0xEF, 0x44, 0x44),      // Red
        Status::Unknown => iced::Color::from_rgb8(0x9C, 0xA3, 0xAF), // Grey
    }
}

fn wifi_signal_grade(rssi: i32) -> S {
    if rssi >= -55 {
        S::SignalExcellent
    } else if rssi >= -65 {
        S::SignalGood
    } else if rssi >= -70 {
        S::SignalAverage
    } else {
        S::SignalWeak
    }
}

// --------- helpers: platform open ---------
#[allow(unused)]
fn open_url(url: &str) -> std::io::Result<()> {
    #[cfg(target_os = "windows")]
    {
        // Используем start без кавычек вокруг URL, чтобы избежать экранирования обратными слэшами
        if let Err(e) = std::process::Command::new("cmd")
            .args(["/C", "start", "", url])
            .spawn()
        {
            eprintln!("failed to open url: {}", e);
        }
        return Ok(());
    }

    #[cfg(target_os = "macos")]
    {
        if let Err(e) = std::process::Command::new("open").arg(url).spawn() {
            eprintln!("failed to open url: {}", e);
        }
        return Ok(());
    }

    #[cfg(all(unix, not(target_os = "macos")))]
    {
        if let Err(e) = std::process::Command::new("xdg-open").arg(url).spawn() {
            eprintln!("failed to open url: {}", e);
        }
        return Ok(());
    }

    // For other unhandled OSes, this is a no-op that returns Ok.
    // The #[allow(unused)] at the function level handles cases where it's not used.
    Ok(())
}
