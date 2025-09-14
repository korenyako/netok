import React from 'react';
import { useTranslation } from 'react-i18next';
import { HeaderStatus } from '../components/HeaderStatus';
import { NodeCard } from '../components/NodeCard';
import { useDiagnostics } from '../store/useDiagnostics';

interface MainPageProps {
  onSettingsClick: () => void;
}

export const MainPage: React.FC<MainPageProps> = ({ onSettingsClick }) => {
  const { t } = useTranslation();
  const { data, loading, refresh } = useDiagnostics();

  const handleRefresh = () => {
    refresh();
  };

  const getUpdatedTime = () => {
    if (!data?.updatedAt) return null;
    return t('meta.updated', { 
      time: new Date(data.updatedAt).toLocaleTimeString() 
    });
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Fixed header */}
      <div className="flex-shrink-0 p-4 border-b border-border-subtle">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-text-primary">
            {t('app.name')}
          </h1>
          <button
            onClick={onSettingsClick}
            className="px-3 py-2 text-sm border border-border-subtle rounded-button bg-bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-primary"
          >
            {t('buttons.settings')}
          </button>
        </div>
        
        {/* Status block */}
        <HeaderStatus />
        
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="w-full py-3 px-4 bg-accent-primary text-white rounded-button font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? t('status.waiting') : t('buttons.refresh')}
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-visible p-4 space-y-4">
        {/* Update time */}
        {getUpdatedTime() && (
          <div className="text-xs text-text-secondary opacity-70">
            {getUpdatedTime()}
          </div>
        )}

        {/* No data message */}
        {!loading && !data && (
          <div className="text-text-secondary text-center py-8">
            {t('meta.no_data')}
          </div>
        )}

        {/* Node path */}
        {data && (
          <div className="space-y-4">
            {/* Computer */}
            <NodeCard type="computer" data={data.computer} />
            
            {/* Network */}
            <NodeCard type="network" data={data.network} />
            
            {/* Router */}
            <NodeCard type="router" data={data.router} />
            
            {/* Internet */}
            <NodeCard type="internet" data={data.internet} />
          </div>
        )}

        {/* Bottom padding for scroll */}
        <div className="h-6" />
      </div>
    </div>
  );
};
