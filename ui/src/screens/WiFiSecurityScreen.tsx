import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, RotateCw } from '../components/icons/UIIcons';
import { NodeOkIcon, NodeWarningIcon, NodeErrorIcon, NodeLoadingIcon } from '../components/icons/DiagnosticStatusIcons';
import { Button } from '@/components/ui/button';
import { MenuCard } from '@/components/MenuCard';
import { CloseButton } from '../components/WindowControls';
import { cn } from '@/lib/utils';
import { checkWifiSecurity, type WiFiSecurityReport, type SecurityCheck, type SecurityStatus } from '../api/tauri';

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

function getOverallSeverity(status: SecurityStatus): 'success' | 'warning' | 'error' {
  if (status === 'safe') return 'success';
  if (status === 'warning') return 'warning';
  return 'error';
}

const severityStyles = {
  success: { bead: 'bg-primary', title: 'text-primary' },
  warning: { bead: 'bg-warning', title: 'text-warning' },
  error: { bead: 'bg-destructive', title: 'text-destructive' },
};

export function WiFiSecurityScreen({ onBack, onNavigateToDns, onNavigateToVpn }: WiFiSecurityScreenProps) {
  const { t } = useTranslation();
  const [report, setReport] = useState<WiFiSecurityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // How many results are currently revealed (0 to 4)
  const [revealedCount, setRevealedCount] = useState(0);
  // Which check index is currently "loading" (-1 = none)
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1);

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  // Reveal results one by one with staggered timing
  const revealResults = useCallback((checks: SecurityCheck[]) => {
    let idx = 0;
    const revealNext = () => {
      if (idx < checks.length) {
        setRevealedCount(idx + 1);
        setCurrentCheckIndex(idx + 1 < checks.length ? idx + 1 : -1);
        idx++;
        if (idx < checks.length) {
          revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
        } else {
          // All revealed — done
          setIsRunning(false);
          setCurrentCheckIndex(-1);
        }
      }
    };
    revealTimerRef.current = setTimeout(revealNext, REVEAL_DELAY);
  }, []);

  const doCheck = useCallback(async () => {
    clearRevealTimer();
    setIsRunning(true);
    setError(null);
    setReport(null);
    setRevealedCount(0);
    setCurrentCheckIndex(0); // Show loading for first check

    try {
      const result = await checkWifiSecurity();
      setReport(result);

      // Sort checks into the canonical order
      const orderedChecks = CHECK_ORDER.map(({ type }) =>
        result.checks.find(c => c.check_type === type)
      ).filter((c): c is SecurityCheck => c !== undefined);

      // Progressively reveal results
      revealResults(orderedChecks);
    } catch (e) {
      setError(String(e));
      setIsRunning(false);
      setCurrentCheckIndex(-1);
    }
  }, [clearRevealTimer, revealResults]);

  useEffect(() => {
    doCheck();
    return clearRevealTimer;
  }, [doCheck, clearRevealTimer]);

  // Get ordered checks from report
  const orderedChecks = report
    ? CHECK_ORDER.map(({ type }) => report.checks.find(c => c.check_type === type))
        .filter((c): c is SecurityCheck => c !== undefined)
    : [];

  // Visible (revealed) checks
  const visibleChecks = orderedChecks.slice(0, revealedCount);
  const allRevealed = revealedCount >= orderedChecks.length && orderedChecks.length > 0;

  // Show scenario message card after all checks are revealed
  const showOverallMessage = allRevealed && report && !isRunning;
  const severity = report ? getOverallSeverity(report.overall_status) : 'success';
  const hasIssues = report && report.overall_status !== 'safe';

  // Show loading placeholder when a check is in progress
  const showLoadingPlaceholder = currentCheckIndex >= 0 && currentCheckIndex < CHECK_ORDER.length;

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
          <Button variant="ghost" size="icon" onClick={doCheck} disabled={isRunning}>
            <RotateCw className="w-5 h-5 text-muted-foreground" />
          </Button>
          <CloseButton />
        </div>
      </div>

      {/* Error State — matches DiagnosticsScreen */}
      {error && visibleChecks.length === 0 && (
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
          {/* Overall message card — appears after all checks complete */}
          {showOverallMessage && report && (
            <div className="pb-3 animate-in fade-in duration-300">
              <div className="rounded-lg bg-accent p-4">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-4 h-4 shrink-0 mt-1">
                    <span className={cn('w-2 h-2 rounded-full', severityStyles[severity].bead)} />
                  </span>
                  <div className="flex-1">
                    <p className={cn('text-base font-medium leading-normal mb-1', severityStyles[severity].title)}>
                      {report.overall_status === 'safe'
                        ? t('wifi_security.overall_safe')
                        : report.overall_status === 'warning'
                          ? t('wifi_security.overall_warning')
                          : t('wifi_security.overall_danger')}
                    </p>
                    {report.network_ssid && (
                      <p className="text-sm text-muted-foreground leading-normal">
                        {t('wifi_security.network', { ssid: report.network_ssid })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  variant="ghost"
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
          {showOverallMessage && hasIssues && (
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
