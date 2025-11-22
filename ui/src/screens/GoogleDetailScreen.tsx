import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';

interface GoogleDetailScreenProps {
  onBack: () => void;
}

export function GoogleDetailScreen({ onBack }: GoogleDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive active state from global store
  const isActive = currentProvider?.type === 'Google';

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setError(null);

      await setDns({ type: 'Google' });

      // Update global store
      dnsStore.setProvider({ type: 'Google' });
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

        {/* Single Variant Option */}
        <div className="space-y-2 mb-[16px]">
          <DnsVariantCard
            title="Public DNS"
            description="No content filtering, fast and reliable"
            dnsAddresses="8.8.8.8, 8.8.4.4"
            isSelected={isActive}
            isActive={isActive}
            onApply={handleApply}
            applyLabel={t('dns_detail.apply')}
            isApplying={isApplying}
            applyDisabled={isApplying}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

      </div>
    </div>
  );
}
