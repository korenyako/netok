import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { notifications } from './utils/notifications';
import { StatusScreen } from './screens/StatusScreen';
import { DiagnosticsScreen } from './screens/DiagnosticsScreen';
import { DnsProvidersScreen } from './screens/DnsProvidersScreen';
import { CloudflareDetailScreen } from './screens/CloudflareDetailScreen';
import { AdGuardDetailScreen } from './screens/AdGuardDetailScreen';
import { Dns4EuDetailScreen } from './screens/Dns4EuDetailScreen';
import { CleanBrowsingDetailScreen } from './screens/CleanBrowsingDetailScreen';
import { Quad9DetailScreen } from './screens/Quad9DetailScreen';
import { OpenDnsDetailScreen } from './screens/OpenDnsDetailScreen';
import { GoogleDetailScreen } from './screens/GoogleDetailScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ThemeSettingsScreen } from './screens/ThemeSettingsScreen';
import { LanguageSettingsScreen } from './screens/LanguageSettingsScreen';
import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from './components/icons/NavigationIcons';
import { runDiagnostics, type DiagnosticsSnapshot } from './api/tauri';
import { dnsStore } from './stores/dnsStore';

type Screen = 'home' | 'security' | 'tools' | 'settings';
type SettingsSubScreen = 'main' | 'theme' | 'language';
type SecuritySubScreen = 'dns-providers' | 'cloudflare-detail' | 'adguard-detail' | 'dns4eu-detail' | 'cleanbrowsing-detail' | 'quad9-detail' | 'opendns-detail' | 'google-detail';

function App() {
  const { t } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [settingsSubScreen, setSettingsSubScreen] = useState<SettingsSubScreen>('main');
  const [securitySubScreen, setSecuritySubScreen] = useState<SecuritySubScreen>('dns-providers');
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsSnapshot | null>(null);

  // Load diagnostics data once on mount
  useEffect(() => {
    fetchDiagnosticsData();
  }, []);

  const fetchDiagnosticsData = async () => {
    try {
      const snapshot = await runDiagnostics();
      setDiagnosticsData(snapshot);
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
      notifications.error(
        t('errors.diagnostics_failed', {
          defaultValue: 'Failed to run diagnostics. Please check your network connection.'
        })
      );
    }
  };

  // If diagnostics is shown, render it without the nav
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
              setCurrentScreen('security');
              setSecuritySubScreen('dns-providers');
            }}
            onNavigateToTools={() => {
              setShowDiagnostics(false);
              setCurrentScreen('tools');
            }}
            onNavigateToSettings={() => {
              setShowDiagnostics(false);
              setCurrentScreen('settings');
              setSettingsSubScreen('main');
            }}
          />
        </div>
      </ThemeProvider>
    );
  }

  // Helper to render settings sub-screens
  const renderSettingsContent = () => {
    if (settingsSubScreen === 'theme') {
      return (
        <ThemeSettingsScreen
          onBack={() => setSettingsSubScreen('main')}
        />
      );
    }
    if (settingsSubScreen === 'language') {
      return (
        <LanguageSettingsScreen onBack={() => setSettingsSubScreen('main')} />
      );
    }
    return (
      <SettingsScreen
        onNavigateToTheme={() => setSettingsSubScreen('theme')}
        onNavigateToLanguage={() => setSettingsSubScreen('language')}
        onBack={() => setCurrentScreen('home')}
      />
    );
  };

  // Helper to render security sub-screens
  const renderSecurityContent = () => {
    if (securitySubScreen === 'cloudflare-detail') {
      return (
        <CloudflareDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'adguard-detail') {
      return (
        <AdGuardDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'dns4eu-detail') {
      return (
        <Dns4EuDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'cleanbrowsing-detail') {
      return (
        <CleanBrowsingDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'quad9-detail') {
      return (
        <Quad9DetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'opendns-detail') {
      return (
        <OpenDnsDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    if (securitySubScreen === 'google-detail') {
      return (
        <GoogleDetailScreen
          onBack={() => {
            setSecuritySubScreen('dns-providers');
            dnsStore.refresh();
          }}
        />
      );
    }
    // dns-providers is the default/main screen
    return (
      <DnsProvidersScreen
        onBack={() => {
          setCurrentScreen('home');
          dnsStore.refresh();
        }}
        onSelectCloudflare={() => setSecuritySubScreen('cloudflare-detail')}
        onSelectAdGuard={() => setSecuritySubScreen('adguard-detail')}
        onSelectDns4Eu={() => setSecuritySubScreen('dns4eu-detail')}
        onSelectCleanBrowsing={() => setSecuritySubScreen('cleanbrowsing-detail')}
        onSelectQuad9={() => setSecuritySubScreen('quad9-detail')}
        onSelectOpenDns={() => setSecuritySubScreen('opendns-detail')}
        onSelectGoogle={() => setSecuritySubScreen('google-detail')}
      />
    );
  };

  return (
    <ThemeProvider>
      <Toaster />
      <div id="app" className="h-full flex flex-col bg-background">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
        {currentScreen === 'home' && (
          <StatusScreen
            diagnostics={diagnosticsData}
            onOpenDiagnostics={() => setShowDiagnostics(true)}
            onNavigateToDnsProviders={() => {
              setCurrentScreen('security');
            }}
          />
        )}

        {currentScreen === 'security' && renderSecurityContent()}

        {currentScreen === 'tools' && (
          <div className="flex items-center justify-center h-full px-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold mb-2 text-foreground">{t('placeholders.tools_title')}</h1>
              <p className="text-sm text-foreground-tertiary">{t('placeholders.tools_description')}</p>
            </div>
          </div>
        )}

        {currentScreen === 'settings' && renderSettingsContent()}
      </div>

        {/* Bottom Navigation Bar */}
        <nav className="bg-background px-4 py-4 border-t border-border">
          <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setCurrentScreen('home');
              setSettingsSubScreen('main');
              setSecuritySubScreen('dns-providers');
            }}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <WaypointsIcon
              className="w-6 h-6"
              color={currentScreen === 'home' ? '#3CB57F' : '#ADADAD'}
            />
          </button>

          <button
            onClick={() => {
              setCurrentScreen('security');
              setSettingsSubScreen('main');
              setSecuritySubScreen('dns-providers');
            }}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <ShieldIcon
              className="w-6 h-6"
              color={currentScreen === 'security' ? '#3CB57F' : '#ADADAD'}
            />
          </button>

          <button
            onClick={() => {
              setCurrentScreen('tools');
              setSettingsSubScreen('main');
              setSecuritySubScreen('dns-providers');
            }}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <WrenchIcon
              className="w-6 h-6"
              color={currentScreen === 'tools' ? '#3CB57F' : '#ADADAD'}
            />
          </button>

          <button
            onClick={() => {
              setCurrentScreen('settings');
              setSettingsSubScreen('main');
              setSecuritySubScreen('dns-providers');
            }}
            className="w-8 h-8 flex items-center justify-center focus:outline-none"
          >
            <SettingsIcon
              className="w-6 h-6"
              color={currentScreen === 'settings' ? '#3CB57F' : '#ADADAD'}
            />
          </button>
          </div>
        </nav>
      </div>
    </ThemeProvider>
  );
}

export default App;
