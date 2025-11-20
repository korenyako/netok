import { useTranslation } from 'react-i18next';

export function ToolsScreen() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2 text-foreground">
          {t('placeholders.tools_title')}
        </h1>
        <p className="text-sm text-foreground-tertiary">
          {t('placeholders.tools_description')}
        </p>
      </div>
    </div>
  );
}
