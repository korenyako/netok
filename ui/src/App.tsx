import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { useNavigation } from './hooks/useNavigation';
import { useDiagnostics } from './hooks/useDiagnostics';

function App() {
  const {
    currentScreen,
    showDiagnostics,
    settingsSubScreen,
    securitySubScreen,
    setShowDiagnostics,
    setSettingsSubScreen,
    setSecuritySubScreen,
    navigateToHome,
    navigateToSecurity,
    navigateToTools,
    navigateToSettings,
  } = useNavigation();

  const { diagnosticsData, fetchDiagnosticsData } = useDiagnostics();

  if (showDiagnostics) {
    return (
      <ThemeProvider>
        <Toaster />
        <div id="app" className="h-full flex flex-col bg-background">
          <DiagnosticsScreen
            onBack={() => setShowDiagnostics(false)}
            onRefresh={fetchDiagnosticsData}
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
        <div className="flex-1 overflow-auto">
          {currentScreen === 'home' && (
            <StatusScreen
              diagnostics={diagnosticsData}
              onOpenDiagnostics={() => setShowDiagnostics(true)}
              onNavigateToDnsProviders={navigateToSecurity}
            />
          )}

          {currentScreen === 'security' && (
            <SecurityRouter
              subScreen={securitySubScreen}
              onSetSubScreen={setSecuritySubScreen}
              onBack={navigateToHome}
            />
          )}

          {currentScreen === 'tools' && <ToolsScreen />}

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
