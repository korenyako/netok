import { useTranslation } from 'react-i18next';
import { ArrowLeft, Activity, Gauge, Trash2, Radar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CloseButton } from '../components/WindowControls';

const tools = [
  { key: 'speed_test', icon: Gauge },
  { key: 'flush_dns', icon: Trash2 },
  { key: 'device_scan', icon: Radar },
] as const;

interface ToolsScreenProps {
  onBack?: () => void;
  onOpenDiagnostics: () => void;
}

export function ToolsScreen({ onBack, onOpenDiagnostics }: ToolsScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.tabs.tools')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">
        <div className="space-y-2">
          {/* Diagnostics - active */}
          <Card
            className="cursor-pointer hover:bg-accent transition-colors bg-transparent"
            onClick={onOpenDiagnostics}
          >
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 mt-0.5">
                <Activity className="w-5 h-5 text-muted-foreground" />
              </span>
              <div className="flex-1">
                <div className="text-base font-medium leading-normal mb-1">
                  {t('diagnostics.title')}
                </div>
                <div className="text-sm text-muted-foreground leading-normal">
                  {t('settings.tools.diagnostics_desc')}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
            </CardContent>
          </Card>

          {/* Other tools - disabled */}
          {tools.map(({ key, icon: Icon }) => (
            <Card key={key} className="bg-transparent opacity-60">
              <CardContent className="flex items-start gap-3 px-4 py-3">
                <span className="shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </span>
                <div className="flex-1">
                  <div className="text-base font-medium leading-normal mb-1">
                    {t(`settings.tools.${key}`)}
                  </div>
                  <div className="text-sm text-muted-foreground leading-normal">
                    {t(`settings.tools.${key}_desc`)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
