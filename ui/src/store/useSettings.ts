import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Settings {
  geoEnabled: boolean;
  dnsMode: 'auto' | 'cloudflare' | 'google' | 'custom';
  customDns: string;
  rememberWindowSize: boolean;
}

export const useSettings = create<Settings & {
  setGeoEnabled: (enabled: boolean) => void;
  setDnsMode: (mode: Settings['dnsMode']) => void;
  setCustomDns: (dns: string) => void;
  setRememberWindowSize: (remember: boolean) => void;
}>()(
  persist(
    (set) => ({
      geoEnabled: true,
      dnsMode: 'auto',
      customDns: '',
      rememberWindowSize: true,
      setGeoEnabled: (enabled: boolean) => set({ geoEnabled: enabled }),
      setDnsMode: (mode: Settings['dnsMode']) => set({ dnsMode: mode }),
      setCustomDns: (dns: string) => set({ customDns: dns }),
      setRememberWindowSize: (remember: boolean) => set({ rememberWindowSize: remember }),
    }),
    {
      name: 'netok-settings',
    }
  )
);
