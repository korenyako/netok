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
    ShortSpeedtest,
    ClearDnsCache,
    OpenCaptive,
    OpenRouterPage,
    CopyDiagnostics,
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
    // ... other strings can be added here
    m
});

pub fn s(key: S) -> &'static str {
    RU.get(&key).copied().unwrap_or("!MISSING STRING!")
}