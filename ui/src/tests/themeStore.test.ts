import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '../stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  describe('setTheme', () => {
    it('should set light theme and remove dark class', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('light');

      expect(useThemeStore.getState().theme).toBe('light');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should set dark theme and add dark class', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('dark');

      expect(useThemeStore.getState().theme).toBe('dark');
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should set system theme and resolve based on media query', () => {
      const { setTheme } = useThemeStore.getState();

      // matchMedia is mocked in setup.ts to return matches: false (light)
      setTheme('system');

      expect(useThemeStore.getState().theme).toBe('system');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');
    });
  });

  describe('updateResolvedTheme', () => {
    it('should update resolved theme when system preference changes', () => {
      const { setTheme, updateResolvedTheme } = useThemeStore.getState();

      setTheme('system');
      expect(useThemeStore.getState().resolvedTheme).toBe('light');

      // Simulate system preference change to dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      updateResolvedTheme();
      expect(useThemeStore.getState().resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should not change resolved theme if user has explicit preference', () => {
      const { setTheme, updateResolvedTheme } = useThemeStore.getState();

      setTheme('dark');
      const resolvedBefore = useThemeStore.getState().resolvedTheme;

      updateResolvedTheme();
      expect(useThemeStore.getState().resolvedTheme).toBe(resolvedBefore);
    });
  });

  describe('theme persistence', () => {
    it('should persist theme choice to localStorage', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('dark');

      // Check if localStorage was updated (zustand persist)
      const stored = localStorage.getItem('theme-storage');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.theme).toBe('dark');
      }
    });
  });

  describe('theme transitions', () => {
    it('should handle multiple theme changes correctly', () => {
      const { setTheme } = useThemeStore.getState();

      // Clear any previous dark class
      document.documentElement.classList.remove('dark');

      setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      setTheme('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });
});
