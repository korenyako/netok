import { useState, useEffect } from 'react';
import { pingDnsServer } from '../api/tauri';

/**
 * Live ping measurement with pulsing indicator support.
 *
 * - Discards the first "cold" measurement, shows from second onward.
 * - Re-pings every 10 seconds while enabled.
 * - Returns `undefined` while loading, `null` if unreachable, or latency in ms.
 */
export function useLivePing(
  targetIp: string | null,
  enabled: boolean,
): number | null | undefined {
  const [ping, setPing] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled || !targetIp) {
      setPing(undefined);
      return;
    }

    let cancelled = false;
    let intervalId: number | undefined;

    const runVisiblePing = () => {
      if (cancelled) return;
      setPing(undefined);
      pingDnsServer(targetIp)
        .then((ms) => { if (!cancelled) setPing(ms); })
        .catch(() => { if (!cancelled) setPing(null); });
    };

    // Cold ping (discarded), then start visible pings
    pingDnsServer(targetIp)
      .catch(() => {})
      .finally(() => {
        if (cancelled) return;
        runVisiblePing();
        intervalId = window.setInterval(runVisiblePing, 10_000);
      });

    return () => {
      cancelled = true;
      if (intervalId !== undefined) clearInterval(intervalId);
    };
  }, [enabled, targetIp]);

  return ping;
}
