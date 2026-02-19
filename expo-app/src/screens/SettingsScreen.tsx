import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sun, Moon, Languages, Info } from '../components/icons/UIIcons';
import { MenuCard } from '../components/MenuCard';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES, type LanguageCode } from '../constants/languages';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToTheme: () => void;
  onNavigateToLanguage: () => void;
  onNavigateToAbout: () => void;
}

export function SettingsScreen({ onBack, onNavigateToTheme, onNavigateToLanguage, onNavigateToAbout }: SettingsScreenProps) {
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
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
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
  cardList: {
    gap: 8,
  },
});
