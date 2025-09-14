import React from 'react';
import { useTranslation } from 'react-i18next';
import { NetworkInfo, ComputerInfo, RouterInfo, InternetInfo } from '../store/useDiagnostics';

interface NodeCardProps {
  type: 'computer' | 'network' | 'router' | 'internet';
  data: ComputerInfo | NetworkInfo | RouterInfo | InternetInfo;
}

export const NodeCard: React.FC<NodeCardProps> = ({ type, data }) => {
  const { t } = useTranslation();

  const renderComputerNode = (info: ComputerInfo) => (
    <div className="space-y-2">
      <div className="text-text-primary font-medium">
        {t('nodes.computer.name')}
      </div>
      <div className="text-text-secondary text-sm space-y-1">
        <div>{t('nodes.computer.name_field')}: {info.name}</div>
        <div>{t('nodes.computer.model_field')}: {info.model}</div>
        <div>{t('nodes.computer.adapter_field')}: {info.adapter}</div>
        <div>{t('nodes.computer.local_ip_field')}: {info.localIp}</div>
      </div>
    </div>
  );

  const renderNetworkNode = (info: NetworkInfo) => {
    const getNetworkTypeText = () => {
      switch (info.type) {
        case 'wifi': return t('nodes.network.type_wifi');
        case 'cable': return t('nodes.network.type_cable');
        case 'usb_modem': return t('nodes.network.type_usb_modem');
        case 'bt': return t('nodes.network.type_bt');
        case 'mobile': return t('nodes.network.type_mobile');
        default: return info.type;
      }
    };

    const getSignalText = () => {
      if (info.type !== 'wifi' || !info.signal) return null;
      
      const levelText = t(`nodes.network.signal_${info.signal.level}`);
      const dbmText = info.signal.dbm ? ` (${info.signal.dbm} dBm)` : '';
      return `${t('nodes.network.signal_field')}: ${levelText}${dbmText}`;
    };

    const getLinkText = () => {
      if (info.type !== 'cable' || info.link === undefined) return null;
      return `${t('nodes.network.link_field')}: ${info.link ? 'есть' : 'нет'}`;
    };

    return (
      <div className="space-y-2">
        <div className="text-text-primary font-medium">
          {t('nodes.network.name')}
        </div>
        <div className="text-text-secondary text-sm space-y-1">
          <div>{getNetworkTypeText()}</div>
          {info.ssid && <div>SSID: {info.ssid}</div>}
          {getSignalText() && <div>{getSignalText()}</div>}
          {getLinkText() && <div>{getLinkText()}</div>}
        </div>
      </div>
    );
  };

  const renderRouterNode = (info: RouterInfo) => (
    <div className="space-y-2">
      <div className="text-text-primary font-medium">
        {t('nodes.router.name')}
      </div>
      <div className="text-text-secondary text-sm space-y-1">
        {(info.model || info.brand) && (
          <div>{t('nodes.router.model_field')}: {info.brand ? `${info.brand} ${info.model}` : info.model}</div>
        )}
        <div>{t('nodes.router.local_ip_field')}: {info.localIp}</div>
      </div>
    </div>
  );

  const renderInternetNode = (info: InternetInfo) => (
    <div className="space-y-2">
      <div className="text-text-primary font-medium">
        {t('nodes.internet.name')}
      </div>
      <div className="text-text-secondary text-sm space-y-1">
        {info.provider && <div>{t('nodes.internet.provider_field')}: {info.provider}</div>}
        <div>{t('nodes.internet.ip_field')}: {info.publicIp}</div>
        {info.country && info.city && (
          <div>{t('nodes.internet.location_field', { country: info.country, city: info.city })}</div>
        )}
      </div>
    </div>
  );

  const renderNodeContent = () => {
    switch (type) {
      case 'computer':
        return renderComputerNode(data as ComputerInfo);
      case 'network':
        return renderNetworkNode(data as NetworkInfo);
      case 'router':
        return renderRouterNode(data as RouterInfo);
      case 'internet':
        return renderInternetNode(data as InternetInfo);
      default:
        return null;
    }
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-4">
      {renderNodeContent()}
    </div>
  );
};
