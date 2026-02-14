import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { listen } from '@tauri-apps/api/event';
import { ArrowLeft, Loader2, RotateCw } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseButton } from '../components/WindowControls';
import { scanNetworkDevices, type NetworkDevice, type DeviceType } from '../api/tauri';

interface DeviceScanScreenProps {
  onBack: () => void;
}

function DeviceIcon({ type, className }: { type: DeviceType; className?: string }) {
  const cn = className ?? 'w-5 h-5';
  const base = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (type) {
    case 'Router':
      // Wifi icon
      return (
        <svg {...base} className={cn}>
          <path d="M12 20h.01" />
          <path d="M2 8.82a15 15 0 0 1 20 0" />
          <path d="M5 12.859a10 10 0 0 1 14 0" />
          <path d="M8.5 16.429a5 5 0 0 1 7 0" />
        </svg>
      );
    case 'Phone':
      // Smartphone icon
      return (
        <svg {...base} className={cn}>
          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case 'Computer':
      // Monitor icon
      return (
        <svg {...base} className={cn}>
          <rect width="20" height="14" x="2" y="3" rx="2" />
          <line x1="8" x2="16" y1="21" y2="21" />
          <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
      );
    case 'Tablet':
      // Tablet icon
      return (
        <svg {...base} className={cn}>
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
          <line x1="12" x2="12.01" y1="18" y2="18" />
        </svg>
      );
    case 'Printer':
      // Printer icon
      return (
        <svg {...base} className={cn}>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
          <rect x="6" y="14" width="12" height="8" rx="1" />
        </svg>
      );
    case 'SmartTv':
      // TV icon
      return (
        <svg {...base} className={cn}>
          <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
          <polyline points="17 2 12 7 7 2" />
        </svg>
      );
    case 'GameConsole':
      // Gamepad icon
      return (
        <svg {...base} className={cn}>
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
        </svg>
      );
    case 'IoT':
      // Cpu icon
      return (
        <svg {...base} className={cn}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M15 2v2" /><path d="M15 20v2" />
          <path d="M2 15h2" /><path d="M2 9h2" />
          <path d="M20 15h2" /><path d="M20 9h2" />
          <path d="M9 2v2" /><path d="M9 20v2" />
        </svg>
      );
    default:
      // Circle-help / question mark
      return (
        <svg {...base} className={cn}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <path d="M12 17h.01" />
        </svg>
      );
  }
}

function deviceTypeColor(type: DeviceType): string {
  switch (type) {
    case 'Router': return 'text-blue-500';
    case 'Phone': return 'text-green-500';
    case 'Computer': return 'text-purple-500';
    case 'Tablet': return 'text-indigo-500';
    case 'Printer': return 'text-orange-500';
    case 'SmartTv': return 'text-pink-500';
    case 'GameConsole': return 'text-red-500';
    case 'IoT': return 'text-amber-500';
    default: return 'text-muted-foreground';
  }
}

export function DeviceScanScreen({ onBack }: DeviceScanScreenProps) {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanStage, setScanStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Listen for scan progress events from backend
  useEffect(() => {
    const unlisten = listen<string>('scan-progress', (event) => {
      setScanStage(event.payload);
    });
    return () => { unlisten.then((f) => f()); };
  }, []);

  const doScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setScanStage(null);
    try {
      const result = await scanNetworkDevices();
      setDevices(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setScanStage(null);
    }
  }, []);

  useEffect(() => {
    doScan();
  }, [doScan]);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('device_scan.title')}
          </h1>
          <Button variant="ghost" size="icon" onClick={doScan} disabled={loading}>
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              : <RotateCw className="w-5 h-5 text-muted-foreground" />
            }
          </Button>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-4 pb-4">
        {loading && devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {scanStage === 'identifying'
                ? t('device_scan.stage_identifying')
                : t('device_scan.stage_scanning')}
            </p>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive text-center py-8">{error}</div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-16">
            {t('device_scan.no_devices')}
          </div>
        )}

        {devices.length > 0 && (
          <div className="space-y-2">
            {/* Device count */}
            <p className="text-xs text-muted-foreground px-1 pb-1">
              {t('device_scan.found', { count: devices.length })}
            </p>

            {devices.map((device) => (
              <div
                key={`${device.ip}-${device.mac}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-accent"
              >
                {/* Device icon */}
                <div className={`shrink-0 ${deviceTypeColor(device.device_type)}`}>
                  <DeviceIcon type={device.device_type} className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm font-medium text-foreground">
                      {device.vendor ?? (device.is_randomized ? t('device_scan.private_address') : t('device_scan.unknown_device'))}
                    </span>
                    {device.is_gateway && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-500 shrink-0">
                        {t('device_scan.badge_router')}
                      </span>
                    )}
                    {device.is_self && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/15 text-primary shrink-0">
                        {t('device_scan.badge_this_device')}
                      </span>
                    )}
                  </div>
                  {device.hostname && (
                    <p className="text-xs text-muted-foreground truncate">
                      {device.hostname}
                    </p>
                  )}
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {device.ip}
                  </span>
                </div>

                {/* Device type label (hide for Unknown) */}
                {device.device_type !== 'Unknown' && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {t(`device_scan.type_${device.device_type.toLowerCase()}`)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
