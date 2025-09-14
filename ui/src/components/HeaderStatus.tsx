import { useTranslation } from 'react-i18next';

interface HeaderStatusProps {
  internetStatus: 'ok' | 'partial' | 'down';
  speed?: { down: number; up: number };
  vpnDetected?: boolean;
}

export function HeaderStatus({ internetStatus, speed, vpnDetected = false }: HeaderStatusProps) {
  const { t } = useTranslation();

  const getStatusText = () => {
    switch (internetStatus) {
      case 'ok':
        return t('status.internet_ok');
      case 'partial':
        return t('status.internet_partial');
      case 'down':
        return t('status.internet_down');
      default:
        return t('status.internet_down');
    }
  };

  const getSpeedText = () => {
    if (!speed) return null;
    return t('status.speed', { down: speed.down, up: speed.up });
  };

  const getVpnText = () => {
    if (vpnDetected) {
      return t('status.connection_vpn_detected');
    }
    return null;
  };

  return (
    <div className="mb-3">
      <div className="text-neutral-900 mb-1">
        {getStatusText()}
      </div>
      
      {getSpeedText() && (
        <div className="text-sm text-neutral-700 mb-1">
          {getSpeedText()}
        </div>
      )}
      
      {getVpnText() && (
        <div className="text-sm text-neutral-700">
          {getVpnText()}
        </div>
      )}
    </div>
  );
}
