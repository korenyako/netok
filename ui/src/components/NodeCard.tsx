import { useTranslation } from 'react-i18next';

const titleWithMeta = (base: string, meta?: string) =>
  meta && meta.trim().length ? `${base} (${meta})` : base;

interface NodeCardProps {
  baseTitleKey?: string;
  metaText?: string;
  title?: string;
  subtitle?: string;
  facts: (string | { text: string; className?: string })[];
}

export function NodeCard({ baseTitleKey, metaText, title: directTitle, subtitle, facts }: NodeCardProps) {
  const { t } = useTranslation();
  
  // Use direct title if provided, otherwise construct from baseTitleKey and metaText
  const finalTitle = directTitle || (baseTitleKey ? titleWithMeta(t(baseTitleKey), metaText) : '');
  
  return (
    <div className="rounded-xl border p-3 mb-3">
      <div className="font-semibold mb-1">{finalTitle}</div>
      {subtitle && (
        <div className="text-sm text-gray-600 mb-1">{subtitle}</div>
      )}
      <div className="text-sm space-y-1">
        {facts.map((fact, i) => (
          <div key={i} className={typeof fact === 'object' ? fact.className : undefined}>
            {typeof fact === 'string' ? fact : fact.text}
          </div>
        ))}
      </div>
    </div>
  );
}