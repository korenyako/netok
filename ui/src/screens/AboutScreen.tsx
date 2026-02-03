import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { getVersion } from '@tauri-apps/api/app';
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
    <div className="flex flex-col bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground flex-1">{t('settings.about.title')}</h1>
        <CloseButton />
      </div>

      {/* Content */}
      <div className="px-4 space-y-4">
        {/* Info */}
        <Card className="bg-transparent">
          <CardContent className="px-4 py-3">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.about.version')}</p>
                <p className="text-sm text-foreground">{appVersion}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('settings.about.developer')}</p>
                <p className="text-sm text-foreground">{t('settings.about.developer_value')}</p>
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
      </div>
    </div>
  );
}
