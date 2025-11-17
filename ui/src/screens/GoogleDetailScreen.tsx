import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, getDnsProvider } from '../api/tauri';

interface GoogleDetailScreenProps {
  onBack: () => void;
}

export function GoogleDetailScreen({ onBack }: GoogleDetailScreenProps) {
  const { t } = useTranslation();
  const [isSelected, setIsSelected] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current DNS provider to detect if Google is active
  useEffect(() => {
    const fetchCurrentProvider = async () => {
      try {
        const provider = await getDnsProvider();
        if (provider.type === 'Google') {
          setIsActive(true);
          setIsSelected(true);
        }
      } catch (err) {
        console.error('Failed to get current DNS provider:', err);
      }
    };

    fetchCurrentProvider();
  }, []);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setError(null);

      await setDns({ type: 'Google' });

      // Success - go back
      onBack();
    } catch (err) {
      console.error('Failed to set DNS:', err);
      setError(err instanceof Error ? err.message : 'Failed to set DNS');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button */}
      <div className="px-4 py-4">
        <button
          onClick={onBack}
          className="w-6 h-6 flex items-center justify-center focus:outline-none"
        >
          <svg
            className="w-6 h-6 text-foreground-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground leading-[28.8px] mb-[12px]">
          {t('dns_providers.google')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.google_desc')}
        </p>

        {/* Subtitle */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[16px]">
          {t('dns_detail.choose_protection')}
        </p>

        {/* Single Variant Option */}
        <div className="space-y-2 mb-[16px]">
          <button
            onClick={() => setIsSelected(true)}
            className={`w-full rounded-[12px] p-4 text-left focus:outline-none bg-background-tertiary ${
              isActive ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-base font-medium text-foreground leading-5 flex-1">
                Public DNS
              </h3>
              {isSelected && (
                <svg
                  className="w-4 h-4 text-primary flex-shrink-0 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 16 16"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3 3 7-7" />
                </svg>
              )}
            </div>
            <p className="text-sm text-foreground-secondary leading-[19.6px] mb-1">
              No content filtering, fast and reliable
            </p>
            <p className="text-xs text-foreground-tertiary leading-[16.8px] font-mono mt-1.5">
              8.8.8.8, 8.8.4.4
            </p>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          disabled={isApplying}
          className="w-full h-[44px] bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-[12px] flex items-center justify-center focus:outline-none transition-colors"
        >
          {isApplying ? (
            <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
              <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <span className="text-base font-medium text-white leading-5">
              {t('dns_detail.apply')}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
