import { WaypointsIcon, ShieldIcon, WrenchIcon, SettingsIcon } from './icons/NavigationIcons';
import type { Screen } from '../hooks/useNavigation';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigateToHome: () => void;
  onNavigateToSecurity: () => void;
  onNavigateToTools: () => void;
  onNavigateToSettings: () => void;
}

export function BottomNav({
  currentScreen,
  onNavigateToHome,
  onNavigateToSecurity,
  onNavigateToTools,
  onNavigateToSettings,
}: BottomNavProps) {
  return (
    <nav className="bg-background px-4 py-4 border-t border-border">
      <div className="flex items-center justify-between">
        <button
          onClick={onNavigateToHome}
          className="w-8 h-8 flex items-center justify-center focus:outline-none"
        >
          <WaypointsIcon
            className="w-6 h-6"
            color={currentScreen === 'home' ? '#3CB57F' : '#ADADAD'}
          />
        </button>

        <button
          onClick={onNavigateToSecurity}
          className="w-8 h-8 flex items-center justify-center focus:outline-none"
        >
          <ShieldIcon
            className="w-6 h-6"
            color={currentScreen === 'security' ? '#3CB57F' : '#ADADAD'}
          />
        </button>

        <button
          onClick={onNavigateToTools}
          className="w-8 h-8 flex items-center justify-center focus:outline-none"
        >
          <WrenchIcon
            className="w-6 h-6"
            color={currentScreen === 'tools' ? '#3CB57F' : '#ADADAD'}
          />
        </button>

        <button
          onClick={onNavigateToSettings}
          className="w-8 h-8 flex items-center justify-center focus:outline-none"
        >
          <SettingsIcon
            className="w-6 h-6"
            color={currentScreen === 'settings' ? '#3CB57F' : '#ADADAD'}
          />
        </button>
      </div>
    </nav>
  );
}
