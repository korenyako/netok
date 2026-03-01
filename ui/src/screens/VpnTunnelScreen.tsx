import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle, Loader2 } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { PingBadge } from '../components/PingBadge';
import { useVpnStore } from '../stores/vpnStore';
import { pingDnsServer } from '../api/tauri';
import { cn } from '@/lib/utils';


interface VpnTunnelScreenProps {
  onBack: () => void;
  onAddVpn: () => void;
}

function RadioDot({ selected, applying }: { selected: boolean; applying: boolean }) {
  if (applying) return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
  return (
    <div className={cn(
      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
      selected ? "border-primary" : "border-muted-foreground/40"
    )}>
      {selected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
    </div>
  );
}

export function VpnTunnelScreen({ onBack, onAddVpn }: VpnTunnelScreenProps) {
  const { t } = useTranslation();
  const {
    configs,
    activeIndex,
    connectionState,
    lastAction,
    connectByIndex,
    disconnect,
    setEditingIndex,
  } = useVpnStore();

  const isConnected = connectionState.type === 'connected';

  // Ping latency for the active server (only when connected)
  const [ping, setPing] = useState<number | null | undefined>(undefined);

  const runPing = useCallback(() => {
    if (activeIndex === null) return;
    const host = configs[activeIndex]?.serverHost;
    if (!host) return;
    setPing(undefined);
    pingDnsServer(host)
      .then((ms) => setPing(ms))
      .catch(() => setPing(null));
  }, [configs, activeIndex]);

  useEffect(() => {
    if (!isConnected || activeIndex === null) {
      setPing(undefined);
      return;
    }
    runPing();
    const id = setInterval(runPing, 10_000);
    return () => clearInterval(id);
  }, [runPing, isConnected, activeIndex]);
  const isConnecting = connectionState.type === 'connecting';
  const isDisconnecting = connectionState.type === 'disconnecting';
  const isError = connectionState.type === 'error';
  const isElevationDenied = connectionState.type === 'elevation_denied';
  const isBusy = isConnecting || isDisconnecting;

  const isVpnActive = isConnected || isConnecting;
  const isDisabled = !isVpnActive;

  const handleDisable = async () => {
    if (isBusy || isDisabled) return;
    await disconnect();
  };

  const handleSelectServer = async (index: number) => {
    if (isBusy) return;
    // If already active and connected, do nothing
    if (activeIndex === index && isVpnActive) return;
    await connectByIndex(index);
  };

  const handleEditServer = (index: number) => {
    setEditingIndex(index);
    onAddVpn();
  };

  const handleAddNew = () => {
    setEditingIndex(null);
    onAddVpn();
  };

  const handleDismissError = () => {
    // Sync with backend's actual state instead of blindly setting disconnected.
    // If disconnect failed, the process may still be running.
    useVpnStore.getState().refreshStatus();
  };

  const handleRetry = () => {
    if (lastAction === 'disconnect') {
      disconnect();
    } else if (activeIndex !== null) {
      connectByIndex(activeIndex);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('vpn.title')}
          </h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {/* Error card */}
          {isError && (
            <Card className="border-destructive/50 bg-destructive/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-destructive">
                      {lastAction === 'disconnect' ? t('vpn.disconnect_failed') : t('vpn.connection_failed')}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{connectionState.message}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleDismissError}>
                    {t('vpn.dismiss')}
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={handleRetry}>
                    {t('vpn.retry')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Elevation denied card */}
          {isElevationDenied && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{t('vpn.elevation_denied')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t('vpn.elevation_denied_desc')}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleDismissError}>
                    {t('vpn.dismiss')}
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={handleRetry}>
                    {t('vpn.retry')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disabled card */}
          <div className={cn(isBusy && !isDisconnecting && 'pointer-events-none opacity-50')}>
            <MenuCard
              variant={isDisabled ? 'filled' : 'ghost'}
              className={cn(isDisabled && 'border-muted-foreground/30')}
              icon={<RadioDot selected={isDisabled} applying={isDisconnecting} />}
              title={t('vpn.disabled')}
              subtitle={t('vpn.disabled_desc')}
              onClick={handleDisable}
            />
          </div>

          {/* Server cards */}
          {configs.map((config, index) => {
            const isActive = activeIndex === index;
            const isThisConnecting = isActive && isConnecting;
            const isThisActive = isActive && isVpnActive;

            const serverTitle = config.serverHost || config.protocol || '';
            const location = [config.city, config.country].filter(Boolean).join(', ');
            const serverSubtitle = (
              <>
                {location && <div>{location}</div>}
                {config.protocol && (
                  <span className="inline-block text-xs font-normal px-1.5 py-0.5 rounded text-purple-500 bg-purple-500/10 mt-1.5">{config.protocol}</span>
                )}
              </>
            );

            return (
              <div key={index} className={cn(isBusy && !isThisConnecting && 'pointer-events-none opacity-50')}>
                <MenuCard
                  variant={isThisActive ? 'filled' : 'ghost'}
                  className={cn('group ghost-action-card', isThisActive && 'border-muted-foreground/30')}
                  icon={<RadioDot selected={isThisActive} applying={isThisConnecting} />}
                  title={serverTitle}
                  subtitle={serverSubtitle}
                  trailing={
                    <div className="flex flex-col items-end self-stretch shrink-0">
                      {isThisActive && isConnected ? <PingBadge value={ping} className="mt-0.5" /> : <span />}
                      <button
                        className="ghost-action px-4 py-1.5 rounded-full text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all mt-auto invisible group-hover:visible"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditServer(index);
                        }}
                      >
                        {t('vpn.edit')}
                      </button>
                    </div>
                  }
                  onClick={() => handleSelectServer(index)}
                />
              </div>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Add VPN button */}
        <Button
          variant="outline"
          className="w-full text-sm font-medium"
          onClick={handleAddNew}
        >
          {t('vpn.add_button')}
        </Button>
      </div>
    </div>
  );
}
