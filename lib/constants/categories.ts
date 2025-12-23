/**
 * Finance Categories
 * Used for transaction categorization and budgets
 */

export const EXPENSE_CATEGORIES = {
  ESSENTIALS: {
    name: 'Essentials',
    icon: '🏠',
    subcategories: ['Rent', 'Utilities', 'Groceries', 'Insurance', 'EMI', 'Phone Bill'],
  },
  FOOD: {
    name: 'Food & Dining',
    icon: '🍕',
    subcategories: ['Restaurants', 'Zomato/Swiggy', 'Coffee', 'Snacks', 'Drinks'],
  },
  TRANSPORT: {
    name: 'Transport',
    icon: '🚗',
    subcategories: ['Fuel', 'Uber/Ola', 'Metro', 'Parking', 'Maintenance'],
  },
  LIFESTYLE: {
    name: 'Lifestyle',
    icon: '🛍️',
    subcategories: ['Shopping', 'Subscriptions', 'Entertainment', 'Trips', 'Dates'],
  },
  HEALTH: {
    name: 'Health',
    icon: '💊',
    subcategories: ['Medicine', 'Gym', 'Doctor', 'Supplements'],
  },
  LEARNING: {
    name: 'Learning',
    icon: '📚',
    subcategories: ['Courses', 'Books', 'Coaching', 'Certifications'],
  },
  PERSONAL: {
    name: 'Personal',
    icon: '🧴',
    subcategories: ['Grooming', 'Clothing', 'Gifts', 'Charity'],
  },
} as const;

export const INCOME_CATEGORIES = {
  SALARY: { name: 'Salary', icon: '💰' },
  FREELANCE: { name: 'Freelance', icon: '💻' },
  INVESTMENTS: { name: 'Investment Returns', icon: '📈' },
  BONUS: { name: 'Bonus', icon: '🎁' },
  REFUND: { name: 'Refund', icon: '↩️' },
  OTHER: { name: 'Other', icon: '💵' },
} as const;

export const SAVINGS_CATEGORIES = {
  EMERGENCY: { name: 'Emergency Fund', icon: '🛡️' },
  GOAL: { name: 'Goal Savings', icon: '🎯' },
  INVESTMENT: { name: 'Investments', icon: '📊' },
} as const;

/**
 * Get all expense category names
 */
export function getExpenseCategories(): string[] {
  return Object.values(EXPENSE_CATEGORIES).map(c => c.name);
}

/**
 * Get subcategories for a category
 */
export function getSubcategories(category: string): string[] {
  const cat = Object.values(EXPENSE_CATEGORIES).find(c => c.name === category);
  return cat?.subcategories || [];
}

/**
 * Get icon for a category
 */
export function getCategoryIcon(category: string): string {
  const expCat = Object.values(EXPENSE_CATEGORIES).find(c => c.name === category);
  if (expCat) return expCat.icon;
  
  const incCat = Object.values(INCOME_CATEGORIES).find(c => c.name === category);
  if (incCat) return incCat.icon;
  
  return '💳';
}

/**
 * Workout Types
 */
export const WORKOUT_TYPES = {
  GYM: { name: 'Gym', icon: '🏋️' },
  CARDIO: { name: 'Cardio', icon: '🏃' },
  YOGA: { name: 'Yoga', icon: '🧘' },
  SWIM: { name: 'Swim', icon: '🏊' },
  CALISTHENICS: { name: 'Calisthenics', icon: '💪' },
  REST: { name: 'Rest', icon: '😴' },
} as const;

/**
 * Gym Programs
 */
export const GYM_PROGRAMS = {
  PUSH: { name: 'Push', description: 'Chest, Shoulders, Triceps' },
  PULL: { name: 'Pull', description: 'Back, Biceps' },
  LEGS: { name: 'Legs', description: 'Quads, Hamstrings, Glutes' },
  UPPER: { name: 'Upper', description: 'Full Upper Body' },
  LOWER: { name: 'Lower', description: 'Full Lower Body' },
  FULL: { name: 'Full Body', description: 'Complete Workout' },
} as const;

/**
 * Common Exercises by Program
 */
export const EXERCISES_BY_PROGRAM: Record<string, string[]> = {
  push: ['Bench Press', 'Incline Dumbbell Press', 'Shoulder Press', 'Lateral Raises', 'Tricep Pushdown', 'Dips'],
  pull: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Face Pulls', 'Bicep Curls'],
  legs: ['Squat', 'Leg Press', 'Romanian Deadlift', 'Leg Curl', 'Leg Extension', 'Calf Raises'],
  upper: ['Bench Press', 'Pull-ups', 'Shoulder Press', 'Barbell Row', 'Lateral Raises', 'Bicep Curls'],
  lower: ['Squat', 'Deadlift', 'Leg Press', 'Walking Lunges', 'Leg Curl', 'Hip Thrust'],
  full: ['Squat', 'Bench Press', 'Deadlift', 'Pull-ups', 'Shoulder Press', 'Plank'],
};

/**
 * Default Habits
 */
export const DEFAULT_HABITS = [
  { name: 'Wake up on time', icon: '⏰', weight: 15, domain: 'discipline' },
  { name: 'Cold shower', icon: '🚿', weight: 10, domain: 'discipline' },
  { name: 'No phone first hour', icon: '📵', weight: 10, domain: 'discipline' },
  { name: 'Meditate', icon: '🧘', weight: 10, domain: 'personal' },
  { name: 'Plan tomorrow', icon: '📝', weight: 10, domain: 'discipline' },
] as const;

/**
 * Domains
 */
export const DOMAINS = {
  HEALTH: { name: 'Health', icon: '💪', color: 'emerald' },
  FINANCE: { name: 'Finance', icon: '💰', color: 'yellow' },
  LEARNING: { name: 'Learning', icon: '📚', color: 'blue' },
  DISCIPLINE: { name: 'Discipline', icon: '🎯', color: 'purple' },
  CAREER: { name: 'Career', icon: '💼', color: 'orange' },
  PERSONAL: { name: 'Personal', icon: '✨', color: 'pink' },
} as const;

