import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { CustomIpScreen } from '../screens/CustomIpScreen';
import { dnsStore } from '../stores/dnsStore';
import type { SecuritySubScreen } from '../hooks/useNavigation';

interface SecurityRouterProps {
  subScreen: SecuritySubScreen;
  onSetSubScreen: (screen: SecuritySubScreen) => void;
  onBack: () => void;
}

export function SecurityRouter({ subScreen, onSetSubScreen, onBack }: SecurityRouterProps) {
  const handleBackToProviders = () => {
    onSetSubScreen('dns-providers');
    dnsStore.refresh();
  };

  const handleBackToHome = () => {
    onBack();
    dnsStore.refresh();
  };

  switch (subScreen) {
    case 'custom-ip':
      return (
        <CustomIpScreen
          onBack={handleBackToProviders}
          onApplied={handleBackToProviders}
        />
      );

    case 'dns-providers':
    default:
      return (
        <DnsProvidersScreen
          onBack={handleBackToHome}
          onCustomIp={() => onSetSubScreen('custom-ip')}
        />
      );
  }
}
