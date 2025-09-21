import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeaderStatus } from './HeaderStatus';
import { NodeCard } from './NodeCard';
import { useDiagnostics } from '../store/useDiagnostics';
import Spinner from './Spinner';
import { formatUpdatedAt } from '../utils/formatUpdatedAt';

export function MainPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { snapshot, isLoading, lastUpdated, refresh } = useDiagnostics();

  const handleRefresh = async () => {
    console.log('[handleRefresh] button clicked');
    if (!isLoading) {
      await refresh();
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const getUpdatedTime = () => {
    const locale = i18n.language as "ru" | "en";
    const timeText = lastUpdated
      ? formatUpdatedAt(lastUpdated, locale)
      : t('meta.never');
    
    return t('meta.updated', { time: timeText });
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {/* Header Status */}
          {snapshot && snapshot.overall !== 'checking' && (
            <HeaderStatus 
              internetStatus={snapshot.overall as 'ok' | 'partial' | 'down'}
              speed={snapshot.speed}
              vpnDetected={snapshot.vpnDetected}
            />
          )}
          
          {/* Node Cards */}
          {snapshot && (
            <div>
              <NodeCard type="computer" data={snapshot.computer} isLoading={isLoading} />
              <NodeCard type="network" data={snapshot.network} isLoading={isLoading} />
              <NodeCard type="router" data={snapshot.router} isLoading={isLoading} />
              <NodeCard type="internet" data={snapshot.internet} geoConsent={snapshot.geoConsent} isLoading={isLoading} />
            </div>
          )}

          {/* Loading state - show when isLoading */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="text-neutral-500">{t('status.waiting')}</div>
            </div>
          )}

          {/* No data state - only show when not loading and no snapshot */}
          {!isLoading && !snapshot && (
            <div className="text-center py-8">
              <div className="text-neutral-500">{t('meta.no_data')}</div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3 z-10">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 text-[13px] self-center">
            {getUpdatedTime()}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="relative h-10 px-4 shrink-0 rounded-lg border bg-neutral-600 text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              aria-live="polite"
              aria-busy={isLoading}
            >
              <span className={isLoading ? "opacity-0" : "opacity-100"}>
                {t('buttons.refresh')}
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
              {t('buttons.settings')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
