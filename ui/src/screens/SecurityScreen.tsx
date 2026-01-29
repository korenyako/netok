import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useDnsStore } from '../stores/useDnsStore';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface SecurityScreenProps {
  onBack: () => void;
  onNavigateToDnsProviders: () => void;
}

export function SecurityScreen({ onBack, onNavigateToDnsProviders }: SecurityScreenProps) {
  const { t } = useTranslation();
  const { currentProvider: dnsProvider } = useDnsStore();

  // Determine if DNS protection is enabled
  const isDnsProtectionEnabled = dnsProvider && dnsProvider.type !== 'Auto';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with Back button and Title */}
      <div className="px-4 py-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{t('security.title')}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-4">

        {/* DNS Protection Status */}
        <Alert
          variant={isDnsProtectionEnabled ? 'success' : 'default'}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={onNavigateToDnsProviders}
        >
          {isDnsProtectionEnabled ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <AlertTitle>
            {isDnsProtectionEnabled ? t('status.dns_protection') : t('status.dns_protection_disabled')}
          </AlertTitle>
          <AlertDescription>
            {isDnsProtectionEnabled
              ? t('status.dns_protection_enabled')
              : t('status.dns_protection_disabled_desc')
            }
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
