import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { formatUpdatedAt } from '../utils/formatUpdatedAt';

describe('formatUpdatedAt', () => {
  beforeEach(() => {
    // Set a fixed date for consistent testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-20T15:30:45'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('same day formatting', () => {
    it('should return only time for same day in English', () => {
      const date = new Date('2025-01-20T10:15:30');
      const result = formatUpdatedAt(date, 'en');

      // Should contain time components
      expect(result).toMatch(/10.*15.*30/);
      // Should not contain date
      expect(result).not.toMatch(/2025/);
    });

    it('should return only time for same day in Russian', () => {
      const date = new Date('2025-01-20T10:15:30');
      const result = formatUpdatedAt(date, 'ru');

      // Should contain time components
      expect(result).toMatch(/10.*15.*30/);
      // Should not contain date
      expect(result).not.toMatch(/2025/);
    });
  });

  describe('different day formatting', () => {
    it('should return date and time for different day in English', () => {
      const date = new Date('2025-01-15T10:15:30');
      const result = formatUpdatedAt(date, 'en');

      // Should contain both date and time
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{2}/); // Date format
      expect(result).toMatch(/10.*15.*30/); // Time
    });

    it('should return date and time for different day in Russian', () => {
      const date = new Date('2025-01-15T10:15:30');
      const result = formatUpdatedAt(date, 'ru');

      // Should contain both date and time
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{2}/); // Date format (Russian uses dots)
      expect(result).toMatch(/10.*15.*30/); // Time
    });
  });

  describe('edge cases', () => {
    it('should handle midnight correctly', () => {
      const date = new Date('2025-01-20T00:00:00');
      const result = formatUpdatedAt(date, 'en');

      // Should contain time (may be formatted as 12 AM or 00:00:00 depending on locale)
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle end of day correctly', () => {
      const date = new Date('2025-01-20T23:59:59');
      const result = formatUpdatedAt(date, 'en');

      // Should contain time
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty string for null/undefined input', () => {
      expect(formatUpdatedAt(null as any, 'en')).toBe('');
      expect(formatUpdatedAt(undefined as any, 'en')).toBe('');
    });

    it('should handle year boundary correctly', () => {
      vi.setSystemTime(new Date('2025-01-01T10:00:00'));
      const date = new Date('2024-12-31T10:00:00');
      const result = formatUpdatedAt(date, 'en');

      // Should include date since it's a different day
      expect(result).toMatch(/31/);
      expect(result).toMatch(/12/);
    });
  });

  describe('locale differences', () => {
    it('should format date differently for en vs ru', () => {
      const date = new Date('2025-01-15T10:15:30');
      const enResult = formatUpdatedAt(date, 'en');
      const ruResult = formatUpdatedAt(date, 'ru');

      // Results should be different due to locale formatting
      expect(enResult).not.toBe(ruResult);

      // English typically uses slashes
      expect(enResult).toMatch(/\//);
      // Russian typically uses dots
      expect(ruResult).toMatch(/\./);
    });
  });

  describe('time formatting', () => {
    it('should use 2-digit format for all time components', () => {
      const date = new Date('2025-01-20T09:05:03');
      const result = formatUpdatedAt(date, 'en');

      // All components should be 2 digits
      expect(result).toMatch(/09/);
      expect(result).toMatch(/05/);
      expect(result).toMatch(/03/);
    });

    it('should handle single digit hours/minutes/seconds', () => {
      const date = new Date('2025-01-20T01:02:03');
      const result = formatUpdatedAt(date, 'en');

      // Should pad with zeros
      expect(result).toMatch(/01.*02.*03/);
    });
  });
});
