import { useState } from 'react';
import NetworkScreen from './components/screens/NetworkScreen';
import SecurityScreen from './components/screens/SecurityScreen';
import ToolsScreen from './components/screens/ToolsScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ThemeScreen from './components/screens/ThemeScreen';
import LanguageScreen from './components/screens/LanguageScreen';

type Screen = 'network' | 'security' | 'tools' | 'settings' | 'theme' | 'language';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('network');
  const [openDNSDirectly, setOpenDNSDirectly] = useState(false);

  const handleNavigate = (screen: Screen, openDNS?: boolean) => {
    setCurrentScreen(screen);
    setOpenDNSDirectly(openDNS || false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 p-4">
      <div className="w-[320px] h-[600px]">
        {currentScreen === 'network' && <NetworkScreen onNavigate={handleNavigate} />}
        {currentScreen === 'security' && <SecurityScreen onNavigate={setCurrentScreen} openDNSDirectly={openDNSDirectly} />}
        {currentScreen === 'tools' && <ToolsScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'settings' && <SettingsScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'theme' && <ThemeScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'language' && <LanguageScreen onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
}
