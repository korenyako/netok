use netok_bridge::{
    get_dns_provider, get_settings_json, run_diagnostics_struct, set_dns_provider,
    set_settings_json, DnsProviderType,
};
use serde_json;

// ============================================================================
// Settings Tests
// ============================================================================

#[test]
fn test_get_settings_returns_valid_json() {
    let json = get_settings_json();

    // Should return non-empty string
    assert!(!json.is_empty());

    // Should be valid JSON
    let parsed: Result<serde_json::Value, _> = serde_json::from_str(&json);
    assert!(
        parsed.is_ok(),
        "Settings JSON should be valid: {}",
        json
    );

    // Should contain expected fields
    let settings = parsed.unwrap();
    assert!(settings.get("language").is_some());
    assert!(settings.get("test_timeout_ms").is_some());
}

#[test]
fn test_set_settings_with_valid_json() {
    let settings_json = r#"{
        "language": "ru",
        "test_timeout_ms": 3000,
        "dns_servers": ["1.1.1.1", "8.8.8.8"]
    }"#;

    let result = set_settings_json(settings_json);
    assert!(result.is_ok(), "Valid settings JSON should be accepted");
}

#[test]
fn test_set_settings_with_invalid_json() {
    let invalid_json = "not valid json {";

    let result = set_settings_json(invalid_json);
    assert!(
        result.is_err(),
        "Invalid JSON should return error"
    );
}

#[test]
fn test_set_settings_with_empty_string() {
    let result = set_settings_json("");
    assert!(result.is_err(), "Empty string should return error");
}

#[test]
fn test_set_settings_with_incomplete_structure() {
    let incomplete_json = r#"{"language": "en"}"#;

    let result = set_settings_json(incomplete_json);
    // Depending on implementation, this might be ok or error
    // Just verify it doesn't panic
    let _ = result;
}

// ============================================================================
// Diagnostics Tests
// ============================================================================

#[tokio::test]
async fn test_run_diagnostics_returns_valid_snapshot() {
    let result = run_diagnostics_struct().await;

    assert!(
        result.is_ok(),
        "Diagnostics should complete successfully"
    );

    let snapshot = result.unwrap();

    // Check basic structure
    assert!(
        !snapshot.at_utc.is_empty(),
        "Snapshot should have timestamp"
    );
    assert!(
        snapshot.nodes.len() >= 4,
        "Snapshot should have at least 4 nodes"
    );
    assert!(
        !snapshot.summary_key.is_empty(),
        "Snapshot should have summary key"
    );
}

#[tokio::test]
async fn test_diagnostics_snapshot_includes_all_sections() {
    let result = run_diagnostics_struct().await;
    assert!(result.is_ok());

    let snapshot = result.unwrap();

    // Verify all main sections exist (even if fields are null)
    // Computer section should have at least some info
    let has_computer_info = snapshot.computer.hostname.is_some()
        || snapshot.computer.local_ip.is_some()
        || snapshot.computer.adapter.is_some();

    assert!(
        has_computer_info,
        "Computer section should have at least one field populated"
    );
}

#[tokio::test]
async fn test_diagnostics_nodes_have_valid_structure() {
    let result = run_diagnostics_struct().await;
    assert!(result.is_ok());

    let snapshot = result.unwrap();

    for node in &snapshot.nodes {
        // Each node should have a valid ID
        assert!(
            matches!(
                node.id.as_str(),
                "computer" | "network" | "dns" | "internet"
            ),
            "Node ID should be one of the expected values: {}",
            node.id
        );

        // Each node should have a label
        assert!(!node.label.is_empty(), "Node should have a label");

        // Status should be valid
        assert!(
            matches!(node.status.as_str(), "ok" | "partial" | "down"),
            "Node status should be valid: {}",
            node.status
        );
    }
}

#[tokio::test]
async fn test_diagnostics_serialization() {
    let result = run_diagnostics_struct().await;
    assert!(result.is_ok());

    let snapshot = result.unwrap();

    // Should serialize to JSON
    let json = serde_json::to_string(&snapshot);
    assert!(
        json.is_ok(),
        "Snapshot should serialize to JSON"
    );

    // Should deserialize back
    let json_str = json.unwrap();
    let deserialized: Result<netok_bridge::Snapshot, _> =
        serde_json::from_str(&json_str);
    assert!(
        deserialized.is_ok(),
        "Snapshot should deserialize from JSON"
    );

    let recovered = deserialized.unwrap();
    assert_eq!(
        snapshot.at_utc, recovered.at_utc,
        "Timestamp should match after round-trip"
    );
}

// ============================================================================
// DNS Provider Tests
// ============================================================================

#[tokio::test]
async fn test_get_dns_provider_returns_valid_type() {
    let result = get_dns_provider().await;

    // May fail on some systems, but should not panic
    if result.is_ok() {
        let provider = result.unwrap();

        // Verify it's one of the known types by serializing
        let json = serde_json::to_value(&provider);
        assert!(json.is_ok(), "DNS provider should be serializable");
    }
}

