import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, X } from '../components/icons/UIIcons';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseButton } from '../components/WindowControls';
import { LANGUAGES, type LanguageCode } from '../constants/languages';
import { resolveSystemLanguage, getSystemLanguageDisplay } from '../i18n';
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
  const [searchQuery, setSearchQuery] = useState('');

  const savedPref = localStorage.getItem('netok.lang') || 'system';
  const isSystemSelected = savedPref === 'system';

  const systemLanguageDisplay = getSystemLanguageDisplay();

  const handleLanguageChange = (pref: 'system' | LanguageCode) => {
    localStorage.setItem('netok.lang', pref);
    const resolved = pref === 'system' ? resolveSystemLanguage() : pref;
    i18n.changeLanguage(resolved);
    invoke('update_tray_language', { lang: resolved }).catch(() => {});
  };

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return languageOrder;
    const q = searchQuery.toLowerCase();
    return languageOrder.filter((code) => {
      const native = LANGUAGES[code].native.toLowerCase();
      const translated = t(`lang.${code}`).toLowerCase();
      return native.includes(q) || translated.includes(q) || code.includes(q);
    });
  }, [searchQuery, t]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3" onMouseDown={() => (document.activeElement as HTMLElement)?.blur?.()}>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('settings.general.language')}
          </h1>
          <CloseButton />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('lang.search')}
            className="w-full h-9 px-3 rounded-lg bg-accent/50 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-1 focus:ring-ring"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-accent cursor-pointer"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Language list */}
      <ScrollArea className="flex-1">
        <div className="px-4 pb-4 space-y-2">
          {/* System language option */}
          <LanguageCard
            title={t('lang.system')}
            subtitle={systemLanguageDisplay}
            isSelected={isSystemSelected}
            onClick={() => handleLanguageChange('system')}
          />

          {filteredLanguages.map((code) => {
            const isSelected = !isSystemSelected && i18n.language === code;
            return (
              <LanguageCard
                key={code}
                title={LANGUAGES[code].native}
                subtitle={t(`lang.${code}`)}
                isSelected={isSelected}
                onClick={() => handleLanguageChange(code)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

function LanguageCard({
  title,
  subtitle,
  isSelected,
  onClick,
}: {
  title: string;
  subtitle: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        isSelected
          ? 'border-muted-foreground/30 bg-accent hover:bg-accent/80'
          : 'bg-transparent hover:bg-accent'
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="text-base font-medium leading-normal truncate">{title}</div>
          {title !== subtitle && (
            <div className="text-sm text-muted-foreground leading-normal truncate">{subtitle}</div>
          )}
        </div>
        {isSelected && <Check className="w-5 h-5 text-primary shrink-0" />}
      </CardContent>
    </Card>
  );
}
