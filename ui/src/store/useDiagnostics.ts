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
  name: string;
  model: string;
  adapter: string;
  localIp: string;
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
  computer: ComputerInfo;
  network: NetworkInfo;
  router: RouterInfo;
  internet: InternetInfo;
  speed?: SpeedInfo;
  vpnDetected: boolean;
  geoConsent: boolean;
  updatedAt: number;
}

interface DiagnosticsStore {
  data: DiagnosticsData | null;
  loading: boolean;
  error: string | null;
  updatedAt: number;
  refresh: () => Promise<void>;
  clearError: () => void;
}

// Realistic placeholder data
const createMockData = (): DiagnosticsData => ({
  overall: 'ok',
  computer: {
    name: i18next.t('mock_data.computer_name'),
    model: i18next.t('mock_data.computer_model'),
    adapter: i18next.t('mock_data.adapter_name'),
    localIp: '192.168.1.105'
  },
  network: {
    type: 'wifi',
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
  geoConsent: true, // Default to true for demo, but can be changed
  updatedAt: Date.now()
});

export const useDiagnostics = create<DiagnosticsStore>((set) => ({
  data: null,
  loading: false,
  error: null,
  updatedAt: 0,

  refresh: async () => {
    set({ loading: true, error: null });
    
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate new mock data with slight variations
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
        data: mockData, 
        loading: false,
        updatedAt: Date.now()
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));
