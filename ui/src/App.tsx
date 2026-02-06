import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { BottomNav } from './components/BottomNav';
import { SecurityRouter } from './components/SecurityRouter';
import { SettingsRouter } from './components/SettingsRouter';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { ToolsScreen } from './screens/ToolsScreen';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <ScrollArea className="flex-1">
          {currentScreen === 'home' && (
            <StatusScreen
              diagnostics={diagnosticsData}
              onOpenDiagnostics={() => setShowDiagnostics(true)}
              onNavigateToDnsProviders={() => {
                navigateToSecurity();
                setSecuritySubScreen('dns-providers');
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

          {currentScreen === 'tools' && <ToolsScreen onBack={navigateToHome} onOpenDiagnostics={() => setShowDiagnostics(true)} />}

          {currentScreen === 'settings' && (
            <SettingsRouter
              subScreen={settingsSubScreen}
              onSetSubScreen={setSettingsSubScreen}
              onBack={navigateToHome}
            />
          )}
        </ScrollArea>

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
