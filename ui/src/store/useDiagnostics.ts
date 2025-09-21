import { create } from 'zustand';
import i18next from 'i18next';

export type OverallStatus = 'ok' | 'partial' | 'down' | 'checking';

export interface NetworkInfo {
  type: 'wifi' | 'cable' | 'usb_modem' | 'bt' | 'mobile';
  signal?: {
    level: 'excellent' | 'good' | 'fair' | 'weak';
    dbm: number;
  };
  link?: boolean;
}

export interface ComputerInfo {
  hostname?: string;
  model?: string;
  adapter?: string;
  local_ip?: string;
}

export interface RouterInfo {
  model?: string;
  brand?: string;
  localIp: string;
}

export interface InternetInfo {
  provider?: string;
  publicIp: string;
  country?: string;
  city?: string;
}

export interface SpeedInfo {
  down: number;
  up: number;
}

export interface DiagnosticsData {
  overall: OverallStatus;
  computer: ComputerInfo | null;
  network: NetworkInfo;
  router: RouterInfo;
  internet: InternetInfo;
  speed?: SpeedInfo;
  vpnDetected: boolean;
  geoConsent: boolean;
  updatedAt: number;
}

// Alias for clarity
export type DiagnosticsSnapshot = DiagnosticsData;

interface DiagnosticsStore {
  snapshot: DiagnosticsSnapshot | null;
  lastUpdated: Date | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// Parse backend diagnostics data
const parseBackendData = (backendData: any): DiagnosticsData => {
  return {
    overall: 'ok', // TODO: Parse from backend
    computer: backendData.computer || null,
    network: {
      type: 'wifi', // TODO: Parse from backend
      signal: {
        level: 'excellent',
        dbm: -45
      }
    },
    router: {
      model: i18next.t('mock_data.router_model'),
      brand: i18next.t('mock_data.router_brand'),
      localIp: '192.168.1.1'
    },
    internet: {
      provider: i18next.t('mock_data.provider_name'),
      publicIp: '95.84.123.45',
      country: i18next.t('mock_data.country_name'),
      city: i18next.t('mock_data.city_name')
    },
    speed: {
      down: 95,
      up: 45
    },
    vpnDetected: false,
    geoConsent: true,
    updatedAt: Date.now()
  };
};

// FAKE_* values are placeholders for development until real system integration is implemented
const createMockData = (): DiagnosticsData => ({
  overall: 'ok',
  computer: {
    hostname: 'FAKE_HOSTNAME',
    model: 'FAKE_MODEL',
    adapter: 'FAKE_ADAPTER',
    local_ip: '0.0.0.0 (FAKE)'
  },
  network: {
    type: 'FAKE_NETWORK_TYPE' as any,
    signal: {
      level: 'FAKE_SIGNAL' as any,
      dbm: -999
    }
  },
  router: {
    model: 'FAKE_ROUTER_MODEL',
    brand: 'FAKE_ROUTER_BRAND',
    localIp: '0.0.0.1 (FAKE)'
  },
  internet: {
    provider: 'FAKE_OPERATOR',
    publicIp: '0.0.0.0 (FAKE_IP)',
    country: 'FAKE_LOCATION',
    city: 'FAKE_LOCATION'
  },
  speed: {
    down: 999,
    up: 999
  },
  vpnDetected: false,
  geoConsent: true, // Default to true for demo, but can be changed
  updatedAt: Date.now()
});

export const useDiagnostics = create<DiagnosticsStore>((set, get) => ({
  snapshot: null,
  lastUpdated: null,
  isLoading: false,

  refresh: async () => {
    console.log('[refresh] start');
    
    if (get().isLoading) {
      console.log('[refresh] already loading, skipping');
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // TODO: Replace with actual Tauri invoke call
      // const data = await invoke<DiagnosticsSnapshot>("run_diagnostics");
      
      // Simulate network delay and data generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, use mock data but with real computer info structure
      // In the future, this will be replaced with actual backend data
      const mockData = createMockData();
      
      // Add some randomness to make it feel realistic
      if (Math.random() > 0.8) {
        mockData.overall = 'partial';
        mockData.speed = {
          down: Math.floor(Math.random() * 50) + 20,
          up: Math.floor(Math.random() * 20) + 10
        };
      }
      
      set({
        snapshot: mockData,
        lastUpdated: new Date(),
      });
      
      console.log('[refresh] success');
    } catch (e) {
      console.error('[refresh] failed', e);
      // keep previous snapshot and lastUpdated on error
    } finally {
      set({ isLoading: false });
      console.log('[refresh] end');
    }
  },
}));
