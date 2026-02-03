import { useState } from 'react';

export type Screen = 'home' | 'security' | 'tools' | 'settings';
export type SettingsSubScreen = 'main' | 'theme' | 'language' | 'close-behavior' | 'about';
export type SecuritySubScreen = 'dns-providers' | 'custom-ip';

export function useNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [settingsSubScreen, setSettingsSubScreen] = useState<SettingsSubScreen>('main');
  const [securitySubScreen, setSecuritySubScreen] = useState<SecuritySubScreen>('dns-providers');

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSettingsSubScreen('main');
    setSecuritySubScreen('dns-providers');
  };

  const navigateToSecurity = () => {
    setCurrentScreen('security');
    setSettingsSubScreen('main');
    setSecuritySubScreen('dns-providers');
  };

  const navigateToTools = () => {
    setCurrentScreen('tools');
    setSettingsSubScreen('main');
    setSecuritySubScreen('dns-providers');
  };

  const navigateToSettings = () => {
    setCurrentScreen('settings');
    setSettingsSubScreen('main');
    setSecuritySubScreen('dns-providers');
  };

  return {
    currentScreen,
    showDiagnostics,
    settingsSubScreen,
    securitySubScreen,
    setCurrentScreen,
    setShowDiagnostics,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
  };
}
