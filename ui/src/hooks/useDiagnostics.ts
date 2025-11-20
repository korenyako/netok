import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { runDiagnostics, type DiagnosticsSnapshot } from '../api/tauri';
import { notifications } from '../utils/notifications';

export function useDiagnostics() {
  const { t } = useTranslation();
  const [diagnosticsData, setDiagnosticsData] = useState<DiagnosticsSnapshot | null>(null);

  const fetchDiagnosticsData = async () => {
    try {
      const snapshot = await runDiagnostics();
      setDiagnosticsData(snapshot);
    } catch (err) {
      console.error('Failed to fetch diagnostics:', err);
      notifications.error(
        t('errors.diagnostics_failed', {
          defaultValue: 'Failed to run diagnostics. Please check your network connection.'
        })
      );
    }
  };

  // Load diagnostics data once on mount
  useEffect(() => {
    fetchDiagnosticsData();
  }, []);

  return {
    diagnosticsData,
    fetchDiagnosticsData,
  };
}
