import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Gauge, Radar } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { CloseButton } from '../components/WindowControls';

interface ToolsScreenProps {
  onBack?: () => void;
  onOpenDiagnostics: () => void;
  onOpenSpeedTest: () => void;
}

interface ToolTile {
  id: string;
  nameKey: string;
  icon: React.ReactNode;
  iconColorClass: string;
  onClick: () => void;
}

export function ToolsScreen({ onBack, onOpenDiagnostics, onOpenSpeedTest }: ToolsScreenProps) {
  const { t } = useTranslation();

  const tools: ToolTile[] = [
    {
      id: 'diagnostics',
      nameKey: 'diagnostics.title',
      icon: <Activity className="w-6 h-6" />,
      iconColorClass: 'text-primary',
      onClick: onOpenDiagnostics,
    },
    {
      id: 'speed-test',
      nameKey: 'settings.tools.speed_test',
      icon: <Gauge className="w-6 h-6" />,
      iconColorClass: 'text-purple-500',
      onClick: onOpenSpeedTest,
    },
    {
      id: 'device-scan',
      nameKey: 'settings.tools.device_scan',
      icon: <Radar className="w-6 h-6" />,
      iconColorClass: 'text-amber-500',
      onClick: () => {},
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('settings.tabs.tools')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content - 2-column grid */}
      <div className="flex-1 px-4">
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={tool.onClick}
              className="flex flex-col items-start gap-3 p-4 rounded-xl bg-accent hover:bg-accent-hover transition-colors text-left"
            >
              {/* Colorful icon */}
              <div className={tool.iconColorClass}>{tool.icon}</div>
              {/* Tool name */}
              <span className="text-base font-medium text-foreground whitespace-pre-line">
                {t(tool.nameKey)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
