import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { setDns, type CleanBrowsingVariant as ApiCleanBrowsingVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface CleanBrowsingDetailScreenProps {
  onBack: () => void;
}

type CleanBrowsingVariant = 'family' | 'adult' | 'security';

export function CleanBrowsingDetailScreen({ onBack }: CleanBrowsingDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [applyingVariant, setApplyingVariant] = useState<CleanBrowsingVariant | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
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
          {t('dns_providers.cleanbrowsing')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Provider Description */}
        <p className="text-xs text-muted-foreground leading-normal mb-3">
          {t('dns_providers.cleanbrowsing_desc')}
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
