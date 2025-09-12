import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';

interface NodeResult {
  id: string;
  label: string;
  status: string;
  latency_ms?: number;
  details?: string;
}

interface Snapshot {
  overall: string;
  nodes: NodeResult[];
  speed?: { down_mbps?: number; up_mbps?: number };
}

export default function App() {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const bootedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke<Snapshot>('run_diagnostics');
      setSnapshot(data);
    } catch (err) {
      console.error('run_diagnostics failed:', err);
      // Optional: set a minimal error snapshot so UI doesn't look empty
      setSnapshot({
        overall: 'down',
        nodes: [
          { id: 'computer', label: 'Компьютер', status: 'down', details: 'Ошибка диагностики' },
          { id: 'network', label: 'Сеть', status: 'down' },
          { id: 'dns', label: 'DNS', status: 'down' },
          { id: 'internet', label: 'Интернет', status: 'down' },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    refresh();
  }, [refresh]);

  const overallToText = (o?: string) =>
    o === 'ok' ? t('status.internet_ok')
    : o === 'partial' ? t('status.internet_partial')
    : o === 'down' ? t('status.internet_down')
    : t('status.waiting'); // fallback

  const statusShort = (s?: string) =>
    s === 'ok' ? t('status.ok_short')
    : s === 'partial' ? t('status.partial_short')
    : s === 'down' ? t('status.down_short')
    : t('status.unknown');

  return (
    <div style={{ padding: 24 }}>
      <h1>Netok</h1>

      <button onClick={refresh} disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {loading ? t('button.loading') : t('button.refresh')}
      </button>

      <div style={{ height: 16 }} />

      <div style={{ fontWeight: 600 }}>
        {overallToText(snapshot?.overall)}
      </div>

      {(!loading && !snapshot) && <div style={{opacity:0.8}}>Нет данных. Нажмите «Обновить».</div>}

      {/* Speed line only if present */}
      {snapshot?.speed && (
        <div>
          {t('speed.line', {
            down: Math.round(snapshot.speed.down_mbps ?? 0),
            up: Math.round(snapshot.speed.up_mbps ?? 0),
          })}
        </div>
      )}

      <div style={{ height: 16 }} />

      {/* Nodes list */}
      <ul>
        {(snapshot?.nodes ?? []).map((n) => {
          const latency = typeof n.latency_ms === 'number' ? ` (${n.latency_ms}ms)` : '';
          return (
            <li key={n.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>
                {n.label} — {statusShort(n.status)}{latency}
              </div>
              {n.details && (
                <div style={{ opacity: 0.8 }}>
                  {n.details}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
