import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dnsStore } from '../stores/dnsStore';
import * as tauriApi from '../api/tauri';

// Mock the tauri API
vi.mock('../api/tauri');

// Mock notifications to avoid errors
vi.mock('../utils/notifications', () => ({
  notifications: {
    error: vi.fn(),
  },
}));

describe('dnsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset store state
    dnsStore['hasInitialized'] = false;
    dnsStore['initializationStarted'] = false;
    dnsStore['currentProvider'] = null;
    dnsStore['isLoading'] = true;
    dnsStore['retryCount'] = 0;
    // Mock getDnsServers to avoid unhandled rejection in Promise.all
    vi.mocked(tauriApi.getDnsServers).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialize', () => {
    it('should load DNS provider on initialization', async () => {
      const mockProvider = { type: 'Google' as const };
      vi.mocked(tauriApi.getDnsProvider).mockResolvedValue(mockProvider);

      await dnsStore.initialize();

      expect(dnsStore.getCurrentProvider()).toEqual(mockProvider);
      expect(dnsStore.isLoadingProvider()).toBe(false);
    });

    it('should set loading state during initialization', async () => {
      let resolveProvider!: (value: tauriApi.DnsProvider) => void;
      vi.mocked(tauriApi.getDnsProvider).mockImplementation(
        () => new Promise((resolve) => { resolveProvider = resolve; })
      );

      const initPromise = dnsStore.initialize();
      expect(dnsStore.isLoadingProvider()).toBe(true);

      resolveProvider({ type: 'Google' });
      await initPromise;
      expect(dnsStore.isLoadingProvider()).toBe(false);
    });

    it('should retry then fallback to Auto on persistent error', async () => {
      vi.mocked(tauriApi.getDnsProvider).mockRejectedValue(
        new Error('Failed to get DNS')
      );

      // First call — triggers retry timer
      await dnsStore.initialize();
      expect(dnsStore.isLoadingProvider()).toBe(true); // still loading during retry

      // Advance through retry 1
      await vi.advanceTimersByTimeAsync(2000);
      // Advance through retry 2
      await vi.advanceTimersByTimeAsync(2000);

      expect(dnsStore.getCurrentProvider()).toEqual({ type: 'Auto' });
      expect(dnsStore.isLoadingProvider()).toBe(false);
    });

    it('should not reinitialize if already initialized', async () => {
      const mockProvider = { type: 'Google' as const };
      vi.mocked(tauriApi.getDnsProvider).mockResolvedValue(mockProvider);

      await dnsStore.initialize();
      const firstCall = vi.mocked(tauriApi.getDnsProvider).mock.calls.length;

      await dnsStore.initialize();
      const secondCall = vi.mocked(tauriApi.getDnsProvider).mock.calls.length;

      expect(secondCall).toBe(firstCall);
    });
  });

  describe('refresh', () => {
    it('should reinitialize the store', async () => {
      const firstProvider = { type: 'Google' as const };
      const secondProvider = { type: 'Auto' as const };

      vi.mocked(tauriApi.getDnsProvider).mockResolvedValueOnce(firstProvider);
      await dnsStore.initialize();

      vi.mocked(tauriApi.getDnsProvider).mockResolvedValueOnce(secondProvider);
      await dnsStore.refresh();

      expect(dnsStore.getCurrentProvider()).toEqual(secondProvider);
    });
  });

  describe('setProvider', () => {
    it('should update current provider', () => {
      const provider = { type: 'Google' as const };

      dnsStore.setProvider(provider);

      expect(dnsStore.getCurrentProvider()).toEqual(provider);
    });

    it('should notify listeners when provider changes', () => {
      const listener = vi.fn();
      dnsStore.subscribe(listener);

      const provider = { type: 'Google' as const };
      dnsStore.setProvider(provider);

      expect(listener).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    it('should add listener and return unsubscribe function', () => {
      const listener = vi.fn();

      const unsubscribe = dnsStore.subscribe(listener);
      dnsStore.setProvider({ type: 'Google' });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      dnsStore.setProvider({ type: 'Auto' });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support multiple subscribers', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      dnsStore.subscribe(listener1);
      dnsStore.subscribe(listener2);

      dnsStore.setProvider({ type: 'Google' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
