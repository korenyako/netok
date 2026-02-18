import { ProtectionHubScreen } from '../screens/ProtectionHubScreen';
import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { CustomIpScreen } from '../screens/CustomIpScreen';
import { VpnTunnelScreen } from '../screens/VpnTunnelScreen';
import { AddVpnScreen } from '../screens/AddVpnScreen';
import { WiFiSecurityScreen } from '../screens/WiFiSecurityScreen';
import type { SecuritySubScreen } from '../hooks/useNavigation';

interface SecurityRouterProps {
  subScreen: SecuritySubScreen;
  onSetSubScreen: (screen: SecuritySubScreen) => void;
  onBack: () => void;
}

export function SecurityRouter({ subScreen, onSetSubScreen, onBack }: SecurityRouterProps) {
  switch (subScreen) {
    case 'dns-providers':
      return (
        <DnsProvidersScreen
          onBack={onBack}
          onCustomIp={() => onSetSubScreen('custom-ip')}
        />
      );

    case 'custom-ip':
      return (
        <CustomIpScreen
          onBack={onBack}
          onApplied={onBack}
        />
      );

    case 'vpn':
      return (
        <VpnTunnelScreen
          onBack={onBack}
          onAddVpn={() => onSetSubScreen('vpn-add')}
        />
      );

    case 'vpn-add':
      return (
        <AddVpnScreen
          onBack={onBack}
          onAdded={onBack}
        />
      );

    case 'wifi-security':
      return (
        <WiFiSecurityScreen
          onBack={onBack}
          onNavigateToDns={() => onSetSubScreen('dns-providers')}
          onNavigateToVpn={() => onSetSubScreen('vpn')}
        />
      );

    case 'hub':
    default:
      return (
        <ProtectionHubScreen
          onBack={onBack}
          onNavigateToDns={() => onSetSubScreen('dns-providers')}
          onNavigateToVpn={() => onSetSubScreen('vpn')}
        />
      );
  }
}