#[tokio::test]
async fn test_set_dns_auto_provider() {
    let provider = DnsProviderType::Auto;

    let result = set_dns_provider(provider).await;

    // May succeed or fail depending on system permissions
    // Just ensure it doesn't panic
    let _ = result;
}

#[tokio::test]
async fn test_set_dns_cloudflare_standard() {
    use netok_bridge::CloudflareVariant;

    let provider = DnsProviderType::Cloudflare {
        variant: CloudflareVariant::Standard,
    };

    let result = set_dns_provider(provider).await;

    // May succeed or fail depending on system permissions
    // Just ensure it doesn't panic
    let _ = result;
}

#[tokio::test]
async fn test_set_dns_google() {
    let provider = DnsProviderType::Google;

    let result = set_dns_provider(provider).await;

    // May succeed or fail depending on system permissions
    // Just ensure it doesn't panic
    let _ = result;
}

#[tokio::test]
async fn test_set_dns_custom_provider() {
    let provider = DnsProviderType::Custom {
        primary: "1.1.1.1".to_string(),
        secondary: "8.8.8.8".to_string(),
    };

    let result = set_dns_provider(provider).await;

    // May succeed or fail depending on system permissions
    // Just ensure it doesn't panic
    let _ = result;
}

// ============================================================================
// DNS Provider Type Conversion Tests
// ============================================================================

#[test]
fn test_dns_provider_all_variants_serialize() {
    use netok_bridge::{
        AdGuardVariant, CleanBrowsingVariant, CloudflareVariant, Dns4EuVariant,
        OpenDnsVariant, Quad9Variant,
    };

    let variants = vec![
        DnsProviderType::Auto,
        DnsProviderType::Google,
        DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Standard,
        },
        DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Malware,
        },
        DnsProviderType::Cloudflare {
            variant: CloudflareVariant::Family,
        },
        DnsProviderType::AdGuard {
            variant: AdGuardVariant::Standard,
        },
        DnsProviderType::AdGuard {
            variant: AdGuardVariant::NonFiltering,
        },
        DnsProviderType::AdGuard {
            variant: AdGuardVariant::Family,
        },
        DnsProviderType::Dns4Eu {
            variant: Dns4EuVariant::Protective,
        },
        DnsProviderType::CleanBrowsing {
            variant: CleanBrowsingVariant::Family,
        },
        DnsProviderType::Quad9 {
            variant: Quad9Variant::Recommended,
        },
        DnsProviderType::OpenDns {
            variant: OpenDnsVariant::FamilyShield,
        },
        DnsProviderType::Custom {
            primary: "1.2.3.4".to_string(),
            secondary: "5.6.7.8".to_string(),
        },
    ];

    // All variants should serialize without panicking
    for variant in variants {
        let json = serde_json::to_string(&variant);
        assert!(
            json.is_ok(),
            "All DNS provider variants should serialize: {:?}",
            variant
        );
    }
}

#[test]
fn test_dns_provider_deserialization() {
    let json = r#"{"type":"Auto"}"#;
    let provider: Result<DnsProviderType, _> = serde_json::from_str(json);
    assert!(provider.is_ok(), "Auto provider should deserialize");

    let json = r#"{"type":"Google"}"#;
    let provider: Result<DnsProviderType, _> = serde_json::from_str(json);
    assert!(provider.is_ok(), "Google provider should deserialize");

    let json = r#"{"type":"Cloudflare","variant":"Standard"}"#;
    let provider: Result<DnsProviderType, _> = serde_json::from_str(json);
    assert!(
        provider.is_ok(),
        "Cloudflare provider should deserialize"
    );
}

// ============================================================================
// Error Handling Tests
// ============================================================================

#[tokio::test]
async fn test_diagnostics_completes_even_with_network_issues() {
    // This test verifies that diagnostics doesn't panic even if network is unavailable
    let result = run_diagnostics_struct().await;

    // Should complete (with partial or down status), not panic
    assert!(
        result.is_ok(),
        "Diagnostics should complete even with network issues"
    );
}

#[test]
fn test_settings_json_roundtrip() {
    // Get current settings
    let original_json = get_settings_json();

    // Parse them
    let settings: serde_json::Value = serde_json::from_str(&original_json)
        .expect("Original settings should be valid JSON");

    // Set them back
    let result = set_settings_json(&original_json);
    assert!(
        result.is_ok(),
        "Setting original settings should succeed"
    );

    // Get them again
    let new_json = get_settings_json();
    let new_settings: serde_json::Value = serde_json::from_str(&new_json)
        .expect("New settings should be valid JSON");

    // Compare key fields
    assert_eq!(
        settings.get("language"),
        new_settings.get("language"),
        "Language should match"
    );
}
