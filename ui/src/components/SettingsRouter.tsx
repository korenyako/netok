import { SettingsScreen } from '../screens/SettingsScreen';
import { ThemeSettingsScreen } from '../screens/ThemeSettingsScreen';
import { LanguageSettingsScreen } from '../screens/LanguageSettingsScreen';
import { CloseBehaviorSettingsScreen } from '../screens/CloseBehaviorSettingsScreen';
import { AboutScreen } from '../screens/AboutScreen';
import type { SettingsSubScreen } from '../hooks/useNavigation';

interface SettingsRouterProps {
  subScreen: SettingsSubScreen;
  onSetSubScreen: (screen: SettingsSubScreen) => void;
  onBack: () => void;
}

export function SettingsRouter({ subScreen, onSetSubScreen, onBack }: SettingsRouterProps) {
  switch (subScreen) {
    case 'theme':
      return <ThemeSettingsScreen onBack={onBack} />;

    case 'language':
      return <LanguageSettingsScreen onBack={onBack} />;

    case 'close-behavior':
      return <CloseBehaviorSettingsScreen onBack={onBack} />;

    case 'about':
      return <AboutScreen onBack={onBack} />;

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
