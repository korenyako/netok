import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { ArrowLeft, Copy, ArrowUpRight } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';
import type { SingleNodeResult } from '../api/types';

interface NodeDetailScreenProps {
  nodeId: string;
  result: SingleNodeResult;
  onBack: () => void;
}

function cleanIspName(isp: string): string {
  return isp.replace(/^AS\d+\s+/, '');
}

function getNodeTitleKey(nodeId: string): string {
  switch (nodeId) {
    case 'computer': return 'diagnostics.computer';
    case 'network': return 'diagnostics.wifi';
    case 'dns': return 'diagnostics.router';
    case 'internet': return 'diagnostics.internet';
    default: return '';
  }
}

function getSignalQualityKey(rssi: number): string {
  if (rssi >= -50) return 'nodes.network.signal_excellent';
  if (rssi >= -60) return 'nodes.network.signal_good';
  if (rssi >= -70) return 'nodes.network.signal_fair';
  return 'nodes.network.signal_weak';
}

interface InfoRow {
  label: string;
  value: string;
  copyable?: boolean;
}

export function NodeDetailScreen({ nodeId, result, onBack }: NodeDetailScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const routerIp = nodeId === 'dns' ? result.router?.gateway_ip : null;

  const handleOpenRouter = () => {
    if (routerIp) {
      Linking.openURL(`http://${routerIp}`);
    }
  };

  const rows: InfoRow[] = [];

  if (nodeId === 'computer' && result.computer) {
    if (result.computer.adapter) {
      rows.push({ label: t('node_detail.adapter'), value: result.computer.adapter });
    }
    if (result.computer.local_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.computer.local_ip, copyable: true });
    }
  }

  if (nodeId === 'network' && result.network) {
    if (result.network.ssid) {
      rows.push({ label: t('node_detail.network_name'), value: result.network.ssid });
    }
    if (result.network.rssi !== null) {
      const qualityText = t(getSignalQualityKey(result.network.rssi));
      rows.push({ label: t('node_detail.signal'), value: `${qualityText} (${result.network.rssi} dBm)` });
    }
  }

  if (nodeId === 'dns' && result.router) {
    if (result.router.vendor) {
      rows.push({ label: t('node_detail.manufacturer'), value: result.router.vendor });
    }
    if (result.router.gateway_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.router.gateway_ip, copyable: true });
    }
  }

  if (nodeId === 'internet' && result.internet) {
    if (result.internet.isp) {
      rows.push({ label: t('node_detail.isp'), value: cleanIspName(result.internet.isp) });
    }
    if (result.internet.city && result.internet.country) {
      rows.push({ label: t('node_detail.location'), value: `${result.internet.city}, ${result.internet.country}` });
    } else if (result.internet.country) {
      rows.push({ label: t('node_detail.location'), value: result.internet.country });
    } else if (result.internet.city) {
      rows.push({ label: t('node_detail.location'), value: result.internet.city });
    }
    if (result.internet.public_ip) {
      rows.push({ label: t('node_detail.ip_address'), value: result.internet.public_ip, copyable: true });
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t(getNodeTitleKey(nodeId))}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <View style={styles.rowList}>
          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: themeColors.mutedForeground }]}>
                {row.label}
              </Text>
              {row.copyable ? (
                <TouchableOpacity
                  style={styles.copyRow}
                  onPress={() => handleCopy(row.value)}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.rowValueCopyable, { color: '#22d3ee' }]}>
                    {row.value}
                  </Text>
                  <Copy size={14} color={themeColors.mutedForeground} />
                </TouchableOpacity>
              ) : (
                <Text style={[styles.rowValue, { color: themeColors.foreground }]}>
                  {row.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        {routerIp && (
          <TouchableOpacity
            style={[styles.openRouterButton, { borderColor: themeColors.border }]}
            onPress={handleOpenRouter}
            activeOpacity={0.7}
          >
            <Text style={[styles.openRouterText, { color: themeColors.foreground }]}>
              {t('node_detail.open_router')}
            </Text>
            <ArrowUpRight size={16} color={themeColors.mutedForeground} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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
    fontSize: 20,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  rowList: {
    gap: 20,
    paddingLeft: 48,
  },
  row: {
    gap: 4,
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 15,
  },
  rowValueCopyable: {
    fontSize: 15,
    fontFamily: 'monospace',
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openRouterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  openRouterText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
