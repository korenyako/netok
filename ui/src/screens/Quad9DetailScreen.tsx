import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { setDns, type Quad9Variant as ApiQuad9Variant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface Quad9DetailScreenProps {
  onBack: () => void;
}

type Quad9Variant = 'recommended' | 'secured_ecs' | 'unsecured';

export function Quad9DetailScreen({ onBack }: Quad9DetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<Quad9Variant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive current variant from global store
  const currentVariant: Quad9Variant | null = currentProvider?.type === 'Quad9'
    ? currentProvider.variant === 'Recommended' ? 'recommended'
    : currentProvider.variant === 'SecuredEcs' ? 'secured_ecs'
    : 'unsecured'
    : null;

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

      // Update global store
      dnsStore.setProvider({ type: 'Quad9', variant: apiVariant });

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
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {t('dns_providers.quad9')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Provider Description */}
        <p className="text-xs text-muted-foreground leading-normal mb-3">
          {t('dns_providers.quad9_desc')}
        </p>

        {/* Variant Options */}
        <div className="space-y-2 mb-4">
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
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

      </div>
    </div>
  );
}
