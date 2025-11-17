import { useState, useEffect } from 'react';
import { dnsStore } from './dnsStore';

export function useDnsStore() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    // Initialize on first mount
    dnsStore.initialize();

    const unsubscribe = dnsStore.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    currentProvider: dnsStore.getCurrentProvider(),
    isLoading: dnsStore.isLoadingProvider(),
    refresh: () => dnsStore.refresh(),
  };
}
