export function NodeCard({ title, lines }: { title: string; lines: (string | [string, string])[] }) {
  return (
    <div className="rounded-xl border p-3 mb-3">
      <div className="font-semibold mb-1">{title}</div>
      <div className="text-sm space-y-1">
        {lines.map((row, i) =>
          Array.isArray(row)
            ? <div key={i}><span className="opacity-70">{row[0]}: </span>{row[1]}</div>
            : <div key={i}>{row}</div>
        )}
      </div>
    </div>
  );
}