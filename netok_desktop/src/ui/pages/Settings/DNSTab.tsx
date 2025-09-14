import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type DNSMode = 'auto' | 'cloudflare' | 'google' | 'custom';

export const DNSTab: React.FC = () => {
  const { t } = useTranslation();
  const [dnsMode, setDnsMode] = useState<DNSMode>('auto');
  const [customDns, setCustomDns] = useState('');

  const handleDnsModeChange = (mode: DNSMode) => {
    setDnsMode(mode);
    if (mode !== 'custom') {
      setCustomDns('');
    }
  };

  const handleClearCache = () => {
    // Stub action - would trigger DNS cache clearing
    alert(t('settings.dns.clear_cache') + ' (stub)');
  };

  const dnsOptions = [
    { value: 'auto', label: t('settings.dns.mode_auto') },
    { value: 'cloudflare', label: t('settings.dns.mode_cloudflare') },
    { value: 'google', label: t('settings.dns.mode_google') },
    { value: 'custom', label: t('settings.dns.mode_custom') },
  ];

  return (
    <div className="space-y-6">
      {/* DNS Mode */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.dns.mode')}
        </h3>
        <div className="space-y-2">
          {dnsOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                name="dnsMode"
                value={option.value}
                checked={dnsMode === option.value}
                onChange={(e) => handleDnsModeChange(e.target.value as DNSMode)}
                className="text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-sm text-text-primary">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom DNS input */}
      {dnsMode === 'custom' && (
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-3">
            {t('settings.dns.custom_dns')}
          </h3>
          <input
            type="text"
            value={customDns}
            onChange={(e) => setCustomDns(e.target.value)}
            placeholder="8.8.8.8"
            className="w-full px-3 py-2 border border-border-subtle rounded-button text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>
      )}

      {/* Clear DNS Cache */}
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-3">
          {t('settings.dns.clear_cache')}
        </h3>
        <button
          onClick={handleClearCache}
          className="px-4 py-2 bg-accent-primary text-white rounded-button text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t('buttons.clear_dns_cache')}
        </button>
      </div>
    </div>
  );
};
