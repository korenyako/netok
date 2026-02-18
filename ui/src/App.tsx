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
    setShowDiagnostics,
    setShowSpeedTest,
    setShowDeviceScan,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
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
          <DeviceScanScreen onBack={() => setShowDeviceScan(false)} />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={() => { setShowDeviceScan(false); navigateToHome(); }}
            onNavigateToSecurity={() => { setShowDeviceScan(false); navigateToSecurity(); }}
            onNavigateToTools={() => { setShowDeviceScan(false); navigateToTools(); }}
            onNavigateToSettings={() => { setShowDeviceScan(false); navigateToSettings(); }}
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
          <SpeedTestScreen onBack={() => setShowSpeedTest(false)} />
          <BottomNav
            currentScreen={currentScreen}
            onNavigateToHome={() => { setShowSpeedTest(false); navigateToHome(); }}
            onNavigateToSecurity={() => { setShowSpeedTest(false); navigateToSecurity(); }}
            onNavigateToTools={() => { setShowSpeedTest(false); navigateToTools(); }}
            onNavigateToSettings={() => { setShowSpeedTest(false); navigateToSettings(); }}
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
            onBack={() => setShowDiagnostics(false)}
            onNavigateToSecurity={() => {
              setShowDiagnostics(false);
              navigateToSecurity();
            }}
            onNavigateToTools={() => {
              setShowDiagnostics(false);
              navigateToTools();
            }}
            onNavigateToSettings={() => {
              setShowDiagnostics(false);
              navigateToSettings();
            }}
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
              onOpenDiagnostics={() => setShowDiagnostics(true)}
              onNavigateToDnsProviders={() => {
                navigateToSecurity();
                setSecuritySubScreen('dns-providers');
              }}
              onNavigateToVpn={() => {
                navigateToSecurity();
                setSecuritySubScreen('vpn');
              }}
              onNavigateToWifiSecurity={() => {
                navigateToSecurity();
                setSecuritySubScreen('wifi-security');
              }}
            />
          )}

          {currentScreen === 'security' && (
            <SecurityRouter
              subScreen={securitySubScreen}
              onSetSubScreen={setSecuritySubScreen}
              onBack={navigateToHome}
            />
          )}

          {currentScreen === 'tools' && <ToolsScreen onBack={navigateToHome} onOpenDiagnostics={() => setShowDiagnostics(true)} onOpenSpeedTest={() => setShowSpeedTest(true)} onOpenDeviceScan={() => setShowDeviceScan(true)} onOpenWifiSecurity={() => { navigateToSecurity(); setSecuritySubScreen('wifi-security'); }} />}

          {currentScreen === 'settings' && (
            <SettingsRouter
              subScreen={settingsSubScreen}
              onSetSubScreen={setSettingsSubScreen}
              onBack={navigateToHome}
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
