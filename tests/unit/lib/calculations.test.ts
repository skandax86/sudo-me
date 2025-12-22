/**
 * Unit Tests for calculations.ts
 * Tests core business logic for discipline scoring, investment allocation, and budget health
 */

import {
  calculateDisciplineScore,
  allocateInvestment,
  checkBudgetHealth,
  DisciplineInput,
} from '@/lib/calculations';
import { DISCIPLINE_WEIGHTS } from '@/lib/constants';

describe('calculateDisciplineScore', () => {
  describe('Arrange-Act-Assert pattern', () => {
    it('should return 100 when all habits are completed', () => {
      // Arrange
      const input: DisciplineInput = {
        wokeUp6am: true,
        coldShower: true,
        noPhoneFirstHour: true,
        meditated: true,
        plannedTomorrow: true,
      };

      // Act
      const result = calculateDisciplineScore(input);

      // Assert
      expect(result).toBe(100);
    });

    it('should return 0 when no habits are completed', () => {
      // Arrange
      const input: DisciplineInput = {
        wokeUp6am: false,
        coldShower: false,
        noPhoneFirstHour: false,
        meditated: false,
        plannedTomorrow: false,
      };

      // Act
      const result = calculateDisciplineScore(input);

      // Assert
      expect(result).toBe(0);
    });

    it('should return correct score when only wake up is completed (40%)', () => {
      // Arrange
      const input: DisciplineInput = {
        wokeUp6am: true,
        coldShower: false,
        noPhoneFirstHour: false,
        meditated: false,
        plannedTomorrow: false,
      };

      // Act
      const result = calculateDisciplineScore(input);

      // Assert - wakeUp weight is 0.40
      expect(result).toBe(Math.round(100 * DISCIPLINE_WEIGHTS.wakeUpTime));
    });

    it('should return correct score when only no phone first hour is completed (25%)', () => {
      // Arrange
      const input: DisciplineInput = {
        wokeUp6am: false,
        coldShower: false,
        noPhoneFirstHour: true,
        meditated: false,
        plannedTomorrow: false,
      };

      // Act
      const result = calculateDisciplineScore(input);

      // Assert
      expect(result).toBe(Math.round(100 * DISCIPLINE_WEIGHTS.noPhoneFirstHour));
    });

    it('should return correct score for partial completion', () => {
      // Arrange - wake up (40%) + cold shower (15%) = 55%
      const input: DisciplineInput = {
        wokeUp6am: true,
        coldShower: true,
        noPhoneFirstHour: false,
        meditated: false,
        plannedTomorrow: false,
      };

      // Act
      const result = calculateDisciplineScore(input);

      // Assert
      const expected = Math.round(
        100 * DISCIPLINE_WEIGHTS.wakeUpTime +
        100 * DISCIPLINE_WEIGHTS.coldShower
      );
      expect(result).toBe(expected);
    });
  });

  describe('Edge cases', () => {
    it('should handle mixed true/false values correctly', () => {
      const input: DisciplineInput = {
        wokeUp6am: true,
        coldShower: false,
        noPhoneFirstHour: true,
        meditated: false,
        plannedTomorrow: true,
      };

      const result = calculateDisciplineScore(input);

      // 40% + 25% + 5% = 70%
      const expected = Math.round(
        100 * DISCIPLINE_WEIGHTS.wakeUpTime +
        100 * DISCIPLINE_WEIGHTS.noPhoneFirstHour +
        100 * DISCIPLINE_WEIGHTS.planTomorrowDone
      );
      expect(result).toBe(expected);
    });

    it('should return rounded integer value', () => {
      const input: DisciplineInput = {
        wokeUp6am: true,
        coldShower: false,
        noPhoneFirstHour: false,
        meditated: false,
        plannedTomorrow: false,
      };

      const result = calculateDisciplineScore(input);

      expect(Number.isInteger(result)).toBe(true);
    });
  });
});

