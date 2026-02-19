import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { MenuCard } from '../components/MenuCard';
import { deriveScenario } from '../utils/deriveScenario';
import { useDiagnosticsStore, type NetworkNode } from '../stores/diagnosticsStore';
import { useTheme } from '../hooks/useTheme';

const LOADING_LABELS = [
  'diagnostics.computer',
  'diagnostics.wifi',
  'diagnostics.router',
  'diagnostics.internet',
];

interface DiagnosticsScreenProps {
  onBack: () => void;
}

export function DiagnosticsScreen({ onBack }: DiagnosticsScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();
  const {
    nodes,
    isRunning,
    currentCheckIndex,
    error,
    runDiagnostics,
  } = useDiagnosticsStore();

  useEffect(() => {
    runDiagnostics(t);
  }, [runDiagnostics, t]);

  const handleRefresh = () => {
    runDiagnostics(t);
  };

  const getStatusIcon = (status: NetworkNode['status']) => {
    if (status === 'ok') return <NodeOkIcon size={20} color={themeColors.primary} />;
    if (status === 'partial') return <NodeWarningIcon size={20} color={themeColors.warning} />;
    if (status === 'down') return <NodeErrorIcon size={20} color={themeColors.destructive} />;
    return <NodeLoadingIcon size={20} color={themeColors.mutedForeground} />;
  };

  const isActive = currentCheckIndex >= 0 && currentCheckIndex < 4;
  const scenarioResult = !isRunning && nodes.length > 0 ? deriveScenario(nodes) : null;
  const showScenarioMessage = scenarioResult !== null && scenarioResult.scenario !== 'all_good';
  const hasLoadingPlaceholder = isActive && currentCheckIndex >= nodes.length;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('diagnostics.title')}
        </Text>
        <TouchableOpacity onPress={handleRefresh} disabled={isRunning} style={styles.headerButton}>
          <RotateCw size={20} color={isRunning ? themeColors.mutedForeground + '40' : themeColors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && nodes.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: themeColors.foreground }]}>
            {t('errors.diagnostics')}
          </Text>
          <Text style={[styles.errorDetail, { color: themeColors.mutedForeground }]}>
            {error}
          </Text>
        </View>
      )}

      {/* Content */}
      {(nodes.length > 0 || isActive) && (
        <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
          {/* Scenario message */}
          {showScenarioMessage && (
            <View style={[styles.scenarioCard, {
              backgroundColor: scenarioResult.severity === 'error'
                ? themeColors.destructive + '15'
                : themeColors.warning + '15',
              borderLeftColor: scenarioResult.severity === 'error'
                ? themeColors.destructive
                : themeColors.warning,
            }]}>
              <Text style={[styles.scenarioTitle, {
                color: scenarioResult.severity === 'error'
                  ? themeColors.destructive
                  : themeColors.warning,
              }]}>
                {t(`diagnostic.scenario.${scenarioResult.scenario}.title`)}
              </Text>
              <Text style={[styles.scenarioMessage, { color: themeColors.foreground }]}>
                {t(`diagnostic.scenario.${scenarioResult.scenario}.message`)}
              </Text>
            </View>
          )}

          {/* Error inline */}
          {error && nodes.length > 0 && (
            <Text style={[styles.errorInline, { color: themeColors.destructive }]}>
              {error}
            </Text>
          )}

          {/* Node cards */}
          <View style={styles.nodeList}>
            {nodes.map((node) => (
              <MenuCard
                key={node.id}
                variant="ghost"
                icon={getStatusIcon(node.status)}
                title={t(node.title)}
                subtitle={node.details.map(d => d.text).join(' · ') || undefined}
                trailing="chevron"
              />
            ))}

            {/* Loading placeholder */}
            {hasLoadingPlaceholder && (
              <MenuCard
                variant="static"
                icon={<ActivityIndicator size="small" color={themeColors.mutedForeground} />}
                title={t(LOADING_LABELS[currentCheckIndex])}
                subtitle={t('diagnostics.checking')}
                muted
              />
            )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  errorDetail: {
    fontSize: 14,
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  scenarioCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 3,
    marginBottom: 12,
  },
  scenarioTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  scenarioMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorInline: {
    fontSize: 14,
    marginBottom: 16,
  },
  nodeList: {
    gap: 8,
  },
});
