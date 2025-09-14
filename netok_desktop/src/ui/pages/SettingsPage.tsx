import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsLayout } from './Settings/SettingsLayout';
import { GeneralTab } from './Settings/GeneralTab';
import { DNSTab } from './Settings/DNSTab';
import { GeoTab } from './Settings/GeoTab';
import { ToolsTab } from './Settings/ToolsTab';

export type SettingsTab = 'general' | 'dns' | 'geo' | 'tools';

interface SettingsPageProps {
  onClose: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: t('settings.tabs.general') },
    { id: 'dns', label: t('settings.tabs.dns') },
    { id: 'geo', label: t('settings.tabs.geo') },
    { id: 'tools', label: t('settings.tabs.tools') },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralTab />;
      case 'dns':
        return <DNSTab />;
      case 'geo':
        return <GeoTab />;
      case 'tools':
        return <ToolsTab />;
      default:
        return <GeneralTab />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <SettingsLayout
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onClose={onClose}
      />
      
      {/* Main content */}
      <div className="flex-1 overflow-y-auto scrollbar-visible">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-6">
            {t('settings.title')}
          </h2>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
