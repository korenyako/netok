import { useState, useEffect, useCallback, useRef } from 'react';
import { dnsStore } from './dnsStore';
import type { DnsProvider } from '../api/tauri';

// DNS logging helper
const logDns = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().slice(11, 23);
  if (data !== undefined) {
    console.log(`[DNS][UI][useDnsStore][${timestamp}] ${message}`, data);
  } else {
    console.log(`[DNS][UI][useDnsStore][${timestamp}] ${message}`);
  }
};

// Compare two DnsProvider objects for equality
function areProvidersEqual(a: DnsProvider | null, b: DnsProvider | null): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.type !== b.type) return false;

  // For Custom type, compare the IP addresses
  if (a.type === 'Custom' && b.type === 'Custom') {
    return a.primary === b.primary &&
           a.secondary === b.secondary &&
           a.primaryIpv6 === b.primaryIpv6 &&
           a.secondaryIpv6 === b.secondaryIpv6;
  }

  // For variant-based types, compare variants
  if ('variant' in a && 'variant' in b) {
    return a.variant === b.variant;
  }

  return true; // Same type, no variant (e.g., Google, Auto)
}

interface DnsStoreState {
  currentProvider: DnsProvider | null;
  dnsServers: string[];
  isLoading: boolean;
}

export function useDnsStore() {
  const mountIdRef = useRef(Math.random().toString(36).slice(2, 8));

  // Initialize state from store
  const [state, setState] = useState<DnsStoreState>(() => ({
    currentProvider: dnsStore.getCurrentProvider(),
    dnsServers: dnsStore.getDnsServers(),
    isLoading: dnsStore.isLoadingProvider()
  }));

  useEffect(() => {
    const mountId = mountIdRef.current;
    logDns(`Hook mounted (id: ${mountId})`);

    // Subscribe to store changes
    const unsubscribe = dnsStore.subscribe(() => {
      const newProvider = dnsStore.getCurrentProvider();
      const newServers = dnsStore.getDnsServers();
      const newIsLoading = dnsStore.isLoadingProvider();

      setState(prev => {
        // Only update if values actually changed
        const providerChanged = !areProvidersEqual(prev.currentProvider, newProvider);
        const serversChanged = prev.dnsServers.join(',') !== newServers.join(',');
        const loadingChanged = prev.isLoading !== newIsLoading;

        if (!providerChanged && !serversChanged && !loadingChanged) {
          return prev; // Return same reference to prevent re-render
        }

        logDns(`State updated (id: ${mountId})`, {
          providerChanged,
          serversChanged,
          loadingChanged,
          newProvider,
          newServers,
          newIsLoading
        });

        return { currentProvider: newProvider, dnsServers: newServers, isLoading: newIsLoading };
      });
    });

    // Initialize on first mount
    dnsStore.initialize();

    return () => {
      logDns(`Hook unmounted (id: ${mountId})`);
      unsubscribe();
    };
  }, []);

  // Memoize refresh to prevent new function on every render
  const refresh = useCallback(() => dnsStore.refresh(), []);

  return {
    currentProvider: state.currentProvider,
    dnsServers: state.dnsServers,
    isLoading: state.isLoading,
    refresh
  };
}
