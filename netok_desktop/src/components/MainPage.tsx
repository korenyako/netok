import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Settings from './Settings';

export default function MainPage() {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          <div className="text-center py-8">
            <h1 className="text-xl font-semibold mb-4">{t('app.title')}</h1>
            <p className="text-neutral-500">{t('app.description')}</p>
          </div>
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-end">
          <button 
            onClick={handleSettingsClick}
            className="h-10 px-4 shrink-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
          >
            {t('buttons.settings')}
          </button>
        </div>
      </footer>

      <Settings open={settingsOpen} onClose={handleCloseSettings} />
    </div>
  );
}
