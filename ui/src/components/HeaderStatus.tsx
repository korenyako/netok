import { useTranslation } from 'react-i18next';
import { statusTitle, statusHint, isOnline, type Connectivity } from '../utils/netStatus';

interface HeaderStatusProps {
  connectivity: Connectivity;
  publicIp?: string;
  city?: string;
  country?: string;
  vpnDetected?: boolean;
}

export function HeaderStatus({ connectivity, publicIp, city, country, vpnDetected = false }: HeaderStatusProps) {
  const { t } = useTranslation();

  const getVpnText = () => {
    return vpnDetected ? t('header.vpn.on') : t('header.vpn.off');
  };

  const hint = statusHint(t, connectivity);
  const online = isOnline(connectivity);

  return (
    <div className={`mb-3 status ${!online ? 'status--warning' : ''}`}>
      <h4 className="text-neutral-900 mb-1">
        {statusTitle(t, connectivity)}
      </h4>
      
      {hint && (
        <p className="text-muted text-sm text-neutral-600 mb-1">
          {hint}
        </p>
      )}
      
      <p className="text-sm text-neutral-700 mb-1">
        {t('header.ip', { 
          ip: online ? (publicIp ?? t('unknown')) : '—', 
          city: online ? (city ?? t('dash')) : t('dash'), 
          country: online ? (country ?? t('dash')) : t('dash')
        })}
      </p>
      
      <div className="text-sm text-neutral-700">
        {getVpnText()}
      </div>
    </div>
  );
}
