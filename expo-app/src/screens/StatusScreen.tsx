import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { useDiagnosticsStore, shouldRefreshDiagnostics } from '../stores/diagnosticsStore';
import { deriveScenario } from '../utils/deriveScenario';
import { Globe, LockOpen, Wifi } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';

const CONNECTION_TYPE_KEYS: Record<string, string> = {
  Wifi: 'nodes.network.type_wifi',
  Ethernet: 'nodes.network.type_cable',
  Usb: 'nodes.network.type_usb_modem',
  Mobile: 'nodes.network.type_mobile',
  Unknown: 'network.unknown',
};

const CIRCLE_SIZE = 220;
const STROKE_WIDTH = 2;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;

type VisualState = 'loading' | 'success' | 'warning' | 'error';

interface StatusScreenProps {
  onOpenDiagnostics: () => void;
  onNavigateToDnsProviders: () => void;
  onNavigateToWifiSecurity: () => void;
}

export function StatusScreen({ onOpenDiagnostics, onNavigateToDnsProviders, onNavigateToWifiSecurity }: StatusScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { nodes, isRunning, lastUpdated, networkInfo, runDiagnostics } = useDiagnosticsStore();

  useEffect(() => {
    if (shouldRefreshDiagnostics(lastUpdated) && !isRunning) {
      runDiagnostics(t);
    }
  }, [lastUpdated, isRunning, runDiagnostics, t]);

  const isLoading = isRunning && nodes.length === 0;
  const scenarioResult = nodes.length > 0 ? deriveScenario(nodes) : null;
  const visualState: VisualState = isLoading
    ? 'loading'
    : (scenarioResult?.severity ?? 'success') as VisualState;

  const strokeColor = (() => {
    switch (visualState) {
      case 'loading': return themeColors.mutedForeground;
      case 'success': return themeColors.primary;
      case 'warning': return themeColors.warning;
      case 'error': return themeColors.destructive;
    }
  })();

  const circleTitle = scenarioResult
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.title`)
    : t('status.waiting');

  const showMessage = scenarioResult && scenarioResult.scenario !== 'all_good';
  const messageText = showMessage
    ? t(`diagnostic.scenario.${scenarioResult.scenario}.message`)
    : null;

  const showNetworkInfo = !isLoading && (visualState === 'success' || visualState === 'warning');

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Main circle area */}
      <TouchableOpacity
        style={styles.mainContent}
        onPress={onOpenDiagnostics}
        activeOpacity={0.8}
      >
        <View style={styles.spacer} />

        {/* Status Circle */}
        <View style={styles.circleContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
            <SvgCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              stroke={strokeColor}
              opacity={0.12}
              fill="none"
            />
            <SvgCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              stroke={strokeColor}
              fill="none"
            />
          </Svg>

          <View style={styles.circleTextContainer}>
            <Text style={[
              styles.circleTitle,
              { color: isLoading ? themeColors.mutedForeground : themeColors.foreground }
            ]}>
              {circleTitle}
            </Text>

            {showNetworkInfo && networkInfo && (
              <Text style={[styles.networkInfo, { color: themeColors.mutedForeground + '99' }]}>
                {networkInfo.connection_type && t(CONNECTION_TYPE_KEYS[networkInfo.connection_type] ?? 'network.unknown')}
                {networkInfo.ssid && ` ${networkInfo.ssid}`}
              </Text>
            )}
          </View>
        </View>

        {/* Message below circle */}
        <View style={styles.messageContainer}>
          {messageText && (
            <Text style={[
              styles.messageText,
              {
                color: visualState === 'error'
                  ? themeColors.destructive + 'BF'
                  : visualState === 'warning'
                    ? themeColors.warning + 'BF'
                    : themeColors.foreground,
              }
            ]}>
              {messageText}
            </Text>
          )}
        </View>

        <View style={styles.spacer} />
      </TouchableOpacity>

      {/* Bottom status indicators */}
      <View style={styles.indicators}>
        <TouchableOpacity style={styles.indicatorButton} onPress={onNavigateToDnsProviders}>
          <Globe size={16} color={themeColors.mutedForeground} />
          <Text style={[styles.indicatorText, { color: themeColors.mutedForeground }]}>
            {t('status.dns_protection_disabled')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.indicatorButton}>
          <LockOpen size={16} color={themeColors.mutedForeground} />
          <Text style={[styles.indicatorText, { color: themeColors.mutedForeground }]}>
            {t('status.vpn_disabled')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.indicatorButton} onPress={onNavigateToWifiSecurity}>
          <Wifi size={16} color={themeColors.mutedForeground} />
          <Text style={[styles.indicatorText, { color: themeColors.mutedForeground }]}>
            {t('protection.check_security')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  spacer: {
    flex: 1,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    position: 'relative',
    marginBottom: 16,
  },
  circleTextContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  circleTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  networkInfo: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 8,
  },
  messageContainer: {
    alignItems: 'center',
    gap: 6,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
  indicators: {
    flexShrink: 0,
    alignItems: 'center',
    gap: 2,
    paddingBottom: 16,
  },
  indicatorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  indicatorText: {
    fontSize: 14,
  },
});
