import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { ArrowLeft } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';
import { useSpeedTestStore } from '../stores/speedTestStore';

interface SpeedTestScreenProps {
  onBack: () => void;
}

const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function SpeedTestScreen({ onBack }: SpeedTestScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const {
    phase,
    progress,
    currentValue,
    metrics,
    error,
    cooldownSecondsLeft,
    startTest,
  } = useSpeedTestStore();

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const phaseLabel = (() => {
    switch (phase) {
      case 'ping': return t('speed_test.phase_ping');
      case 'download': return t('speed_test.phase_download');
      case 'upload': return t('speed_test.phase_upload');
      default: return '';
    }
  })();

  const canStart = phase === 'idle' || phase === 'done' || phase === 'error';
  const isCoolingDown = cooldownSecondsLeft > 0 && canStart;

  const handleStart = () => {
    if (canStart && !isCoolingDown) {
      startTest();
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('speed_test.title')}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Progress circle */}
        <View style={styles.circleContainer}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
            <SvgCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              strokeWidth={STROKE_WIDTH}
              stroke={themeColors.accent}
              fill="none"
            />
            {isRunning && (
              <SvgCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE_WIDTH}
                stroke={themeColors.primary}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation={-90}
                origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
              />
            )}
          </Svg>

          <View style={styles.circleInner}>
            {phase === 'idle' ? (
              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: themeColors.primary }]}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={[styles.startButtonText, { color: themeColors.primaryForeground }]}>
                  {t('speed_test.start')}
                </Text>
              </TouchableOpacity>
            ) : phase === 'done' && metrics.download !== null ? (
              <View style={styles.resultInCircle}>
                <Text style={[styles.bigNumber, { color: themeColors.foreground }]}>
                  {metrics.download.toFixed(1)}
                </Text>
                <Text style={[styles.unitLabel, { color: themeColors.mutedForeground }]}>
                  {t('speed_test.unit_mbps')}
                </Text>
              </View>
            ) : phase === 'error' ? (
              <View style={styles.phaseInfo}>
                <Text style={[styles.errorText, { color: themeColors.destructive }]}>
                  {t(error || 'speed_test.error_test_failed')}
                </Text>
              </View>
            ) : isRunning ? (
              <View style={styles.phaseInfo}>
                <Text style={[styles.phaseLabel, { color: themeColors.mutedForeground }]}>
                  {phaseLabel}
                </Text>
                <Text style={[styles.bigNumber, { color: themeColors.foreground }]}>
                  {currentValue}
                </Text>
                <Text style={[styles.unitLabel, { color: themeColors.mutedForeground }]}>
                  {phase === 'ping' ? t('speed_test.unit_ms') : t('speed_test.unit_mbps')}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Results */}
        {phase === 'done' && metrics.download !== null && (
          <View style={styles.resultsGrid}>
            <View style={[styles.resultCard, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.resultLabel, { color: themeColors.mutedForeground }]}>
                {t('speed_test.download')}
              </Text>
              <Text style={[styles.resultValue, { color: themeColors.foreground }]}>
                {metrics.download!.toFixed(1)}
              </Text>
              <Text style={[styles.resultUnit, { color: themeColors.mutedForeground }]}>
                {t('speed_test.unit_mbps')}
              </Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.resultLabel, { color: themeColors.mutedForeground }]}>
                {t('speed_test.upload')}
              </Text>
              <Text style={[styles.resultValue, { color: themeColors.foreground }]}>
                {metrics.upload!.toFixed(1)}
              </Text>
              <Text style={[styles.resultUnit, { color: themeColors.mutedForeground }]}>
                {t('speed_test.unit_mbps')}
              </Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: themeColors.accent }]}>
              <Text style={[styles.resultLabel, { color: themeColors.mutedForeground }]}>
                {t('speed_test.ping')}
              </Text>
              <Text style={[styles.resultValue, { color: themeColors.foreground }]}>
                {metrics.ping}
              </Text>
              <Text style={[styles.resultUnit, { color: themeColors.mutedForeground }]}>
                {t('speed_test.unit_ms')}
              </Text>
            </View>
          </View>
        )}

        {/* Repeat / Start button */}
        {(phase === 'done' || phase === 'error') && (
          <TouchableOpacity
            style={[
              styles.repeatButton,
              {
                borderColor: themeColors.border,
                opacity: isCoolingDown ? 0.5 : 1,
              },
            ]}
            onPress={handleStart}
            disabled={isCoolingDown}
            activeOpacity={0.7}
          >
            <Text style={[styles.repeatText, { color: themeColors.foreground }]}>
              {isCoolingDown
                ? `${t('speed_test.cooldown_wait')} ${cooldownSecondsLeft}s`
                : t('speed_test.repeat')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    position: 'relative',
    marginBottom: 32,
  },
  circleInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  resultInCircle: {
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 15,
    marginTop: 2,
  },
  phaseInfo: {
    alignItems: 'center',
  },
  phaseLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  resultCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  resultLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  resultUnit: {
    fontSize: 13,
    marginTop: 2,
  },
  repeatButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  repeatText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
