import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDnsStore } from '../stores/useDnsStore';

interface SecurityScreenProps {
  onBack: () => void;
  onNavigateToDnsProviders: () => void;
}

export function SecurityScreen({ onBack, onNavigateToDnsProviders }: SecurityScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider, isLoading: isDnsLoading } = useDnsStore();
  const [dots, setDots] = useState(1);

  // Animate dots during loading
  useEffect(() => {
    if (!isDnsLoading) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev % 3) + 1);
    }, 400);

    return () => clearInterval(interval);
  }, [isDnsLoading]);

  // Determine if DNS protection is enabled
  const isDnsProtectionEnabled = dnsProvider && dnsProvider.type !== 'Auto';

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
        <h1 className="text-2xl font-semibold text-foreground mb-[28px]">{t('security.title')}</h1>

        {/* DNS Protection Card - Clickable */}
        <button
          onClick={onNavigateToDnsProviders}
          className="w-full bg-background-tertiary rounded-[12px] p-4 text-left focus:outline-none hover:opacity-80 transition-opacity"
        >
          {isDnsLoading ? (
            <p className="text-sm text-foreground-secondary leading-[19.6px]">
              {t('status.dns_checking')}{'.'.repeat(dots)}
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-medium text-foreground leading-5">
                  {isDnsProtectionEnabled ? t('status.dns_protection') : t('status.dns_protection_disabled')}
                </h3>
                {/* Checkmark - green if enabled */}
                {isDnsProtectionEnabled && (
                  <svg
                    className="w-4 h-4 text-primary flex-shrink-0"
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
              <p className="text-sm text-foreground-secondary leading-[19.6px]">
                {isDnsProtectionEnabled
                  ? t('status.dns_protection_enabled')
                  : t('status.dns_protection_disabled_desc')
                }
              </p>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
