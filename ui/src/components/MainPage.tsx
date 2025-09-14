import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HeaderStatus } from './HeaderStatus';
import { NodeCard } from './NodeCard';
import { useDiagnostics } from '../store/useDiagnostics';
import Spinner from './Spinner';

export function MainPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, loading, updatedAt, refresh } = useDiagnostics();

  const handleRefresh = async () => {
    if (!loading) {
      await refresh();
    }
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const getUpdatedTime = () => {
    if (!updatedAt) return null;
    return t('meta.updated', { 
      time: new Date(updatedAt).toLocaleTimeString() 
    });
  };

  return (
    <div className="h-full flex flex-col">
      <main className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {/* Header Status */}
          {data && (
            <HeaderStatus 
              internetStatus={data.overall}
              speed={data.speed}
              vpnDetected={data.vpnDetected}
            />
          )}
          
          {/* Node Cards */}
          {data && (
            <div>
              <NodeCard type="computer" data={data.computer} />
              <NodeCard type="network" data={data.network} />
              <NodeCard type="router" data={data.router} />
              <NodeCard type="internet" data={data.internet} geoConsent={data.geoConsent} />
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="text-neutral-500">{t('status.waiting')}</div>
            </div>
          )}

          {/* No data state */}
          {!loading && !data && (
            <div className="text-center py-8">
              <div className="text-neutral-500">{t('meta.no_data')}</div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="sticky bottom-0 border-t border-neutral-200 bg-white p-3">
        <div className="flex justify-between items-center">
          <span className="text-neutral-500 text-[13px] self-center">
            {getUpdatedTime()}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="relative h-10 px-4 shrink-0 rounded-lg border bg-neutral-600 text-white hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
              aria-live="polite"
              aria-busy={loading}
            >
              <span className={loading ? "opacity-0" : "opacity-100"}>
                {t('buttons.refresh')}
              </span>
              {loading && (
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
