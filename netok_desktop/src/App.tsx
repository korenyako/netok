import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import "./App.css";

type Overall = 'ok' | 'partial' | 'down';
type NodeId = 'computer' | 'network' | 'dns' | 'internet';

interface NodeResult {
  id: NodeId;
  label: string;            // e.g. "Компьютер", "Wi-Fi", "DNS", "Интернет"
  status: Overall | 'ok';   // keep as in bridge
  latency_ms?: number;
  details?: string;         // optional factual line
}

interface Snapshot {
  overall: Overall;                 // ok / partial / down
  nodes: NodeResult[];
  speed?: { down_mbps?: number; up_mbps?: number };
}

const hasBooted = (globalThis as any);

export default function App() {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke<Snapshot>('run_diagnostics');
      setSnapshot(data);
    } catch (e) {
      console.error('run_diagnostics failed', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // guard to avoid double-run in React 18 StrictMode
    if (hasBooted.__netokBooted) return;
    hasBooted.__netokBooted = true;
    refresh();
  }, [refresh]);
  
  const getOverallText = (overall: Overall) => {
    switch (overall) {
      case 'ok': return 'Интернет работает';
      case 'partial': return 'Интернет работает частично';
      case 'down': return 'Интернет недоступен';
      default: return 'Статус неизвестен';
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>Netok</h3>
      <button onClick={refresh} disabled={loading}>
        {t("button.refresh")}
      </button>
      {snapshot && (
        <>
          <p><em>{getOverallText(snapshot.overall)}</em></p>
          <ul>
            {snapshot.nodes.map(n => (
              <li key={n.id}>
                <b>{n.label}</b> — {n.status} {n.latency_ms ? `(${n.latency_ms}ms)` : ""}
                {n.details && <div style={{ fontSize: '0.9em', color: '#666' }}>{n.details}</div>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
