import { useTranslation } from 'react-i18next';
import { HeaderStatus } from './components/HeaderStatus';
import { NodeCard } from './components/NodeCard';
import { LanguageToggle } from './components/LanguageToggle';
import { useDiagnostics } from './store/useDiagnostics';

function App() {
  const { t } = useTranslation();
  const { data, loading, updatedAt, refresh } = useDiagnostics();

  const handleRefresh = () => {
    refresh();
  };

  const getUpdatedTime = () => {
    if (!updatedAt) return null;
    return t('meta.updated', { 
      time: new Date(updatedAt).toLocaleTimeString() 
    });
  };

  return (
    <div id="app" className="h-full flex flex-col">
      <header className="p-3 bg-white border-b border-neutral-200">
        <div className="flex justify-end items-center">
          <LanguageToggle />
        </div>
      </header>
      
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
              onClick={handleRefresh}
              disabled={loading}
              className="h-10 px-4 shrink-0 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? t('status.waiting') : t('buttons.refresh')}
            </button>
            <button className="h-10 px-4 shrink-0 border border-neutral-300 rounded-lg hover:bg-neutral-50 font-medium">
              {t('buttons.settings')}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
