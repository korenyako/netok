import { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDiagnostics } from "../store/useDiagnostics";
import { useSettings } from "../store/useSettings";
import { NodeCard } from "../components/NodeCard";
import { HeaderStatus } from "../components/HeaderStatus";
import Spinner from "./Spinner";

export default function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { snapshot, isLoading, refresh, error } = useDiagnostics();
  const { geoEnabled } = useSettings();

  useEffect(() => { refresh(); }, [refresh]);

  const handleSettings = () => {
    navigate('/settings');
  };

  // Format updated time for footer
  const updatedAtHMS = snapshot?.updatedAt 
    ? new Date(snapshot.updatedAt).toLocaleTimeString() 
    : '';

  // VPN detection (placeholder - would need actual VPN detection logic)
  const vpnDetected = false;

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          <HeaderStatus 
            internetStatus={snapshot?.overall === 'checking' ? 'down' : snapshot?.overall || 'down'}
            publicIp={snapshot?.internet?.publicIp}
            city={geoEnabled ? snapshot?.internet?.city : undefined}
            country={geoEnabled ? snapshot?.internet?.country : undefined}
            vpnDetected={vpnDetected}
          />

          <NodeCard 
            baseTitleKey="node.computer.title"
            metaText={snapshot?.computer?.hostname ? t('meta.computer', { hostname: snapshot.computer.hostname }) : undefined}
            facts={[
              t('node.computer.adapter', { name: snapshot?.computer?.adapter ?? t('unknown') }),
              t('node.computer.lan_ip', { ip: snapshot?.computer?.local_ip ?? t('unknown') }),
            ]} 
          />

          {snapshot?.network?.type === 'wifi' ? (
            <NodeCard 
              baseTitleKey="node.network.title.wifi"
              metaText={undefined} // SSID not available in current data structure
              facts={[
                (() => {
                  const rawGrade = getSignalGrade(snapshot?.network?.signal?.dbm);
                  const gradeKey = `signal.grade.${rawGrade}` as const;
                  const gradeText = t(gradeKey);
                  return t('node.network.signal', { 
                    grade: gradeText,
                    dbm: snapshot?.network?.signal?.dbm ?? t('unknown')
                  });
                })(),
              ]} 
            />
          ) : (
            <NodeCard 
              baseTitleKey="node.network.title.ethernet"
              metaText={t('meta.ethernet')}
              facts={[
                t('node.network.link', { text: snapshot?.network?.link ? 'up' : 'down' }),
              ]} 
            />
          )}

          <NodeCard 
            baseTitleKey="node.router.title"
            metaText={snapshot?.router?.brand || snapshot?.router?.model ? t('meta.router', { name: `${snapshot?.router?.brand ?? ''} ${snapshot?.router?.model ?? ''}`.trim() }) : undefined}
            facts={[
              t('node.router.lan_ip', { ip: snapshot?.router?.localIp ?? t('unknown') }),
            ]} 
          />

          <NodeCard 
            baseTitleKey="node.internet.title"
            metaText={snapshot?.internet?.provider ? t('meta.internet', { operator: snapshot.internet.provider }) : undefined}
            facts={[
              t('node.internet.speed', { 
                down: snapshot?.speed?.down ?? t('unknown'), 
                up: snapshot?.speed?.up ?? t('unknown') 
              }),
            ]} 
          />

          {error && <div className="mt-2 text-red-500">{t('status.error_prefix')} {error}</div>}
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-center gap-2 mb-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isLoading}
            className="relative h-10 px-4 shrink-0 rounded-lg border bg-neutral-600 text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            aria-live="polite"
            aria-busy={isLoading}
          >
            <span className={isLoading ? "opacity-0" : "opacity-100"}>
              {isLoading ? t('status.waiting') : t('actions.refresh')}
            </span>
            {isLoading && (
              <span className="absolute inset-0 grid place-items-center">
                <Spinner className="size-4 animate-spin text-white" />
              </span>
            )}
          </button>
          <button 
            onClick={handleSettings}
            className="h-10 px-4 shrink-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium"
          >
            {t('actions.settings')}
          </button>
        </div>
        <div className="text-xs opacity-70 text-center">
          {t('footer.updated', { time: updatedAtHMS })}
        </div>
      </footer>
    </div>
  );
}

function getSignalGrade(dbm?: number): string {
  if (!dbm) return 'unknown';
  if (dbm >= -55) return 'excellent';
  if (dbm >= -67) return 'good';
  if (dbm >= -75) return 'fair';
  return 'weak';
}
