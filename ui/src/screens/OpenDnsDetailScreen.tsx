import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, type OpenDnsVariant as ApiOpenDnsVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface OpenDnsDetailScreenProps {
  onBack: () => void;
}

type OpenDnsVariant = 'familyshield' | 'home';

export function OpenDnsDetailScreen({ onBack }: OpenDnsDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<OpenDnsVariant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: OpenDnsVariant | null = currentProvider?.type === 'OpenDns'
    ? currentProvider.variant === 'FamilyShield' ? 'familyshield'
    : 'home'
    : null;

  const getDnsAddresses = (variantId: OpenDnsVariant): string => {
    switch (variantId) {
      case 'familyshield':
        return '208.67.222.123, 208.67.220.123';
      case 'home':
        return '208.67.222.222, 208.67.220.220';
    }
  };

  const variants: Array<{
    id: OpenDnsVariant;
    title: string;
    description: string;
  }> = [
    {
      id: 'familyshield',
      title: t('dns_detail.opendns.familyshield'),
      description: t('dns_detail.opendns.familyshield_desc'),
    },
    {
      id: 'home',
      title: t('dns_detail.opendns.home'),
      description: t('dns_detail.opendns.home_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: OpenDnsVariant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiOpenDnsVariant =
        variantId === 'familyshield' ? 'FamilyShield' : 'Home';

      await setDns({
        type: 'OpenDns',
        variant: apiVariant,
      });

      // Update global store
      dnsStore.setProvider({ type: 'OpenDns', variant: apiVariant });

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
          {t('dns_providers.opendns')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.opendns_desc')}
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
