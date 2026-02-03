import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { cn } from '@/lib/utils';

interface LanguageSettingsScreenProps {
  onBack: () => void;
}

type Language = 'en' | 'ru';

export function LanguageSettingsScreen({ onBack }: LanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as Language;

  const languages: Array<{
    code: Language;
    name: string;
  }> = [
    { code: 'ru', name: t('settings.general.language_ru') },
    { code: 'en', name: t('settings.general.language_en') },
  ];

  const handleLanguageChange = (language: Language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('netok.lang', language);
    invoke('update_tray_language', { lang: language }).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.general.language')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">

        {/* Language Options */}
        <div className="space-y-2">
          {languages.map((language) => {
            const isSelected = currentLanguage === language.code;
            return (
              <Card
                key={language.code}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/10 hover:bg-primary/15 dark:bg-primary/10 dark:hover:bg-primary/15'
                    : 'bg-transparent hover:bg-accent'
                )}
                onClick={() => handleLanguageChange(language.code)}
              >
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <span className="text-base font-medium leading-normal flex-1">{language.name}</span>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
