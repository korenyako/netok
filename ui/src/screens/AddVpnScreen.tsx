import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';

import { CloseButton } from '../components/WindowControls';
import { useVpnStore, type VpnConfig } from '../stores/vpnStore';
import { lookupIpLocation } from '../api/tauri';
import { extractServerHost } from '../utils/vpnUri';

interface AddVpnScreenProps {
  onBack: () => void;
  onAdded: () => void;
}

function detectProtocol(key: string): string {
  const lower = key.trim().toLowerCase();
  if (lower.startsWith('vless://')) return 'VLESS';
  if (lower.startsWith('vmess://')) return 'VMess';
  if (lower.startsWith('ss://')) return 'Shadowsocks';
  if (lower.startsWith('trojan://')) return 'Trojan';
  if (lower.startsWith('wg://') || lower.startsWith('wireguard://')) return 'WireGuard';
  if (lower.startsWith('ssconf://')) return 'Outline';
  return 'Unknown';
}

export function AddVpnScreen({ onBack, onAdded }: AddVpnScreenProps) {
  const { t } = useTranslation();
  const { config, setConfig } = useVpnStore();
  const [keyValue, setKeyValue] = useState(config?.rawKey ?? '');
  const [isLookingUp, setIsLookingUp] = useState(false);

  const handleAdd = async () => {
    const trimmed = keyValue.trim();
    if (!trimmed) return;

    const protocol = detectProtocol(trimmed);
    let country = '';
    let city = '';

    const host = extractServerHost(trimmed);
    if (host) {
      setIsLookingUp(true);
      try {
        const location = await lookupIpLocation(host);
        country = location.country ?? '';
        city = location.city ?? '';
      } catch (e) {
        console.error('IP location lookup failed:', e);
      } finally {
        setIsLookingUp(false);
      }
    }

    const config: VpnConfig = {
      protocol,
      serverHost: host || '',
      country,
      city,
      ping: 0,
      rawKey: trimmed,
    };

    setConfig(config);
    onAdded();
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
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 space-y-6 overflow-y-auto">
        <p className="text-sm font-normal text-muted-foreground">
          {t('vpn.key_hint')}
        </p>

        <div className="flex-1 flex flex-col min-h-0 gap-3">
          <span className="text-xs text-muted-foreground/60">{t('vpn.key_example')}</span>
          <textarea
            placeholder=""
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            className="flex-1 min-h-0 w-full rounded-lg bg-accent/50 p-3 text-sm font-mono resize-none outline-none focus:ring-1 focus:ring-ring placeholder:font-light placeholder:text-muted-foreground/60 custom-scrollbar"
          />
          <Button
            className="w-full uppercase font-mono tracking-wider text-xs shrink-0"
            onClick={handleAdd}
            disabled={!keyValue.trim() || isLookingUp}
          >
            {isLookingUp ? t('vpn.detecting_location') : t('vpn.save_button')}
          </Button>
        </div>
      </div>
    </div>
  );
}
