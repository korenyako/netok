import { useTranslation } from 'react-i18next';
import { MockScenarioSelector } from '../components/MockScenarioSelector';

export function ToolsScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full px-4 py-4 overflow-auto">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-4 text-foreground">
        {t('SettingsTools')}
      </h1>

      {/* Mock Scenario Selector for Testing */}
      <MockScenarioSelector className="mb-4" />

      {/* Placeholder for future tools */}
      <div className="text-center py-8">
        <p className="text-sm text-foreground-tertiary">
          {t('placeholders.tools_description')}
        </p>
      </div>
    </div>
  );
}
