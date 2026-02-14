import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from '../components/icons/UIIcons';
import { useThemeStore } from '../stores/themeStore';
import type { Theme } from '../stores/themeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
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
      id: 'dark',
      title: t('settings.general.theme_dark'),
      description: t('settings.general.theme_dark_desc'),
    },
    {
      id: 'light',
      title: t('settings.general.theme_light'),
      description: t('settings.general.theme_light_desc'),
    },
  ];

  const handleThemeChange = (theme: Theme) => {
    setTheme(theme);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('settings.general.theme')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {themes.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <Card
                key={theme.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected
                    ? 'border-muted-foreground/30 bg-accent hover:bg-accent-hover'
                    : 'bg-transparent hover:bg-accent'
                )}
                onClick={() => handleThemeChange(theme.id)}
              >
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-base font-medium leading-normal">{theme.title}</span>
                    <div className="text-sm text-muted-foreground leading-normal mt-0.5">
                      {theme.description}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
