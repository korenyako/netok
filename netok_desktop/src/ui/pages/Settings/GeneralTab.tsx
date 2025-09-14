import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const GeneralTab: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  const [geoConsent, setGeoConsent] = useState(true);
  const [rememberWindow, setRememberWindow] = useState(true);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.general.language')}
        </h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              value="ru"
              checked={language === 'ru'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-accent-primary focus:ring-accent-primary"
            />
            <span className="text-sm text-text-primary">
              {t('settings.general.language_ru')}
            </span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-accent-primary focus:ring-accent-primary"
            />
            <span className="text-sm text-text-primary">
              {t('settings.general.language_en')}
            </span>
          </label>
        </div>
      </div>

      {/* Geo consent */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.general.geo_consent')}
        </h3>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={geoConsent}
            onChange={(e) => setGeoConsent(e.target.checked)}
            className="text-accent-primary focus:ring-accent-primary rounded"
          />
          <span className="text-sm text-text-primary">
            {t('settings.geo.consent_description')}
          </span>
        </label>
      </div>

      {/* Remember window */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.general.remember_window')}
        </h3>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={rememberWindow}
            onChange={(e) => setRememberWindow(e.target.checked)}
            className="text-accent-primary focus:ring-accent-primary rounded"
          />
          <span className="text-sm text-text-primary">
            {t('settings.general.remember_window')}
          </span>
        </label>
      </div>
    </div>
  );
};
