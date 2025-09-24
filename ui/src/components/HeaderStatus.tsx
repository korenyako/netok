import { useTranslation } from 'react-i18next';

interface HeaderStatusProps {
  internetStatus: 'ok' | 'partial' | 'down';
  publicIp?: string;
  city?: string;
  country?: string;
  vpnDetected?: boolean;
}

export function HeaderStatus({ internetStatus, publicIp, city, country, vpnDetected = false }: HeaderStatusProps) {
  const { t } = useTranslation();

  const getStatusText = () => {
    switch (internetStatus) {
      case 'ok':
        return t('header.status.available');
      case 'partial':
        return t('header.status.partial');
      case 'down':
        return t('header.status.unavailable');
      default:
        return t('header.status.unavailable');
    }
  };

  const getIpText = () => {
    return t('header.ip', { 
      ip: publicIp ?? t('dash'), 
      city: city ?? t('dash'), 
      country: country ?? t('dash') 
    });
  };

  const getVpnText = () => {
    return vpnDetected ? t('header.vpn.on') : t('header.vpn.off');
  };

  return (
    <div className="mb-3">
      <div className="text-neutral-900 mb-1">
        {getStatusText()}
      </div>
      
      <div className="text-sm text-neutral-700 mb-1">
        {getIpText()}
      </div>
      
      <div className="text-sm text-neutral-700">
        {getVpnText()}
      </div>
    </div>
  );
}
