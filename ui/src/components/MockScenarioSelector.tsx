import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAllScenarios, getMockScenario, type DiagnosticResult } from '../api/tauri';
import { DiagnosticMessage } from './DiagnosticMessage';

interface MockScenarioSelectorProps {
  className?: string;
}

export function MockScenarioSelector({ className = '' }: MockScenarioSelectorProps) {
  const { t } = useTranslation();
  const [scenarios, setScenarios] = useState<[number, string][]>([]);
  const [selectedId, setSelectedId] = useState<number>(0);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const data = await getAllScenarios();
        setScenarios(data);
        if (data.length > 0) {
          setSelectedId(data[0][0]);
        }
      } catch (err) {
        console.error('Failed to fetch scenarios:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scenarios');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenarios();
  }, []);

  // Fetch mock result when selected scenario changes
  useEffect(() => {
    if (selectedId === undefined) return;

    const fetchResult = async () => {
      try {
        const data = await getMockScenario(selectedId);
        setResult(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch mock scenario:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scenario');
        setResult(null);
      }
    };

    fetchResult();
  }, [selectedId]);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedId(Number(e.target.value));
  };

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="text-foreground-secondary text-sm">
          {t('diagnostic.mock.title')}...
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg bg-background-secondary border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <h3 className="text-sm font-medium text-foreground">
          {t('diagnostic.mock.title')}
        </h3>
      </div>

      {/* Scenario Selector */}
      <div className="mb-4">
        <label className="block text-xs text-foreground-secondary mb-1">
          {t('diagnostic.mock.select_scenario')}
        </label>
        <select
          value={selectedId}
          onChange={handleSelectChange}
          className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {scenarios.map(([id, key]) => (
            <option key={id} value={id}>
              {t(`diagnostic.scenario.${key}.title`)}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-sm text-red-500 mb-3">
          {error}
        </div>
      )}

      {/* Diagnostic Message Preview */}
      {result && (
        <DiagnosticMessage
          scenario={result.scenario}
          severity={result.severity}
        />
      )}

      {/* Mock Mode Indicator */}
      <div className="mt-3 text-xs text-foreground-tertiary italic">
        {t('diagnostic.mock.enabled')}
      </div>
    </div>
  );
}
