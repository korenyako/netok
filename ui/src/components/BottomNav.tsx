import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    <nav className="bg-background px-4 py-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToHome}
          className={cn(
            'h-12 w-12',
            currentScreen === 'home' ? 'text-primary bg-accent' : 'text-muted-foreground'
          )}
        >
          <WaypointsIcon className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToSecurity}
          className={cn(
            'h-12 w-12',
            currentScreen === 'security' ? 'text-primary bg-accent' : 'text-muted-foreground'
          )}
        >
          <ShieldIcon className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToTools}
          className={cn(
            'h-12 w-12',
            currentScreen === 'tools' ? 'text-primary bg-accent' : 'text-muted-foreground'
          )}
        >
          <WrenchIcon className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToSettings}
          className={cn(
            'h-12 w-12',
            currentScreen === 'settings' ? 'text-primary bg-accent' : 'text-muted-foreground'
          )}
        >
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
}
