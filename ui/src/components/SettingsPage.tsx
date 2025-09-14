import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type SettingsTab = 'general' | 'dns' | 'geo' | 'tools';

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  
  // Settings state
  const [rememberWindowSize, setRememberWindowSize] = useState(true);
  const [dnsMode, setDnsMode] = useState<'auto' | 'cloudflare' | 'google' | 'custom'>('auto');
  const [customDns, setCustomDns] = useState('');
  const [showGeoLocation, setShowGeoLocation] = useState(true);

  const handleClose = () => {
    navigate('/');
  };

  const handleDnsModeChange = (mode: typeof dnsMode) => {
    setDnsMode(mode);
    if (mode === 'auto') {
      setCustomDns('');
      // TODO: Reset to system DNS and flush cache
    } else if (mode === 'custom') {
      // TODO: Apply custom DNS and flush cache
    } else {
      // TODO: Apply predefined DNS and flush cache
    }
  };

  const handleToolAction = (action: string) => {
    // TODO: Implement tool actions
    console.log(`Tool action: ${action}`);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('netok.lang', lang);
  };

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'general', label: t('settings.tabs.general') },
    { key: 'dns', label: t('settings.tabs.dns') },
    { key: 'geo', label: t('settings.tabs.geo') },
    { key: 'tools', label: t('settings.tabs.tools') },
  ];

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          {t('settings.general.language')}
        </h3>
        <select 
          value={i18n.language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="h-9 px-3 rounded-md border bg-white text-sm w-32"
        >
          <option value="ru">{t('settings.general.language_ru')}</option>
          <option value="en">{t('settings.general.language_en')}</option>
        </select>
      </div>
      
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={rememberWindowSize}
            onChange={(e) => setRememberWindowSize(e.target.checked)}
            className="w-4 h-4 text-neutral-600 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <span className="text-sm text-neutral-700">
            {t('settings.general.remember_window_size')}
          </span>
        </label>
      </div>
    </div>
  );

  const renderDnsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">
          {t('settings.dns.mode')}
        </h3>
        <div className="space-y-2">
          {[
            { value: 'auto', label: t('settings.dns.mode_auto') },
            { value: 'cloudflare', label: t('settings.dns.mode_cloudflare') },
            { value: 'google', label: t('settings.dns.mode_google') },
            { value: 'custom', label: t('settings.dns.mode_custom') },
          ].map((option) => (
            <label key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                name="dns-mode"
                value={option.value}
                checked={dnsMode === option.value}
                onChange={() => handleDnsModeChange(option.value as typeof dnsMode)}
                className="w-4 h-4 text-neutral-600 border-neutral-300 focus:ring-neutral-500"
              />
              <span className="text-sm text-neutral-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {dnsMode === 'custom' && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 mb-3">
            {t('settings.dns.custom_dns')}
          </h3>
          <input
            type="text"
            value={customDns}
            onChange={(e) => setCustomDns(e.target.value)}
            placeholder={t('settings.dns.custom_dns_placeholder')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );

  const renderGeoTab = () => (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={showGeoLocation}
            onChange={(e) => setShowGeoLocation(e.target.checked)}
            className="w-4 h-4 text-neutral-600 border-neutral-300 rounded focus:ring-neutral-500"
          />
          <div>
            <span className="text-sm text-neutral-700">
              {t('settings.geo.show_location')}
            </span>
            <p className="text-xs text-neutral-500 mt-1">
              {t('settings.geo.description')}
            </p>
          </div>
        </label>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="space-y-4">
      {[
        { key: 'speed_test', label: t('settings.tools.speed_test') },
        { key: 'flush_dns', label: t('settings.tools.flush_dns') },
        { key: 'open_captive', label: t('settings.tools.open_captive') },
        { key: 'open_router', label: t('settings.tools.open_router') },
        { key: 'copy_diagnostics', label: t('settings.tools.copy_diagnostics') },
      ].map((tool) => (
        <button
          key={tool.key}
          onClick={() => handleToolAction(tool.key)}
          className="w-full px-4 py-3 text-left border border-neutral-300 rounded-lg hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-transparent text-sm text-neutral-700"
        >
          {tool.label}
        </button>
      ))}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralTab();
      case 'dns':
        return renderDnsTab();
      case 'geo':
        return renderGeoTab();
      case 'tools':
        return renderToolsTab();
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-lg font-semibold text-neutral-900">
            {t('settings.title')}
          </h1>
          <button
            onClick={handleClose}
            className="h-8 px-3 rounded-md border border-neutral-300 bg-white text-sm text-neutral-700 hover:bg-neutral-50 hover:border-neutral-400"
          >
            {t('buttons.back')}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 bg-neutral-50 border-r border-neutral-200 p-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content panel */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
