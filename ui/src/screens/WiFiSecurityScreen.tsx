import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2, RotateCw } from '../components/icons/UIIcons';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CloseButton } from '../components/WindowControls';
import { checkWifiSecurity, type WiFiSecurityReport, type SecurityCheck, type SecurityStatus } from '../api/tauri';

interface WiFiSecurityScreenProps {
  onBack: () => void;
  onNavigateToDns: () => void;
  onNavigateToVpn: () => void;
}

function StatusIcon({ status, className }: { status: SecurityStatus; className?: string }) {
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

  switch (status) {
    case 'safe':
      return (
        <svg {...base} className={`${cn} text-green-500`}>
          <path d="M20 6 9 17l-5-5" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...base} className={`${cn} text-amber-500`}>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      );
    case 'danger':
      return (
        <svg {...base} className={`${cn} text-red-500`}>
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      );
  }
}

function OverallIcon({ status, className }: { status: SecurityStatus; className?: string }) {
  const cn = className ?? 'w-12 h-12';
  const base = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 48,
    height: 48,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  const color = status === 'safe' ? 'text-green-500' : status === 'warning' ? 'text-amber-500' : 'text-red-500';

  return (
    <svg {...base} className={`${cn} ${color}`}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      {status === 'safe' && <path d="m9 12 2 2 4-4" />}
      {status === 'warning' && (
        <>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </>
      )}
      {status === 'danger' && (
        <>
          <path d="m14.5 9.5-5 5" />
          <path d="m9.5 9.5 5 5" />
        </>
      )}
    </svg>
  );
}

function getCheckLabel(check: SecurityCheck, t: (key: string) => string): { title: string; description: string } {
  const checkLabels: Record<string, string> = {
    encryption: t('wifi_security.check_encryption'),
    evil_twin: t('wifi_security.check_evil_twin'),
    arp_spoofing: t('wifi_security.check_arp_spoofing'),
    dns_hijacking: t('wifi_security.check_dns_hijacking'),
  };

  const title = checkLabels[check.check_type] || check.check_type;

  let description = '';
  switch (check.check_type) {
    case 'encryption':
      if (check.status === 'safe') description = t('wifi_security.encryption_safe');
      else if (check.status === 'danger') description = t('wifi_security.encryption_danger');
      else if (check.details === 'WEP') description = t('wifi_security.encryption_warning_wep');
      else if (check.details === 'WPA') description = t('wifi_security.encryption_warning_wpa');
      else description = t('wifi_security.encryption_safe');
      break;
    case 'evil_twin':
      description = check.status === 'safe'
        ? t('wifi_security.evil_twin_safe')
        : t('wifi_security.evil_twin_warning');
      break;
    case 'arp_spoofing':
      if (check.status === 'safe') description = t('wifi_security.arp_safe');
      else if (check.status === 'danger') description = t('wifi_security.arp_danger');
      else description = t('wifi_security.arp_warning');
      break;
    case 'dns_hijacking':
      description = check.status === 'safe'
        ? t('wifi_security.dns_safe')
        : t('wifi_security.dns_warning');
      break;
  }

  return { title, description };
}

function CheckSpinner() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-accent animate-pulse">
      <div className="shrink-0">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-muted-foreground/10 rounded w-24 mb-2" />
        <div className="h-3 bg-muted-foreground/10 rounded w-48" />
      </div>
    </div>
  );
}

export function WiFiSecurityScreen({ onBack, onNavigateToDns, onNavigateToVpn }: WiFiSecurityScreenProps) {
  const { t } = useTranslation();
  const [report, setReport] = useState<WiFiSecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const doCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await checkWifiSecurity();
      setReport(result);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    doCheck();
  }, [doCheck]);

  const overallLabel = report
    ? report.overall_status === 'safe'
      ? t('wifi_security.overall_safe')
      : report.overall_status === 'warning'
        ? t('wifi_security.overall_warning')
        : t('wifi_security.overall_danger')
    : '';

  const hasIssues = report && report.overall_status !== 'safe';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div data-tauri-drag-region className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5 text-muted-foreground rtl-flip" />
          </Button>
          <h1 className="flex-1 text-lg font-semibold text-foreground">
            {t('wifi_security.title')}
          </h1>
          <Button variant="ghost" size="icon" onClick={doCheck} disabled={loading}>
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
        {/* Loading state */}
        {loading && !report && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('wifi_security.scanning')}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-sm text-destructive text-center py-8">{error}</div>
        )}

        {/* Report */}
        {report && (
          <div className="space-y-4">
            {/* Overall status */}
            <div className="flex flex-col items-center py-4 gap-2">
              <OverallIcon status={report.overall_status} />
              <p className={`text-base font-semibold ${
                report.overall_status === 'safe' ? 'text-green-500' :
                report.overall_status === 'warning' ? 'text-amber-500' : 'text-red-500'
              }`}>
                {overallLabel}
              </p>
              {report.network_ssid && (
                <p className="text-xs text-muted-foreground">
                  {t('wifi_security.network', { ssid: report.network_ssid })}
                </p>
              )}
            </div>

            {/* Individual checks */}
            <div className="space-y-2">
              {loading ? (
                <>
                  <CheckSpinner />
                  <CheckSpinner />
                  <CheckSpinner />
                  <CheckSpinner />
                </>
              ) : (
                report.checks.map((check) => {
                  const { title, description } = getCheckLabel(check, t);
                  return (
                    <div
                      key={check.check_type}
                      className="flex items-start gap-3 p-3 rounded-xl bg-accent"
                    >
                      <div className="shrink-0 mt-0.5">
                        <StatusIcon status={check.status} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Recommendations */}
            {hasIssues && !loading && (
              <div className="space-y-2 pt-2">
                {report.checks.some(c => c.check_type === 'dns_hijacking' && c.status !== 'safe') && (
                  <button
                    onClick={onNavigateToDns}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary shrink-0"
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      {t('wifi_security.recommend_dns')}
                    </span>
                  </button>
                )}
                {(report.checks.some(c => c.check_type === 'encryption' && c.status !== 'safe') ||
                  report.checks.some(c => c.check_type === 'arp_spoofing' && c.status !== 'safe')) && (
                  <button
                    onClick={onNavigateToVpn}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/15 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary shrink-0"
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span className="text-sm font-medium text-primary">
                      {t('wifi_security.recommend_vpn')}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
