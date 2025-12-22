/**
 * Unit Tests for utils.ts
 * Tests utility functions for phase calculation and date handling
 */

import { cn, getCurrentPhase, getDaysElapsed } from '@/lib/utils';

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
  });

  it('should handle false/undefined values', () => {
    expect(cn('base', false, undefined, null)).toBe('base');
  });

  it('should merge tailwind classes correctly', () => {
    // Later classes should override earlier ones
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8');
  });

  it('should handle array of classes', () => {
    expect(cn(['px-4', 'py-2'])).toBe('px-4 py-2');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
  });
});

describe('getCurrentPhase', () => {
  describe('Phase boundaries', () => {
    it('should return Foundation for days 1-30', () => {
      expect(getCurrentPhase(1)).toBe('Foundation');
      expect(getCurrentPhase(15)).toBe('Foundation');
      expect(getCurrentPhase(30)).toBe('Foundation');
    });

    it('should return Intensity for days 31-60', () => {
      expect(getCurrentPhase(31)).toBe('Intensity');
      expect(getCurrentPhase(45)).toBe('Intensity');
      expect(getCurrentPhase(60)).toBe('Intensity');
    });

    it('should return Mastery for days 61+', () => {
      expect(getCurrentPhase(61)).toBe('Mastery');
      expect(getCurrentPhase(75)).toBe('Mastery');
      expect(getCurrentPhase(90)).toBe('Mastery');
      expect(getCurrentPhase(100)).toBe('Mastery');
    });
  });

  describe('Boundary transitions', () => {
    it('should transition from Foundation to Intensity at day 31', () => {
      expect(getCurrentPhase(30)).toBe('Foundation');
      expect(getCurrentPhase(31)).toBe('Intensity');
    });

    it('should transition from Intensity to Mastery at day 61', () => {
      expect(getCurrentPhase(60)).toBe('Intensity');
      expect(getCurrentPhase(61)).toBe('Mastery');
    });
  });

  describe('Edge cases', () => {
    it('should handle day 0 or negative (treat as Foundation)', () => {
      expect(getCurrentPhase(0)).toBe('Foundation');
      expect(getCurrentPhase(-1)).toBe('Foundation');
    });

    it('should handle very large day numbers', () => {
      expect(getCurrentPhase(365)).toBe('Mastery');
      expect(getCurrentPhase(1000)).toBe('Mastery');
    });
  });
});

describe('getDaysElapsed', () => {
  describe('Date string input', () => {
    it('should calculate days from ISO date string', () => {
      // Mock the current date
      const now = new Date('2024-01-15T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const result = getDaysElapsed('2024-01-10');

      // From Jan 10 to Jan 15 = 5 days + 1 (inclusive) = 6
      expect(result).toBe(6);

      jest.useRealTimers();
    });

    it('should return 1 for today', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const result = getDaysElapsed('2024-01-15');

      // Same day should return 1 (minimum)
      expect(result).toBe(1);

      jest.useRealTimers();
    });
  });

  describe('Date object input', () => {
    it('should calculate days from Date object', () => {
      const now = new Date('2024-01-20T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const result = getDaysElapsed(startDate);

      // From Jan 1 to Jan 20 = 19 days + 1 = 20
      expect(result).toBe(20);

      jest.useRealTimers();
    });
  });

  describe('Edge cases', () => {
    it('should return minimum of 1 for future dates', () => {
      const now = new Date('2024-01-10T12:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const result = getDaysElapsed('2024-01-15');

      // Future date should return at least 1
      expect(result).toBe(1);

      jest.useRealTimers();
    });

    it('should handle date at midnight', () => {
      const now = new Date('2024-01-10T00:00:00Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const result = getDaysElapsed('2024-01-05T00:00:00Z');

      expect(result).toBe(6);

      jest.useRealTimers();
    });

    it('should handle date at end of day', () => {
      const now = new Date('2024-01-10T23:59:59Z');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      const result = getDaysElapsed('2024-01-05T00:00:00Z');

      expect(result).toBe(6);

      jest.useRealTimers();
    });
  });
});

