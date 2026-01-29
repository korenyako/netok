import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MockScenarioSelector } from '../components/MockScenarioSelector';

export function ToolsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollArea className="flex flex-col h-full px-4 py-4">
      {/* Header */}
      <h1 className="text-xl font-semibold mb-4 text-foreground">
        {t('SettingsTools')}
      </h1>

      {/* Mock Scenario Selector for Testing */}
      <MockScenarioSelector className="mb-4" />

      {/* Placeholder for future tools */}
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          {t('placeholders.tools_description')}
        </p>
      </div>
    </ScrollArea>
  );
}
