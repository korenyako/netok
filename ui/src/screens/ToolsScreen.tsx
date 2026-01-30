import { useTranslation } from 'react-i18next';
import { ArrowLeft, Gauge, Trash2, Globe, Router, ClipboardCopy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tools = [
  { key: 'speed_test', icon: Gauge },
  { key: 'flush_dns', icon: Trash2 },
  { key: 'open_captive', icon: Globe },
  { key: 'open_router', icon: Router },
  { key: 'copy_diagnostics', icon: ClipboardCopy },
] as const;

interface ToolsScreenProps {
  onBack?: () => void;
}

export function ToolsScreen({ onBack }: ToolsScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{t('settings.tabs.tools')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">
        <div className="space-y-2">
          {tools.map(({ key, icon: Icon }) => (
            <Card key={key} className="bg-transparent opacity-60">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <div className="text-base font-medium leading-normal">
                    {t(`settings.tools.${key}`)}
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
