import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NetokLogoIcon, ShieldIcon, ToolsIcon, SettingsIcon } from './icons/NavigationIcons';
import { useDiagnosticsStore, getStatusColor, STATUS_TEXT_CLASS } from '../stores/diagnosticsStore';
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
  const { nodes, isRunning } = useDiagnosticsStore();
  const statusColor = getStatusColor(nodes, isRunning);

  return (
    <nav className="bg-background px-4 py-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToHome}
          className={cn(
            'h-12 w-12',
            STATUS_TEXT_CLASS[statusColor],
            currentScreen === 'home' && 'bg-accent'
          )}
        >
          <NetokLogoIcon className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToSecurity}
          className={cn(
            'h-12 w-12',
            currentScreen === 'security' ? 'text-foreground bg-accent' : 'text-foreground'
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
            currentScreen === 'tools' ? 'text-foreground bg-accent' : 'text-foreground'
          )}
        >
          <ToolsIcon className="w-6 h-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNavigateToSettings}
          className={cn(
            'h-12 w-12',
            currentScreen === 'settings' ? 'text-foreground bg-accent' : 'text-foreground'
          )}
        >
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </div>
    </nav>
  );
}
