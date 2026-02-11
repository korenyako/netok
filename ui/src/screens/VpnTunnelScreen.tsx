import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MenuCard } from '@/components/MenuCard';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useVpnStore } from '../stores/vpnStore';


interface VpnTunnelScreenProps {
  onBack: () => void;
  onAddVpn: () => void;
}

export function VpnTunnelScreen({ onBack, onAddVpn }: VpnTunnelScreenProps) {
  const { t } = useTranslation();
  const { config, connectionState, connect, disconnect } = useVpnStore();

  const isConnected = connectionState.type === 'connected';
  const isConnecting = connectionState.type === 'connecting';
  const isDisconnecting = connectionState.type === 'disconnecting';
  const isError = connectionState.type === 'error';
  const isElevationDenied = connectionState.type === 'elevation_denied';
  const isBusy = isConnecting || isDisconnecting;

  const handleToggle = async (checked: boolean) => {
    if (!config) return;
    if (checked) {
      await connect();
    } else {
      await disconnect();
    }
  };

  const handleDismissError = () => {
    useVpnStore.setState({ connectionState: { type: 'disconnected' } });
  };

  // Build title, badge, and subtitle for the server card
  const serverTitle = config?.serverHost || config?.protocol || '';
  const serverBadge = config?.protocol || '';
  const serverSubtitle = [config?.city, config?.country].filter(Boolean).join(', ') || undefined;

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
          {config && (
            <Switch
              checked={isConnected}
              onCheckedChange={handleToggle}
              disabled={isBusy}
            />
          )}
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
                    <div className="text-sm font-medium text-destructive">{t('vpn.connection_failed')}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{connectionState.message}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={handleDismissError}>
                    {t('vpn.dismiss')}
                  </Button>
                  <Button variant="default" size="sm" className="flex-1" onClick={() => connect()}>
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
                  <Button variant="default" size="sm" className="flex-1" onClick={() => connect()}>
                    {t('vpn.retry')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Server card (when configured) — click to toggle */}
          {config && (
            <MenuCard
              variant={isConnected || isBusy ? 'selected' : 'ghost'}
              title={serverTitle}
              badge={serverBadge}
              badgeClassName="text-purple-500 bg-purple-500/10"
              subtitle={serverSubtitle}
              checked={isBusy ? 'spinner' : isConnected}
              onClick={() => !isBusy && handleToggle(!isConnected)}
            />
          )}

          {/* Traffic path (when connected) */}
          {isConnected && (
            <Card>
              <CardContent className="py-3 px-4">
                <div className="text-sm text-muted-foreground mb-3">{t('vpn.traffic_path')}</div>
                <div className="flex items-center justify-between text-xs">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto mb-1 text-base">
                      💻
                    </div>
                    <div className="text-muted-foreground">{t('vpn.you')}</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-2 rounded" />
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center mx-auto mb-1 text-base">
                      🔒
                    </div>
                    <div className="text-primary">{t('vpn.vpn_node')}</div>
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-2 rounded" />
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto mb-1 text-base">
                      🌍
                    </div>
                    <div className="text-muted-foreground">{t('vpn.internet')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex-1" />

        {/* Set VPN button */}
        <Button
          variant="outline"
          className="w-full uppercase font-mono tracking-wider text-xs"
          onClick={onAddVpn}
        >
          {t('vpn.set_vpn')}
        </Button>
      </div>
    </div>
  );
}
