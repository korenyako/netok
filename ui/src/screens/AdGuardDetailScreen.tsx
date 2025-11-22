import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, type AdGuardVariant as ApiAdGuardVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface AdGuardDetailScreenProps {
  onBack: () => void;
}

type AdGuardVariant = 'standard' | 'nonfiltering' | 'family';

export function AdGuardDetailScreen({ onBack }: AdGuardDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<AdGuardVariant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: AdGuardVariant | null = currentProvider?.type === 'AdGuard'
    ? currentProvider.variant === 'Standard' ? 'standard'
    : currentProvider.variant === 'NonFiltering' ? 'nonfiltering'
    : 'family'
    : null;

  const getDnsAddresses = (variantId: AdGuardVariant): string => {
    switch (variantId) {
      case 'standard':
        return '94.140.14.14, 94.140.15.15';
      case 'nonfiltering':
        return '94.140.14.140, 94.140.14.141';
      case 'family':
        return '94.140.14.15, 94.140.15.16';
    }
  };

  const variants: Array<{
    id: AdGuardVariant;
    title: string;
    description: string;
  }> = [
    {
      id: 'standard',
      title: t('dns_detail.adguard.standard'),
      description: t('dns_detail.adguard.standard_desc'),
    },
    {
      id: 'nonfiltering',
      title: t('dns_detail.adguard.unfiltered'),
      description: t('dns_detail.adguard.unfiltered_desc'),
    },
    {
      id: 'family',
      title: t('dns_detail.adguard.family'),
      description: t('dns_detail.adguard.family_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: AdGuardVariant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiAdGuardVariant =
        variantId === 'standard' ? 'Standard' :
        variantId === 'nonfiltering' ? 'NonFiltering' :
        'Family';

      await setDns({
        type: 'AdGuard',
        variant: apiVariant,
      });

      // Update global store
      dnsStore.setProvider({ type: 'AdGuard', variant: apiVariant });

      // Show success notification
      notifications.success(t('dns_detail.apply_success'));
    } catch (err) {
      console.error('Failed to set DNS:', err);
      setError(err instanceof Error ? err.message : 'Failed to set DNS');
    } finally {
      setApplyingVariant(null);
    }
  };

  const handleDisable = async () => {
    try {
      setIsDisabling(true);
      setError(null);

      await setDns({ type: 'Auto' });

      // Update global store
      dnsStore.setProvider({ type: 'Auto' });

      // Show success notification
      notifications.success(t('dns_detail.disable_success'));
    } catch (err) {
      console.error('Failed to disable DNS:', err);
      setError(err instanceof Error ? err.message : 'Failed to disable DNS');
    } finally {
      setIsDisabling(false);
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
          {t('dns_providers.adguard')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.adguard_desc')}
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
                onApply={currentVariant === variant.id ? handleDisable : () => handleApplyVariant(variant.id)}
                applyLabel={currentVariant === variant.id ? t('dns_detail.disable') : t('dns_detail.apply')}
                isApplying={currentVariant === variant.id ? isDisabling : applyingVariant === variant.id}
                applyDisabled={Boolean((applyingVariant && applyingVariant !== variant.id) || (isDisabling && currentVariant !== variant.id))}
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
