import { describe, it, expect, beforeEach, vi } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import {
  runDiagnostics,
  getDnsProvider,
  setDns,
  getSettings,
  setSettings,
  type DiagnosticsSnapshot,
  type DnsProvider,
} from '../api/tauri';

// Mock @tauri-apps/api/core
vi.mock('@tauri-apps/api/core');

describe('Tauri API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('runDiagnostics', () => {
    it('should call invoke with run_diagnostics command', async () => {
      const mockSnapshot: DiagnosticsSnapshot = {
        at_utc: '2025-01-20T10:00:00Z',
        summary_key: 'summary.ok',
        nodes: [],
        computer: { hostname: 'test-pc', model: null, adapter: null, local_ip: null },
        network: {
          connection_type: 'Ethernet',
          ssid: null,
          rssi: null,
          signal_quality: null,
          channel: null,
          frequency: null,
        },
        router: { gateway_ip: null, gateway_mac: null, vendor: null, model: null },
        internet: {
          public_ip: null,
          isp: null,
          country: null,
          city: null,
          dns_ok: false,
          http_ok: false,
          latency_ms: null,
          speed_down_mbps: null,
          speed_up_mbps: null,
        },
      };

      vi.mocked(invoke).mockResolvedValue(mockSnapshot);

      const result = await runDiagnostics();

      expect(invoke).toHaveBeenCalledWith('run_diagnostics');
      expect(result).toEqual(mockSnapshot);
    });

    it('should throw error if invoke fails', async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Network error'));

      await expect(runDiagnostics()).rejects.toThrow('Network error');
    });
  });

  describe('getDnsProvider', () => {
    it('should call invoke with get_dns_provider command', async () => {
      const mockProvider: DnsProvider = { type: 'Cloudflare', variant: 'Standard' };
      vi.mocked(invoke).mockResolvedValue(mockProvider);

      const result = await getDnsProvider();

      expect(invoke).toHaveBeenCalledWith('get_dns_provider');
      expect(result).toEqual(mockProvider);
    });

    it('should handle all DNS provider types', async () => {
      const providerTypes: DnsProvider[] = [
        { type: 'Auto' },
        { type: 'Cloudflare', variant: 'Standard' },
        { type: 'Google' },
        { type: 'Quad9', variant: 'Recommended' },
      ];

      for (const provider of providerTypes) {
        vi.mocked(invoke).mockResolvedValue(provider);
        const result = await getDnsProvider();
        expect(result).toEqual(provider);
      }
    });
  });

  describe('setDns', () => {
    it('should call invoke with set_dns command and provider data', async () => {
      const provider: DnsProvider = { type: 'Cloudflare', variant: 'Standard' };
      vi.mocked(invoke).mockResolvedValue(undefined);

      await setDns(provider);

      expect(invoke).toHaveBeenCalledWith('set_dns', { provider });
    });

    it('should handle errors from backend', async () => {
      const provider: DnsProvider = { type: 'Cloudflare', variant: 'Standard' };
      vi.mocked(invoke).mockRejectedValue(new Error('Permission denied'));

      await expect(setDns(provider)).rejects.toThrow('Permission denied');
    });

    it('should successfully set different DNS providers', async () => {
      const providers: DnsProvider[] = [
        { type: 'Auto' },
        { type: 'Cloudflare', variant: 'Standard' },
        { type: 'Google' },
      ];

      vi.mocked(invoke).mockResolvedValue(undefined);

      for (const provider of providers) {
        await expect(setDns(provider)).resolves.not.toThrow();
        expect(invoke).toHaveBeenCalledWith('set_dns', { provider });
      }
    });
  });

  describe('getSettings', () => {
    it('should call invoke with get_settings command', async () => {
      const mockSettingsJson = JSON.stringify({
        language: 'en',
        test_timeout_ms: 3000,
        dns_servers: ['1.1.1.1', '8.8.8.8'],
      });

      vi.mocked(invoke).mockResolvedValue(mockSettingsJson);

      const result = await getSettings();

      expect(invoke).toHaveBeenCalledWith('get_settings');
      expect(result).toEqual(mockSettingsJson);
    });
  });

  describe('setSettings', () => {
    it('should call invoke with set_settings command and JSON string', async () => {
      const settingsJson = JSON.stringify({
        language: 'ru',
        test_timeout_ms: 3000,
        dns_servers: ['1.1.1.1'],
      });

      vi.mocked(invoke).mockResolvedValue(undefined);

      await setSettings(settingsJson);

      expect(invoke).toHaveBeenCalledWith('set_settings', { json: settingsJson });
    });

    it('should handle valid JSON settings', async () => {
      const settingsJson = JSON.stringify({
        language: 'en',
        test_timeout_ms: 3000,
        dns_servers: [],
      });

      vi.mocked(invoke).mockResolvedValue(undefined);

      await expect(setSettings(settingsJson)).resolves.not.toThrow();
    });

    it('should handle timeout values in JSON', async () => {
      const settingsJson = JSON.stringify({
        language: 'en',
        test_timeout_ms: 10000,
        dns_servers: [],
      });

      vi.mocked(invoke).mockResolvedValue(undefined);

      await setSettings(settingsJson);

      expect(invoke).toHaveBeenCalledWith('set_settings', {
        json: expect.stringContaining('10000'),
      });
    });

    it('should handle empty DNS servers array in JSON', async () => {
      const settingsJson = JSON.stringify({
        language: 'en',
        test_timeout_ms: 5000,
        dns_servers: [],
      });

      vi.mocked(invoke).mockResolvedValue(undefined);

      await setSettings(settingsJson);

      expect(invoke).toHaveBeenCalledWith('set_settings', { json: settingsJson });
    });
  });

  describe('error handling', () => {
    it('should propagate Tauri invoke errors correctly', async () => {
      const tauriError = new Error('Tauri IPC error');
      vi.mocked(invoke).mockRejectedValue(tauriError);

      await expect(runDiagnostics()).rejects.toThrow('Tauri IPC error');
      await expect(setDns({ type: 'Auto' })).rejects.toThrow('Tauri IPC error');
    });

    it('should handle network timeout errors', async () => {
      vi.mocked(invoke).mockRejectedValue(new Error('Request timeout'));

      await expect(runDiagnostics()).rejects.toThrow('Request timeout');
    });
  });
});
