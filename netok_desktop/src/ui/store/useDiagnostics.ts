import { create } from 'zustand';

export type OverallStatus = 'ok' | 'partial' | 'down' | 'checking';

export interface NetworkInfo {
  type: 'wifi' | 'cable' | 'usb_modem' | 'bt' | 'mobile';
  ssid?: string;
  signal?: {
    level: 'excellent' | 'good' | 'fair' | 'weak' | 'unknown';
    dbm?: number;
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
  downMbps: number;
  upMbps: number;
}

export interface DiagnosticsData {
  overall: OverallStatus;
  computer: ComputerInfo;
  network: NetworkInfo;
  router: RouterInfo;
  internet: InternetInfo;
  speed?: SpeedInfo;
  vpnDetected: boolean;
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
    name: 'DESKTOP-ABC123',
    model: 'Dell OptiPlex 7090',
    adapter: 'Intel Wi-Fi 6 AX201',
    localIp: '192.168.1.105'
  },
  network: {
    type: 'wifi',
    ssid: 'HomeNetwork_5G',
    signal: {
      level: 'excellent',
      dbm: -45
    }
  },
  router: {
    model: 'TP-Link Archer AX73',
    brand: 'TP-Link',
    localIp: '192.168.1.1'
  },
  internet: {
    provider: 'Rostelecom',
    publicIp: '95.84.123.45',
    country: 'Russia',
    city: 'Moscow'
  },
  speed: {
    downMbps: 95,
    upMbps: 45
  },
  vpnDetected: false,
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
          downMbps: Math.floor(Math.random() * 50) + 20,
          upMbps: Math.floor(Math.random() * 20) + 10
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
