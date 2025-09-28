#[cfg(windows)]
use winapi::{
    shared::{
        guiddef::GUID,
        winerror::ERROR_SUCCESS,
        minwindef::TRUE,
        wlantypes::DOT11_SSID,
    },
    um::{
        winnt::HANDLE,
        wlanapi::*,
    },
};

#[cfg(windows)]
fn guid_eq(a: &GUID, b: &GUID) -> bool {
    a.Data1 == b.Data1 && a.Data2 == b.Data2 && a.Data3 == b.Data3 && a.Data4 == b.Data4
}

#[cfg(windows)]
fn parse_guid_braced(s: &str) -> Option<GUID> {
    // "{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}"
    let s = s.trim();
    let s = s.strip_prefix('{').and_then(|x| x.strip_suffix('}')).unwrap_or(s);
    let uuid = uuid::Uuid::parse_str(s).ok()?;
    let _bytes = *uuid.as_bytes();
    // GUID layout matches Uuid bytes order? Use from_fields to be precise.
    let (d1, d2, d3, d4) = uuid.as_fields();
    Some(GUID {
        Data1: d1,
        Data2: d2,
        Data3: d3,
        Data4: *d4,
    })
}

#[cfg(windows)]
pub struct WlanConnInfo {
    pub ssid: Option<String>,
    pub bssid: Option<String>, // "aa:bb:cc:dd:ee:ff"
    pub quality_0_100: Option<u32>,
    pub rssi_dbm: Option<i32>, // если нашли BSS entry
}

/// Возвращает SSID/BSSID/quality/RSSI для заданного интерфейса GUID ("{...}") если он подключен.
#[cfg(windows)]
pub unsafe fn wlan_conn_info_for_interface_guid(if_guid_braced: &str) -> Option<WlanConnInfo> {
    let guid = parse_guid_braced(if_guid_braced)?;
    let mut client: HANDLE = std::ptr::null_mut();
    let mut ver: u32 = 0;
    if WlanOpenHandle(2, std::ptr::null_mut(), &mut ver, &mut client) != ERROR_SUCCESS {
        return None;
    }
    let mut if_list_ptr: *mut WLAN_INTERFACE_INFO_LIST = std::ptr::null_mut();
    let mut out: Option<WlanConnInfo> = None;

    if WlanEnumInterfaces(client, std::ptr::null_mut(), &mut if_list_ptr) == ERROR_SUCCESS && !if_list_ptr.is_null() {
        let list = &*if_list_ptr;
        for i in 0..list.dwNumberOfItems {
            let info = &list.InterfaceInfo[i as usize];
            if guid_eq(&info.InterfaceGuid, &guid) {
                // 1) current connection (SSID/BSSID + quality)
                let mut data_size: u32 = 0;
                let mut data_ptr: *mut winapi::ctypes::c_void = std::ptr::null_mut();
                if WlanQueryInterface(
                    client,
                    &info.InterfaceGuid,
                    wlan_intf_opcode_current_connection,
                    std::ptr::null_mut(),
                    &mut data_size,
                    &mut data_ptr,
                    std::ptr::null_mut(),
                ) == ERROR_SUCCESS && !data_ptr.is_null()
                {
                    let attrs = &*(data_ptr as *const WLAN_CONNECTION_ATTRIBUTES);
                    if attrs.isState == wlan_interface_state_connected {
                        // SSID
                        let ssid = {
                            let len = attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength as usize;
                            let bytes = &attrs.wlanAssociationAttributes.dot11Ssid.ucSSID[..len];
                            Some(String::from_utf8_lossy(bytes).to_string())
                        };
                        // BSSID
                        let bssid = {
                            let mac = attrs.wlanAssociationAttributes.dot11Bssid;
                            Some(format!("{:02x}:{:02x}:{:02x}:{:02x}:{:02x}:{:02x}",
                                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]))
                        };
                        let quality = Some(attrs.wlanAssociationAttributes.wlanSignalQuality as u32);

                        // 2) try to get BSS list and find exact BSSID → RSSI
                        let mut bss_list_ptr: *mut WLAN_BSS_LIST = std::ptr::null_mut();
                        let ssid_ref = DOT11_SSID {
                            uSSIDLength: attrs.wlanAssociationAttributes.dot11Ssid.uSSIDLength,
                            ucSSID: attrs.wlanAssociationAttributes.dot11Ssid.ucSSID,
                        };
                        let mut rssi_dbm: Option<i32> = None;
                        if WlanGetNetworkBssList(
                            client,
                            &info.InterfaceGuid,
                            &ssid_ref as *const _ as *mut _,
                            1, // DOT11_BSS_TYPE_infrastructure
                            TRUE,
                            std::ptr::null_mut(),
                            &mut bss_list_ptr,
                        ) == ERROR_SUCCESS && !bss_list_ptr.is_null()
                        {
                            let bss_list = &*bss_list_ptr;
                            for j in 0..bss_list.dwNumberOfItems {
                                let e = &bss_list.wlanBssEntries[j as usize];
                                if e.dot11Bssid == attrs.wlanAssociationAttributes.dot11Bssid {
                                    rssi_dbm = Some(e.lRssi);
                                    break;
                                }
                            }
                            WlanFreeMemory(bss_list_ptr as _);
                        }

                        out = Some(WlanConnInfo {
                            ssid,
                            bssid,
                            quality_0_100: quality,
                            rssi_dbm,
                        });
                    }
                    WlanFreeMemory(data_ptr as _);
                }
                break;
            }
        }
        WlanFreeMemory(if_list_ptr as _);
    }

    WlanCloseHandle(client, std::ptr::null_mut());
    out
}

#[cfg(not(windows))]
pub struct WlanConnInfo {
    pub ssid: Option<String>,
    pub bssid: Option<String>,
    pub quality_0_100: Option<u32>,
    pub rssi_dbm: Option<i32>,
}

#[cfg(not(windows))]
pub unsafe fn wlan_conn_info_for_interface_guid(_if_guid_braced: &str) -> Option<WlanConnInfo> {
    None
}

/// Return RSSI in dBm for given WLAN interface GUID (string with braces), or None.
#[cfg(windows)]
pub unsafe fn wlan_rssi_dbm_for_interface_guid(if_guid_braced: &str) -> Option<i32> {
    wlan_conn_info_for_interface_guid(if_guid_braced)?.rssi_dbm
}

#[cfg(not(windows))]
pub unsafe fn wlan_rssi_dbm_for_interface_guid(_if_guid_braced: &str) -> Option<i32> {
    None
}
