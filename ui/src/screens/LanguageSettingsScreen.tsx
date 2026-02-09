import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check } from '../components/icons/UIIcons';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import { cn } from '@/lib/utils';

interface LanguageSettingsScreenProps {
  onBack: () => void;
}

const languageOrder: LanguageCode[] = [
  // Latin script (alphabetical by native name)
  'de', 'en', 'es', 'fr', 'it', 'pl', 'pt', 'tr',
  // Cyrillic script
  'ru', 'uk',
  // Arabic script
  'fa',
  // CJK
  'zh', 'ja', 'ko',
];

export function LanguageSettingsScreen({ onBack }: LanguageSettingsScreenProps) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language as LanguageCode;

  const handleLanguageChange = (language: LanguageCode) => {
    i18n.changeLanguage(language);
    localStorage.setItem('netok.lang', language);
    invoke('update_tray_language', { lang: language }).catch(() => {});
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.general.language')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          {languageOrder.map((code) => {
            const isSelected = currentLanguage === code;
            const meta = LANGUAGES[code];
            return (
              <Card
                key={code}
                className={cn(
                  'cursor-pointer transition-colors',
                  isSelected
                    ? 'border-muted-foreground/30 bg-accent hover:bg-accent/80'
                    : 'bg-transparent hover:bg-accent'
                )}
                onClick={() => handleLanguageChange(code)}
              >
                <CardContent className="flex items-center gap-3 px-4 py-3">
                  <span className="text-base font-medium leading-normal flex-1">{meta.native}</span>
                  {isSelected && (
                    <Check className="w-5 h-5 text-foreground shrink-0" />
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
