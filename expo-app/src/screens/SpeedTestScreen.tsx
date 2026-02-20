import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Svg, { Circle as SvgCircle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { ArrowLeft, ArrowDown, ArrowUp, RotateCw, InfoCircleFilled } from '../components/icons/UIIcons';
import { useTheme } from '../hooks/useTheme';
import {
  useSpeedTestStore,
  type SpeedTestWarning,
  type ExperienceRating,
  type GraphPoint,
} from '../stores/speedTestStore';

interface SpeedTestScreenProps {
  onBack: () => void;
}

const PURPLE = '#a855f7';
const SCREEN_WIDTH = Dimensions.get('window').width;

// ── Main Screen ────────────────────────────────────────────

export function SpeedTestScreen({ onBack }: SpeedTestScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { phase, cooldownSecondsLeft, startTest, reset, cancelTest } = useSpeedTestStore();

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const isCoolingDown = cooldownSecondsLeft > 0;

  const handleRestart = useCallback(() => {
    if (isRunning) cancelTest();
    reset();
    startTest();
  }, [isRunning, cancelTest, reset, startTest]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('speed_test.title')}
        </Text>
        <TouchableOpacity
          onPress={handleRestart}
          style={styles.headerButton}
          disabled={phase === 'idle' || isCoolingDown}
        >
          <RotateCw
            size={20}
            color={phase === 'idle' || isCoolingDown
              ? themeColors.border
              : themeColors.mutedForeground
            }
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Circle progress (hidden when done) */}
        {phase !== 'done' && <CircleProgress />}

        {/* Speed metrics (download / upload) */}
        <SpeedMetrics />

        {/* Graph */}
        <SpeedGraph />

        {/* Latency metrics */}
        <LatencyMetrics />

        {/* Error state */}
        {phase === 'error' && <ErrorCard />}

        {/* Warning cards */}
        {phase === 'done' && <WarningCards />}

        {/* Experience ratings */}
        {phase === 'done' && <ExperienceRatingsSection />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Circle Progress ────────────────────────────────────────

const CIRCLE_SIZE = 220;
const STROKE_WIDTH = 2;
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircleProgress() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { phase, progress, currentValue, currentUnit, cooldownSecondsLeft, startTest } = useSpeedTestStore();

  const offset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const strokeColor = phase === 'upload' ? PURPLE : themeColors.primary;

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload';
  const canStart = (phase === 'idle' || phase === 'error') && cooldownSecondsLeft === 0;
  const showCooldown = (phase === 'idle' || phase === 'error') && cooldownSecondsLeft > 0;

  return (
    <View style={styles.circleContainer}>
      <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}>
        {/* Background circle */}
        <SvgCircle
          cx={CIRCLE_SIZE / 2}
          cy={CIRCLE_SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          stroke={themeColors.accent}
          fill="none"
        />
        {/* Progress circle */}
        {isRunning && (
          <SvgCircle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            strokeWidth={STROKE_WIDTH}
            stroke={strokeColor}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            rotation={-90}
            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
          />
        )}
      </Svg>

      <View style={styles.circleInner}>
        {/* Cooldown timer */}
        {showCooldown && (
          <View style={styles.phaseInfo}>
            <Text style={[styles.bigNumber, { color: themeColors.mutedForeground, fontFamily: 'monospace' }]}>
              {cooldownSecondsLeft}
            </Text>
            <Text style={[styles.unitLabel, { color: themeColors.mutedForeground }]}>
              {t('speed_test.cooldown_wait')}
            </Text>
          </View>
        )}

        {/* Start button */}
        {canStart && (
          <TouchableOpacity onPress={() => startTest()} activeOpacity={0.7}>
            <Text style={[styles.startText, { color: themeColors.primary }]}>
              {t('speed_test.start')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Running state */}
        {isRunning && (
          <View style={styles.phaseInfo}>
            <Text style={[styles.bigNumber, { color: themeColors.foreground, fontFamily: 'monospace' }]}>
              {currentValue}
            </Text>
            <Text style={[styles.unitLabel, { color: themeColors.mutedForeground, fontFamily: 'monospace' }]}>
              {t(currentUnit)}
            </Text>
            <View style={styles.phaseIndicator}>
              {phase === 'ping' && (
                <Text style={[styles.phaseTag, { color: strokeColor }]}>
                  {t('speed_test.phase_ping')}
                </Text>
              )}
              {phase === 'download' && (
                <ArrowDown size={16} color={themeColors.primary} />
              )}
              {phase === 'upload' && (
                <ArrowUp size={16} color={PURPLE} />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Speed Metrics ──────────────────────────────────────────

function SpeedMetrics() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { metrics } = useSpeedTestStore();

  return (
    <View style={styles.speedMetrics}>
      {/* Download */}
      <View style={styles.speedMetricItem}>
        <ArrowDown size={20} color={themeColors.primary} />
        <View style={styles.speedMetricText}>
          <Text style={[
            styles.speedMetricValue,
            { color: metrics.download !== null ? themeColors.primary : themeColors.mutedForeground, fontFamily: 'monospace' },
          ]}>
            {metrics.download !== null ? Math.round(metrics.download) : '\u2014'}
          </Text>
          {metrics.download !== null && (
            <Text style={[styles.speedMetricUnit, { color: themeColors.mutedForeground, fontFamily: 'monospace' }]}>
              {t('speed_test.unit_mbps')}
            </Text>
          )}
        </View>
      </View>

      {/* Upload */}
      <View style={styles.speedMetricItem}>
        <ArrowUp size={20} color={PURPLE} />
        <View style={styles.speedMetricText}>
          <Text style={[
            styles.speedMetricValue,
            { color: metrics.upload !== null ? PURPLE : themeColors.mutedForeground, fontFamily: 'monospace' },
          ]}>
            {metrics.upload !== null ? Math.round(metrics.upload) : '\u2014'}
          </Text>
          {metrics.upload !== null && (
            <Text style={[styles.speedMetricUnit, { color: themeColors.mutedForeground, fontFamily: 'monospace' }]}>
              {t('speed_test.unit_mbps')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ── Speed Graph (SVG) ──────────────────────────────────────

const GRAPH_HEIGHT = 80;
const GRAPH_PADDING = 5;

function SpeedGraph() {
  const { themeColors } = useTheme();
  const { downloadData, uploadData } = useSpeedTestStore();

  const hasData = downloadData.length > 1 || uploadData.length > 1;
  if (!hasData) return null;

  const graphWidth = SCREEN_WIDTH - 32; // account for px-4 padding
  const allValues = [
    ...downloadData.map((d) => d.value),
    ...uploadData.map((d) => d.value),
  ];
  const maxVal = Math.max(...allValues, 1);

  return (
    <View style={styles.graphContainer}>
      <Svg width={graphWidth} height={GRAPH_HEIGHT}>
        <Defs>
          <LinearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={themeColors.primary} stopOpacity="0.25" />
            <Stop offset="1" stopColor={themeColors.primary} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="ulGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={PURPLE} stopOpacity="0.25" />
            <Stop offset="1" stopColor={PURPLE} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {downloadData.length > 1 && (
          <>
            <Path
              d={buildFillPath(downloadData, graphWidth, GRAPH_HEIGHT, maxVal)}
              fill="url(#dlGrad)"
            />
            <Path
              d={buildLinePath(downloadData, graphWidth, GRAPH_HEIGHT, maxVal)}
              stroke={themeColors.primary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
        {uploadData.length > 1 && (
          <>
            <Path
              d={buildFillPath(uploadData, graphWidth, GRAPH_HEIGHT, maxVal)}
              fill="url(#ulGrad)"
            />
            <Path
              d={buildLinePath(uploadData, graphWidth, GRAPH_HEIGHT, maxVal)}
              stroke={PURPLE}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        )}
      </Svg>
    </View>
  );
}

function toPoint(data: GraphPoint[], index: number, width: number, height: number, maxVal: number) {
  const graphH = height - GRAPH_PADDING * 2;
  const stepX = (width - GRAPH_PADDING * 2) / Math.max(data.length - 1, 1);
  return {
    x: GRAPH_PADDING + index * stepX,
    y: GRAPH_PADDING + graphH - (data[index].value / maxVal) * graphH,
  };
}

function buildLinePath(data: GraphPoint[], width: number, height: number, maxVal: number): string {
  if (data.length < 2) return '';
  const points = data.map((_, i) => toPoint(data, i, width, height, maxVal));

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    if (i === 0) {
      d += ` L${midX},${midY}`;
    } else {
      d += ` Q${curr.x},${curr.y} ${midX},${midY}`;
    }
  }
  const last = points[points.length - 1];
  d += ` L${last.x},${last.y}`;
  return d;
}

function buildFillPath(data: GraphPoint[], width: number, height: number, maxVal: number): string {
  if (data.length < 2) return '';
  const points = data.map((_, i) => toPoint(data, i, width, height, maxVal));

  let d = `M${points[0].x},${height} L${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    if (i === 0) {
      d += ` L${midX},${midY}`;
    } else {
      d += ` Q${curr.x},${curr.y} ${midX},${midY}`;
    }
  }
  const last = points[points.length - 1];
  d += ` L${last.x},${last.y} L${last.x},${height} Z`;
  return d;
}

// ── Latency Metrics ────────────────────────────────────────

function LatencyMetrics() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { metrics } = useSpeedTestStore();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const toggleTooltip = (key: string) => {
    setActiveTooltip((prev) => (prev === key ? null : key));
  };

  return (
    <View style={styles.latencySection}>
      <View style={styles.latencyRow}>
        <LatencyItem
          label={t('speed_test.ping')}
          value={metrics.ping}
          tooltipKey="ping"
          onToggle={toggleTooltip}
          themeColors={themeColors}
          t={t}
        />
        <LatencyItem
          label={t('speed_test.latency')}
          value={metrics.latency}
          tooltipKey="latency"
          onToggle={toggleTooltip}
          themeColors={themeColors}
          t={t}
        />
        <LatencyItem
          label={t('speed_test.jitter')}
          value={metrics.jitter}
          tooltipKey="jitter"
          onToggle={toggleTooltip}
          themeColors={themeColors}
          t={t}
        />
      </View>

      {activeTooltip && (
        <View style={[styles.tooltip, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.tooltipText, { color: themeColors.cardForeground }]}>
            {t(`speed_test.tooltip_${activeTooltip}`)}
          </Text>
        </View>
      )}
    </View>
  );
}

interface LatencyItemProps {
  label: string;
  value: number | null;
  tooltipKey: string;
  onToggle: (key: string) => void;
  themeColors: Record<string, string>;
  t: (key: string) => string;
}

function LatencyItem({ label, value, tooltipKey, onToggle, themeColors, t }: LatencyItemProps) {
  return (
    <View style={styles.latencyItem}>
      <TouchableOpacity
        style={styles.latencyLabelRow}
        onPress={() => onToggle(tooltipKey)}
        activeOpacity={0.6}
      >
        <Text style={[styles.latencyLabel, { color: themeColors.mutedForeground }]}>{label}</Text>
        <InfoCircleFilled size={14} color={themeColors.mutedForeground} />
      </TouchableOpacity>
      <View style={styles.latencyValueRow}>
        {value !== null ? (
          <>
            <Text style={[styles.latencyValue, { color: themeColors.foreground, fontFamily: 'monospace' }]}>
              {Math.round(value)}
            </Text>
            <Text style={[styles.latencyUnit, { color: themeColors.mutedForeground, fontFamily: 'monospace' }]}>
              {t('speed_test.unit_ms')}
            </Text>
          </>
        ) : (
          <Text style={[styles.latencyValue, { color: themeColors.foreground, fontFamily: 'monospace' }]}>
            {'\u2014'}
          </Text>
        )}
      </View>
    </View>
  );
}

// ── Error Card ─────────────────────────────────────────────

function ErrorCard() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { error } = useSpeedTestStore();

  return (
    <View style={[styles.errorCard, { backgroundColor: themeColors.destructive + '0D' }]}>
      <Text style={[styles.errorText, { color: themeColors.destructive }]}>
        {t(error || 'speed_test.error_test_failed')}
      </Text>
    </View>
  );
}

// ── Warning Cards ──────────────────────────────────────────

function WarningCards() {
  const { t } = useTranslation();
  const { themeColors, isDark } = useTheme();
  const { warnings } = useSpeedTestStore();

  if (warnings.length === 0) return null;

  const amberBg = isDark ? 'rgba(180, 130, 0, 0.12)' : 'rgba(255, 191, 0, 0.12)';
  const amberText = isDark ? 'rgba(252, 211, 77, 0.7)' : '#b45309';

  return (
    <View style={styles.warningsContainer}>
      {warnings.map((w) => (
        <View key={w.titleKey} style={[styles.warningCard, { backgroundColor: amberBg }]}>
          <Text style={[styles.warningTitle, { color: amberText }]}>
            {t(w.titleKey)}
          </Text>
          <Text style={[styles.warningDesc, { color: amberText }]}>
            {t(w.descKey, w.descParams)}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ── Experience Ratings ─────────────────────────────────────

function ExperienceRatingsSection() {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const { experienceRatings } = useSpeedTestStore();

  if (experienceRatings.length === 0) return null;

  return (
    <View style={styles.ratingsGrid}>
      {experienceRatings.map((rating) => (
        <View key={rating.nameKey} style={[styles.ratingCard, { backgroundColor: themeColors.accent }]}>
          <Text style={[styles.ratingName, { color: themeColors.foreground }]}>
            {t(rating.nameKey)}
          </Text>
          <Text style={[styles.ratingLevel, { color: rating.color }]}>
            {t(`speed_test.rating_${rating.level}`)}
          </Text>
          <View style={[styles.ratingBarBg, { backgroundColor: themeColors.border }]}>
            <View
              style={[
                styles.ratingBarFill,
                {
                  width: `${rating.fillPercent}%`,
                  backgroundColor: rating.color,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Circle
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 24,
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
  phaseInfo: {
    alignItems: 'center',
  },
  bigNumber: {
    fontSize: 40,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  unitLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  startText: {
    fontSize: 18,
    fontWeight: '500',
  },
  phaseIndicator: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseTag: {
    fontSize: 12,
  },

  // Speed metrics
  speedMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  speedMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedMetricText: {
    alignItems: 'center',
  },
  speedMetricValue: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  speedMetricUnit: {
    fontSize: 12,
  },

  // Graph
  graphContainer: {
    marginTop: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },

  // Latency
  latencySection: {
    marginBottom: 24,
  },
  latencyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingLeft: 16,
  },
  latencyItem: {
    flex: 1,
  },
  latencyLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
    opacity: 0.7,
  },
  latencyLabel: {
    fontSize: 14,
  },
  latencyValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  latencyValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  latencyUnit: {
    fontSize: 14,
  },
  tooltip: {
    marginTop: 8,
    marginHorizontal: 8,
    borderRadius: 12,
    padding: 12,
  },
  tooltipText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Error
  errorCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
    fontSize: 14,
  },

  // Warnings
  warningsContainer: {
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  warningCard: {
    borderRadius: 12,
    padding: 16,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  warningDesc: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Ratings
  ratingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  ratingCard: {
    width: (SCREEN_WIDTH - 32 - 8 - 12) / 2, // half screen minus padding and gap
    borderRadius: 12,
    padding: 12,
  },
  ratingName: {
    fontSize: 14,
  },
  ratingLevel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
  ratingBarBg: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  ratingBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});
