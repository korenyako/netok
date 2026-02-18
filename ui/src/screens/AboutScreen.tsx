import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowUpRight } from '../components/icons/UIIcons';
import Spinner from '../components/Spinner';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useUpdateChecker } from '../hooks/useUpdateChecker';

interface AboutScreenProps {
  onBack: () => void;
}

export function AboutScreen({ onBack }: AboutScreenProps) {
  const { t } = useTranslation();
  const [appVersion, setAppVersion] = useState('...');
  const { status, updateVersion, updateDate, progress, checkForUpdates, downloadAndInstall } = useUpdateChecker();

  useEffect(() => {
    getVersion().then(setAppVersion).catch(() => setAppVersion('0.1.0'));
  }, []);

  const isChecking = status === 'checking';
  const isAvailable = status === 'available';
  const isDownloading = status === 'downloading';

  const handleUpdateClick = () => {
    if (isAvailable) {
      downloadAndInstall();
    } else {
      checkForUpdates();
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return '';
    }
  };

  let statusText: string | null = null;
  if (isChecking) statusText = t('settings.about.checking_updates');
  else if (isAvailable && updateVersion) statusText = t('settings.about.update_version_date', { version: updateVersion, date: formatDate(updateDate) });
  else if (isDownloading) statusText = t('settings.about.update_downloading', { progress: String(progress) });
  else if (status === 'up-to-date') statusText = t('settings.about.update_up_to_date');
  else if (status === 'error') statusText = t('settings.about.update_error');

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

        {/* Check for updates */}
        <div>
          <Button
            variant={isAvailable ? 'default' : 'outline'}
            className="w-full text-sm font-medium"
            disabled={isChecking || isDownloading}
            onClick={handleUpdateClick}
          >
            {(isChecking || isDownloading) && <Spinner className="w-4 h-4 me-2" />}
            {isAvailable
              ? t('settings.about.update_to', { version: updateVersion })
              : isDownloading
                ? t('settings.about.update_downloading', { progress: String(progress) })
                : t('settings.about.check_updates')}
          </Button>
          {statusText && (
            <p className="text-xs text-muted-foreground text-center mt-2">{statusText}</p>
          )}
        </div>

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
