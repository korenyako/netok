import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { setDns, type OpenDnsVariant as ApiOpenDnsVariant } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">
          {t('dns_providers.opendns')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Provider Description */}
        <p className="text-xs text-muted-foreground leading-normal mb-3">
          {t('dns_providers.opendns_desc')}
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
