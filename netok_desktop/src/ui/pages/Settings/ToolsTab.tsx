import React from 'react';
import { useTranslation } from 'react-i18next';

export const ToolsTab: React.FC = () => {
  const { t } = useTranslation();

  const handleSpeedTest = () => {
    alert(t('settings.tools.speed_test') + ' (stub)');
  };

  const handleClearDnsCache = () => {
    alert(t('settings.tools.clear_dns_cache') + ' (stub)');
  };

  const handleOpenWifiCaptive = () => {
    alert(t('settings.tools.open_wifi_captive') + ' (stub)');
  };

  const handleOpenRouterPage = () => {
    alert(t('settings.tools.open_router_page') + ' (stub)');
  };

  const handleCopyDiagnostics = () => {
    alert(t('settings.tools.copy_diagnostics') + ' (stub)');
  };

  const tools = [
    {
      id: 'speed_test',
      label: t('settings.tools.speed_test'),
      description: 'Quick network speed measurement',
      action: handleSpeedTest
    },
    {
      id: 'clear_dns_cache',
      label: t('settings.tools.clear_dns_cache'),
      description: 'Clear DNS resolver cache',
      action: handleClearDnsCache
    },
    {
      id: 'open_wifi_captive',
      label: t('settings.tools.open_wifi_captive'),
      description: 'Open Wi-Fi captive portal page',
      action: handleOpenWifiCaptive
    },
    {
      id: 'open_router_page',
      label: t('settings.tools.open_router_page'),
      description: 'Open router admin page',
      action: handleOpenRouterPage
    },
    {
      id: 'copy_diagnostics',
      label: t('settings.tools.copy_diagnostics'),
      description: 'Copy diagnostic results to clipboard',
      action: handleCopyDiagnostics
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-4">
          Network Tools
        </h3>
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-bg-surface border border-border-subtle rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-text-primary mb-1">
                    {tool.label}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    {tool.description}
                  </p>
                </div>
                <button
                  onClick={tool.action}
                  className="ml-4 px-3 py-1 bg-accent-primary text-white rounded-button text-xs font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {t('buttons.apply')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
