import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, XThick } from '../components/icons/UIIcons';
import { setDns } from '../api/tauri';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CloseButton } from '../components/WindowControls';

interface CustomIpScreenProps {
  onBack: () => void;
  onApplied: () => void;
}

function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255 && String(num) === part;
  });
}

function isValidIpv6(ip: string): boolean {
  // Basic IPv6 validation - allows full and shortened forms
  const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  // Also allow :: notation
  if (ip === '::') return true;
  if (ip.includes(':::')) return false;
  // Count colons - IPv6 should have at most 7 colons (8 groups)
  const colonCount = (ip.match(/:/g) || []).length;
  if (colonCount > 7) return false;
  // If using :: shorthand, expand and validate
  if (ip.includes('::')) {
    const parts = ip.split('::');
    if (parts.length > 2) return false;
    return ipv6Regex.test(ip) || /^[0-9a-fA-F:]+$/.test(ip);
  }
  return ipv6Regex.test(ip);
}

export function CustomIpScreen({ onBack, onApplied }: CustomIpScreenProps) {
  const { t } = useTranslation();
  const [primaryDns, setPrimaryDns] = useState('');
  const [secondaryDns, setSecondaryDns] = useState('');
  const [primaryIpv6, setPrimaryIpv6] = useState('');
  const [secondaryIpv6, setSecondaryIpv6] = useState('');
  const [primaryError, setPrimaryError] = useState(false);
  const [secondaryError, setSecondaryError] = useState(false);
  const [primaryIpv6Error, setPrimaryIpv6Error] = useState(false);
  const [secondaryIpv6Error, setSecondaryIpv6Error] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    if (isApplying) return;

    const primary = primaryDns.trim();
    const secondary = secondaryDns.trim();
    const primaryV6 = primaryIpv6.trim();
    const secondaryV6 = secondaryIpv6.trim();

    const pErr = !isValidIpv4(primary);
    const sErr = secondary !== '' && !isValidIpv4(secondary);
    const pv6Err = primaryV6 !== '' && !isValidIpv6(primaryV6);
    const sv6Err = secondaryV6 !== '' && !isValidIpv6(secondaryV6);

    setPrimaryError(pErr);
    setSecondaryError(sErr);
    setPrimaryIpv6Error(pv6Err);
    setSecondaryIpv6Error(sv6Err);

    if (pErr || sErr || pv6Err || sv6Err) return;

    try {
      setIsApplying(true);
      const provider = {
        type: 'Custom' as const,
        primary,
        secondary: secondary || primary, // Use primary as secondary if not specified
        primaryIpv6: primaryV6 || null,
        secondaryIpv6: secondaryV6 || null,
      };
      await setDns(provider);
      dnsStore.setProvider(provider);
      onApplied();
    } catch (err) {
      console.error('Failed to set custom DNS:', err);
    } finally {
      setIsApplying(false);
    }
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
            {t('dns_providers.custom_ip')}
          </h1>
          <CloseButton />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardContent className="flex-1 flex flex-col px-4 pt-3 pb-5 space-y-4 overflow-y-auto">
            <p className="text-xs text-muted-foreground">
              {t('dns_providers.custom_ip_hint')}
            </p>
            {/* IPv4 Section */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IPv4</p>
              <div>
                <div className="relative">
                  <Input
                    placeholder="1.1.1.1"
                    value={primaryDns}
                    onChange={(e) => { setPrimaryDns(e.target.value); setPrimaryError(false); }}
                    className={cn('font-mono text-sm pr-8 border-0 bg-background shadow-none', primaryError && '!border !border-destructive')}
                  />
                  {primaryDns && (
                    <button
                      type="button"
                      onClick={() => { setPrimaryDns(''); setPrimaryError(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <XThick className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {primaryError && (
                  <p className="text-xs text-destructive mt-1">{t('dns_providers.custom_ip_invalid')}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Input
                    placeholder={`8.8.8.8 (${t('dns_providers.optional')})`}
                    value={secondaryDns}
                    onChange={(e) => { setSecondaryDns(e.target.value); setSecondaryError(false); }}
                    className={cn('font-mono text-sm pr-8 border-0 bg-background shadow-none', secondaryError && '!border !border-destructive')}
                  />
                  {secondaryDns && (
                    <button
                      type="button"
                      onClick={() => { setSecondaryDns(''); setSecondaryError(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <XThick className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {secondaryError && (
                  <p className="text-xs text-destructive mt-1">{t('dns_providers.custom_ip_invalid')}</p>
                )}
              </div>
            </div>

            {/* IPv6 Section */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                IPv6 <span className="font-normal normal-case">({t('dns_providers.optional')})</span>
              </p>
              <div>
                <div className="relative">
                  <Input
                    placeholder="2606:4700:4700::1111"
                    value={primaryIpv6}
                    onChange={(e) => { setPrimaryIpv6(e.target.value); setPrimaryIpv6Error(false); }}
                    className={cn('font-mono text-sm pr-8 border-0 bg-background shadow-none', primaryIpv6Error && '!border !border-destructive')}
                  />
                  {primaryIpv6 && (
                    <button
                      type="button"
                      onClick={() => { setPrimaryIpv6(''); setPrimaryIpv6Error(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <XThick className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {primaryIpv6Error && (
                  <p className="text-xs text-destructive mt-1">{t('dns_providers.custom_ipv6_invalid')}</p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Input
                    placeholder="2606:4700:4700::1001"
                    value={secondaryIpv6}
                    onChange={(e) => { setSecondaryIpv6(e.target.value); setSecondaryIpv6Error(false); }}
                    className={cn('font-mono text-sm pr-8 border-0 bg-background shadow-none', secondaryIpv6Error && '!border !border-destructive')}
                  />
                  {secondaryIpv6 && (
                    <button
                      type="button"
                      onClick={() => { setSecondaryIpv6(''); setSecondaryIpv6Error(false); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      <XThick className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {secondaryIpv6Error && (
                  <p className="text-xs text-destructive mt-1">{t('dns_providers.custom_ipv6_invalid')}</p>
                )}
              </div>
            </div>

            <div className="flex-1" />
            <Button
              className="w-full"
              onClick={handleApply}
              disabled={!primaryDns.trim() || isApplying}
            >
              {isApplying ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {t('dns_providers.custom_ip_apply')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
