import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Activity, Gauge, MonitorSmartphone, Wifi } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';

interface ToolsScreenProps {
  onOpenDiagnostics: () => void;
  onOpenSpeedTest: () => void;
  onOpenDeviceScan: () => void;
  onOpenWifiSecurity: () => void;
}

export function ToolsScreen({ onOpenDiagnostics, onOpenSpeedTest, onOpenDeviceScan, onOpenWifiSecurity }: ToolsScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();

  const tools = [
    {
      id: 'diagnostics',
      nameKey: 'diagnostics.title',
      icon: <Activity size={24} color={themeColors.primary} />,
      onPress: onOpenDiagnostics,
    },
    {
      id: 'speed-test',
      nameKey: 'settings.tools.speed_test',
      icon: <Gauge size={24} color="#A855F7" />,
      onPress: onOpenSpeedTest,
    },
    {
      id: 'device-scan',
      nameKey: 'settings.tools.device_scan',
      icon: <MonitorSmartphone size={24} color="#F59E0B" />,
      onPress: onOpenDeviceScan,
    },
    {
      id: 'wifi-security',
      nameKey: 'settings.tools.wifi_security',
      icon: <Wifi size={24} color="#06B6D4" />,
      onPress: onOpenWifiSecurity,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('settings.tabs.tools')}
        </Text>
      </View>

      <View style={styles.grid}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.tile, { backgroundColor: themeColors.accent }]}
            onPress={tool.onPress}
            activeOpacity={0.7}
          >
            <View>{tool.icon}</View>
            <Text style={[styles.tileName, { color: themeColors.foreground }]}>
              {t(tool.nameKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  tile: {
    width: '47%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  tileName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
