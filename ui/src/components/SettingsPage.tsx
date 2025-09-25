import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from '../store/useSettings';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Settings from centralized store
  const { 
    geoEnabled, 
    setGeoEnabled, 
    rememberWindowSize, 
    setRememberWindowSize,
    dnsMode,
    setDnsMode,
    customDns,
    setCustomDns
  } = useSettings();

  const handleClose = () => {
    navigate('/');
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('netok.lang', lang);
  };

  const handleDnsModeChange = async (mode: typeof dnsMode) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Apply DNS settings
      await invoke('set_dns', { 
        mode, 
        customDns: mode === 'custom' ? customDns : null 
      });

      // Flush DNS cache
      await invoke('flush_dns_cache');

      setDnsMode(mode);
      setSuccess(t('settings.dns.applied_successfully'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlushCache = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await invoke('flush_dns_cache');
      setSuccess(t('settings.dns.cache_flushed'));
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-lg font-semibold text-neutral-900">
            {t('settings.title')}
          </h1>
          <button
            onClick={handleClose}
            className="h-8 px-3 rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
          >
            {t('buttons.close')}
          </button>
        </div>
      </header>

      {/* Main content - Vertical scrollable list */}
      <main className="flex-1 overflow-y-auto p-4 space-y-8">
        
        {/* General Section */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            {t('settings.tabs.general')}
          </h2>
          
          <div className="space-y-4">
            {/* Language Dropdown */}
      <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
          {t('settings.general.language')}
              </label>
        <select 
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
        >
                <option value="en">{t('settings.general.language_en')}</option>
          <option value="ru">{t('settings.general.language_ru')}</option>
        </select>
      </div>
      
            {/* Remember Window Size Checkbox */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={rememberWindowSize}
            onChange={(e) => setRememberWindowSize(e.target.checked)}
            className="w-4 h-4 text-neutral-600 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <span className="text-sm text-neutral-700">
            {t('settings.general.remember_window_size')}
          </span>
        </label>
      </div>
    </div>
        </section>

        {/* DNS Section */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            {t('settings.tabs.dns')}
          </h2>
          
          <div className="space-y-4">
            {/* DNS Mode Radio Group */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                {t('settings.dns.mode')}
              </label>
              <div className="space-y-2">
                {[
                  { value: 'auto', label: t('settings.dns.mode_auto') },
                  { value: 'cloudflare', label: t('settings.dns.mode_cloudflare') },
                  { value: 'google', label: t('settings.dns.mode_google') },
                  { value: 'custom', label: t('settings.dns.mode_custom') },
                ].map((option) => (
                  <label key={option.value} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="dns-mode"
                      value={option.value}
                      checked={dnsMode === option.value}
                      onChange={() => handleDnsModeChange(option.value as typeof dnsMode)}
                      disabled={isLoading}
                      className="w-4 h-4 text-neutral-600 border-neutral-300 focus:ring-neutral-500 disabled:opacity-50"
                    />
                    <span className="text-sm text-neutral-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom DNS Input */}
            {dnsMode === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('settings.dns.custom_dns')}
                </label>
                <input
                  type="text"
                  value={customDns}
                  onChange={(e) => setCustomDns(e.target.value)}
                  placeholder={t('settings.dns.custom_dns_placeholder')}
                  disabled={isLoading}
                  className="w-full h-10 px-3 rounded-md border border-neutral-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
            )}

            {/* Clear DNS Cache Button */}
            <div>
              <button
                onClick={handleFlushCache}
                disabled={isLoading}
                className="w-full h-10 px-4 rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('settings.dns.flush_cache')}
              </button>
            </div>
          </div>
        </section>

        {/* Geo Section */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            {t('settings.tabs.geo')}
          </h2>
          
          <div className="space-y-4">
            {/* Geolocation Toggle */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={geoEnabled}
            onChange={(e) => setGeoEnabled(e.target.checked)}
            className="w-4 h-4 text-neutral-600 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <div>
            <span className="text-sm text-neutral-700">
              {t('settings.geo.show_location')}
            </span>
            <p className="text-xs text-neutral-500 mt-1">
              {t('settings.geo.description')}
            </p>
          </div>
        </label>
      </div>
    </div>
        </section>

        {/* Status Messages */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-600">
              {t('errors.dns_operation_failed')}: {error}
            </div>
    </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-600">
              {success}
            </div>
        </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600"></div>
            <span className="ml-2 text-sm text-neutral-600">
              {t('status.applying_settings')}
            </span>
          </div>
        )}
        </main>
    </div>
  );
}
