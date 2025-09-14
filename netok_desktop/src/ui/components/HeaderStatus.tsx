import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDiagnostics } from '../store/useDiagnostics';

export const HeaderStatus: React.FC = () => {
  const { t } = useTranslation();
  const { data, loading } = useDiagnostics();

  const getStatusText = () => {
    if (loading) return t('status.waiting');
    if (!data) return t('status.internet_down');
    
    switch (data.overall) {
      case 'ok':
        return t('status.internet_ok');
      case 'partial':
        return t('status.internet_partial');
      case 'down':
        return t('status.internet_down');
      default:
        return t('status.waiting');
    }
  };

  const getSpeedText = () => {
    if (!data?.speed) return null;
    return t('status.speed', {
      down: data.speed.downMbps,
      up: data.speed.upMbps
    });
  };

  const getVpnText = () => {
    if (!data?.vpnDetected) {
      return t('status.connection_no_vpn');
    }
    return null;
  };

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-lg p-4 mb-4">
      {/* Status line */}
      <div className="text-text-primary font-medium mb-2">
        {getStatusText()}
      </div>
      
      {/* Speed line */}
      {getSpeedText() && (
        <div className="text-text-secondary text-sm mb-2">
          {getSpeedText()}
        </div>
      )}
      
      {/* VPN line - only show if no VPN detected */}
      {getVpnText() && (
        <div className="text-text-secondary text-sm">
          {getVpnText()}
        </div>
      )}
    </div>
  );
};
