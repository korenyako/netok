import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sun, Moon, Languages, Minimize2, Info, Trash2 } from '../components/icons/UIIcons';
import { toast } from 'sonner';
import { useThemeStore } from '../stores/themeStore';
import { useCloseBehaviorStore } from '../stores/closeBehaviorStore';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
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

  const themeIcon = currentTheme === 'dark'
    ? <Moon className="w-5 h-5 text-muted-foreground" />
    : <Sun className="w-5 h-5 text-muted-foreground" />;

  const themeSubtitle = currentTheme === 'dark'
    ? t('settings.general.theme_dark')
    : t('settings.general.theme_light');

  const savedLangPref = localStorage.getItem('netok.lang') || 'system';
  const languageSubtitle = savedLangPref === 'system'
    ? t('lang.system')
    : LANGUAGES[currentLanguage as LanguageCode]?.native || currentLanguage;

  const closeBehaviorSubtitle = closeBehavior === 'minimize_to_tray'
    ? t('settings.general.close_minimize')
    : t('settings.general.close_quit');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('settings.title')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          <MenuCard
            icon={themeIcon}
            title={t('settings.general.theme')}
            subtitle={themeSubtitle}
            trailing="chevron"
            onClick={onNavigateToTheme}
          />

          <MenuCard
            icon={<Languages className="w-5 h-5 text-muted-foreground" />}
            title={t('settings.general.language')}
            subtitle={languageSubtitle}
            trailing="chevron"
            onClick={onNavigateToLanguage}
          />

          <MenuCard
            icon={<Minimize2 className="w-5 h-5 text-muted-foreground" />}
            title={t('settings.general.close_behavior')}
            subtitle={closeBehaviorSubtitle}
            trailing="chevron"
            onClick={onNavigateToCloseBehavior}
          />

          <MenuCard
            icon={<Info className="w-5 h-5 text-muted-foreground" />}
            title={t('settings.general.about')}
            subtitle={t('settings.general.about_desc')}
            trailing="chevron"
            onClick={onNavigateToAbout}
          />
        </div>

        <div className="flex-1" />

        {/* Clear DNS cache */}
        <Button
          variant="outline"
          className="w-full uppercase font-mono tracking-wider text-xs"
          onClick={() => {
            // TODO: Implement actual DNS cache flush
            toast.success(t('dns_providers.cache_cleared'));
          }}
        >
          <Trash2 className="w-4 h-4" />
          {t('settings.tools.flush_dns')}
        </Button>
      </div>
    </div>
  );
}
