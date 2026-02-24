import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Loader2, RotateCw,
  Wifi, Monitor, Smartphone, Tablet, Printer, Tv, Gamepad2, Cpu,
  Ghost, HelpCircle,
} from '../components/icons/UIIcons';
import { ScanProgressRing } from '../components/ScanProgressRing';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useDeviceScanStore, formatTimeAgo } from '../stores/deviceScanStore';
import { useDiagnosticsStore, getNetworkAvailability } from '../stores/diagnosticsStore';
import type { DeviceType, NetworkDevice } from '../api/tauri';

interface DeviceScanScreenProps {
  onBack: () => void;
}

const DEVICE_TYPE_ICONS: Record<DeviceType, (props: { className?: string }) => React.ReactNode> = {
  Router: Wifi,
  Phone: Smartphone,
  Computer: Monitor,
  Tablet: Tablet,
  Printer: Printer,
  SmartTv: Tv,
  GameConsole: Gamepad2,
  IoT: Cpu,
  Unknown: HelpCircle,
};

const DEVICE_TYPE_COLORS: Record<DeviceType, string> = {
  Router: 'text-primary',
  Phone: 'text-primary',
  Computer: 'text-primary',
  Tablet: 'text-primary',
  Printer: 'text-primary',
  SmartTv: 'text-primary',
  GameConsole: 'text-primary',
  IoT: 'text-primary',
  Unknown: 'text-muted-foreground',
};

/** Pick icon + color with priority: is_gateway → is_randomized → device_type → unknown */
function getDeviceVisual(device: NetworkDevice) {
  if (device.is_gateway) {
    return { Icon: Wifi, color: 'text-primary' };
  }
  if (device.is_randomized && device.device_type === 'Unknown') {
    return { Icon: Ghost, color: 'text-muted-foreground' };
  }
  return {
    Icon: DEVICE_TYPE_ICONS[device.device_type] ?? HelpCircle,
    color: DEVICE_TYPE_COLORS[device.device_type] ?? 'text-muted-foreground',
  };
}

export function DeviceScanScreen({ onBack }: DeviceScanScreenProps) {
  const { t } = useTranslation();
  const { devices, lastUpdated, isScanning, scanStage, scanProgress, error, runScan } = useDeviceScanStore();
  const nodes = useDiagnosticsStore(s => s.nodes);
  const availability = getNetworkAvailability(nodes);
  const networkBlocked = availability === 'no_network';

  // Tick every 30s to refresh the "updated X min ago" label
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!lastUpdated) return;
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  // Auto-scan on first visit (no cached data, skip when no network)
  useEffect(() => {
    if (!networkBlocked && devices.length === 0 && !lastUpdated && !isScanning) {
      runScan();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showLoading = isScanning && devices.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('device_scan.title')}
          </h1>
          {!showLoading && (
            <Button variant="ghost" size="icon" onClick={runScan} disabled={isScanning || networkBlocked}>
              {isScanning
                ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                : <RotateCw className="w-5 h-5 text-muted-foreground" />
              }
            </Button>
          )}
          <CloseButton />
        </div>
      </div>

      {/* Content — loading state uses StatusScreen-style centered layout */}
      {showLoading ? (
        <div className="flex-1 flex flex-col items-center px-4">
          <div className="h-4 shrink-0" />
          <ScanProgressRing
            percent={scanProgress}
          />
          <div className="flex-[3] flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">
              {scanStage === 'identifying'
                ? t('device_scan.stage_identifying')
                : t('device_scan.stage_scanning')}
            </p>
          </div>
        </div>
      ) : (
      <div className="flex-1 px-4 pb-4 overflow-y-auto">
        {networkBlocked && !isScanning && devices.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-16">
            {t('network.scan_unavailable_no_network')}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive text-center py-8">{error}</div>
        )}

        {!isScanning && !error && devices.length === 0 && lastUpdated && (
          <div className="text-sm text-muted-foreground text-center py-16">
            {t('device_scan.no_devices')}
          </div>
        )}

        {devices.length > 0 && (
          <div className="space-y-2">
            {/* Device count + last updated */}
            <div className="flex items-baseline justify-between px-1 pb-1">
              <p className="text-xs text-muted-foreground">
                {t('device_scan.found', { count: devices.length })}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  {formatTimeAgo(lastUpdated, t)}
                </p>
              )}
            </div>

            {devices.map((device) => {
              const typeLabel = t(`device_scan.type_${device.device_type.toLowerCase()}`);
              const name = device.hostname ?? device.vendor;
              const { Icon, color } = getDeviceVisual(device);

              return (
                <Card key={`${device.ip}-${device.mac}`} className="bg-transparent hover:bg-accent">
                  <CardContent className="flex items-start gap-3 py-3 px-4">
                    <span className={`shrink-0 mt-2.5 ${color}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      {name ? (
                        <>
                          <div className="text-sm text-muted-foreground leading-normal">{typeLabel}</div>
                          <div className="text-base font-medium leading-normal flex">
                            <span className="min-w-0 truncate" dir="ltr">{name}</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-base font-medium leading-normal">{t('device_scan.unknown_device')}</div>
                      )}
                      <div className="text-sm text-muted-foreground leading-normal">{device.ip}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      )}
    </div>
  );
}
