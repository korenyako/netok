import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon } from '../components/icons/DiagnosticStatusIcons';
import { useTheme } from '../hooks/useTheme';
import { checkWifiSecurity } from '../api/network';
import type { WiFiSecurityReport, SecurityCheck, SecurityStatus } from '../api/types';

interface WiFiSecurityScreenProps {
  onBack: () => void;
}

const CHECK_NAMES: Record<string, string> = {
  encryption: 'wifi_security.check_encryption',
  evil_twin: 'wifi_security.check_evil_twin',
  arp_spoofing: 'wifi_security.check_arp_spoofing',
  dns_hijacking: 'wifi_security.check_dns_hijacking',
};

const CHECK_DETAILS: Record<string, Record<SecurityStatus, string>> = {
  encryption: {
    safe: 'wifi_security.encryption_safe',
    warning: 'wifi_security.encryption_warning_wep',
    danger: 'wifi_security.encryption_danger',
  },
  evil_twin: {
    safe: 'wifi_security.evil_twin_safe',
    warning: 'wifi_security.evil_twin_warning',
    danger: 'wifi_security.evil_twin_warning',
  },
  arp_spoofing: {
    safe: 'wifi_security.arp_safe',
    warning: 'wifi_security.arp_warning',
    danger: 'wifi_security.arp_danger',
  },
  dns_hijacking: {
    safe: 'wifi_security.dns_safe',
    warning: 'wifi_security.dns_warning',
    danger: 'wifi_security.dns_warning',
  },
};

export function WiFiSecurityScreen({ onBack }: WiFiSecurityScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const [report, setReport] = useState<WiFiSecurityReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [visibleChecks, setVisibleChecks] = useState<number>(0);

  const runScan = useCallback(async () => {
    setIsScanning(true);
    setVisibleChecks(0);
    setReport(null);
    try {
      const result = await checkWifiSecurity();
      setReport(result);
      // Staggered reveal
      for (let i = 1; i <= result.checks.length; i++) {
        await new Promise(r => setTimeout(r, 250));
        setVisibleChecks(i);
      }
    } catch (err) {
      console.error('WiFi security check failed:', err);
    } finally {
      setIsScanning(false);
    }
  }, []);

  useEffect(() => {
    runScan();
  }, [runScan]);

  const getStatusIcon = (status: SecurityStatus) => {
    switch (status) {
      case 'safe': return <NodeOkIcon size={20} color={themeColors.success} />;
      case 'warning': return <NodeWarningIcon size={20} color={themeColors.warning} />;
      case 'danger': return <NodeErrorIcon size={20} color={themeColors.destructive} />;
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('wifi_security.title')}
        </Text>
      </View>

      {isScanning && !report ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.mutedForeground }]}>
            {t('wifi_security.scanning')}
          </Text>
        </View>
      ) : report ? (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          {/* Overall status */}
          <View style={[styles.overallCard, {
            backgroundColor: report.overall_status === 'safe'
              ? themeColors.success + '15'
              : report.overall_status === 'warning'
                ? themeColors.warning + '15'
                : themeColors.destructive + '15',
          }]}>
            <ShieldCheck
              size={24}
              color={report.overall_status === 'safe'
                ? themeColors.success
                : report.overall_status === 'warning'
                  ? themeColors.warning
                  : themeColors.destructive}
            />
            <Text style={[styles.overallText, {
              color: report.overall_status === 'safe'
                ? themeColors.success
                : report.overall_status === 'warning'
                  ? themeColors.warning
                  : themeColors.destructive,
            }]}>
              {t(`wifi_security.overall_${report.overall_status}`)}
            </Text>
          </View>

          {report.network_ssid && (
            <Text style={[styles.networkName, { color: themeColors.mutedForeground }]}>
              {t('wifi_security.network', { ssid: report.network_ssid })}
            </Text>
          )}

          {/* Individual checks */}
          <View style={styles.checkList}>
            {report.checks.slice(0, visibleChecks).map((check, index) => (
              <View key={index} style={[styles.checkCard, { backgroundColor: themeColors.accent }]}>
                <View style={styles.checkHeader}>
                  {getStatusIcon(check.status)}
                  <Text style={[styles.checkName, { color: themeColors.foreground }]}>
                    {t(CHECK_NAMES[check.check_type] || check.check_type)}
                  </Text>
                </View>
                <Text style={[styles.checkDetail, { color: themeColors.mutedForeground }]}>
                  {t(CHECK_DETAILS[check.check_type]?.[check.status] || '')}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : null}
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
  loadingState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 17,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  overallText: {
    fontSize: 17,
    fontWeight: '600',
  },
  networkName: {
    fontSize: 15,
    marginBottom: 16,
  },
  checkList: {
    gap: 8,
  },
  checkCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkName: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkDetail: {
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 28,
  },
});
