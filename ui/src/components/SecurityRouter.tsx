import { ProtectionHubScreen } from '../screens/ProtectionHubScreen';
import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { CustomIpScreen } from '../screens/CustomIpScreen';
import { VpnTunnelScreen } from '../screens/VpnTunnelScreen';
import { AddVpnScreen } from '../screens/AddVpnScreen';
import type { SecuritySubScreen } from '../hooks/useNavigation';

interface SecurityRouterProps {
  subScreen: SecuritySubScreen;
  onSetSubScreen: (screen: SecuritySubScreen) => void;
  onBack: () => void;
}

export function SecurityRouter({ subScreen, onSetSubScreen, onBack }: SecurityRouterProps) {
  const handleBackToHub = () => {
    onSetSubScreen('hub');
  };

  const handleBackToHome = () => {
    onBack();
  };

  const handleBackToProviders = () => {
    onSetSubScreen('dns-providers');
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
      return (
        <VpnTunnelScreen
          onBack={handleBackToHub}
          onAddVpn={() => onSetSubScreen('vpn-add')}
        />
      );

    case 'vpn-add':
      return (
        <AddVpnScreen
          onBack={() => onSetSubScreen('vpn')}
          onAdded={() => onSetSubScreen('vpn')}
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
