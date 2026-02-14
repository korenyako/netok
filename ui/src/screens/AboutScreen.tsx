import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight } from '../components/icons/UIIcons';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const { t } = useTranslation();
  const [appVersion, setAppVersion] = useState('...');

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('0.1.0'));
  }, []);

  const changes = t('settings.about.changes', { returnObjects: true }) as string[];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">{t('settings.about.title')}</h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto space-y-4">
        {/* Info */}
        <Card className="bg-transparent">
          <CardContent className="px-4 py-3">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.about.version')}</p>
                <p className="text-sm text-foreground">{appVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.about.author')}</p>
                <p className="text-sm text-foreground">{t('settings.about.author_value')}</p>
                <button
                  onClick={() => openUrl('https://korenyako.github.io/')}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  korenyako.github.io
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What's new */}
        <Card className="bg-transparent">
          <CardContent className="px-4 py-3">
            <p className="text-sm text-muted-foreground mb-2">{t('settings.about.whats_new')}</p>
            <ul className="space-y-1">
              {Array.isArray(changes) && changes.map((item) => (
                <li key={item} className="text-sm text-foreground flex gap-2">
                  <span className="text-muted-foreground shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Website button */}
        <Button
          onClick={() => openUrl('https://netok.app/')}
          className="w-full text-sm font-medium"
        >
          {t('settings.about.website_button')}
          <ArrowUpRight className="w-4 h-4 ms-2" />
        </Button>
      </div>
    </div>
  );
}
