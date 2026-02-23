import { SettingsScreen } from '../screens/SettingsScreen';
import { ThemeSettingsScreen } from '../screens/ThemeSettingsScreen';
import { LanguageSettingsScreen } from '../screens/LanguageSettingsScreen';
import { CloseBehaviorSettingsScreen } from '../screens/CloseBehaviorSettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { DebugScenariosScreen } from '../screens/DebugScenariosScreen';
import type { SettingsSubScreen } from '../hooks/useNavigation';

interface SettingsRouterProps {
  subScreen: SettingsSubScreen;
  onSetSubScreen: (screen: SettingsSubScreen) => void;
  onBack: () => void;
  onNavigateToHome?: () => void;
}

export function SettingsRouter({ subScreen, onSetSubScreen, onBack, onNavigateToHome }: SettingsRouterProps) {
  switch (subScreen) {
    case 'theme':
      return <ThemeSettingsScreen onBack={onBack} />;

    case 'language':
      return <LanguageSettingsScreen onBack={onBack} />;

    case 'close-behavior':
      return <CloseBehaviorSettingsScreen onBack={onBack} />;

    case 'about':
      return (
        <AboutScreen
          onBack={onBack}
          onNavigateToDebugScenarios={() => onSetSubScreen('debug-scenarios')}
        />
      );

    case 'debug-scenarios':
      return (
        <DebugScenariosScreen
          onBack={onBack}
          onNavigateToHome={onNavigateToHome ?? onBack}
        />
      );

    case 'main':
    default:
      return (
        <SettingsScreen
          onNavigateToTheme={() => onSetSubScreen('theme')}
          onNavigateToLanguage={() => onSetSubScreen('language')}
          onNavigateToCloseBehavior={() => onSetSubScreen('close-behavior')}
          onNavigateToAbout={() => onSetSubScreen('about')}
          onBack={onBack}
        />
      );
  }
}
