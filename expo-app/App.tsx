import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Initialize i18n before anything else
import './src/i18n';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/stores/themeStore';
import { colors } from './src/theme/colors';

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const bg = theme === 'dark' ? colors.dark.background : colors.light.background;
      NavigationBar.setBackgroundColorAsync(bg);
      NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
