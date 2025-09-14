import React from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsTab } from '../SettingsPage';

interface SettingsLayoutProps {
  tabs: { id: SettingsTab; label: string }[];
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  onClose: () => void;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  tabs,
  activeTab,
  onTabChange,
  onClose
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-48 bg-bg-surface border-r border-border-subtle flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-semibold text-text-primary">
            {t('settings.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary rounded"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => onTabChange(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-button text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-accent-primary`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
