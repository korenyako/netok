import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import { useSettings } from '../store/useSettings';

export function DNSTab() {
  const { t } = useTranslation();
  const { dnsMode, setDnsMode, customDns, setCustomDns } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          {t('settings.dns.mode')}
        </h3>
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

      {dnsMode === 'custom' && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            {t('settings.dns.custom_dns')}
          </h3>
          <input
            type="text"
            value={customDns}
            onChange={(e) => setCustomDns(e.target.value)}
            placeholder={t('settings.dns.custom_dns_placeholder')}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
      )}

      <div>
        <button
          onClick={handleFlushCache}
          disabled={isLoading}
          className="w-full px-4 py-3 text-left border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-sm text-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('settings.dns.flush_cache')}
        </button>
      </div>

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
    </div>
  );
}
