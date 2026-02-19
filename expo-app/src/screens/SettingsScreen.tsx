import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Sun, Moon, Languages, Info } from '../components/icons/UIIcons';
import { MenuCard } from '../components/MenuCard';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES, type LanguageCode } from '../constants/languages';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
  onNavigateToLanguage: () => void;
  onNavigateToAbout: () => void;
}

export function SettingsScreen({ onNavigateToTheme, onNavigateToLanguage, onNavigateToAbout }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const { theme, themeColors } = useTheme();
  const currentLanguage = i18n.language;

  const themeIcon = theme === 'dark'
    ? <Moon size={20} color={themeColors.mutedForeground} />
    : <Sun size={20} color={themeColors.mutedForeground} />;

  const themeSubtitle = theme === 'dark'
    ? t('settings.general.theme_dark')
    : t('settings.general.theme_light');

  const languageSubtitle = LANGUAGES[currentLanguage as LanguageCode]?.native || currentLanguage;

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('settings.title')}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <View style={styles.cardList}>
          <MenuCard
            icon={themeIcon}
            title={t('settings.general.theme')}
            subtitle={themeSubtitle}
            trailing="chevron"
            onClick={onNavigateToTheme}
          />

          <MenuCard
            icon={<Languages size={20} color={themeColors.mutedForeground} />}
            title={t('settings.general.language')}
            subtitle={languageSubtitle}
            trailing="chevron"
            onClick={onNavigateToLanguage}
          />

          <MenuCard
            icon={<Info size={20} color={themeColors.mutedForeground} />}
            title={t('settings.general.about')}
            subtitle={t('settings.general.about_desc')}
            trailing="chevron"
            onClick={onNavigateToAbout}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollInner: {
    paddingBottom: 16,
  },
  cardList: {
    gap: 8,
  },
});