describe('allocateInvestment', () => {
  describe('Standard allocation (30/40/30)', () => {
    it('should allocate correctly for 10000', () => {
      // Arrange
      const amount = 10000;

      // Act
      const result = allocateInvestment(amount);

      // Assert
      expect(result).toEqual({
        lowRisk: 3000,
        midRisk: 4000,
        highRisk: 3000,
      });
    });

    it('should allocate correctly for 100000', () => {
      const result = allocateInvestment(100000);

      expect(result.lowRisk).toBe(30000);
      expect(result.midRisk).toBe(40000);
      expect(result.highRisk).toBe(30000);
    });

    it('should sum to original amount', () => {
      const amount = 50000;
      const result = allocateInvestment(amount);

      expect(result.lowRisk + result.midRisk + result.highRisk).toBe(amount);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero amount', () => {
      const result = allocateInvestment(0);

      expect(result).toEqual({
        lowRisk: 0,
        midRisk: 0,
        highRisk: 0,
      });
    });

    it('should round to nearest integer', () => {
      const result = allocateInvestment(100);

      expect(Number.isInteger(result.lowRisk)).toBe(true);
      expect(Number.isInteger(result.midRisk)).toBe(true);
      expect(Number.isInteger(result.highRisk)).toBe(true);
    });

    it('should handle small amounts that cause rounding', () => {
      const result = allocateInvestment(7);

      // 30% of 7 = 2.1 → 2
      // 40% of 7 = 2.8 → 3
      // 30% of 7 = 2.1 → 2
      expect(result.lowRisk).toBe(2);
      expect(result.midRisk).toBe(3);
      expect(result.highRisk).toBe(2);
    });

    it('should handle large amounts', () => {
      const amount = 10000000; // 10 million
      const result = allocateInvestment(amount);

      expect(result.lowRisk).toBe(3000000);
      expect(result.midRisk).toBe(4000000);
      expect(result.highRisk).toBe(3000000);
    });
  });
});

describe('checkBudgetHealth', () => {
  describe('Health status thresholds', () => {
    it('should return HEALTHY when under 75%', () => {
      expect(checkBudgetHealth(7000, 10000)).toBe('HEALTHY');
      expect(checkBudgetHealth(0, 10000)).toBe('HEALTHY');
      expect(checkBudgetHealth(5000, 10000)).toBe('HEALTHY');
    });

    it('should return CAUTION when between 75% and 90%', () => {
      expect(checkBudgetHealth(7500, 10000)).toBe('CAUTION');
      expect(checkBudgetHealth(8000, 10000)).toBe('CAUTION');
      expect(checkBudgetHealth(8999, 10000)).toBe('CAUTION');
    });

    it('should return WARNING when between 90% and 100%', () => {
      expect(checkBudgetHealth(9000, 10000)).toBe('WARNING');
      expect(checkBudgetHealth(9500, 10000)).toBe('WARNING');
      expect(checkBudgetHealth(9999, 10000)).toBe('WARNING');
    });

    it('should return BREACH when at or over 100%', () => {
      expect(checkBudgetHealth(10000, 10000)).toBe('BREACH');
      expect(checkBudgetHealth(11000, 10000)).toBe('BREACH');
      expect(checkBudgetHealth(15000, 10000)).toBe('BREACH');
    });
  });

  describe('Boundary conditions', () => {
    it('should return CAUTION at exactly 75%', () => {
      expect(checkBudgetHealth(75, 100)).toBe('CAUTION');
    });

    it('should return WARNING at exactly 90%', () => {
      expect(checkBudgetHealth(90, 100)).toBe('WARNING');
    });

    it('should return BREACH at exactly 100%', () => {
      expect(checkBudgetHealth(100, 100)).toBe('BREACH');
    });

    it('should return HEALTHY just below 75%', () => {
      expect(checkBudgetHealth(74.99, 100)).toBe('HEALTHY');
    });
  });

  describe('Edge cases', () => {
    it('should handle decimal values', () => {
      expect(checkBudgetHealth(74.5, 100)).toBe('HEALTHY');
      expect(checkBudgetHealth(89.9, 100)).toBe('CAUTION');
    });

    it('should handle small budget limits', () => {
      expect(checkBudgetHealth(8, 10)).toBe('CAUTION');
      expect(checkBudgetHealth(9, 10)).toBe('WARNING');
    });

    it('should handle large budget limits', () => {
      expect(checkBudgetHealth(900000, 1000000)).toBe('WARNING');
    });
  });
});

