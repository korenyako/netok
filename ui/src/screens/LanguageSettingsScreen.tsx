import { useTranslation } from 'react-i18next';
import { ArrowLeft, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
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
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{t('settings.general.language')}</h1>
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
                  'cursor-pointer hover:bg-accent transition-colors',
                  !isSelected && 'bg-transparent'
                )}
                onClick={() => handleLanguageChange(language.code)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <span className={cn(
                    'flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0 mt-px',
                    isSelected ? 'border-primary' : 'border-muted-foreground'
                  )}>
                    {isSelected && (
                      <Circle className="w-2 h-2 fill-primary text-primary" />
                    )}
                  </span>
                  <span className="text-base font-medium leading-normal">{language.name}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
