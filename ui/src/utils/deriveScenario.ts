import type { DiagnosticScenario, DiagnosticSeverity, ConnectionType, InternetInfo } from '../api/tauri';

export interface DerivedScenario {
  scenario: DiagnosticScenario;
  severity: DiagnosticSeverity;
}

/** Optional detailed info for more precise scenario derivation. */
export interface ScenarioContext {
  connectionType?: ConnectionType;
  internetInfo?: Pick<InternetInfo, 'dns_ok' | 'http_ok'>;
}

/**
 * Derives a diagnostic scenario and severity from an array of node results.
 * Accepts any object with `id` and `status` fields (works with both
 * API NodeResult and UI-transformed NetworkNode).
 *
 * When `context` is provided, uses connection_type and dns_ok/http_ok
 * to distinguish wifi_disabled vs wifi_not_connected and
 * http_blocked vs dns_failure.
 */
export function deriveScenario(
  nodes: { id: string; status: string }[],
  context?: ScenarioContext,
): DerivedScenario | null {
  if (nodes.length === 0) return null;

  const allOk = nodes.every(n => n.status === 'ok');
  if (allOk) {
    return { scenario: 'all_good', severity: 'success' };
  }

  const networkNode = nodes.find(n => n.id === 'network');
  const routerNode = nodes.find(n => n.id === 'dns');
  const internetNode = nodes.find(n => n.id === 'internet');

  // Network down — distinguish disabled adapter from disconnected
  if (networkNode?.status === 'down') {
    if (context?.connectionType === 'Disabled') {
      return { scenario: 'wifi_disabled', severity: 'error' };
    }
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

  // Internet partial — distinguish dns_failure from http_blocked
  if (internetNode?.status === 'partial') {
    if (context?.internetInfo) {
      const { dns_ok, http_ok } = context.internetInfo;
      if (dns_ok && !http_ok) {
        return { scenario: 'http_blocked', severity: 'warning' };
      }
    }
    return { scenario: 'dns_failure', severity: 'warning' };
  }

  return { scenario: 'all_good', severity: 'success' };
}
