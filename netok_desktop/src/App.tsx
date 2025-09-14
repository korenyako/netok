import { useCallback, useEffect, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import Settings from './components/Settings';

type Overall = 'ok' | 'partial' | 'down';
type NodeId = 'computer' | 'network' | 'dns' | 'internet';

interface NodeResult {
  id: NodeId;
  label: string;
  status: Overall;
  latency_ms?: number;
  details?: string;
}

interface Speed { 
  down_mbps?: number; 
  up_mbps?: number; 
}

interface Snapshot { 
  overall: Overall; 
  nodes: NodeResult[]; 
  speed?: Speed; 
}

interface SnapshotWithMeta extends Snapshot { 
  updated_at: number 
} // epoch ms

export default function App() {
  const { t } = useTranslation();
  const [snapshot, setSnapshot] = useState<SnapshotWithMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const bootedRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      // теперь Tauri возвращает объект, а не строку
      const data = await invoke<Snapshot>('run_diagnostics');
      const snapshotWithMeta: SnapshotWithMeta = { ...data, updated_at: Date.now() };
      setSnapshot(snapshotWithMeta);
      
      // Save to localStorage
      localStorage.setItem('netok.snapshot', JSON.stringify(snapshotWithMeta));
    } catch (err) {
      console.error('run_diagnostics failed:', err);
      const errorSnapshot: SnapshotWithMeta = {
        overall: 'down',
        nodes: [
          { id: 'computer', label: 'Компьютер', status: 'down', details: 'Ошибка диагностики' },
          { id: 'network',  label: 'Сеть',      status: 'down' },
          { id: 'dns',      label: 'DNS',       status: 'down' },
          { id: 'internet', label: 'Интернет',  status: 'down' },
        ],
        updated_at: Date.now(),
      };
      setSnapshot(errorSnapshot);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    
    // Load cached snapshot first
    try {
      const cached = localStorage.getItem('netok.snapshot');
      if (cached) {
        const cachedSnapshot = JSON.parse(cached) as SnapshotWithMeta;
        setSnapshot(cachedSnapshot);
      }
    } catch (err) {
      console.warn('Failed to load cached snapshot:', err);
    }
    
    // Then refresh in background
    refresh();
  }, [refresh]);

  const overallToText = (o?: Overall) =>
    o === 'ok' ? t('status.internet_ok')
    : o === 'partial' ? t('status.internet_partial')
    : o === 'down' ? t('status.internet_down')
    : t('status.waiting'); // fallback

  const statusShort = (s?: Overall) =>
    s === 'ok' ? t('status.ok_short')
    : s === 'partial' ? t('status.partial_short')
    : s === 'down' ? t('status.down_short')
    : t('status.unknown');

  return (
    <div style={{ 
      minWidth: 260, 
      maxWidth: 420, 
      margin: '16px auto', 
      padding: '0 16px',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header - fixed height */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16,
        flexShrink: 0,
      }}>
        <h1 style={{ margin: 0 }}>Netok</h1>
        <button 
          onClick={() => setSettingsOpen(true)} 
          style={{ 
            padding: '8px 12px', 
            borderRadius: 6, 
            border: '1px solid #ccc',
            backgroundColor: '#f5f5f5',
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          {t('button.settings')}
        </button>
      </div>

      {/* Refresh button - fixed height */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <button onClick={refresh} disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {loading ? t('button.loading') : t('button.refresh')}
        </button>
      </div>

      {/* Scrollable content area */}
      <div style={{ 
        overflowY: 'auto', 
        flex: 1,
        minHeight: 0, // Important for flex child to shrink
      }}>
        <div style={{ fontWeight: 600 }}>
          {overallToText(snapshot?.overall)}
        </div>

        {snapshot?.updated_at && (
          <div style={{opacity:0.7, fontSize:12}}>
            {t('meta.updated', { time: new Date(snapshot.updated_at).toLocaleTimeString() })}
          </div>
        )}

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

      <Settings 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  );
}
