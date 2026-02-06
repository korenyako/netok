import { useTranslation } from 'react-i18next';
import { ArrowLeft, Plus, Loader2 } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MenuCard } from '@/components/MenuCard';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useVpnStore } from '../stores/vpnStore';
import { cn } from '@/lib/utils';

interface VpnTunnelScreenProps {
  onBack: () => void;
  onAddVpn: () => void;
}

export function VpnTunnelScreen({ onBack, onAddVpn }: VpnTunnelScreenProps) {
  const { t } = useTranslation();
  const { config, isEnabled, isConnecting, setEnabled, setConnecting, removeConfig } = useVpnStore();

  const handleToggle = (checked: boolean) => {
    if (!config) return;
    if (checked) {
      setConnecting(true);
      // Simulate connection delay (UI-only, no real sing-box integration)
      setTimeout(() => {
        setConnecting(false);
        setEnabled(true);
      }, 1200);
    } else {
      setConnecting(false);
      setEnabled(false);
    }
  };

  const handleRemove = () => {
    removeConfig();
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-5rem)] bg-background">
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
            isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : (
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isConnecting}
              />
            )
          )}
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {!config ? (
          /* Empty state */
          <div className="space-y-4">
            <Card
              className="border-2 border-dashed border-border cursor-pointer hover:border-muted-foreground/50 transition-colors bg-transparent"
              onClick={onAddVpn}
            >
              <CardContent className="py-6 px-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-base font-medium mb-1">{t('vpn.add_vpn')}</div>
                  <div className="text-sm text-muted-foreground">{t('vpn.add_vpn_desc')}</div>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-muted-foreground px-4">
              {t('vpn.supported_formats')}
            </p>
          </div>
        ) : (
          /* VPN configured */
          <div className="space-y-2">
            {/* Server card */}
            <Card className={cn(
              'transition-colors',
              isEnabled && !isConnecting ? 'bg-primary/10' : ''
            )}>
              <CardContent className="flex items-center gap-3 py-3 px-4">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg shrink-0">
                  {config.protocol === 'WireGuard' ? 'WG' : config.protocol.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium">{config.country}</div>
                  <div className="text-sm text-muted-foreground">
                    {config.city} &middot; {config.protocol}
                  </div>
                </div>
                {isEnabled && !isConnecting && (
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium text-primary">{config.ping} ms</div>
                    <div className="text-xs text-muted-foreground">{t('vpn.ping')}</div>
                  </div>
                )}
                {isConnecting && (
                  <Loader2 className="w-4 h-4 animate-spin text-warning shrink-0" />
                )}
              </CardContent>
            </Card>

            {/* Traffic path (when connected) */}
            {isEnabled && !isConnecting && (
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

            {/* Change server */}
            <MenuCard
              variant="ghost"
              title={t('vpn.change_server')}
              subtitle={t('vpn.change_server_desc')}
              trailing="chevron"
              onClick={onAddVpn}
            />

            {/* Remove VPN */}
            <MenuCard
              variant="ghost"
              title={t('vpn.remove_vpn')}
              muted
              onClick={handleRemove}
              className="text-destructive"
            />
          </div>
        )}
      </div>
    </div>
  );
}
