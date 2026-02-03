import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';

interface ComputerData {
  hostname?: string;
  model?: string;
  adapter?: string;
  local_ip?: string;
}

interface NetworkData {
  type: 'wifi' | 'cable' | 'usb_modem' | 'bt' | 'mobile';
  signal?: {
    level: 'excellent' | 'good' | 'fair' | 'weak';
    dbm: number;
  };
  link?: boolean;
}

interface RouterData {
  model?: string;
  brand?: string;
  localIp: string;
}

interface InternetData {
  provider?: string;
  publicIp: string;
  country?: string;
  city?: string;
}

type NodeData = ComputerData | NetworkData | RouterData | InternetData;

interface NodeCardProps {
  type: 'computer' | 'network' | 'router' | 'internet';
  data: NodeData | null;
  geoConsent?: boolean;
  isLoading?: boolean;
}

export function NodeCard({ type, data, geoConsent = false, isLoading = false }: NodeCardProps) {
  const { t } = useTranslation();

  const renderComputer = (data: ComputerData | null) => (
    <div>
      <h3 className="text-base font-semibold text-card-foreground mb-2">{t('nodes.computer.name')}</h3>
      {data ? (
        <div className="grid gap-1 text-xs text-muted-foreground">
          {data.hostname && (
            <div>{t('nodes.computer.name_field')}: {data.hostname}</div>
          )}
          {data.model && (
            <div>{t('nodes.computer.model_field')}: {data.model}</div>
          )}
          {data.adapter && (
            <div>{t('nodes.computer.adapter_field')}: {data.adapter}</div>
          )}
          {data.local_ip && (
            <div>{t('nodes.computer.local_ip_field')}: {data.local_ip}</div>
          )}
        </div>
      ) : (
        !isLoading && (
          <div className="text-xs text-muted-foreground italic">
            {t('meta.no_data')}
          </div>
        )
      )}
    </div>
  );

  const renderNetwork = (data: NetworkData) => {
    const getNetworkTypeText = () => {
      switch (data.type) {
        case 'wifi': return t('nodes.network.type_wifi');
        case 'cable': return t('nodes.network.type_cable');
        case 'usb_modem': return t('nodes.network.type_usb_modem');
        case 'bt': return t('nodes.network.type_bt');
        case 'mobile': return t('nodes.network.type_mobile');
        default: return data.type;
      }
    };

    const getSignalText = () => {
      if (data.type !== 'wifi' || !data.signal) return null;

      const levelText = t(`nodes.network.signal_${data.signal.level}`);
      return `${t('nodes.network.signal_field')}: ${levelText} (${data.signal.dbm} dBm)`;
    };

    const getLinkText = () => {
      if (data.type !== 'cable' || data.link === undefined) return null;
      return `${t('nodes.network.link_field')}: ${data.link ? 'есть' : 'нет'}`;
    };

    return (
      <div>
        <h3 className="text-base font-semibold text-card-foreground mb-2">{t('nodes.network.name')}</h3>
        <div className="grid gap-1 text-xs text-muted-foreground">
          <div>{getNetworkTypeText()}</div>
          {getSignalText() && <div>{getSignalText()}</div>}
          {getLinkText() && <div>{getLinkText()}</div>}
        </div>
      </div>
    );
  };

  const renderRouter = (data: RouterData) => (
    <div>
      <h3 className="text-base font-semibold text-card-foreground mb-2">{t('nodes.router.name')}</h3>
      <div className="grid gap-1 text-xs text-muted-foreground">
        {(data.model || data.brand) && (
          <div>{data.brand ? `${data.brand} ${data.model}` : data.model}</div>
        )}
        <div>{t('nodes.router.local_ip_field')}: {data.localIp}</div>
      </div>
    </div>
  );

  const renderInternet = (data: InternetData) => {
    return (
      <div>
        <h3 className="text-base font-semibold text-card-foreground mb-2">{t('nodes.internet.name')}</h3>
        <div className="grid gap-1 text-xs text-muted-foreground">
          {data.provider && <div>{data.provider}</div>}
          <div>{t('nodes.internet.ip_field')}: {data.publicIp}</div>
          {geoConsent && data.country && data.city && (
            <div>{data.country}, {data.city}</div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (type) {
      case 'computer':
        return renderComputer(data as ComputerData | null);
      case 'network':
        return renderNetwork(data as NetworkData);
      case 'router':
        return renderRouter(data as RouterData);
      case 'internet':
        return renderInternet(data as InternetData);
      default:
        return null;
    }
  };

  return (
    <Card className="mb-3">
      <CardContent className="px-4 py-3">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
