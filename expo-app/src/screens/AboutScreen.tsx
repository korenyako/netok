import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { NetokLogoIcon } from '../components/icons/NavigationIcons';
import { useTheme } from '../hooks/useTheme';

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const { t } = useTranslation();
  const { themeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('settings.about.title')}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <NetokLogoIcon size={48} color={themeColors.primary} />
          <Text style={[styles.appName, { color: themeColors.foreground }]}>Netok</Text>
          <Text style={[styles.version, { color: themeColors.mutedForeground }]}>
            {t('settings.about.version')} 0.1.0 (Mobile)
          </Text>
        </View>

        <View style={styles.infoList}>
          <View style={[styles.infoRow, { borderBottomColor: themeColors.separator }]}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>
              {t('settings.about.author')}
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.foreground }]}>
              {t('settings.about.author_value')}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: themeColors.separator }]}>
            <Text style={[styles.infoLabel, { color: themeColors.mutedForeground }]}>
              {t('settings.about.version')}
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.foreground }]}>
              0.1.0
            </Text>
          </View>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  version: {
    fontSize: 14,
  },
  infoList: {
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
  },
});
