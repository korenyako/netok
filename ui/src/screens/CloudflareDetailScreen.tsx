import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, type CloudflareVariant as ApiCloudflareVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface CloudflareDetailScreenProps {
  onBack: () => void;
}

type CloudflareVariant = 'standard' | 'malware' | 'family';

export function CloudflareDetailScreen({ onBack }: CloudflareDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<CloudflareVariant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: CloudflareVariant | null = currentProvider?.type === 'Cloudflare'
    ? currentProvider.variant === 'Standard' ? 'standard'
    : currentProvider.variant === 'Malware' ? 'malware'
    : 'family'
    : null;

  const getDnsAddresses = (variantId: CloudflareVariant): string => {
    switch (variantId) {
      case 'standard':
        return '1.1.1.1, 1.0.0.1';
      case 'malware':
        return '1.1.1.2, 1.0.0.2';
      case 'family':
        return '1.1.1.3, 1.0.0.3';
    }
  };

  const variants: Array<{
    id: CloudflareVariant;
    title: string;
    description: string;
  }> = [
    {
      id: 'standard',
      title: t('dns_detail.cloudflare.standard'),
      description: t('dns_detail.cloudflare.standard_desc'),
    },
    {
      id: 'malware',
      title: t('dns_detail.cloudflare.malware'),
      description: t('dns_detail.cloudflare.malware_desc'),
    },
    {
      id: 'family',
      title: t('dns_detail.cloudflare.family'),
      description: t('dns_detail.cloudflare.family_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: CloudflareVariant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiCloudflareVariant =
        variantId === 'standard' ? 'Standard' :
        variantId === 'malware' ? 'Malware' :
        'Family';

      await setDns({
        type: 'Cloudflare',
        variant: apiVariant,
      });

      // Update global store
      dnsStore.setProvider({ type: 'Cloudflare', variant: apiVariant });

      // Show success notification
      notifications.success(t('dns_detail.apply_success'));
    } catch (err) {
      console.error('Failed to set DNS:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to set DNS';
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable DNS';
      setError(errorMessage);
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
          {t('dns_providers.cloudflare')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.cloudflare_desc')}
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
                applyDisabled={Boolean((applyingVariant || isDisabling) && applyingVariant !== variant.id && !isDisabling)}
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
