import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sun, Moon, Monitor, Languages, Minimize2, Info, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';
import { useCloseBehaviorStore } from '../stores/closeBehaviorStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';

interface SettingsScreenProps {
  onNavigateToTheme: () => void;
  onNavigateToLanguage: () => void;
  onNavigateToCloseBehavior: () => void;
  onNavigateToAbout: () => void;
  onBack?: () => void;
}

export function SettingsScreen({ onNavigateToTheme, onNavigateToLanguage, onNavigateToCloseBehavior, onNavigateToAbout, onBack }: SettingsScreenProps) {
  const { t, i18n } = useTranslation();

  const { theme: currentTheme } = useThemeStore();
  const { closeBehavior } = useCloseBehaviorStore();
  const currentLanguage = i18n.language;

  return (
    <div className="flex flex-col bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.title')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-4">

        {/* Settings Cards */}
        <div className="space-y-2">
          {/* Theme Setting Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToTheme}>
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 mt-0.5">
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
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
            </CardContent>
          </Card>

          {/* Language Setting Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToLanguage}>
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 mt-0.5">
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
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
            </CardContent>
          </Card>
          {/* Close Behavior Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToCloseBehavior}>
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 mt-0.5">
                <Minimize2 className="w-5 h-5 text-muted-foreground" />
              </span>
              <div className="flex-1">
                <div className="text-base font-medium leading-normal mb-1">
                  {t('settings.general.close_behavior')}
                </div>
                <div className="text-sm text-muted-foreground leading-normal">
                  {closeBehavior === 'minimize_to_tray'
                    ? t('settings.general.close_minimize')
                    : t('settings.general.close_quit')}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
            </CardContent>
          </Card>

          {/* About Card */}
          <Card className="cursor-pointer hover:bg-accent transition-colors bg-transparent" onClick={onNavigateToAbout}>
            <CardContent className="flex items-start gap-3 px-4 py-3">
              <span className="shrink-0 mt-0.5">
                <Info className="w-5 h-5 text-muted-foreground" />
              </span>
              <div className="flex-1">
                <div className="text-base font-medium leading-normal mb-1">
                  {t('settings.general.about')}
                </div>
                <div className="text-sm text-muted-foreground leading-normal">
                  {t('settings.general.about_desc')}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 self-center" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
