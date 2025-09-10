//! Internationalization and localization.
//! For now, it only contains Russian strings as per UI-SPEC v1.

use std::collections::HashMap;
use once_cell::sync::Lazy;

#[derive(Debug, Eq, PartialEq, Hash, Clone, Copy)]
pub enum S {
    // General
    AppName,
    Loading,
    Unknown,
    Refresh,
    Refreshing,
    Settings,
    Back,
    Enabled,
    Disabled,

    // Top lines
    InternetOk,
    InternetPartial,
    InternetDown,
    Speed,
    SpeedValue,

    // Nodes
    NodeComputer,
    NodeNetwork,
    NodeRouter,
    NodeInternet,

    // Facts
    NetAdapter,
    LocalIp,
    Signal,
    SignalValue,
    Link,
    LinkValue,
    PublicIp,
    Location,
    LocationValue,
    Ssid,
    Gateway,
    Provider,

    // Signal Grades
    SignalExcellent,
    SignalGood,
    SignalAverage,
    SignalWeak,

    // Link status
    LinkStatusActive,
    LinkStatusInactive,

    // Settings
    Dns,
    DnsAuto,
    DnsCloudflare,
    DnsGoogle,
    DnsCustom,
    DnsCustomPlaceholder,
    ApplyDns,
    ShowGeodata,
    Language,
    LanguageRu,
    LanguageEn,
    ShortSpeedtest,
    ClearDnsCache,
    OpenCaptive,
    OpenRouterPage,
    CopyDiagnostics,

    // Settings Sections
    SettingsGeneral,
    SettingsNetwork,
    SettingsDns,
    SettingsAppearance,
    SettingsTools,
    SettingsAbout,
    Version,
    Licenses,
    LicenseInter,
    LicenseLucide,
    ReportIssue,
    Tbd,
}

static RU: Lazy<HashMap<S, &'static str>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(S::AppName, "Netok");
    m.insert(S::Loading, "Проверяю…");
    m.insert(S::Unknown, "неизвестно");
    m.insert(S::Refresh, "Обновить");
    m.insert(S::Refreshing, "Обновление…");
    m.insert(S::Settings, "Настройки");
    m.insert(S::Back, "← Назад");
    m.insert(S::Enabled, "Вкл");
    m.insert(S::Disabled, "Выкл");

    m.insert(S::InternetOk, "Интернет работает, всё в порядке.");
    m.insert(S::InternetPartial, "Интернет работает частично.");
    m.insert(S::InternetDown, "Интернет недоступен.");
    m.insert(S::Speed, "Скорость");
    m.insert(S::SpeedValue, "Скорость: {down}/{up} Мбит/с");

    m.insert(S::NodeComputer, "Компьютер");
    m.insert(S::NodeNetwork, "Сеть");
    m.insert(S::NodeRouter, "Роутер");
    m.insert(S::NodeInternet, "Интернет");

    m.insert(S::SignalExcellent, "отличный");
    m.insert(S::SignalGood, "хороший");
    m.insert(S::SignalAverage, "средний");
    m.insert(S::SignalWeak, "слабый");

    m.insert(S::NetAdapter, "Сетевой адаптер");
    m.insert(S::LocalIp, "IP в локальной сети");
    m.insert(S::PublicIp, "IP");
    m.insert(S::Signal, "Сигнал");
    m.insert(S::SignalValue, "{grade} ({dbm} dBm)");
    m.insert(S::Link, "Линк");
    m.insert(S::LinkValue, "{speed} {unit}");
    m.insert(S::LinkStatusActive, "активен");
    m.insert(S::LinkStatusInactive, "нет");
    m.insert(S::LocationValue, "{country}, {city}");
    
    m.insert(S::Dns, "DNS");
    m.insert(S::DnsAuto, "Авто");
    m.insert(S::DnsCloudflare, "Cloudflare (1.1.1.1)");
    m.insert(S::DnsGoogle, "Google (8.8.8.8)");
    m.insert(S::DnsCustom, "Пользовательский");
    m.insert(S::DnsCustomPlaceholder, "Введите IP адрес");
    m.insert(S::ApplyDns, "Применить DNS");
    m.insert(S::ShowGeodata, "Показывать геоданные");
    m.insert(S::Language, "Язык");
    m.insert(S::LanguageRu, "Русский");
    m.insert(S::LanguageEn, "English");
    // ... other strings can be added here

    m.insert(S::SettingsGeneral, "Общие");
    m.insert(S::SettingsNetwork, "Сеть");
    m.insert(S::SettingsDns, "DNS");
    m.insert(S::SettingsAppearance, "Внешний вид");
    m.insert(S::SettingsTools, "Инструменты");
    m.insert(S::SettingsAbout, "О программе");
    m.insert(S::Version, "Версия");
    m.insert(S::Licenses, "Лицензии");
    m.insert(S::LicenseInter, "Шрифт Inter: SIL OFL 1.1");
    m.insert(S::LicenseLucide, "Иконки Lucide: ISC License");
    m.insert(S::ReportIssue, "Сообщить о проблеме");
    m.insert(S::Tbd, "В разработке");
    m
});

