import { DnsProvidersScreen } from '../screens/DnsProvidersScreen';
import { CloudflareDetailScreen } from '../screens/CloudflareDetailScreen';
import { AdGuardDetailScreen } from '../screens/AdGuardDetailScreen';
import { Dns4EuDetailScreen } from '../screens/Dns4EuDetailScreen';
import { CleanBrowsingDetailScreen } from '../screens/CleanBrowsingDetailScreen';
import { Quad9DetailScreen } from '../screens/Quad9DetailScreen';
import { OpenDnsDetailScreen } from '../screens/OpenDnsDetailScreen';
import { GoogleDetailScreen } from '../screens/GoogleDetailScreen';
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
    case 'cloudflare-detail':
      return <CloudflareDetailScreen onBack={handleBackToProviders} />;

    case 'adguard-detail':
      return <AdGuardDetailScreen onBack={handleBackToProviders} />;

    case 'dns4eu-detail':
      return <Dns4EuDetailScreen onBack={handleBackToProviders} />;

    case 'cleanbrowsing-detail':
      return <CleanBrowsingDetailScreen onBack={handleBackToProviders} />;

    case 'quad9-detail':
      return <Quad9DetailScreen onBack={handleBackToProviders} />;

    case 'opendns-detail':
      return <OpenDnsDetailScreen onBack={handleBackToProviders} />;

    case 'google-detail':
      return <GoogleDetailScreen onBack={handleBackToProviders} />;

    case 'dns-providers':
    default:
      return (
        <DnsProvidersScreen
          onBack={handleBackToHome}
          onSelectCloudflare={() => onSetSubScreen('cloudflare-detail')}
          onSelectAdGuard={() => onSetSubScreen('adguard-detail')}
          onSelectDns4Eu={() => onSetSubScreen('dns4eu-detail')}
          onSelectCleanBrowsing={() => onSetSubScreen('cleanbrowsing-detail')}
          onSelectQuad9={() => onSetSubScreen('quad9-detail')}
          onSelectOpenDns={() => onSetSubScreen('opendns-detail')}
          onSelectGoogle={() => onSetSubScreen('google-detail')}
        />
      );
  }
}
