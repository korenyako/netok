import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { MenuCard } from '../components/MenuCard';
import { useTheme } from '../hooks/useTheme';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LanguageSettingsScreenProps {
  onBack: () => void;
}

export function LanguageSettingsScreen({ onBack }: LanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const { themeColors } = useTheme();
  const currentLang = i18n.language;

  const handleLanguageSelect = async (code: LanguageCode) => {
    await i18n.changeLanguage(code);
    await AsyncStorage.setItem('netok.lang', code);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <ArrowLeft size={20} color={themeColors.mutedForeground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.foreground }]}>
          {t('settings.general.language')}
        </Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <View style={styles.cardList}>
          {(Object.entries(LANGUAGES) as [LanguageCode, { native: string; dir: string }][]).map(
            ([code, { native }]) => {
              const isSelected = currentLang === code;
              return (
                <MenuCard
                  key={code}
                  variant={isSelected ? 'selected' : 'ghost'}
                  title={native}
                  subtitle={t(`lang.${code}`)}
                  checked={isSelected}
                  onClick={() => handleLanguageSelect(code)}
                />
              );
            }
          )}
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
