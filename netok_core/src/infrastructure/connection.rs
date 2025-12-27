//! Connection type detection.

use crate::domain::ConnectionType;

/// Detect connection type based on interface name.
pub fn detect_connection_type(interface_name: &str) -> ConnectionType {
    let name_lower = interface_name.to_lowercase();

    if name_lower.contains("wi-fi")
        || name_lower.contains("wifi")
        || name_lower.contains("wlan")
        || name_lower.contains("802.11")
        || name_lower.contains("wireless")
    {
        ConnectionType::Wifi
    } else if name_lower.contains("ethernet")
        || name_lower.contains("eth")
        || name_lower.starts_with("en")
    {
        ConnectionType::Ethernet
    } else if name_lower.contains("usb") {
        ConnectionType::Usb
    } else if name_lower.contains("mobile")
        || name_lower.contains("cellular")
        || name_lower.contains("wwan")
        || name_lower.contains("lte")
    {
        ConnectionType::Mobile
    } else {
        ConnectionType::Unknown
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_wifi() {
        assert_eq!(detect_connection_type("wifi"), ConnectionType::Wifi);
        assert_eq!(detect_connection_type("wlan0"), ConnectionType::Wifi);
        assert_eq!(detect_connection_type("Wi-Fi"), ConnectionType::Wifi);
    }

    #[test]
    fn test_detect_ethernet() {
        assert_eq!(detect_connection_type("ethernet"), ConnectionType::Ethernet);
        assert_eq!(detect_connection_type("eth0"), ConnectionType::Ethernet);
        assert_eq!(detect_connection_type("en0"), ConnectionType::Ethernet);
    }

    #[test]
    fn test_detect_usb() {
        assert_eq!(detect_connection_type("usb0"), ConnectionType::Usb);
    }

    #[test]
    fn test_detect_mobile() {
        assert_eq!(detect_connection_type("Mobile"), ConnectionType::Mobile);
        assert_eq!(detect_connection_type("Cellular"), ConnectionType::Mobile);
    }

    #[test]
    fn test_detect_unknown() {
        assert_eq!(detect_connection_type(""), ConnectionType::Unknown);
        assert_eq!(
            detect_connection_type("SomeWeirdAdapter"),
            ConnectionType::Unknown
        );
    }
}
