import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sun, Moon } from '../components/icons/UIIcons';
import { MenuCard } from '../components/MenuCard';
import { useTheme } from '../hooks/useTheme';

interface ThemeSettingsScreenProps {
  onBack: () => void;
}

export function ThemeSettingsScreen({ onBack }: ThemeSettingsScreenProps) {
  const { t } = useTranslation();
  const { theme, themeColors, setTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('settings.general.theme')}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.cardList}>
          <MenuCard
            variant={theme === 'light' ? 'selected' : 'ghost'}
            icon={<Sun size={20} color={theme === 'light' ? themeColors.primary : themeColors.mutedForeground} />}
            title={t('settings.general.theme_light')}
            subtitle={t('settings.general.theme_light_desc')}
            checked={theme === 'light'}
            onClick={() => setTheme('light')}
          />

          <MenuCard
            variant={theme === 'dark' ? 'selected' : 'ghost'}
            icon={<Moon size={20} color={theme === 'dark' ? themeColors.primary : themeColors.mutedForeground} />}
            title={t('settings.general.theme_dark')}
            subtitle={t('settings.general.theme_dark_desc')}
            checked={theme === 'dark'}
            onClick={() => setTheme('dark')}
          />
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
  cardList: {
    gap: 8,
  },
});
