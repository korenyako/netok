import { useTranslation } from 'react-i18next';
import { ArrowLeft, Circle } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import type { Theme } from '../stores/themeStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ThemeSettingsScreenProps {
  onBack: () => void;
}

export function ThemeSettingsScreen({ onBack }: ThemeSettingsScreenProps) {
  const { t } = useTranslation();
  const { theme: currentTheme, setTheme } = useThemeStore();

  const themes: Array<{
    id: Theme;
    title: string;
    description: string;
  }> = [
    {
      id: 'light',
      title: t('settings.general.theme_light'),
      description: t('settings.general.theme_light_desc'),
    },
    {
      id: 'dark',
      title: t('settings.general.theme_dark'),
      description: t('settings.general.theme_dark_desc'),
    },
    {
      id: 'system',
      title: t('settings.general.theme_system'),
      description: t('settings.general.theme_system_desc'),
    },
  ];

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{t('settings.general.theme')}</h1>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">

        {/* Theme Options */}
        <div className="space-y-2">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <Card
                key={theme.id}
                className={cn(
                  'cursor-pointer hover:bg-accent transition-colors',
                  !isSelected && 'bg-transparent'
                )}
                onClick={() => handleThemeChange(theme.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 w-full">
                    <span className={cn(
                      'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 mt-px',
                      isSelected ? 'border-primary' : 'border-muted-foreground'
                    )}>
                      {isSelected && (
                        <Circle className="w-2 h-2 fill-primary text-primary" />
                      )}
                    </span>
                    <span className="text-base font-medium flex-1 text-left leading-normal">{theme.title}</span>
                  </div>
                  <div className="text-sm text-muted-foreground text-left leading-normal mt-2 ml-7">
                    {theme.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
