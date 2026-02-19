import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Initialize i18n before anything else
import './src/i18n';

import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/stores/themeStore';

export default function App() {
  const theme = useThemeStore((s) => s.theme);

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
