import type { DiagnosticScenario, DiagnosticSeverity } from '../api/types';

export interface DerivedScenario {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
}

export function deriveScenario(
  nodes: { id: string; status: string }[]
): DerivedScenario | null {
  if (nodes.length === 0) return null;

  const allOk = nodes.every(n => n.status === 'ok');
  if (allOk) {
    return { scenario: 'all_good', severity: 'success' };
  }

  const networkNode = nodes.find(n => n.id === 'network');
  const routerNode = nodes.find(n => n.id === 'dns');
  const internetNode = nodes.find(n => n.id === 'internet');

  if (networkNode?.status === 'down') {
    return { scenario: 'wifi_not_connected', severity: 'error' };
  }

  if (networkNode?.status === 'partial') {
    return { scenario: 'weak_signal', severity: 'warning' };
  }

  if (routerNode?.status === 'down') {
    return { scenario: 'router_unreachable', severity: 'error' };
  }

  if (internetNode?.status === 'down') {
    return { scenario: 'no_internet', severity: 'error' };
  }

  if (internetNode?.status === 'partial') {
    return { scenario: 'dns_failure', severity: 'warning' };
  }

  return { scenario: 'all_good', severity: 'success' };
}
