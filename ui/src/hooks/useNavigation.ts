import { useState } from 'react';

export type Screen = 'home' | 'security' | 'tools' | 'settings';
export type SettingsSubScreen = 'main' | 'theme' | 'language' | 'close-behavior' | 'about';
export type SecuritySubScreen = 'hub' | 'dns-providers' | 'custom-ip' | 'vpn' | 'vpn-add' | 'wifi-security';

export function useNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [showDeviceScan, setShowDeviceScan] = useState(false);
  const [settingsSubScreen, setSettingsSubScreen] = useState<SettingsSubScreen>('main');
  const [securitySubScreen, setSecuritySubScreen] = useState<SecuritySubScreen>('hub');

  const navigateToHome = () => {
    setCurrentScreen('home');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
  };

  const navigateToSecurity = () => {
    setCurrentScreen('security');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
  };

  const navigateToTools = () => {
    setCurrentScreen('tools');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
  };

  const navigateToSettings = () => {
    setCurrentScreen('settings');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
  };

  return {
    currentScreen,
    showDiagnostics,
    showSpeedTest,
    showDeviceScan,
    settingsSubScreen,
    securitySubScreen,
    setCurrentScreen,
    setShowDiagnostics,
    setShowSpeedTest,
    setShowDeviceScan,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
  };
}
