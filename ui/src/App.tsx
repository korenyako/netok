import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { SpeedTestScreen } from './screens/SpeedTestScreen';
import { DeviceScanScreen } from './screens/DeviceScanScreen';
import { useNavigation } from './hooks/useNavigation';
import { useUpdateChecker } from './hooks/useUpdateChecker';

function App() {
  const {
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
  } = useNavigation();

  const { t } = useTranslation();
  const { checkForUpdates, downloadAndInstall } = useUpdateChecker();

  useEffect(() => {
    checkForUpdates().then((update) => {
      if (update) {
        toast(t('settings.about.update_available_toast', { version: update.version }), {
          duration: 8000,
          action: {
            label: t('settings.about.update_to', { version: update.version }),
            onClick: () => downloadAndInstall(),
          },
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (showDeviceScan) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <DeviceScanScreen onBack={goBack} />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={navigateToHome}
            onNavigateToSecurity={navigateToSecurity}
            onNavigateToTools={navigateToTools}
            onNavigateToSettings={navigateToSettings}
          />
        </div>
      </ThemeProvider>
    );
  }

  if (showSpeedTest) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <SpeedTestScreen onBack={goBack} />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={navigateToHome}
            onNavigateToSecurity={navigateToSecurity}
            onNavigateToTools={navigateToTools}
            onNavigateToSettings={navigateToSettings}
          />
        </div>
      </ThemeProvider>
    );
  }

  if (showDiagnostics) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <DiagnosticsScreen
            onBack={goBack}
            onNavigateToDnsProviders={() => navigateToSecuritySubScreen('dns-providers')}
            onNavigateToVpn={() => navigateToSecuritySubScreen('vpn')}
          />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={goBack}
            onNavigateToSecurity={navigateToSecurity}
            onNavigateToTools={navigateToTools}
            onNavigateToSettings={navigateToSettings}
          />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Toaster />
            <div id="app" className="h-full flex flex-col bg-background">
        <div className="flex-1 flex flex-col min-h-0">
          {currentScreen === 'home' && (
            <StatusScreen
              onOpenDiagnostics={openDiagnostics}
              onNavigateToDnsProviders={() => navigateToSecuritySubScreen('dns-providers')}
              onNavigateToVpn={() => navigateToSecuritySubScreen('vpn')}
              onNavigateToWifiSecurity={() => navigateToSecuritySubScreen('wifi-security')}
            />
          )}

          {currentScreen === 'security' && (
            <SecurityRouter
              subScreen={securitySubScreen}
              onSetSubScreen={navigateToSecuritySubScreen}
              onBack={goBack}
            />
          )}

          {currentScreen === 'tools' && <ToolsScreen onBack={goBack} onOpenDiagnostics={openDiagnostics} onOpenSpeedTest={openSpeedTest} onOpenDeviceScan={openDeviceScan} onOpenWifiSecurity={() => navigateToSecuritySubScreen('wifi-security')} />}

          {currentScreen === 'settings' && (
            <SettingsRouter
              subScreen={settingsSubScreen}
              onSetSubScreen={navigateToSettingsSubScreen}
              onBack={goBack}
              onNavigateToHome={navigateToHome}
              onNavigateToSpeedTest={openSpeedTest}
            />
          )}
        </div>

        <BottomNav
          currentScreen={currentScreen}
          onNavigateToHome={navigateToHome}
          onNavigateToSecurity={navigateToSecurity}
          onNavigateToTools={navigateToTools}
          onNavigateToSettings={navigateToSettings}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
