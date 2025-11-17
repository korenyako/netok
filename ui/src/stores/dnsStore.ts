import { getDnsProvider, type DnsProvider } from '../api/tauri';

type DnsStoreListener = () => void;

class DnsStore {
  private currentProvider: DnsProvider | null = null;
  private isLoading: boolean = true;
  private listeners: Set<DnsStoreListener> = new Set();
  private hasInitialized: boolean = false;

  async initialize() {
    if (this.hasInitialized && !this.isLoading) {
      return;
    }

    try {
      this.isLoading = true;
      this.notifyListeners();

      const provider = await getDnsProvider();
      this.currentProvider = provider;
      this.hasInitialized = true;
    } catch (err) {
      console.error('Failed to get DNS provider:', err);
      this.currentProvider = { type: 'Auto' };
    } finally {
      this.isLoading = false;
      this.notifyListeners();
    }
  }

  async refresh() {
    this.hasInitialized = false;
    await this.initialize();
  }

  getCurrentProvider(): DnsProvider | null {
    return this.currentProvider;
  }

  isLoadingProvider(): boolean {
    return this.isLoading;
  }

  setProvider(provider: DnsProvider) {
    this.currentProvider = provider;
    this.notifyListeners();
  }

  subscribe(listener: DnsStoreListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const dnsStore = new DnsStore();
