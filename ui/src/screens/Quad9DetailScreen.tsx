import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { setDns, getDnsProvider, type Quad9Variant as ApiQuad9Variant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';

interface Quad9DetailScreenProps {
  onBack: () => void;
}

type Quad9Variant = 'recommended' | 'secured_ecs' | 'unsecured';

export function Quad9DetailScreen({ onBack }: Quad9DetailScreenProps) {
  const { t } = useTranslation();
  const [currentVariant, setCurrentVariant] = useState<Quad9Variant | null>(null);
  const [applyingVariant, setApplyingVariant] = useState<Quad9Variant | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load current DNS provider to detect which variant is active
  useEffect(() => {
    const fetchCurrentProvider = async () => {
      try {
        const provider = await getDnsProvider();
        if (provider.type === 'Quad9') {
          const variant = provider.variant;
          if (variant === 'Recommended') {
            setCurrentVariant('recommended');
          } else if (variant === 'SecuredEcs') {
            setCurrentVariant('secured_ecs');
          } else if (variant === 'Unsecured') {
            setCurrentVariant('unsecured');
          }
        }
      } catch (err) {
        console.error('Failed to get current DNS provider:', err);
      }
    };

    fetchCurrentProvider();
  }, []);

  const getDnsAddresses = (variantId: Quad9Variant): string => {
    switch (variantId) {
      case 'recommended':
        return '9.9.9.9, 149.112.112.112';
      case 'secured_ecs':
        return '9.9.9.11, 149.112.112.11';
      case 'unsecured':
        return '9.9.9.10, 149.112.112.10';
    }
  };

  const variants: Array<{
    id: Quad9Variant;
    title: string;
    description: string;
  }> = [
    {
      id: 'recommended',
      title: t('dns_detail.quad9.recommended'),
      description: t('dns_detail.quad9.recommended_desc'),
    },
    {
      id: 'secured_ecs',
      title: t('dns_detail.quad9.secured_ecs'),
      description: t('dns_detail.quad9.secured_ecs_desc'),
    },
    {
      id: 'unsecured',
      title: t('dns_detail.quad9.unsecured'),
      description: t('dns_detail.quad9.unsecured_desc'),
    },
  ];

  const handleApplyVariant = async (variantId: Quad9Variant) => {
    try {
      setApplyingVariant(variantId);
      setError(null);

      // Map UI variant to API variant
      const apiVariant: ApiQuad9Variant =
        variantId === 'recommended' ? 'Recommended' :
        variantId === 'secured_ecs' ? 'SecuredEcs' :
        'Unsecured';

      await setDns({
        type: 'Quad9',
        variant: apiVariant,
      });
      setCurrentVariant(variantId);
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
          {t('dns_providers.quad9')}
        </h1>

        {/* Provider Description */}
        <p className="text-sm text-foreground-secondary leading-[19.6px] mb-[12px]">
          {t('dns_providers.quad9_desc')}
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
