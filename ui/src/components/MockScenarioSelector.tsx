import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
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

  if (isLoading) {
    return (
      <div className={cn('p-4', className)}>
        <div className="text-muted-foreground text-sm">
          {t('diagnostic.mock.title')}...
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
          <h3 className="text-sm font-medium text-foreground">
            {t('diagnostic.mock.title')}
          </h3>
        </div>

        {/* Scenario Selector */}
        <div className="mb-4">
          <label className="block text-xs text-muted-foreground mb-1">
            {t('diagnostic.mock.select_scenario')}
          </label>
          <Select value={String(selectedId)} onValueChange={(value) => setSelectedId(Number(value))}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('diagnostic.mock.select_scenario')} />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map(([id, key]) => (
                <SelectItem key={id} value={String(id)}>
                  {t(`diagnostic.scenario.${key}.title`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-sm text-destructive mb-3">
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
        <div className="mt-3 text-xs text-muted-foreground italic">
          {t('diagnostic.mock.enabled')}
        </div>
      </CardContent>
    </Card>
  );
}
