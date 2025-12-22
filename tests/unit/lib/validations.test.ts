/**
 * Unit Tests for validations.ts
 * Tests Zod validation schemas for data integrity
 */

import {
  UserProfileSchema,
  DailyLogSchema,
  TransactionSchema,
  GoalSchema,
} from '@/lib/validations';

describe('UserProfileSchema', () => {
  describe('Valid inputs', () => {
    it('should validate a complete profile', () => {
      const validProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
        startDate: new Date('2024-01-01'),
        targetWeight: 75,
        currentSalary: 100000,
        targetSalary: 2000000,
      };

      const result = UserProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should validate a profile with only required fields', () => {
      const minimalProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: 'J',
        startDate: new Date('2024-01-01'),
      };

      const result = UserProfileSchema.safeParse(minimalProfile);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject empty uid', () => {
      const invalidProfile = {
        uid: '',
        email: 'test@example.com',
        name: 'John',
        startDate: new Date(),
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidProfile = {
        uid: 'user-123',
        email: 'not-an-email',
        name: 'John',
        startDate: new Date(),
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject empty name', () => {
      const invalidProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: '',
        startDate: new Date(),
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject name over 100 characters', () => {
      const invalidProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: 'A'.repeat(101),
        startDate: new Date(),
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject negative target weight', () => {
      const invalidProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: 'John',
        startDate: new Date(),
        targetWeight: -10,
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject target salary below minimum', () => {
      const invalidProfile = {
        uid: 'user-123',
        email: 'test@example.com',
        name: 'John',
        startDate: new Date(),
        targetSalary: 1000000, // Below 2000000 minimum
      };

      const result = UserProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });
});

describe('DailyLogSchema', () => {
  describe('Valid inputs', () => {
    it('should validate a complete daily log', () => {
      const validLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'Gym' as const,
          waterIntakeOz: 100,
          sleepHours: 7.5,
        },
        learning: {
          leetCodeSolved: 3,
          pagesRead: 20,
          studyHours: 2,
        },
        journal: {
          impulseControlRating: 4,
          notes: 'Great day!',
        },
      };

      const result = DailyLogSchema.safeParse(validLog);
      expect(result.success).toBe(true);
    });

    it('should validate a log without optional fields', () => {
      const minimalLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: false,
          coldShower: false,
          noPhoneFirstHour: false,
          meditated: false,
          plannedTomorrow: false,
        },
        fitness: {
          workoutType: 'Rest' as const,
          waterIntakeOz: 0,
        },
        learning: {
          leetCodeSolved: 0,
          pagesRead: 0,
          studyHours: 0,
        },
      };

      const result = DailyLogSchema.safeParse(minimalLog);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject invalid date format', () => {
      const invalidLog = {
        date: '01-15-2024', // Wrong format
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'Gym',
          waterIntakeOz: 100,
        },
        learning: {
          leetCodeSolved: 0,
          pagesRead: 0,
          studyHours: 0,
        },
      };

      const result = DailyLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });

    it('should reject invalid workout type', () => {
      const invalidLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'InvalidType',
          waterIntakeOz: 100,
        },
        learning: {
          leetCodeSolved: 0,
          pagesRead: 0,
          studyHours: 0,
        },
      };

      const result = DailyLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });

    it('should reject water intake over 200 oz', () => {
      const invalidLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'Gym',
          waterIntakeOz: 250, // Over 200
        },
        learning: {
          leetCodeSolved: 0,
          pagesRead: 0,
          studyHours: 0,
        },
      };

      const result = DailyLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });

    it('should reject impulse control rating outside 1-5', () => {
      const invalidLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'Gym',
          waterIntakeOz: 100,
        },
        learning: {
          leetCodeSolved: 0,
          pagesRead: 0,
          studyHours: 0,
        },
        journal: {
          impulseControlRating: 6, // Over 5
        },
      };

      const result = DailyLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });

    it('should reject negative leetcode count', () => {
      const invalidLog = {
        date: '2024-01-15',
        habits: {
          wokeUpAt6am: true,
          coldShower: true,
          noPhoneFirstHour: true,
          meditated: true,
          plannedTomorrow: true,
        },
        fitness: {
          workoutType: 'Gym',
          waterIntakeOz: 100,
        },
        learning: {
          leetCodeSolved: -1,
          pagesRead: 0,
          studyHours: 0,
        },
      };

      const result = DailyLogSchema.safeParse(invalidLog);
      expect(result.success).toBe(false);
    });
  });
});