static EN: Lazy<HashMap<S, &'static str>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(S::AppName, "Netok");
    m.insert(S::Loading, "Checking…");
    m.insert(S::Unknown, "unknown");
    m.insert(S::Refresh, "Refresh");
    m.insert(S::Refreshing, "Refreshing…");
    m.insert(S::Settings, "Settings");
    m.insert(S::Back, "← Back");
    m.insert(S::Enabled, "On");
    m.insert(S::Disabled, "Off");

    m.insert(S::InternetOk, "Internet is working correctly.");
    m.insert(S::InternetPartial, "Internet is partially working.");
    m.insert(S::InternetDown, "Internet is unavailable.");
    m.insert(S::Speed, "Speed");
    m.insert(S::SpeedValue, "Speed: {down}/{up} Mbps");

    m.insert(S::NodeComputer, "Computer");
    m.insert(S::NodeNetwork, "Network");
    m.insert(S::NodeRouter, "Router");
    m.insert(S::NodeInternet, "Internet");

    m.insert(S::SignalExcellent, "excellent");
    m.insert(S::SignalGood, "good");
    m.insert(S::SignalAverage, "average");
    m.insert(S::SignalWeak, "weak");

    m.insert(S::NetAdapter, "Network Adapter");
    m.insert(S::LocalIp, "Local IP");
    m.insert(S::PublicIp, "IP");
    m.insert(S::Signal, "Signal");
    m.insert(S::SignalValue, "{grade} ({dbm} dBm)");
    m.insert(S::Link, "Link");
    m.insert(S::LinkValue, "{speed} {unit}");
    m.insert(S::LinkStatusActive, "active");
    m.insert(S::LinkStatusInactive, "none");
    m.insert(S::LocationValue, "{country}, {city}");

    m.insert(S::Dns, "DNS");
    m.insert(S::DnsAuto, "Auto");
    m.insert(S::DnsCloudflare, "Cloudflare (1.1.1.1)");
    m.insert(S::DnsGoogle, "Google (8.8.8.8)");
    m.insert(S::DnsCustom, "Custom");
    m.insert(S::DnsCustomPlaceholder, "Enter IP address");
    m.insert(S::ApplyDns, "Apply DNS");
    m.insert(S::ShowGeodata, "Show geodata");
    m.insert(S::Language, "Language");
    m.insert(S::LanguageRu, "Русский");
    m.insert(S::LanguageEn, "English");

    m.insert(S::SettingsGeneral, "General");
    m.insert(S::SettingsNetwork, "Network");
    m.insert(S::SettingsDns, "DNS");
    m.insert(S::SettingsAppearance, "Appearance");
    m.insert(S::SettingsTools, "Tools");
    m.insert(S::SettingsAbout, "About");
    m.insert(S::Version, "Version");
    m.insert(S::Licenses, "Licenses");
    m.insert(S::LicenseInter, "Inter font: SIL OFL 1.1");
    m.insert(S::LicenseLucide, "Lucide icons: ISC License");
    m.insert(S::ReportIssue, "Report an issue");
    m.insert(S::Tbd, "TBD");
    m
});

static CURRENT_LANG: once_cell::sync::Lazy<std::sync::Mutex<String>> = once_cell::sync::Lazy::new(|| std::sync::Mutex::new("ru".to_string()));

pub fn set_lang(lang: &str) {
    *CURRENT_LANG.lock().unwrap() = lang.to_string();
}

pub fn s(key: S) -> &'static str {
    let lang = CURRENT_LANG.lock().unwrap();
    let map = if *lang == "en" { &EN } else { &RU };
    map.get(&key).copied().unwrap_or("!MISSING STRING!")
}