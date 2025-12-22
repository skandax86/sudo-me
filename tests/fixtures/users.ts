/**
 * Test Fixtures - User Data
 * Provides consistent test data for user-related tests
 */

import { Profile, UserPreferences, GeneratedPlan } from '@/types/database';

export const testUsers = {
  newUser: {
    id: 'new-user-id',
    email: 'new@example.com',
    name: 'New User',
    onboarding_complete: false,
  },
  
  completedOnboarding: {
    id: 'completed-user-id',
    email: 'completed@example.com',
    name: 'Completed User',
    onboarding_complete: true,
    preferences: {
      primaryFocus: 'health',
      specificGoals: ['lose_weight', 'build_muscle'],
      customGoals: [],
      currentLevel: 'intermediate',
      biggestChallenge: 'consistency',
      hoursPerDay: 2,
      daysPerWeek: 5,
      planDuration: 90,
      wakeUpTime: '06:00',
      sleepTime: '22:00',
      workSchedule: '9-5',
      age: 28,
      trackingAreas: ['weight', 'workouts', 'calories'],
      customTracking: [],
      monthlyBudget: 50000,
    } as UserPreferences,
    generated_plan: {
      duration: 90,
      planName: '90-Day Transformation',
      dailyHabits: [
        { name: 'Wake up at 6am', target: 'Daily', icon: '⏰', time: '06:00' },
        { name: 'Workout', target: '5x/week', icon: '💪', time: 'Morning' },
      ],
      weeklyGoals: ['Lose 1kg', 'Complete 5 workouts'],
      morningRoutine: [
        { activity: 'Hydrate', duration: '5 min', icon: '💧' },
        { activity: 'Stretch', duration: '10 min', icon: '🧘' },
      ],
      eveningRoutine: [
        { activity: 'Review day', duration: '10 min', icon: '📝' },
        { activity: 'Plan tomorrow', duration: '10 min', icon: '📋' },
      ],
      tracking: [
        { name: 'Weight', frequency: 'Daily', metric: 'kg' },
        { name: 'Workouts', frequency: 'Daily', metric: 'count' },
      ],
      milestones: {
        week1: 'Establish routine',
        week4: 'See first results',
        week8: 'Major progress',
        week12: 'Transformation complete',
      },
      budgetAllocation: {
        essentials: 30,
        savings: 20,
        investments: 20,
        wants: 15,
        goals: 15,
      },
      coachingTip: 'Focus on consistency over intensity.',
      wakeTime: '06:00',
      sleepTime: '22:00',
    } as GeneratedPlan,
  },
  
  fitnessEnthusiast: {
    id: 'fitness-user-id',
    email: 'fitness@example.com',
    name: 'Fitness Enthusiast',
    onboarding_complete: true,
    current_streak: 30,
    total_xp: 5000,
    level: 'Advanced',
  },
};

export const createTestProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'test-user-' + Date.now(),
  email: `test-${Date.now()}@example.com`,
  name: 'Test User',
  wake_time: '06:00',
  start_date: new Date().toISOString().split('T')[0],
  long_term_goals: ['Goal 1', 'Goal 2'],
  target_weight: 75,
  salary: 100000,
  current_streak: 0,
  total_xp: 0,
  level: 'Beginner',
  onboarding_complete: false,
  preferences: null,
  generated_plan: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

