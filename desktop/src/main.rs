use iced::{
    executor, theme,
    widget::{button, column, container, horizontal_space, radio, row, text, text_input, Space},
    Alignment, Application, Command, Element, Length, Settings, Theme,
};

// Импорт API ядра (проверьте имя пакета core в Cargo.toml)
use netok_core::{
    compose_top_banner, dns, run_all, tools, DnsMode, NodeKind, Overall, Snapshot, Status,
};

#[derive(Debug, Clone)]
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

pub fn main() -> iced::Result {
    NetokApp::run(Settings::default())
}

struct NetokApp {
    loading: bool,
    snapshot: Option<Snapshot>,
    route: Route,
    geodata_enabled: bool,
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
    DnsError(()),
    SpeedTestResult(()),
    DnsCacheCleared,
    CaptiveOpened,
    RouterOpened(String),
    DiagnosticsCopied,
    CopyToClipboard(String),
    OpenUrl(String),
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
            dns_mode: DnsModeUI::Auto,
            custom_dns: String::new(),
            last_ssid: None,
            last_rssi: None,
        };
        // Первый запуск — тянем снапшот
        let cmd = Command::perform(run_all(Some(true)), Message::SnapshotReady);
        (app, cmd)
    }

    fn title(&self) -> String {
        "Netok".into()
    }

    fn theme(&self) -> Theme {
        Theme::Dark
    }

    fn update(&mut self, message: Message) -> Command<Message> {
        match message {
            Message::Refresh => {
                self.loading = true;
                return Command::perform(
                    run_all(Some(self.geodata_enabled)),
                    Message::SnapshotReady,
                );
            }
            Message::SnapshotReady(mut s) => {
                if let Some(node) = s.nodes.iter_mut().find(|n| n.kind == NodeKind::Network) {
                    let mut has_ssid = false;
                    let mut has_rssi = false;

                    for (k, v) in &node.facts {
                        if k == "SSID" {
                            has_ssid = true;
                            self.last_ssid = Some(v.clone());
                        }
                        if k == "Сигнал" {
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
                            node.facts.push((
                                "Сигнал".to_string(),
                                format!("{} ({} dBm)", grade, last_rssi),
                            ));
                        }
                    }
                }

                self.snapshot = Some(s);
                self.loading = false;
            }
            Message::OpenSettings => {
                self.route = Route::Settings;
            }
            Message::BackToMain => {
                self.route = Route::Main;
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
                        Err(_) => Message::DnsError(()),
                    },
                );
            }
            Message::ToggleGeodata => {
                self.geodata_enabled = !self.geodata_enabled;
            }
            Message::ShortSpeedTest => {
                return Command::perform(tools::short_speedtest(), |result| match result {
                    Ok((_down, _up)) => Message::SpeedTestResult(()),
                    Err(_) => Message::SpeedTestResult(()),
                });
            }
            Message::ClearDnsCache => {
                return Command::perform(dns::flush(), |result| match result {
                    Ok(_) => Message::DnsCacheCleared,
                    Err(_) => Message::SpeedTestResult(()),
                });
            }
            Message::OpenCaptive => {
                return Command::perform(tools::open_captive(), |result| match result {
                    Ok(_) => Message::CaptiveOpened,
                    Err(_) => Message::SpeedTestResult(()),
                });
            }
            Message::OpenRouter => {
                return Command::perform(tools::open_router(), |result| match result {
                    Ok(ip) => Message::RouterOpened(ip),
                    Err(_) => Message::DnsError(()), // Generic error
                });
            }
            Message::CopyDiagnostics => {
                return Command::perform(tools::copy_report(), |result| match result {
                    Ok(_) => Message::DiagnosticsCopied,
                    Err(_) => Message::DnsError(()), // Generic error
                });
            }
            Message::DnsApplied => {
                // Показать toast "Готово"
            }
            Message::DnsError(_) => {
                // Показать toast с ошибкой
            }
            Message::SpeedTestResult(_) => {
                // Показать результат
            }
            Message::DnsCacheCleared => {
                // Показать toast "Кэш очищен"
            }
            Message::CaptiveOpened => {
                // Показать toast "Каптив открыт"
            }
            Message::RouterOpened(ip) => {
                // Показать toast "Роутер открыт"
                // и открыть URL
                return Command::perform(
                    async move {
                        let _ = open_url(&format!("http://{}/", ip));
                    },
                    |_| Message::Refresh, // эффективный no-op
                );
            }
            Message::DiagnosticsCopied => {
                // Показать toast "Диагностика скопирована"
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

        let header = column![text(internet_line), text(speed_line),].spacing(4);

        // Центральный «путь»
        let nodes = nodes_view(self.snapshot.as_ref());

        // Низ: кнопки
        let refresh_btn: Element<Message> = if self.loading {
            button("Обновление...").padding([8, 16]).into()
        } else {
            button("Обновить")
                .on_press(Message::Refresh)
                .padding([8, 16])
                .into()
        };

        let bottom = row![
            refresh_btn,
            Space::with_width(Length::Fill),
            button("Настройки")
                .on_press(Message::OpenSettings)
                .padding([8, 16]),
        ];

        container(
            column![
                container(header).padding([12, 16]),
                Space::with_height(Length::Fixed(8.0)),
                container(nodes).padding([8, 16]).width(Length::Fill),
                Space::with_height(Length::Fixed(8.0)),
                container(bottom)
                    .padding([8, 16])
                    .width(Length::Fill)
                    .align_x(iced::alignment::Horizontal::Left),
            ]
            .spacing(8)
            .width(Length::Fill)
            .height(Length::Fill),
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }

    fn view_settings(&self) -> Element<'_, Message> {
        let dns_section = column![
            text("DNS").size(18),
            radio(
                "Авто",
                DnsModeUI::Auto,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
            radio(
                "Cloudflare (1.1.1.1)",
                DnsModeUI::Cloudflare,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
            radio(
                "Google (8.8.8.8)",
                DnsModeUI::Google,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
            radio(
                "Пользовательский",
                DnsModeUI::Custom,
                Some(self.dns_mode),
                Message::DnsModeChanged
            ),
        ]
        .spacing(8);

        let custom_dns_input = if matches!(self.dns_mode, DnsModeUI::Custom) {
            text_input("Введите IP адрес", &self.custom_dns)
                .on_input(Message::CustomDnsChanged)
                .padding(8)
        } else {
            text_input("", "").padding(8)
        };

        let apply_dns_btn = button("Применить DNS")
            .on_press(Message::ApplyDns)
            .padding([8, 16]);

        let dns_block = column![dns_section, custom_dns_input, apply_dns_btn,].spacing(12);

        let geodata_toggle = row![
            text("Показывать геоданные"),
            horizontal_space(),
            button(if self.geodata_enabled {
                "Вкл"
            } else {
                "Выкл"
            })
            .on_press(Message::ToggleGeodata)
            .padding([4, 8]),
        ]
        .align_items(Alignment::Center);

        let action_buttons = column![
            button("Короткий спидтест")
                .on_press(Message::ShortSpeedTest)
                .padding([8, 16]),
            button("Очистить DNS-кэш")
                .on_press(Message::ClearDnsCache)
                .padding([8, 16]),
            button("Открыть каптив")
                .on_press(Message::OpenCaptive)
                .padding([8, 16]),
            button("Открыть роутер")
                .on_press(Message::OpenRouter)
                .padding([8, 16]),
            button("Скопировать диагностику")
                .on_press(Message::CopyDiagnostics)
                .padding([8, 16]),
        ]
        .spacing(8);

        let back_btn = button("← Назад")
            .on_press(Message::BackToMain)
            .padding([8, 16]);

        container(
            column![
                container(back_btn).padding([12, 16]),
                Space::with_height(Length::Fixed(16.0)),
                container(dns_block).padding([16, 16]),
                Space::with_height(Length::Fixed(16.0)),
                container(geodata_toggle).padding([16, 16]),
                Space::with_height(Length::Fixed(16.0)),
                container(action_buttons).padding([16, 16]),
            ]
            .spacing(8)
            .width(Length::Fill)
            .height(Length::Fill),
        )
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
    }
}

// ---------- helpers ----------

fn top_lines(snap: Option<&Snapshot>) -> (String, String) {
    let tb = snap.map(compose_top_banner);
    let internet_line = match tb.as_ref().map(|t| t.overall) {
        Some(Overall::Ok) => "Интернет работает, всё в порядке.".into(),
        Some(Overall::DnsProblem) => "Интернет работает частично.".into(),
        Some(Overall::NoGateway) => "Интернет недоступен.".into(),
        Some(Overall::ProviderIssue) => "Интернет недоступен.".into(),
        None => "Проверяю…".into(),
    };
    let speed_line = tb
        .as_ref()
        .and_then(|t| t.speed)
        .map(|(d, u)| format!("Скорость: {d}/{u} Мбит/с"))
        .unwrap_or_else(|| "Скорость: неизвестно".into());
    (internet_line, speed_line)
}

// Указываем явный lifetime, чтобы не было ворнингов о скрытой 'a
fn nodes_view<'a>(snap: Option<&'a Snapshot>) -> Element<'a, Message> {
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

        let bead = text(bead_emoji(status)).size(20);
        let icon = text(match kind {
            NodeKind::Computer => "🖥️",
            NodeKind::Network => "📶",
            NodeKind::Router => "📡",
            NodeKind::Internet => "🌐",
        })
        .size(18);
        let mut facts_col = column![];

        match kind {
            NodeKind::Network => {
                // Определяем тип и SSID
                let mut net_type: Option<&str> = None; // "Wi-Fi", "кабель", "usb-модем"...
                let mut ssid: Option<String> = None;
                let mut rssi: Option<i32> = None;
                let mut link: Option<String> = None;
                for (k, v) in facts {
                    if k == "Тип" {
                        net_type = Some(v.as_str());
                    }
                    if k == "SSID" {
                        ssid = Some(v.clone());
                    }
                    if k == "Сигнал" {
                        if let Some(start) = v.find('(') {
                            if let Some(end) = v.find(" dBm)") {
                                let num_str = &v[start + 1..end];
                                if let Ok(val) = num_str.parse::<i32>() {
                                    rssi = Some(val);
                                }
                            }
                        }
                    }
                    if k == "Линк" {
                        link = Some(v.clone());
                    }
                }
                let net_type_lc = net_type.map(|s| s.to_lowercase());
                let is_wifi = matches!(net_type_lc.as_deref(), Some(t) if t.contains("wi-fi") || t.contains("wifi"));
                let is_cable = matches!(net_type_lc.as_deref(), Some(t) if t.contains("кабель") || t.contains("ethernet"));

                let title = match (net_type_lc.as_deref(), ssid) {
                    (Some(t), Some(name)) if t.contains("wi-fi") || t.contains("wifi") => {
                        format!("Сеть Wi-Fi {}", name)
                    }
                    (Some(t), None) if t.contains("wi-fi") || t.contains("wifi") => {
                        "Сеть Wi-Fi (неизвестно)".to_string()
                    }
                    (Some(t), _) if t.contains("кабель") || t.contains("ethernet") => {
                        "Сеть Кабель".to_string()
                    }
                    (Some(t), _) if t.contains("usb") && t.contains("модем") => {
                        "Сеть USB-модем".to_string()
                    }
                    (Some(t), _) if t.contains("bt") || t.contains("bluetooth") => {
                        "Сеть BT".to_string()
                    }
                    (Some(t), _) if t.contains("мобиль") && t.contains("модем") => {
                        "Сеть мобильный модем".to_string()
                    }
                    _ => "Сеть (неизвестно)".to_string(),
                };
                facts_col = facts_col.push(text(title).size(16));

                if is_wifi {
                    if let Some(dbm) = rssi {
                        let grade = wifi_signal_grade(dbm);
                        facts_col = facts_col
                            .push(text(format!("Сигнал: {} ({} dBm)", grade, dbm)).size(14));
                    } else {
                        facts_col = facts_col.push(text("Сигнал: неизвестно").size(14));
                    }
                } else if is_cable {
                    if let Some(l) = link {
                        let l = if let Some(val) = l.strip_suffix(" Mbps") {
                            format!("{} Мбит/с", val)
                        } else if let Some(val) = l.strip_suffix(" Gbps") {
                            format!("{} Гбит/с", val)
                        } else {
                            l
                        };
                        facts_col = facts_col.push(text(format!("Линк: {}", l)).size(14));
                    } else {
                        facts_col = facts_col.push(text("Линк: нет").size(14));
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
                    if k == "Имя" || k == "Host" || k == "Hostname" {
                        name = Some(v.clone());
                    }
                    if k == "Сетевой адаптер" {
                        adapter = Some(v.clone());
                    }
                    if k == "IP в локальной сети" || k == "IP" {
                        ip_local = Some(v.clone());
                    }
                }
                let title = match name {
                    Some(n) => format!("Компьютер {}", n),
                    None => "Компьютер".to_string(),
                };
                facts_col = facts_col.push(text(title).size(16));

                let adapter_line = format!(
                    "Сетевой адаптер: {}",
                    adapter.unwrap_or_else(|| "неизвестно".into())
                );
                facts_col = facts_col.push(text(adapter_line).size(14));

                let ip_val = ip_local.filter(|s| !s.trim().is_empty());
                let ip_display = ip_val.clone().unwrap_or_else(|| "неизвестно".into());
                let mut line = row![text(format!("IP в локальной сети: {}", ip_display)).size(14)]
                    .align_items(Alignment::Center);
                if let Some(ip) = ip_val {
                    line = line.push(Space::with_width(Length::Fixed(8.0)));
                    line = line.push(
                        button(text("[📋]").size(14))
                            .style(theme::Button::Text)
                            .on_press(Message::CopyToClipboard(ip))
                            .padding([0, 4]),
                    );
                }
                facts_col = facts_col.push(line);
            }
            NodeKind::Router => {
                let mut model: Option<String> = None;
                let mut ip_local: Option<String> = None;
                for (k, v) in facts {
                    if k == "Модель" || k == "Model" {
                        model = Some(v.clone());
                    }
                    if k == "IP в локальной сети" || k == "Gateway" || k == "IP" {
                        ip_local = Some(v.clone());
                    }
                }
                let title = match model {
                    Some(m) => format!("Роутер {}", m),
                    None => "Роутер".to_string(),
                };
                facts_col = facts_col.push(text(title).size(16));

                let ip_val = ip_local.filter(|s| !s.trim().is_empty());
                let ip_display = ip_val.clone().unwrap_or_else(|| "неизвестно".into());
                let mut line = row![text(format!("IP в локальной сети: {}", ip_display)).size(14)]
                    .align_items(Alignment::Center);
                line = line.push(Space::with_width(Length::Fixed(8.0)));
                if let Some(ip) = ip_val.clone() {
                    line = line.push(
                        button(text("[📋]").size(14))
                            .style(theme::Button::Text)
                            .on_press(Message::CopyToClipboard(ip.clone()))
                            .padding([0, 4]),
                    );
                    line = line.push(Space::with_width(Length::Fixed(4.0)));
                    line = line.push(
                        button(text("↗︎").size(14))
                            .style(theme::Button::Text)
                            .on_press(Message::OpenUrl(format!("http://{}/", ip)))
                            .padding([0, 4]),
                    );
                } else {
                    line = line.push(
                        button(text("↗︎").size(14))
                            .style(theme::Button::Text)
                            .padding([0, 4]),
                    );
                }
                facts_col = facts_col.push(line);
            }
            NodeKind::Internet => {
                let mut provider: Option<String> = None;
                let mut public_ip: Option<String> = None;
                let mut country: Option<String> = None;
                let mut geo_city: Option<String> = None;
                for (k, v) in facts {
                    if k == "Провайдер" || k == "ISP" {
                        provider = Some(v.clone());
                    }
                    if k == "Public IP" || k == "IP" {
                        public_ip = Some(v.clone());
                    }
                    if k == "Страна" || k == "Country" {
                        country = Some(v.clone());
                    }
                    if k == "Город" || k == "City" {
                        geo_city = Some(v.clone());
                    }
                }
                let title = match provider {
                    Some(p) => format!("Интернет {}", p),
                    None => "Интернет".to_string(),
                };
                facts_col = facts_col.push(text(title).size(16));

                let ip_val = public_ip.filter(|s| !s.trim().is_empty());
                let ip_display = ip_val.clone().unwrap_or_else(|| "неизвестно".into());
                let mut line = row![text(format!("IP: {}", ip_display)).size(14)]
                    .align_items(Alignment::Center);
                if let Some(ip) = ip_val {
                    line = line.push(Space::with_width(Length::Fixed(8.0)));
                    line = line.push(
                        button(text("[📋]").size(14))
                            .style(theme::Button::Text)
                            .on_press(Message::CopyToClipboard(ip))
                            .padding([0, 4]),
                    );
                }
                facts_col = facts_col.push(line);

                let location = match (country, geo_city) {
                    (Some(cn), Some(ct)) => format!("{}, {}", cn, ct),
                    (Some(cn), None) => cn,
                    (None, Some(ct)) => ct,
                    (None, None) => "неизвестно".into(),
                };
                facts_col = facts_col.push(text(location).size(14));
            }
        }

        col = col.push(
            row![
                bead,
                Space::with_width(Length::Fixed(6.0)),
                icon,
                Space::with_width(Length::Fixed(6.0)),
                facts_col
            ]
            .align_items(Alignment::Center),
        );
    }

    col.into()
}

fn bead_emoji(status: Status) -> &'static str {
    match status {
        Status::Good => "🟢",
        Status::Partial => "🟡",
        Status::Bad => "🔴",
        Status::Unknown => "⚪",
    }
}

fn wifi_signal_grade(rssi: i32) -> &'static str {
    if rssi >= -55 {
        "отличный"
    } else if rssi >= -65 {
        "хороший"
    } else if rssi >= -70 {
        "средний"
    } else {
        "слабый"
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

    #[allow(unreachable_code)]
    Ok(())
}