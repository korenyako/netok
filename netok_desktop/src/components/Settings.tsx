import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function Settings({ open, onClose }: SettingsProps) {
  const { t } = useTranslation();
  const { lang, setLang } = useLanguage();

  if (!open) return null;

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLang(event.target.value);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        minWidth: 300,
        maxWidth: 400,
      }}>
        <h2 className="text-2xl font-semibold mb-5">
          {t('settings.title')}
        </h2>
        
        <div style={{ marginBottom: 20 }}>
          <label className="block mb-2 font-medium text-base">
            {t('settings.language')}
          </label>
          <select
            value={lang}
            onChange={handleLanguageChange}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
            className="text-base"
          >
            <option value="ru">{t('settings.language_ru')}</option>
            <option value="en">{t('settings.language_en')}</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #ccc',
              backgroundColor: '#f5f5f5',
              cursor: 'pointer',
            }}
            className="text-base"
          >
            {t('button.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
