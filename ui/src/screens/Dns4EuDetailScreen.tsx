import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, type Dns4EuVariant as ApiDns4EuVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface Dns4EuDetailScreenProps {
  onBack: () => void;
}

type Dns4EuVariant = 'protective' | 'protective_child' | 'protective_ad' | 'protective_child_ad' | 'unfiltered';

export function Dns4EuDetailScreen({ onBack }: Dns4EuDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<Dns4EuVariant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: Dns4EuVariant | null = currentProvider?.type === 'Dns4Eu'
    ? currentProvider.variant === 'Protective' ? 'protective'
    : currentProvider.variant === 'ProtectiveChild' ? 'protective_child'
    : currentProvider.variant === 'ProtectiveAd' ? 'protective_ad'
    : currentProvider.variant === 'ProtectiveChildAd' ? 'protective_child_ad'
    : 'unfiltered'
    : null;

  const getDnsAddresses = (variantId: Dns4EuVariant): string => {
    switch (variantId) {
      case 'protective':
        return '86.54.11.1';
      case 'protective_child':
        return '86.54.11.12';
      case 'protective_ad':
        return '86.54.11.13';
      case 'protective_child_ad':
        return '86.54.11.11';
      case 'unfiltered':
        return '86.54.11.100';
    }
  };

  const variants: Array<{
    id: Dns4EuVariant;
    title: string;
    description: string;
  }> = [
    {
      id: 'protective',
      title: t('dns_detail.dns4eu.protective'),
      description: t('dns_detail.dns4eu.protective_desc'),
    },
    {
      id: 'protective_child',
      title: t('dns_detail.dns4eu.protective_child'),
      description: t('dns_detail.dns4eu.protective_child_desc'),
    },
    {
      id: 'protective_ad',
      title: t('dns_detail.dns4eu.protective_ad'),
      description: t('dns_detail.dns4eu.protective_ad_desc'),
    },
    {
      id: 'protective_child_ad',
      title: t('dns_detail.dns4eu.protective_child_ad'),
      description: t('dns_detail.dns4eu.protective_child_ad_desc'),
    },
    {
      id: 'unfiltered',
      title: t('dns_detail.dns4eu.unfiltered'),
      description: t('dns_detail.dns4eu.unfiltered_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: Dns4EuVariant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiDns4EuVariant =
        variantId === 'protective' ? 'Protective' :
        variantId === 'protective_child' ? 'ProtectiveChild' :
        variantId === 'protective_ad' ? 'ProtectiveAd' :
        variantId === 'protective_child_ad' ? 'ProtectiveChildAd' :
        'Unfiltered';

      await setDns({
        type: 'Dns4Eu',
        variant: apiVariant,
      });

      // Update global store
      dnsStore.setProvider({ type: 'Dns4Eu', variant: apiVariant });

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
          {t('dns_providers.dns4eu')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.dns4eu_desc')}
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
