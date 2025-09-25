import { useEffect, useState } from "react";
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
  const [showDebug, setShowDebug] = useState(false);

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
            publicIp={snapshot?.internet?.public_ip}
            city={geoEnabled ? snapshot?.internet?.city : undefined}
            country={geoEnabled ? snapshot?.internet?.country : undefined}
            vpnDetected={vpnDetected}
          />

          <NodeCard 
            baseTitleKey="node.computer.title"
            metaText={snapshot?.computer?.hostname ? t('meta.computer', { hostname: snapshot.computer.hostname }) : undefined}
            facts={[
              t('node.computer.adapter', { name: snapshot?.computer?.primary_adapter ?? t('unknown') }),
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
            metaText={undefined}
            facts={[
              t('node.router.lan_ip', { ip: snapshot?.router?.local_ip ?? t('unknown') }),
            ]} 
          />

          <NodeCard 
            baseTitleKey="node.internet.title"
            metaText={snapshot?.internet?.provider ? t('meta.internet', { operator: snapshot.internet.provider }) : undefined}
            facts={[
              t('node.internet.public_ip', { ip: snapshot?.internet?.public_ip ?? t('unknown') }),
              t('node.internet.operator', { operator: snapshot?.internet?.operator ?? t('unknown') }),
              ...(geoEnabled && snapshot?.internet?.city && snapshot?.internet?.country ? [
                t('node.internet.location', { 
                  city: snapshot.internet.city, 
                  country: snapshot.internet.country 
                })
              ] : []),
            ]} 
          />
          
          {/* Provider indicator */}
          {snapshot?.internet?.provider && (
            <div className="text-xs text-gray-500 text-center mt-1">
              {t('node.internet.source', { provider: snapshot.internet.provider })}
            </div>
          )}

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
        
        {/* Debug section */}
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            Debug → {showDebug ? 'hide' : 'show'} raw JSON
          </button>
        </div>
        
        {showDebug && snapshot?.rawSnapshot && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <pre className="whitespace-pre-wrap overflow-auto max-h-40">
              {snapshot.rawSnapshot}
            </pre>
          </div>
        )}
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
