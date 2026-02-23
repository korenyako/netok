import { useState, useRef, useCallback } from 'react';

export type Screen = 'home' | 'security' | 'tools' | 'settings';
export type SettingsSubScreen = 'main' | 'theme' | 'language' | 'close-behavior' | 'about' | 'debug-scenarios';
export type SecuritySubScreen = 'hub' | 'dns-providers' | 'custom-ip' | 'vpn' | 'vpn-add' | 'wifi-security';

interface NavState {
  currentScreen: Screen;
  securitySubScreen: SecuritySubScreen;
  settingsSubScreen: SettingsSubScreen;
  showDiagnostics: boolean;
  showSpeedTest: boolean;
  showDeviceScan: boolean;
}

export function useNavigation() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [showDeviceScan, setShowDeviceScan] = useState(false);
  const [settingsSubScreen, setSettingsSubScreen] = useState<SettingsSubScreen>('main');
  const [securitySubScreen, setSecuritySubScreen] = useState<SecuritySubScreen>('hub');

  const historyRef = useRef<NavState[]>([]);
  const stateRef = useRef<NavState>({
    currentScreen: 'home',
    securitySubScreen: 'hub',
    settingsSubScreen: 'main',
    showDiagnostics: false,
    showSpeedTest: false,
    showDeviceScan: false,
  });

  // Keep stateRef in sync with current state
  stateRef.current = {
    currentScreen,
    securitySubScreen,
    settingsSubScreen,
    showDiagnostics,
    showSpeedTest,
    showDeviceScan,
  };

  const pushHistory = useCallback(() => {
    historyRef.current.push({ ...stateRef.current });
  }, []);

  const restoreState = useCallback((state: NavState) => {
    setCurrentScreen(state.currentScreen);
    setSecuritySubScreen(state.securitySubScreen);
    setSettingsSubScreen(state.settingsSubScreen);
    setShowDiagnostics(state.showDiagnostics);
    setShowSpeedTest(state.showSpeedTest);
    setShowDeviceScan(state.showDeviceScan);
  }, []);

  const goBack = useCallback(() => {
    const prev = historyRef.current.pop();
    if (prev) {
      restoreState(prev);
    }
  }, [restoreState]);

  const navigateToHome = useCallback(() => {
    pushHistory();
    setCurrentScreen('home');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const navigateToSecurity = useCallback(() => {
    pushHistory();
    setCurrentScreen('security');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const navigateToTools = useCallback(() => {
    pushHistory();
    setCurrentScreen('tools');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const navigateToSettings = useCallback(() => {
    pushHistory();
    setCurrentScreen('settings');
    setSettingsSubScreen('main');
    setSecuritySubScreen('hub');
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const navigateToSecuritySubScreen = useCallback((sub: SecuritySubScreen) => {
    pushHistory();
    setCurrentScreen('security');
    setSecuritySubScreen(sub);
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const navigateToSettingsSubScreen = useCallback((sub: SettingsSubScreen) => {
    pushHistory();
    setCurrentScreen('settings');
    setSettingsSubScreen(sub);
    setShowDiagnostics(false);
    setShowSpeedTest(false);
    setShowDeviceScan(false);
  }, [pushHistory]);

  const openDiagnostics = useCallback(() => {
    pushHistory();
    setShowDiagnostics(true);
  }, [pushHistory]);

  const openSpeedTest = useCallback(() => {
    pushHistory();
    setShowSpeedTest(true);
  }, [pushHistory]);

  const openDeviceScan = useCallback(() => {
    pushHistory();
    setShowDeviceScan(true);
  }, [pushHistory]);

  return {
    currentScreen,
    showDiagnostics,
    showSpeedTest,
    showDeviceScan,
    settingsSubScreen,
    securitySubScreen,
    goBack,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
    navigateToSecuritySubScreen,
    navigateToSettingsSubScreen,
    openDiagnostics,
    openSpeedTest,
    openDeviceScan,
  };
}
