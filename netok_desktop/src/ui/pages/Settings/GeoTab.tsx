import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const GeoTab: React.FC = () => {
  const { t } = useTranslation();
  const [geoConsent, setGeoConsent] = useState(true);

  return (
    <div className="space-y-6">
      {/* Geo consent */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.geo.consent')}
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
        <p className="text-xs text-text-secondary mt-2">
          When enabled, country and city information will be shown for your public IP address.
        </p>
      </div>
    </div>
  );
};
