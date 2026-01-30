import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { setDns, type AdGuardVariant as ApiAdGuardVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  const [expandedVariant, setExpandedVariant] = useState<AdGuardVariant | null>(null);

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
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {t('dns_providers.adguard')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Provider Status Card */}
        <div className="rounded-lg border border-primary/50 p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
              <span className="w-2 h-2 rounded-full bg-primary" />
            </span>
            <div className="flex-1">
              <p className="text-base font-medium leading-normal mb-1 text-primary">
                {t('dns_providers.adguard')}
              </p>
              <p className="text-sm text-muted-foreground leading-normal">
                {t('dns_providers.adguard_desc')}
              </p>
            </div>
          </div>
        </div>

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
                expanded={expandedVariant === variant.id}
                onToggle={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}
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
