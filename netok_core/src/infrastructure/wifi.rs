//! Wi-Fi information retrieval.

/// State of the Wi-Fi adapter as reported by the WLAN API.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WifiAdapterState {
    /// No wireless interface found on the system
    Absent,
    /// Adapter exists but is disabled / not ready
    Disabled,
    /// Adapter is enabled but not connected to any network
    Disconnected,
    /// Adapter is connected to a network
    Connected,
}

/// Get Wi-Fi information on Windows using WLAN API.
///
/// Returns a tuple of (SSID, RSSI in dBm, interface description, adapter state)
/// for the currently connected Wi-Fi network.
///
/// When not connected:
/// - SSID and RSSI are None
/// - adapter state distinguishes Absent / Disabled / Disconnected
///
/// # Platform Support
/// - **Windows**: Full support via Windows WLAN API
/// - **macOS/Linux**: Returns (None, None, None, Absent) - TODO
///
/// # Safety
/// This function uses the Windows WLAN API which requires careful resource management.
/// All safety invariants are documented inline within the unsafe block.
#[cfg(target_os = "windows")]
pub fn get_wifi_info() -> (Option<String>, Option<i32>, Option<String>, WifiAdapterState) {
    use std::ptr;
    use windows::Win32::Foundation::*;
    use windows::Win32::NetworkManagement::WiFi::*;

    /// RAII guard for WLAN client handle to ensure proper cleanup.
    ///
    /// SAFETY: This guard ensures that WlanCloseHandle is called when the guard
    /// is dropped, preventing resource leaks.
    struct WlanHandle(HANDLE);

    impl Drop for WlanHandle {
        fn drop(&mut self) {
            // SAFETY: The handle is valid (checked at creation) and must be closed
            // to free system resources. WlanCloseHandle is safe to call even if
            // other WLAN operations have failed.
            unsafe {
                let _ = WlanCloseHandle(self.0, None);
            }
        }
    }

    // SAFETY: This entire function operates on Windows WLAN API with the following invariants:
    //
    // 1. Resource Management:
    //    - WlanOpenHandle creates a handle that MUST be closed with WlanCloseHandle
    //    - WlanEnumInterfaces allocates memory that MUST be freed with WlanFreeMemory
    //    - WlanQueryInterface allocates memory that MUST be freed with WlanFreeMemory
    //    - All handles and pointers are checked for validity before use
    //
    // 2. Pointer Safety:
    //    - All pointers from Windows API are checked for null before dereferencing
    //    - Pointer lifetime is limited to the scope where Windows owns the memory
    //    - UTF-16 strings are bounds-checked before conversion
    //
    // 3. Array Access:
    //    - Interface list iteration uses dwNumberOfItems as the bounds check
    //    - SSID byte array access is bounds-checked with uSSIDLength
    //    - Interface description array uses null-terminator search with bounds
    //
    // 4. Error Handling:
    //    - All Windows API calls check return codes (0 = success, non-zero = error)
    //    - Early returns ensure cleanup code is reached via RAII guard
    //    - Invalid handles detected via is_invalid() check
    unsafe {
        let mut client_handle: HANDLE = HANDLE::default();
        let mut negotiated_version: u32 = 0;

        // SAFETY: WlanOpenHandle initializes a WLAN client session.
        // - Version 2 is valid for Windows Vista and later
        // - Output parameters are valid pointers to local variables
        // - Return code is checked for errors
        let result = WlanOpenHandle(
            2,    // Client version for Windows Vista and later
            None, // Reserved parameter, must be None
            &mut negotiated_version,
            &mut client_handle,
        );

        if result != 0 || client_handle.is_invalid() {
            return (None, None, None, WifiAdapterState::Absent);
        }

        // Wrap handle in RAII guard to ensure cleanup on all code paths
        let _handle_guard = WlanHandle(client_handle);

        // SAFETY: WlanEnumInterfaces retrieves list of WLAN interfaces.
        // - client_handle is valid (checked above)
        // - interface_list pointer is valid (local variable)
        // - Return code is checked for errors
        // - Returned memory MUST be freed with WlanFreeMemory
        let mut interface_list: *mut WLAN_INTERFACE_INFO_LIST = ptr::null_mut();
        let result = WlanEnumInterfaces(client_handle, None, &mut interface_list);

        if result != 0 || interface_list.is_null() {
            return (None, None, None, WifiAdapterState::Absent);
        }

        let mut ssid = None;
        let mut rssi = None;
        let mut interface_desc = None;
        let mut adapter_state = WifiAdapterState::Absent;

        // SAFETY: Dereferencing interface_list pointer.
        // - Pointer is non-null (checked above)
        // - Memory is valid (allocated by WlanEnumInterfaces)
        // - Struct layout matches Windows API definition
        let list = &*interface_list;

        // Iterate through all interfaces to find connected Wi-Fi
        for i in 0..list.dwNumberOfItems as usize {
            // SAFETY: Array access within bounds.
            // - i < dwNumberOfItems (loop condition)
            // - InterfaceInfo is a flexible array member with dwNumberOfItems elements
            let interface = &list.InterfaceInfo[i];

            // Get interface description (UTF-16 string)
            // SAFETY: Interface description is a fixed-size array of u16 (UTF-16)
            let desc_bytes = &interface.strInterfaceDescription;
            let desc_len = desc_bytes
                .iter()
                .position(|&c| c == 0)
                .unwrap_or(desc_bytes.len());
            if desc_len > 0 {
                // String::from_utf16 safely handles UTF-16 conversion
                interface_desc = String::from_utf16(&desc_bytes[..desc_len]).ok();
            }

            // Track the best adapter state across all interfaces
            // (prefer Connected > Disconnected > Disabled > Absent)
            if interface.isState == wlan_interface_state_not_ready {
                if adapter_state == WifiAdapterState::Absent {
                    adapter_state = WifiAdapterState::Disabled;
                }
            } else if interface.isState != wlan_interface_state_connected {
                // Any state other than not_ready and connected means the adapter
                // is enabled (disconnected, scanning, associating, etc.)
                if adapter_state != WifiAdapterState::Connected {
                    adapter_state = WifiAdapterState::Disconnected;
                }
            }

            if interface.isState == wlan_interface_state_connected {
                adapter_state = WifiAdapterState::Connected;
                // Query current connection
                let mut data_size: u32 = 0;
                let mut connection_attrs: *mut WLAN_CONNECTION_ATTRIBUTES = ptr::null_mut();

                // SAFETY: WlanQueryInterface queries interface properties.
                // - client_handle is valid (wrapped in guard)
                // - interface GUID is from valid interface structure
                // - connection_attrs pointer is valid (local variable)
                // - Return code is checked for errors
                // - Returned memory MUST be freed with WlanFreeMemory
                let result = WlanQueryInterface(
                    client_handle,
                    &interface.InterfaceGuid,
                    wlan_intf_opcode_current_connection,
                    None, // Reserved parameter
                    &mut data_size,
                    std::ptr::addr_of_mut!(connection_attrs) as *mut *mut core::ffi::c_void,
                    None, // opcode value type (not needed)
                );

                if result == 0 && !connection_attrs.is_null() {
                    // SAFETY: Dereferencing connection_attrs pointer.
                    // - Pointer is non-null (checked above)
                    // - Memory is valid (allocated by WlanQueryInterface)
                    // - Struct layout matches Windows API definition
                    let attrs = &*connection_attrs;

                    // Get SSID (fixed-size byte array)
                    let ssid_len = attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength as usize;
                    if ssid_len > 0 && ssid_len <= 32 {
                        // SAFETY: SSID array access within bounds
                        // - ssid_len <= 32 (DOT11_SSID_MAX_LENGTH)
                        // - ucSSID is a fixed-size array of 32 bytes
                        let ssid_bytes =
                            &attrs.wlanAssociationAttributes.dot11Ssid.ucSSID[..ssid_len];
                        ssid = String::from_utf8(ssid_bytes.to_vec()).ok();
                    }

                    // Get signal quality (0-100) and convert to approximate RSSI
                    let quality = attrs.wlanAssociationAttributes.wlanSignalQuality;
                    // Rough conversion: 100% ≈ -40 dBm, 0% ≈ -90 dBm
                    rssi = Some(-90 + (quality as i32) / 2);

                    // SAFETY: Free memory allocated by WlanQueryInterface
                    // - connection_attrs is non-null and was allocated by Windows API
                    WlanFreeMemory(connection_attrs as *const core::ffi::c_void);
                }

                // Found connected interface, no need to check others
                break;
            }
        }

        // SAFETY: Free memory allocated by WlanEnumInterfaces
        // - interface_list is non-null and was allocated by Windows API
        WlanFreeMemory(interface_list as *const core::ffi::c_void);

        // Note: WlanCloseHandle is called automatically by _handle_guard destructor

        (ssid, rssi, interface_desc, adapter_state)
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_wifi_info() -> (Option<String>, Option<i32>, Option<String>, WifiAdapterState) {
    // TODO: Implement for Linux and macOS
    (None, None, None, WifiAdapterState::Absent)
}
