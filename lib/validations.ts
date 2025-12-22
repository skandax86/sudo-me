import { z } from 'zod';

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  targetWeight: z.number().positive().optional(),
  currentSalary: z.number().positive().optional(),
  targetSalary: z.number().min(2000000).optional()
});

export const DailyLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  habits: z.object({
    wokeUpAt6am: z.boolean(),
    coldShower: z.boolean(),
    noPhoneFirstHour: z.boolean(),
    meditated: z.boolean(),
    plannedTomorrow: z.boolean()
  }),
  fitness: z.object({
    workoutType: z.enum(['Gym', 'Run', 'Calisthenics', 'Swim', 'Rest']),
    waterIntakeOz: z.number().min(0).max(200),
    sleepHours: z.number().min(0).max(24).optional()
  }),
  learning: z.object({
    leetCodeSolved: z.number().int().min(0),
    pagesRead: z.number().int().min(0),
    studyHours: z.number().min(0).max(24)
  }),
  journal: z.object({
    impulseControlRating: z.number().int().min(1).max(5).optional(),
    notes: z.string().max(5000).optional()
  }).optional()
});

export const TransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['Expense', 'Income']),
  category: z.enum(['Essentials', 'Wants', 'Investments', 'Savings', 'Goals']),
  description: z.string().min(1).max(500),
  date: z.date()
});

export const GoalSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['Fitness', 'Career', 'Finance', 'Habits', 'Learning', 'Travel', 'Health', 'Lifestyle']),
  timeframe: z.enum(['Short-term', 'Mid-term', 'Long-term']),
  targetDate: z.date(),
  priority: z.enum(['High', 'Medium', 'Low']),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'Cancelled', 'On Hold'])
});




