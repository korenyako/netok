import { getDnsProvider, getDnsServers, type DnsProvider } from '../api/tauri';
import { notifications } from '../utils/notifications';

type DnsStoreListener = () => void;

// DNS logging helper
const logDns = (message: string, data?: unknown) => {
  const timestamp = new Date().toISOString().slice(11, 23);
  if (data !== undefined) {
    console.log(`[DNS][UI][${timestamp}] ${message}`, data);
  } else {
    console.log(`[DNS][UI][${timestamp}] ${message}`);
  }
};

class DnsStore {
  private currentProvider: DnsProvider | null = null;
  private dnsServers: string[] = [];
  private isLoading: boolean = true;  // Start as true to show loading state initially
  private listeners: Set<DnsStoreListener> = new Set();
  private hasInitialized: boolean = false;
  private initializationStarted: boolean = false;  // Separate flag to prevent double-fetch

  async initialize() {
    logDns('initialize() called', {
      hasInitialized: this.hasInitialized,
      initializationStarted: this.initializationStarted,
      isLoading: this.isLoading
    });

    // Skip if already initialized OR if initialization already started (prevents double-fetch in React StrictMode)
    if (this.hasInitialized || this.initializationStarted) {
      logDns('Skipping init', {
        reason: this.hasInitialized ? 'already initialized' : 'initialization in progress'
      });
      return;
    }

    try {
      this.initializationStarted = true;
      this.isLoading = true;
      this.notifyListeners();

      logDns('Fetching DNS provider from backend...');
      const [provider, servers] = await Promise.all([
        getDnsProvider(),
        getDnsServers().catch(() => [] as string[]),
      ]);
      logDns('Received provider from backend:', provider);
      logDns('Received DNS servers:', servers);

      this.currentProvider = provider;
      this.dnsServers = servers;
      this.hasInitialized = true;
    } catch (err) {
      console.error('[DNS][UI] Failed to get DNS provider:', err);
      this.currentProvider = { type: 'Auto' };
      logDns('Fallback to Auto due to error');
      this.hasInitialized = true;  // Mark as initialized even on error to prevent retry loops

      // Show notification only if this was a refresh (not first load)
      // Note: we check hasInitialized BEFORE setting it above, so this only triggers on refresh
    } finally {
      this.isLoading = false;
      logDns('initialize() finished', { provider: this.currentProvider, isLoading: this.isLoading });
      this.notifyListeners();
    }
  }

  async refresh() {
    logDns('refresh() called');
    // Reset flags to allow re-fetch
    this.hasInitialized = false;
    this.initializationStarted = false;

    try {
      await this.initialize();
    } catch (err) {
      // Show notification on refresh failure
      notifications.error('Failed to get current DNS provider. Showing default.');
    }
  }

  getCurrentProvider(): DnsProvider | null {
    return this.currentProvider;
  }

  getDnsServers(): string[] {
    return this.dnsServers;
  }

  isLoadingProvider(): boolean {
    return this.isLoading;
  }

  setProvider(provider: DnsProvider) {
    logDns('setProvider() called', { oldProvider: this.currentProvider, newProvider: provider });
    this.currentProvider = provider;
    this.notifyListeners();
  }

  subscribe(listener: DnsStoreListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    logDns(`Notifying ${this.listeners.size} listener(s)`);
    this.listeners.forEach(listener => listener());
  }
}

export const dnsStore = new DnsStore();
