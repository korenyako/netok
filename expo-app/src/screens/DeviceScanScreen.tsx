import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw, Smartphone, Monitor, Tv, Cpu } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';
import { scanNetworkDevices } from '../api/network';
import type { NetworkDevice, DeviceType } from '../api/types';

interface DeviceScanScreenProps {
  onBack: () => void;
}

function getDeviceIcon(type: DeviceType, color: string) {
  switch (type) {
    case 'Phone': return <Smartphone size={20} color={color} />;
    case 'Computer': return <Monitor size={20} color={color} />;
    case 'SmartTv': return <Tv size={20} color={color} />;
    case 'Router': return <Cpu size={20} color={color} />;
    default: return <Cpu size={20} color={color} />;
  }
}

export function DeviceScanScreen({ onBack }: DeviceScanScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const runScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const result = await scanNetworkDevices();
      setDevices(result);
      setHasScanned(true);
    } catch (err) {
      console.error('Device scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const getDeviceTypeName = (type: DeviceType): string => {
    const key = `device_scan.type_${type.toLowerCase()}`;
    return t(key);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('device_scan.title')}
        </Text>
        <TouchableOpacity onPress={runScan} disabled={isScanning} style={styles.headerButton}>
          <RotateCw size={20} color={isScanning ? themeColors.mutedForeground + '40' : themeColors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {!hasScanned && !isScanning ? (
        <View style={styles.emptyState}>
          <TouchableOpacity
            style={[styles.scanButton, { backgroundColor: themeColors.primary }]}
            onPress={runScan}
            activeOpacity={0.8}
          >
            <Text style={[styles.scanButtonText, { color: themeColors.primaryForeground }]}>
              {t('device_scan.title')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : isScanning ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.scanningText, { color: themeColors.mutedForeground }]}>
            {t('device_scan.scanning')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          <Text style={[styles.countText, { color: themeColors.mutedForeground }]}>
            {t('device_scan.found', { count: devices.length })}
          </Text>
          <View style={styles.deviceList}>
            {devices.map((device, index) => (
              <View key={index} style={[styles.deviceCard, { backgroundColor: themeColors.accent }]}>
                <View style={styles.deviceIcon}>
                  {getDeviceIcon(device.device_type, themeColors.mutedForeground)}
                </View>
                <View style={styles.deviceInfo}>
                  <View style={styles.deviceNameRow}>
                    <Text style={[styles.deviceName, { color: themeColors.foreground }]}>
                      {device.vendor
                        ? t('device_scan.branded_device', { name: device.vendor })
                        : getDeviceTypeName(device.device_type)}
                    </Text>
                    {device.is_gateway && (
                      <View style={[styles.deviceBadge, { backgroundColor: themeColors.primary + '1A' }]}>
                        <Text style={[styles.deviceBadgeText, { color: themeColors.primary }]}>
                          {t('device_scan.badge_router')}
                        </Text>
                      </View>
                    )}
                    {device.is_self && (
                      <View style={[styles.deviceBadge, { backgroundColor: themeColors.primary + '1A' }]}>
                        <Text style={[styles.deviceBadgeText, { color: themeColors.primary }]}>
                          {t('device_scan.badge_this_device')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.deviceIp, { color: themeColors.mutedForeground }]}>
                    {device.ip} · {device.mac}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  scanButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scanningText: {
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  countText: {
    fontSize: 14,
    marginBottom: 12,
  },
  deviceList: {
    gap: 8,
  },
  deviceCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  deviceIcon: {
    flexShrink: 0,
  },
  deviceInfo: {
    flex: 1,
    minWidth: 0,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '500',
  },
  deviceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  deviceBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deviceIp: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
