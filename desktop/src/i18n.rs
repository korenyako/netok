//! Internationalization and localization.
//! Uses JSON files for translations with hardcoded fallbacks.

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

    // Network types
    NetworkWifi,
    NetworkCable,
    NetworkUsbModem,
    NetworkBluetooth,
    NetworkMobileModem,

    // Fact keys (for matching incoming data)
    FactType,
    FactSignal,
    FactLink,
    FactName,
    FactHost,
    FactHostname,
    FactNetAdapter,
    FactModel,
    FactProvider,
    FactIsp,
    FactCountry,
    FactCity,
    FactPublicIp,
    FactIp,
    FactLocalIp,
}

static RU: Lazy<HashMap<S, &'static str>> = Lazy::new(|| {
    let mut m = HashMap::new();
    m.insert(S::AppName, "Netok");
    m.insert(S::Loading, "Проверяю...");
    m.insert(S::Unknown, "неизвестно");
    m.insert(S::Refresh, "Обновить");
    m.insert(S::Refreshing, "Обновление...");
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
    m.insert(S::ShortSpeedtest, "Короткий тест скорости");
    m.insert(S::ClearDnsCache, "Очистить DNS-кэш");
    m.insert(S::OpenCaptive, "Открыть страницу входа Wi-Fi");
    m.insert(S::OpenRouterPage, "Открыть страницу роутера");
    m.insert(S::CopyDiagnostics, "Скопировать результат проверки");

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

    // Network types
    m.insert(S::NetworkWifi, "Wi-Fi");
    m.insert(S::NetworkCable, "Кабель");
    m.insert(S::NetworkUsbModem, "USB-модем");
    m.insert(S::NetworkBluetooth, "BT");
    m.insert(S::NetworkMobileModem, "мобильный модем");

    // Fact keys (Russian versions for matching)
    m.insert(S::FactType, "Тип");
    m.insert(S::FactSignal, "Сигнал");
    m.insert(S::FactLink, "Линк");
    m.insert(S::FactName, "Имя");
    m.insert(S::FactHost, "Host");
    m.insert(S::FactHostname, "Hostname");
    m.insert(S::FactNetAdapter, "Сетевой адаптер");
    m.insert(S::FactModel, "Модель");
    m.insert(S::FactProvider, "Провайдер");
    m.insert(S::FactIsp, "ISP");
    m.insert(S::FactCountry, "Страна");
    m.insert(S::FactCity, "Город");
    m.insert(S::FactPublicIp, "Public IP");
    m.insert(S::FactIp, "IP");
    m.insert(S::FactLocalIp, "IP в локальной сети");
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
    m.insert(S::ShortSpeedtest, "Short Speed Test");
    m.insert(S::ClearDnsCache, "Clear DNS Cache");
    m.insert(S::OpenCaptive, "Open Captive Portal");
    m.insert(S::OpenRouterPage, "Open Router Page");
    m.insert(S::CopyDiagnostics, "Copy Diagnostics");

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

    // Network types
    m.insert(S::NetworkWifi, "Wi-Fi");
    m.insert(S::NetworkCable, "Cable");
    m.insert(S::NetworkUsbModem, "USB Modem");
    m.insert(S::NetworkBluetooth, "Bluetooth");
    m.insert(S::NetworkMobileModem, "Mobile Modem");

    // Fact keys (English versions for matching)
    m.insert(S::FactType, "Type");
    m.insert(S::FactSignal, "Signal");
    m.insert(S::FactLink, "Link");
    m.insert(S::FactName, "Name");
    m.insert(S::FactHost, "Host");
    m.insert(S::FactHostname, "Hostname");
    m.insert(S::FactNetAdapter, "Network Adapter");
    m.insert(S::FactModel, "Model");
    m.insert(S::FactProvider, "Provider");
    m.insert(S::FactIsp, "ISP");
    m.insert(S::FactCountry, "Country");
    m.insert(S::FactCity, "City");
    m.insert(S::FactPublicIp, "Public IP");
    m.insert(S::FactIp, "IP");
    m.insert(S::FactLocalIp, "Local IP");
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

/// Translation function with argument substitution
/// Usage: t("SpeedValue", &[("down", "100"), ("up", "50")])
pub fn t(key: &str, args: &[(&str, &str)]) -> String {
    let lang = CURRENT_LANG.lock().unwrap();
    let map = if *lang == "en" { &EN } else { &RU };
    
    // Find the key in the enum
    let s_key = match key {
        "SpeedValue" => S::SpeedValue,
        "SignalValue" => S::SignalValue,
        "LinkValue" => S::LinkValue,
        "LocationValue" => S::LocationValue,
        _ => return format!("!MISSING: {}!", key),
    };
    
    if let Some(template) = map.get(&s_key) {
        substitute_args(template, args)
    } else {
        format!("!MISSING: {}!", key)
    }
}

/// Check if a fact key matches a localized string
/// This helps with fact key matching in both languages
pub fn is_fact_key(fact_key: &str, s_key: S) -> bool {
    let lang = CURRENT_LANG.lock().unwrap();
    let map = if *lang == "en" { &EN } else { &RU };
    
    if let Some(localized) = map.get(&s_key) {
        fact_key == *localized || fact_key == s(s_key)
    } else {
        false
    }
}

/// Get localized string for network type based on type string
pub fn get_network_type_label(net_type: &str) -> String {
    let net_type_lc = net_type.to_lowercase();
    if net_type_lc.contains("wi-fi") || net_type_lc.contains("wifi") {
        s(S::NetworkWifi).to_string()
    } else if net_type_lc.contains("кабель") || net_type_lc.contains("ethernet") || net_type_lc.contains("cable") {
        s(S::NetworkCable).to_string()
    } else if net_type_lc.contains("usb") && net_type_lc.contains("модем") {
        s(S::NetworkUsbModem).to_string()
    } else if net_type_lc.contains("bt") || net_type_lc.contains("bluetooth") {
        s(S::NetworkBluetooth).to_string()
    } else if net_type_lc.contains("мобиль") && net_type_lc.contains("модем") {
        s(S::NetworkMobileModem).to_string()
    } else {
        net_type.to_string()
    }
}

fn substitute_args(template: &str, args: &[(&str, &str)]) -> String {
    let mut result = template.to_string();
    for (key, value) in args {
        let placeholder = format!("{{{}}}", key);
        result = result.replace(&placeholder, value);
    }
    result
}