import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, XThick } from '../components/icons/UIIcons';
import { setDns, testDnsServer } from '../api/tauri';
import { dnsStore } from '../stores/dnsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CloseButton } from '../components/WindowControls';
import { saveCustomDnsConfig, loadCustomDnsConfig } from '../utils/customDnsStorage';

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
  const [serverUnreachable, setServerUnreachable] = useState(false);

  // Load existing Custom DNS addresses from localStorage on mount
  useEffect(() => {
    const savedConfig = loadCustomDnsConfig();
    if (savedConfig) {
      setPrimaryDns(savedConfig.primary || '');
      setPrimaryIpv6(savedConfig.primaryIpv6 || '');
      // Don't load secondary if it's the same as primary (we set it as fallback)
      if (savedConfig.secondary && savedConfig.secondary !== savedConfig.primary) {
        setSecondaryDns(savedConfig.secondary);
      }
      if (savedConfig.secondaryIpv6) {
        setSecondaryIpv6(savedConfig.secondaryIpv6);
      }
    }
  }, []);

  // Validate on blur
  const handlePrimaryBlur = () => {
    const value = primaryDns.trim();
    if (value && !isValidIpv4(value)) {
      setPrimaryError(true);
    }
  };

  const handleSecondaryBlur = () => {
    const value = secondaryDns.trim();
    if (value && !isValidIpv4(value)) {
      setSecondaryError(true);
    }
  };

  const handlePrimaryIpv6Blur = () => {
    const value = primaryIpv6.trim();
    if (value && !isValidIpv6(value)) {
      setPrimaryIpv6Error(true);
    }
  };

  const handleSecondaryIpv6Blur = () => {
    const value = secondaryIpv6.trim();
    if (value && !isValidIpv6(value)) {
      setSecondaryIpv6Error(true);
    }
  };

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
    setServerUnreachable(false);

    if (pErr || sErr || pv6Err || sv6Err) return;

    try {
      setIsApplying(true);

      // Test DNS server reachability before applying
      const isReachable = await testDnsServer(primary);

      if (!isReachable) {
        setServerUnreachable(true);
        setIsApplying(false);
        return;
      }

      const provider = {
        type: 'Custom' as const,
        primary,
        secondary: secondary || primary, // Use primary as secondary if not specified
        primaryIpv6: primaryV6 || null,
        secondaryIpv6: secondaryV6 || null,
      };
      await setDns(provider);
      dnsStore.setProvider(provider);

      // Save to localStorage so we can restore even if backend detects a known provider
      saveCustomDnsConfig({
        primary,
        secondary: secondary || primary,
        primaryIpv6: primaryV6 || null,
        secondaryIpv6: secondaryV6 || null,
      });

      onApplied();
    } catch (err) {
      console.error('Failed to set custom DNS:', err);
      setServerUnreachable(true);
    } finally {
      setIsApplying(false);
    }
  };

  // Check if Apply button should be enabled
  const isApplyEnabled = primaryDns.trim() && isValidIpv4(primaryDns.trim()) && !isApplying;

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
      <div className="flex-1 px-4 pb-4 flex flex-col min-h-0 space-y-4 overflow-y-auto">
        <p className="text-sm font-normal text-muted-foreground">
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
                onChange={(e) => { setPrimaryDns(e.target.value); setPrimaryError(false); setServerUnreachable(false); }}
                onBlur={handlePrimaryBlur}
                className={cn('font-mono text-sm pr-8 placeholder:font-light', primaryError && 'border-destructive')}
              />
              {primaryDns && (
                <button
                  type="button"
                  onClick={() => { setPrimaryDns(''); setPrimaryError(false); setServerUnreachable(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  <XThick className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {primaryError && (
              <div className="mt-1.5">
                <p className="text-xs text-destructive">{t('dns_providers.custom_ip_typo')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('dns_providers.custom_ip_hint_ipv4')}</p>
              </div>
            )}
          </div>
          <div>
            <div className="relative">
              <Input
                placeholder="8.8.8.8"
                value={secondaryDns}
                onChange={(e) => { setSecondaryDns(e.target.value); setSecondaryError(false); }}
                onBlur={handleSecondaryBlur}
                className={cn('font-mono text-sm pr-8 placeholder:font-light', secondaryError && 'border-destructive')}
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
              <div className="mt-1.5">
                <p className="text-xs text-destructive">{t('dns_providers.custom_ip_typo')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('dns_providers.custom_ip_hint_ipv4')}</p>
              </div>
            )}
          </div>
        </div>

        {/* IPv6 Section */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IPv6</p>
          <div>
            <div className="relative">
              <Input
                placeholder="2606:4700:4700::1111"
                value={primaryIpv6}
                onChange={(e) => { setPrimaryIpv6(e.target.value); setPrimaryIpv6Error(false); }}
                onBlur={handlePrimaryIpv6Blur}
                className={cn('font-mono text-sm pr-8 placeholder:font-light', primaryIpv6Error && 'border-destructive')}
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
              <div className="mt-1.5">
                <p className="text-xs text-destructive">{t('dns_providers.custom_ip_typo')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('dns_providers.custom_ip_hint_ipv6')}</p>
              </div>
            )}
          </div>
          <div>
            <div className="relative">
              <Input
                placeholder="2606:4700:4700::1001"
                value={secondaryIpv6}
                onChange={(e) => { setSecondaryIpv6(e.target.value); setSecondaryIpv6Error(false); }}
                onBlur={handleSecondaryIpv6Blur}
                className={cn('font-mono text-sm pr-8 placeholder:font-light', secondaryIpv6Error && 'border-destructive')}
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
              <div className="mt-1.5">
                <p className="text-xs text-destructive">{t('dns_providers.custom_ip_typo')}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{t('dns_providers.custom_ip_hint_ipv6')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Checking state */}
        {isApplying && (
          <div className="px-3 py-2 rounded-md bg-muted/50 flex items-center gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {t('dns_providers.custom_ip_checking')}
            </p>
          </div>
        )}

        {/* Warning for unreachable server */}
        {serverUnreachable && !isApplying && (
          <div className="px-3 py-2 rounded-md bg-yellow-500/10">
            <p className="text-xs text-yellow-600 dark:text-yellow-500">{t('dns_providers.custom_ip_unreachable')}</p>
          </div>
        )}

        <Button
          className="w-full uppercase font-mono tracking-wider text-xs"
          onClick={handleApply}
          disabled={!isApplyEnabled}
        >
          {t('dns_providers.custom_ip_apply')}
        </Button>
      </div>
    </div>
  );
}
