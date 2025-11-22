import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, type CleanBrowsingVariant as ApiCleanBrowsingVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';

interface CleanBrowsingDetailScreenProps {
  onBack: () => void;
}

type CleanBrowsingVariant = 'family' | 'adult' | 'security';

export function CleanBrowsingDetailScreen({ onBack }: CleanBrowsingDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<CleanBrowsingVariant | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: CleanBrowsingVariant | null = currentProvider?.type === 'CleanBrowsing'
    ? currentProvider.variant === 'Family' ? 'family'
    : currentProvider.variant === 'Adult' ? 'adult'
    : 'security'
    : null;

  const getDnsAddresses = (variantId: CleanBrowsingVariant): string => {
    switch (variantId) {
      case 'family':
        return '185.228.168.168, 185.228.169.168';
      case 'adult':
        return '185.228.168.10, 185.228.169.11';
      case 'security':
        return '185.228.168.9, 185.228.169.9';
    }
  };

  const variants: Array<{
    id: CleanBrowsingVariant;
    title: string;
    description: string;
  }> = [
    {
      id: 'family',
      title: t('dns_detail.cleanbrowsing.family'),
      description: t('dns_detail.cleanbrowsing.family_desc'),
    },
    {
      id: 'adult',
      title: t('dns_detail.cleanbrowsing.adult'),
      description: t('dns_detail.cleanbrowsing.adult_desc'),
    },
    {
      id: 'security',
      title: t('dns_detail.cleanbrowsing.security'),
      description: t('dns_detail.cleanbrowsing.security_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: CleanBrowsingVariant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiCleanBrowsingVariant =
        variantId === 'family' ? 'Family' :
        variantId === 'adult' ? 'Adult' :
        'Security';

      await setDns({
        type: 'CleanBrowsing',
        variant: apiVariant,
      });

      // Update global store
      dnsStore.setProvider({ type: 'CleanBrowsing', variant: apiVariant });
    } catch (err) {
      console.error('Failed to set DNS:', err);
      setError(err instanceof Error ? err.message : 'Failed to set DNS');
    } finally {
      setApplyingVariant(null);
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
          {t('dns_providers.cleanbrowsing')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.cleanbrowsing_desc')}
        </p>

        {/* Variant Options */}
        <div className="space-y-2 mb-[16px]">
          {variants.map((variant) => {
            const dnsAddresses = getDnsAddresses(variant.id);
            return (
              <DnsVariantCard
                key={variant.id}
                title={variant.title}
                description={variant.description}
                dnsAddresses={dnsAddresses}
                isSelected={currentVariant === variant.id}
                isActive={currentVariant === variant.id}
                onApply={() => handleApplyVariant(variant.id)}
                applyLabel={t('dns_detail.apply')}
                isApplying={applyingVariant === variant.id}
                applyDisabled={Boolean(applyingVariant && applyingVariant !== variant.id)}
              />
            );
          })}
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
