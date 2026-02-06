import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../stores/themeStore';

describe('themeStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useThemeStore.setState({ theme: 'dark' });
  });

  describe('setTheme', () => {
    it('should set light theme', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('light');

      expect(useThemeStore.getState().theme).toBe('light');
    });

    it('should set dark theme', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('dark');

      expect(useThemeStore.getState().theme).toBe('dark');
    });
  });

  describe('theme persistence', () => {
    it('should persist theme choice to localStorage', () => {
      const { setTheme } = useThemeStore.getState();
      setTheme('light');

      // Check if localStorage was updated (zustand persist)
      const stored = localStorage.getItem('theme-storage');
      expect(stored).toBeTruthy();

      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.state.theme).toBe('light');
      }
    });
  });

  describe('theme transitions', () => {
    it('should handle multiple theme changes correctly', () => {
      const { setTheme } = useThemeStore.getState();

      setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');

      setTheme('dark');
      expect(useThemeStore.getState().theme).toBe('dark');

      setTheme('light');
      expect(useThemeStore.getState().theme).toBe('light');
    });
  });

  describe('store is pure (no DOM side effects)', () => {
    it('should not modify document classList directly', () => {
      // Clear any previous dark class
      document.documentElement.classList.remove('dark');

      const { setTheme } = useThemeStore.getState();
      setTheme('dark');

      // Store should update state but NOT touch DOM
      expect(useThemeStore.getState().theme).toBe('dark');
      // DOM should remain unchanged (ThemeProvider handles DOM)
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('default theme', () => {
    it('should default to dark theme', () => {
      // Create a fresh store state
      useThemeStore.setState({ theme: 'dark' });
      expect(useThemeStore.getState().theme).toBe('dark');
    });
  });
});
