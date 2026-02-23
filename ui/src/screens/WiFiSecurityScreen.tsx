import { useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { CloseButton } from '../components/WindowControls';
import { useWifiSecurityStore } from '../stores/wifiSecurityStore';
import { useDiagnosticsStore, getNetworkAvailability } from '../stores/diagnosticsStore';
import type { SecurityCheck, SecurityStatus } from '../api/tauri';

interface WiFiSecurityScreenProps {
  onBack: () => void;
  onNavigateToDns: () => void;
  onNavigateToVpn: () => void;
}

// Check order and corresponding i18n keys (matches backend order)
const CHECK_ORDER: Array<{ type: string; labelKey: string }> = [
  { type: 'encryption', labelKey: 'wifi_security.check_encryption' },
  { type: 'evil_twin', labelKey: 'wifi_security.check_evil_twin' },
  { type: 'arp_spoofing', labelKey: 'wifi_security.check_arp_spoofing' },
  { type: 'dns_hijacking', labelKey: 'wifi_security.check_dns_hijacking' },
];

// Delay between revealing each result (ms)
const REVEAL_DELAY = 250;

function getStatusIcon(status: SecurityStatus) {
  if (status === 'safe') {
    return <NodeOkIcon className="w-5 h-5 text-primary" />;
  }
  if (status === 'warning') {
    return <NodeWarningIcon className="w-5 h-5 text-warning" />;
  }
  return <NodeErrorIcon className="w-5 h-5 text-destructive" />;
}

function getCheckDescription(check: SecurityCheck, t: (key: string) => string): string {
  switch (check.check_type) {
    case 'encryption':
      if (check.status === 'safe') return t('wifi_security.encryption_safe');
      if (check.status === 'danger') return t('wifi_security.encryption_danger');
      if (check.details === 'WEP') return t('wifi_security.encryption_warning_wep');
      if (check.details === 'WPA') return t('wifi_security.encryption_warning_wpa');
      return t('wifi_security.encryption_safe');
    case 'evil_twin':
      return check.status === 'safe'
        ? t('wifi_security.evil_twin_safe')
        : t('wifi_security.evil_twin_warning');
    case 'arp_spoofing':
      if (check.status === 'safe') return t('wifi_security.arp_safe');
      if (check.status === 'danger') return t('wifi_security.arp_danger');
      return t('wifi_security.arp_warning');
    case 'dns_hijacking':
      return check.status === 'safe'
        ? t('wifi_security.dns_safe')
        : t('wifi_security.dns_warning');
    default:
      return '';
  }
}

export function WiFiSecurityScreen({ onBack, onNavigateToDns, onNavigateToVpn }: WiFiSecurityScreenProps) {
  const { t } = useTranslation();
  const {
    report,
    isRunning,
    error,
    revealedCount,
    currentCheckIndex,
    runScan,
    resetReveal,
  } = useWifiSecurityStore();
  const nodes = useDiagnosticsStore(s => s.nodes);
  const availability = getNetworkAvailability(nodes);
  const networkBlocked = availability === 'no_network';

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealStartedRef = useRef(false);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  // Staggered reveal: called once when report arrives during a scan
  const startReveal = useCallback((checks: SecurityCheck[]) => {
    let idx = 0;
    const revealNext = () => {
      if (idx < checks.length) {
        // Use direct store access to avoid stale closures
        useWifiSecurityStore.setState({
          revealedCount: idx + 1,
          currentCheckIndex: idx + 1 < checks.length ? idx + 1 : -1,
        });
        idx++;
        if (idx < checks.length) {
          revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
        } else {
          // All revealed — done
          useWifiSecurityStore.setState({ isRunning: false, currentCheckIndex: -1 });
        }
      }
    };
    revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
  }, []);

  // When report arrives and we're running a scan → start reveal animation
  useEffect(() => {
    if (report && isRunning && !revealStartedRef.current) {
      revealStartedRef.current = true;
      const orderedChecks = CHECK_ORDER.map(({ type }) =>
        report.checks.find(c => c.check_type === type)
      ).filter((c): c is SecurityCheck => c !== undefined);
      startReveal(orderedChecks);
    }
    // Reset the flag when not running (new scan can start fresh)
    if (!isRunning) {
      revealStartedRef.current = false;
    }
  }, [report, isRunning, startReveal]);

  // On mount: if no report, start scan (skip when no network); if report exists, show all instantly
  useEffect(() => {
    if (!networkBlocked && !report && !isRunning) {
      runScan();
    } else if (report && !isRunning) {
      resetReveal();
    }
    return clearRevealTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doRefresh = useCallback(() => {
    clearRevealTimer();
    revealStartedRef.current = false;
    runScan();
  }, [clearRevealTimer, runScan]);

  // Get ordered checks from report
  const orderedChecks = report
    ? CHECK_ORDER.map(({ type }) => report.checks.find(c => c.check_type === type))
        .filter((c): c is SecurityCheck => c !== undefined)
    : [];

  // Visible (revealed) checks
  const visibleChecks = orderedChecks.slice(0, revealedCount);
  const allRevealed = revealedCount >= orderedChecks.length && orderedChecks.length > 0;

  const hasIssues = report && report.overall_status !== 'safe';

  // Show loading placeholder when a check is in progress
  const showLoadingPlaceholder = currentCheckIndex >= 0 && currentCheckIndex < CHECK_ORDER.length;

  // Show recommendations after all checks revealed + issues found
  const showRecommendations = allRevealed && !isRunning && hasIssues;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header — matches DiagnosticsScreen exactly */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('wifi_security.title')}
          </h1>
          <Button variant="ghost" size="icon" onClick={doRefresh} disabled={isRunning || networkBlocked}>
            <RotateCw className="w-5 h-5 text-muted-foreground" />
          </Button>
          <CloseButton />
        </div>
      </div>

      {/* Network unavailable state */}
      {networkBlocked && !isRunning && visibleChecks.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('network.scan_unavailable_no_network')}
          </p>
        </div>
      )}

      {/* Error State — matches DiagnosticsScreen */}
      {error && !networkBlocked && visibleChecks.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-foreground mb-4">{t('wifi_security.scanning')}</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      {(visibleChecks.length > 0 || showLoadingPlaceholder) && (
        <div className="flex-1 px-4 overflow-y-auto pb-4">
          {/* Error inline — shown after partial results */}
          {error && visibleChecks.length > 0 && (
            <div className="mb-4 text-sm text-destructive animate-in fade-in duration-300">
              {error}
            </div>
          )}

          {/* Check results — same layout as diagnostics nodes */}
          <div className="space-y-2">
            {/* Revealed checks */}
            {visibleChecks.map((check) => {
              const checkDef = CHECK_ORDER.find(c => c.type === check.check_type);
              return (
                <MenuCard
                  key={check.check_type}
                  variant="static"
                  icon={getStatusIcon(check.status)}
                  title={t(checkDef?.labelKey ?? check.check_type)}
                  subtitle={<p>{getCheckDescription(check, t)}</p>}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                />
              );
            })}

            {/* Loading placeholder for current check */}
            {showLoadingPlaceholder && (
              <MenuCard
                variant="static"
                icon={<NodeLoadingIcon className="w-5 h-5 text-muted-foreground animate-spin" />}
                title={t(CHECK_ORDER[currentCheckIndex].labelKey)}
                subtitle={<span className="text-muted-foreground/60">{t('wifi_security.checking')}</span>}
                muted
                className="animate-in fade-in duration-200"
              />
            )}
          </div>

          {/* Recommendations — appears after all checks, if issues found */}
          {showRecommendations && (
            <div className="space-y-2 pt-4">
              {report!.checks.some(c => c.check_type === 'dns_hijacking' && c.status !== 'safe') && (
                <MenuCard
                  variant="highlighted"
                  icon={<NodeOkIcon className="w-5 h-5 text-primary" />}
                  title={t('wifi_security.recommend_dns')}
                  trailing="chevron"
                  onClick={onNavigateToDns}
                  className="animate-in fade-in duration-300"
                />
              )}
              {(report!.checks.some(c => c.check_type === 'encryption' && c.status !== 'safe') ||
                report!.checks.some(c => c.check_type === 'arp_spoofing' && c.status !== 'safe')) && (
                <MenuCard
                  variant="highlighted"
                  icon={<NodeOkIcon className="w-5 h-5 text-primary" />}
                  title={t('wifi_security.recommend_vpn')}
                  trailing="chevron"
                  onClick={onNavigateToVpn}
                  className="animate-in fade-in duration-300"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