describe('TransactionSchema', () => {
  describe('Valid inputs', () => {
    it('should validate a valid expense', () => {
      const validTransaction = {
        amount: 1000,
        type: 'Expense' as const,
        category: 'Essentials' as const,
        description: 'Groceries',
        date: new Date('2024-01-15'),
      };

      const result = TransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });

    it('should validate a valid income', () => {
      const validTransaction = {
        amount: 50000,
        type: 'Income' as const,
        category: 'Savings' as const,
        description: 'Monthly salary',
        date: new Date('2024-01-01'),
      };

      const result = TransactionSchema.safeParse(validTransaction);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject zero amount', () => {
      const invalidTransaction = {
        amount: 0,
        type: 'Expense',
        category: 'Essentials',
        description: 'Test',
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const invalidTransaction = {
        amount: -100,
        type: 'Expense',
        category: 'Essentials',
        description: 'Test',
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid type', () => {
      const invalidTransaction = {
        amount: 100,
        type: 'Transfer',
        category: 'Essentials',
        description: 'Test',
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidTransaction = {
        amount: 100,
        type: 'Expense',
        category: 'Entertainment',
        description: 'Test',
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject empty description', () => {
      const invalidTransaction = {
        amount: 100,
        type: 'Expense',
        category: 'Essentials',
        description: '',
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });

    it('should reject description over 500 characters', () => {
      const invalidTransaction = {
        amount: 100,
        type: 'Expense',
        category: 'Essentials',
        description: 'A'.repeat(501),
        date: new Date(),
      };

      const result = TransactionSchema.safeParse(invalidTransaction);
      expect(result.success).toBe(false);
    });
  });
});

describe('GoalSchema', () => {
  describe('Valid inputs', () => {
    it('should validate a complete goal', () => {
      const validGoal = {
        title: 'Lose 10 kg',
        description: 'Weight loss goal for the year',
        category: 'Fitness' as const,
        timeframe: 'Mid-term' as const,
        targetDate: new Date('2024-12-31'),
        priority: 'High' as const,
        status: 'In Progress' as const,
      };

      const result = GoalSchema.safeParse(validGoal);
      expect(result.success).toBe(true);
    });

    it('should validate a goal without description', () => {
      const minimalGoal = {
        title: 'Read 12 books',
        category: 'Learning' as const,
        timeframe: 'Long-term' as const,
        targetDate: new Date('2024-12-31'),
        priority: 'Medium' as const,
        status: 'Not Started' as const,
      };

      const result = GoalSchema.safeParse(minimalGoal);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject empty title', () => {
      const invalidGoal = {
        title: '',
        category: 'Fitness',
        timeframe: 'Short-term',
        targetDate: new Date(),
        priority: 'High',
        status: 'Not Started',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject title over 200 characters', () => {
      const invalidGoal = {
        title: 'A'.repeat(201),
        category: 'Fitness',
        timeframe: 'Short-term',
        targetDate: new Date(),
        priority: 'High',
        status: 'Not Started',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid category', () => {
      const invalidGoal = {
        title: 'Test Goal',
        category: 'Sports',
        timeframe: 'Short-term',
        targetDate: new Date(),
        priority: 'High',
        status: 'Not Started',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid timeframe', () => {
      const invalidGoal = {
        title: 'Test Goal',
        category: 'Fitness',
        timeframe: 'Weekly',
        targetDate: new Date(),
        priority: 'High',
        status: 'Not Started',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid priority', () => {
      const invalidGoal = {
        title: 'Test Goal',
        category: 'Fitness',
        timeframe: 'Short-term',
        targetDate: new Date(),
        priority: 'Critical',
        status: 'Not Started',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidGoal = {
        title: 'Test Goal',
        category: 'Fitness',
        timeframe: 'Short-term',
        targetDate: new Date(),
        priority: 'High',
        status: 'Pending',
      };

      const result = GoalSchema.safeParse(invalidGoal);
      expect(result.success).toBe(false);
    });
  });
});

