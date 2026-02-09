import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CloseButton } from '../components/WindowControls';
import { useVpnStore, type VpnConfig } from '../stores/vpnStore';
import { lookupIpLocation } from '../api/tauri';

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

/** Extract server host (IP or hostname) from a VPN URI key. */
function extractServerHost(key: string): string | null {
  const trimmed = key.trim();

  // vmess:// uses base64-encoded JSON with an "add" field
  if (trimmed.toLowerCase().startsWith('vmess://')) {
    try {
      const b64 = trimmed.slice('vmess://'.length).split('#')[0];
      const json = JSON.parse(atob(b64));
      if (json.add) return json.add;
    } catch {
      // fall through
    }
    return null;
  }

  // Most protocols: scheme://userinfo@host:port/...
  // vless, ss, trojan, wg, wireguard, ssconf
  const atIdx = trimmed.indexOf('@');
  if (atIdx === -1) return null;

  const afterAt = trimmed.slice(atIdx + 1);
  // Remove query (?...) and fragment (#...) first
  const hostPort = afterAt.split(/[?#]/)[0];

  // Handle IPv6 in brackets: [::1]:port
  const bracketMatch = hostPort.match(/^\[([^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1];

  // host:port or just host
  const colonIdx = hostPort.lastIndexOf(':');
  if (colonIdx === -1) return hostPort || null;
  return hostPort.slice(0, colonIdx) || null;
}

export function AddVpnScreen({ onBack, onAdded }: AddVpnScreenProps) {
  const { t } = useTranslation();
  const [keyValue, setKeyValue] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const { setConfig, setEnabled, setConnecting } = useVpnStore();

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
      country,
      city,
      ping: 0,
      rawKey: trimmed,
    };

    setConfig(config);
    setEnabled(false);
    setConnecting(false);
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
      <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-3">
        <Card>
          <CardContent className="px-4 py-3 space-y-4">
            <p className="text-sm font-normal text-muted-foreground">
              {t('vpn.key_hint')}
            </p>

            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {t('vpn.key_label')}
              </p>
              <textarea
                placeholder={t('vpn.key_placeholder')}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                className="w-full h-28 bg-background rounded-lg p-3 text-sm font-mono resize-none border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
              />
            </div>

            <Button
              className="w-full uppercase font-mono tracking-wider text-xs"
              onClick={handleAdd}
              disabled={!keyValue.trim() || isLookingUp}
            >
              {isLookingUp ? t('vpn.detecting_location') : t('vpn.add_button')}
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm font-normal text-muted-foreground px-4">
          {t('vpn.supported_full')}
        </p>
      </div>
    </div>
  );
}
