import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sun, Moon, Monitor, Languages, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
  onNavigateToLanguage: () => void;
  onBack?: () => void;
}

export function SettingsScreen({ onNavigateToTheme, onNavigateToLanguage, onBack }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const appVersion = '1.0.0';

  const { theme: currentTheme } = useThemeStore();
  const currentLanguage = i18n.language;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{t('settings.title')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">

        {/* Settings Cards */}
        <div className="space-y-2">
          {/* Theme Setting Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToTheme}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className="shrink-0 mt-1">
                {currentTheme === 'dark' ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : currentTheme === 'system' ? (
                  <Monitor className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
              </span>
              <div className="flex-1">
                <div className="text-base font-medium leading-normal mb-1">
                  {t('settings.general.theme')}
                </div>
                <div className="text-sm text-muted-foreground leading-normal">
                  {currentTheme === 'light' && t('settings.general.theme_light')}
                  {currentTheme === 'dark' && t('settings.general.theme_dark')}
                  {currentTheme === 'system' && t('settings.general.theme_system')}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>

          {/* Language Setting Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToLanguage}>
            <CardContent className="flex items-start gap-3 p-4">
              <span className="shrink-0 mt-1">
                <Languages className="w-5 h-5 text-muted-foreground" />
              </span>
              <div className="flex-1">
                <div className="text-base font-medium leading-normal mb-1">
                  {t('settings.general.language')}
                </div>
                <div className="text-sm text-muted-foreground leading-normal">
                  {currentLanguage === 'ru'
                    ? t('settings.general.language_ru')
                    : t('settings.general.language_en')}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>
        </div>

        {/* Version */}
        <div className="mt-auto pb-4 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">v{appVersion}</span>
        </div>
      </div>
    </div>
  );
}
