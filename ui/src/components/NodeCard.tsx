import { useTranslation } from 'react-i18next';

const titleWithMeta = (base: string, meta?: string) =>
  meta && meta.trim().length ? `${base} (${meta})` : base;

interface NodeCardProps {
  baseTitleKey: string;
  metaText?: string;
  facts: string[];
}

export function NodeCard({ baseTitleKey, metaText, facts }: NodeCardProps) {
  const { t } = useTranslation();
  const baseTitle = t(baseTitleKey);
  const title = titleWithMeta(baseTitle, metaText);

  return (
    <div className="rounded-xl border p-3 mb-3">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm space-y-1">
        {facts.map((fact, i) => (
          <div key={i}>{fact}</div>
        ))}
      </div>
    </div>
  );
}