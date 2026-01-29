import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { setDns } from '../api/tauri';
import { DnsVariantCard } from '../components/DnsVariantCard';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDnsStore } from '../stores/useDnsStore';
import { dnsStore } from '../stores/dnsStore';
import { notifications } from '../utils/notifications';

interface GoogleDetailScreenProps {
  onBack: () => void;
}

export function GoogleDetailScreen({ onBack }: GoogleDetailScreenProps) {
  const { t } = useTranslation();
  const { currentProvider } = useDnsStore();
  const [isApplying, setIsApplying] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive active state from global store
  const isActive = currentProvider?.type === 'Google';

  const handleApply = async () => {
    try {
      setIsApplying(true);
      setError(null);

      await setDns({ type: 'Google' });

      // Update global store
      dnsStore.setProvider({ type: 'Google' });

      // Show success notification
      notifications.success(t('dns_detail.apply_success'));
    } catch (err) {
      console.error('Failed to set DNS:', err);
      setError(err instanceof Error ? err.message : 'Failed to set DNS');
    } finally {
      setIsApplying(false);
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
          {t('dns_providers.google')}
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">
        {/* Provider Description */}
        <p className="text-xs text-muted-foreground leading-normal mb-3">
          {t('dns_providers.google_desc')}
        </p>

        {/* Single Variant Option */}
        <div className="space-y-2 mb-4">
          <DnsVariantCard
            title="Public DNS"
            description="No content filtering, fast and reliable"
            dnsAddresses="8.8.8.8, 8.8.4.4"
            isSelected={isActive}
            isActive={isActive}
            onApply={isActive ? handleDisable : handleApply}
            applyLabel={isActive ? t('dns_detail.disable') : t('dns_detail.apply')}
            isApplying={isActive ? isDisabling : isApplying}
            applyDisabled={isApplying || isDisabling}
          />
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
