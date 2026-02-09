import { ProtectionHubScreen } from '../screens/ProtectionHubScreen';
import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { CustomIpScreen } from '../screens/CustomIpScreen';
import { VpnTunnelScreen } from '../screens/VpnTunnelScreen';
import { AddVpnScreen } from '../screens/AddVpnScreen';
import { dnsStore } from '../stores/dnsStore';
import type { SecuritySubScreen } from '../hooks/useNavigation';

interface SecurityRouterProps {
  subScreen: SecuritySubScreen;
  onSetSubScreen: (screen: SecuritySubScreen) => void;
  onBack: () => void;
}

export function SecurityRouter({ subScreen, onSetSubScreen, onBack }: SecurityRouterProps) {
  const handleBackToHub = () => {
    onSetSubScreen('hub');
    dnsStore.refresh();
  };

  const handleBackToHome = () => {
    onBack();
    dnsStore.refresh();
  };

  const handleBackToProviders = () => {
    onSetSubScreen('dns-providers');
    dnsStore.refresh();
  };

  switch (subScreen) {
    case 'dns-providers':
      return (
        <DnsProvidersScreen
          onBack={handleBackToHub}
          onCustomIp={() => onSetSubScreen('custom-ip')}
        />
      );

    case 'custom-ip':
      return (
        <CustomIpScreen
          onBack={handleBackToProviders}
          onApplied={handleBackToProviders}
        />
      );

    case 'vpn':
    case 'vpn-add':
      return (
        <AddVpnScreen
          onBack={handleBackToHub}
          onAdded={handleBackToHub}
        />
      );

    case 'hub':
    default:
      return (
        <ProtectionHubScreen
          onBack={handleBackToHome}
          onNavigateToDns={() => onSetSubScreen('dns-providers')}
          onNavigateToVpn={() => onSetSubScreen('vpn')}
        />
      );
  }
}
