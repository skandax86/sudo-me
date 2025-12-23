/**
 * Gamification System
 * 
 * Levels, achievements, streaks, and emotional rewards.
 * Designed to make progress feel meaningful.
 */

// ============================================================================
// LEVELS & IDENTITY
// ============================================================================

export interface Level {
  level: number;
  name: string;
  title: string;
  minXP: number;
  maxXP: number;
  icon: string;
  color: string;
  description: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: 'Awakening', title: 'Explorer', minXP: 0, maxXP: 100, icon: '🌱', color: 'from-slate-400 to-slate-500', description: 'Just getting started' },
  { level: 2, name: 'Foundation', title: 'Learner', minXP: 100, maxXP: 300, icon: '🌿', color: 'from-green-400 to-green-500', description: 'Building habits' },
  { level: 3, name: 'Momentum', title: 'Builder', minXP: 300, maxXP: 600, icon: '🌳', color: 'from-emerald-500 to-teal-500', description: 'Consistency emerging' },
  { level: 4, name: 'Discipline', title: 'Practitioner', minXP: 600, maxXP: 1000, icon: '⚡', color: 'from-blue-500 to-indigo-500', description: 'Habits becoming automatic' },
  { level: 5, name: 'Mastery', title: 'Disciplined Mind', minXP: 1000, maxXP: 1500, icon: '🔥', color: 'from-violet-500 to-purple-500', description: 'Real transformation' },
  { level: 6, name: 'Excellence', title: 'Master', minXP: 1500, maxXP: 2200, icon: '💎', color: 'from-purple-500 to-pink-500', description: 'Exceptional control' },
  { level: 7, name: 'Elite', title: 'Elite Performer', minXP: 2200, maxXP: 3000, icon: '👑', color: 'from-amber-500 to-orange-500', description: 'Top 1%' },
  { level: 8, name: 'Legend', title: 'Legend', minXP: 3000, maxXP: 999999, icon: '🏆', color: 'from-yellow-400 to-amber-500', description: 'Unstoppable' },
];

export function getLevelFromXP(xp: number): Level {
  return LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];
}

export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const current = xp - level.minXP;
  const needed = level.maxXP - level.minXP;
  const percentage = Math.min((current / needed) * 100, 100);
  return { current, needed, percentage };
}

// ============================================================================
// XP REWARDS
// ============================================================================

export const XP_REWARDS = {
  // Daily habits
  daily_log_complete: 10,
  all_habits_done: 20,
  workout_logged: 15,
  
  // Streaks
  streak_7_days: 50,
  streak_14_days: 100,
  streak_21_days: 150,
  streak_30_days: 250,
  streak_60_days: 500,
  streak_90_days: 1000,
  
  // Milestones
  first_week_complete: 100,
  first_month_complete: 300,
  halfway_point: 500,
  plan_complete: 1000,
  
  // Learning
  leetcode_problem: 5,
  leetcode_10: 50,
  leetcode_50: 200,
  leetcode_100: 500,
  book_completed: 100,
  
  // Finance
  budget_on_track: 25,
  savings_goal_hit: 100,
  
  // Personal
  journal_entry: 5,
  reflection_7_days: 50,
};

// ============================================================================
// ACHIEVEMENTS / MILESTONES
// ============================================================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp: number;
  category: 'streak' | 'habit' | 'fitness' | 'finance' | 'learning' | 'milestone';
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalWorkouts: number;
  totalLeetCode: number;
  totalBooksRead: number;
  totalJournalEntries: number;
  daysOnPlan: number;
  allHabitsDaysCount: number;
  budgetOnTrackMonths: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Streak achievements
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '🔥', xp: 50, category: 'streak', condition: (s) => s.currentStreak >= 7 },
  { id: 'streak_14', name: 'Fortnight Fighter', description: '14-day streak', icon: '🔥', xp: 100, category: 'streak', condition: (s) => s.currentStreak >= 14 },
  { id: 'streak_21', name: 'Habit Former', description: '21-day streak (habits stick now!)', icon: '⚡', xp: 150, category: 'streak', condition: (s) => s.currentStreak >= 21 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day streak', icon: '💪', xp: 250, category: 'streak', condition: (s) => s.currentStreak >= 30 },
  { id: 'streak_60', name: 'Disciplined Mind', description: '60-day streak', icon: '🧠', xp: 500, category: 'streak', condition: (s) => s.currentStreak >= 60 },
  { id: 'streak_90', name: 'Transformation Complete', description: '90-day streak', icon: '🏆', xp: 1000, category: 'streak', condition: (s) => s.currentStreak >= 90 },
  
  // Fitness
  { id: 'first_workout', name: 'First Step', description: 'Logged first workout', icon: '🏋️', xp: 25, category: 'fitness', condition: (s) => s.totalWorkouts >= 1 },
  { id: 'workout_10', name: 'Getting Consistent', description: '10 workouts logged', icon: '💪', xp: 75, category: 'fitness', condition: (s) => s.totalWorkouts >= 10 },
  { id: 'workout_50', name: 'Gym Regular', description: '50 workouts logged', icon: '🔥', xp: 200, category: 'fitness', condition: (s) => s.totalWorkouts >= 50 },
  { id: 'workout_100', name: 'Fitness Enthusiast', description: '100 workouts logged', icon: '🏆', xp: 500, category: 'fitness', condition: (s) => s.totalWorkouts >= 100 },
  
  // Learning
  { id: 'leetcode_10', name: 'Problem Solver', description: '10 LeetCode problems', icon: '💻', xp: 50, category: 'learning', condition: (s) => s.totalLeetCode >= 10 },
  { id: 'leetcode_50', name: 'Code Warrior', description: '50 LeetCode problems', icon: '⚔️', xp: 200, category: 'learning', condition: (s) => s.totalLeetCode >= 50 },
  { id: 'leetcode_100', name: 'DSA Master', description: '100 LeetCode problems', icon: '🧠', xp: 500, category: 'learning', condition: (s) => s.totalLeetCode >= 100 },
  { id: 'leetcode_200', name: 'Interview Ready', description: '200 LeetCode problems', icon: '🎯', xp: 1000, category: 'learning', condition: (s) => s.totalLeetCode >= 200 },
  { id: 'book_1', name: 'Reader', description: 'Finished first book', icon: '📖', xp: 100, category: 'learning', condition: (s) => s.totalBooksRead >= 1 },
  { id: 'book_12', name: 'Bookworm', description: '12 books in a year', icon: '📚', xp: 500, category: 'learning', condition: (s) => s.totalBooksRead >= 12 },
  
  // Milestones
  { id: 'week_1', name: 'First Week', description: 'Completed first week', icon: '🌟', xp: 100, category: 'milestone', condition: (s) => s.daysOnPlan >= 7 },
  { id: 'month_1', name: 'First Month', description: 'Completed first month', icon: '🎖️', xp: 300, category: 'milestone', condition: (s) => s.daysOnPlan >= 30 },
  { id: 'halfway', name: 'Halfway There', description: 'Reached 45 days', icon: '⭐', xp: 500, category: 'milestone', condition: (s) => s.daysOnPlan >= 45 },
  { id: 'complete', name: 'Journey Complete', description: 'Finished 90-day plan', icon: '🏆', xp: 1000, category: 'milestone', condition: (s) => s.daysOnPlan >= 90 },
  
  // Perfect days
  { id: 'perfect_day_1', name: 'Perfect Day', description: 'All habits done in one day', icon: '✨', xp: 25, category: 'habit', condition: (s) => s.allHabitsDaysCount >= 1 },
  { id: 'perfect_week', name: 'Perfect Week', description: '7 perfect days', icon: '💎', xp: 150, category: 'habit', condition: (s) => s.allHabitsDaysCount >= 7 },
];

export function getUnlockedAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.condition(stats));
}

export function getNextAchievements(stats: UserStats, limit = 3): Achievement[] {
  const unlocked = new Set(getUnlockedAchievements(stats).map(a => a.id));
  return ACHIEVEMENTS.filter(a => !unlocked.has(a.id)).slice(0, limit);
}

// ============================================================================
// STREAK PROTECTION
// ============================================================================

export interface StreakProtection {
  forgivenessDaysRemaining: number;
  forgivenessDaysUsedThisMonth: number;
  lastForgivenessDayUsed: string | null;
}

export const MAX_FORGIVENESS_DAYS_PER_MONTH = 2;

export function canUseForgiveness(protection: StreakProtection): boolean {
  return protection.forgivenessDaysRemaining > 0;
}

export function useForgiveness(protection: StreakProtection): StreakProtection {
  if (!canUseForgiveness(protection)) return protection;
  
  return {
    ...protection,
    forgivenessDaysRemaining: protection.forgivenessDaysRemaining - 1,
    forgivenessDaysUsedThisMonth: protection.forgivenessDaysUsedThisMonth + 1,
    lastForgivenessDayUsed: new Date().toISOString().split('T')[0],
  };
}

// Reset forgiveness at start of month
export function resetMonthlyForgiveness(protection: StreakProtection): StreakProtection {
  return {
    ...protection,
    forgivenessDaysRemaining: MAX_FORGIVENESS_DAYS_PER_MONTH,
    forgivenessDaysUsedThisMonth: 0,
  };
}

// ============================================================================
// CELEBRATION MESSAGES
// ============================================================================

export const CELEBRATION_MESSAGES = {
  streak_7: {
    title: '🔥 One Week Strong!',
    message: "You've built 7 days of momentum. Most people quit by now. Not you.",
    emoji: '🎉',
  },
  streak_14: {
    title: '⚡ Two Weeks In!',
    message: "Habits are forming. Your brain is rewiring. Keep going.",
    emoji: '💪',
  },
  streak_21: {
    title: '🧠 Habit Formation Complete!',
    message: "21 days - the magic number. These habits are becoming automatic now.",
    emoji: '🏆',
  },
  streak_30: {
    title: '👑 Monthly Master!',
    message: "30 days of discipline. You're in the top 5% of users.",
    emoji: '🎖️',
  },
  first_workout: {
    title: '💪 First Workout Logged!',
    message: "The hardest rep is walking through the door. You did it.",
    emoji: '🏋️',
  },
  budget_on_track: {
    title: '💰 Budget Champion!',
    message: "You stayed within budget this month. Financial freedom incoming.",
    emoji: '📊',
  },
  leetcode_milestone: {
    title: '💻 Code Warrior!',
    message: "Another problem conquered. Interview readiness loading...",
    emoji: '⚔️',
  },
  all_habits_done: {
    title: '✨ Perfect Day!',
    message: "All habits complete. This is what discipline looks like.",
    emoji: '💎',
  },
};

// ============================================================================
// DAILY WINS DETECTION
// ============================================================================

export interface DailyWin {
  id: string;
  icon: string;
  message: string;
  category: 'habit' | 'fitness' | 'finance' | 'learning' | 'streak';
}

export interface WinDetectionInput {
  currentStreak: number;
  previousStreak: number;
  todayHabitsComplete: number;
  totalHabits: number;
  workedOut: boolean;
  stayedUnderBudget: boolean;
  leetCodeToday: number;
  pagesReadToday: number;
  studyHoursToday: number;
  savedMoney: number;
}

export function detectDailyWins(input: WinDetectionInput): DailyWin[] {
  const wins: DailyWin[] = [];
  
  // Streak maintained
  if (input.currentStreak > 0 && input.currentStreak >= input.previousStreak) {
    wins.push({
      id: 'streak_kept',
      icon: '🔥',
      message: `Streak alive: Day ${input.currentStreak}`,
      category: 'streak',
    });
  }
  
  // All habits done
  if (input.todayHabitsComplete === input.totalHabits && input.totalHabits > 0) {
    wins.push({
      id: 'all_habits',
      icon: '✨',
      message: 'All habits complete!',
      category: 'habit',
    });
  } else if (input.todayHabitsComplete >= Math.ceil(input.totalHabits * 0.8)) {
    wins.push({
      id: 'most_habits',
      icon: '✅',
      message: `${input.todayHabitsComplete}/${input.totalHabits} habits done`,
      category: 'habit',
    });
  }
  
  // Workout
  if (input.workedOut) {
    wins.push({
      id: 'workout',
      icon: '💪',
      message: 'Workout logged',
      category: 'fitness',
    });
  }
  
  // Budget
  if (input.stayedUnderBudget) {
    wins.push({
      id: 'budget',
      icon: '💰',
      message: 'Stayed within budget',
      category: 'finance',
    });
  }
  
  // LeetCode
  if (input.leetCodeToday > 0) {
    wins.push({
      id: 'leetcode',
      icon: '💻',
      message: `${input.leetCodeToday} problem${input.leetCodeToday > 1 ? 's' : ''} solved`,
      category: 'learning',
    });
  }
  
  // Reading
  if (input.pagesReadToday >= 10) {
    wins.push({
      id: 'reading',
      icon: '📚',
      message: `${input.pagesReadToday} pages read`,
      category: 'learning',
    });
  }
  
  // Study
  if (input.studyHoursToday >= 1) {
    wins.push({
      id: 'study',
      icon: '🎓',
      message: `${input.studyHoursToday}h studied`,
      category: 'learning',
    });
  }
  
  return wins;
}

// ============================================================================
// PROGRESS COMPARISON
// ============================================================================

export interface ProgressComparison {
  metric: string;
  icon: string;
  current: number;
  previous: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

export function compareProgress(
  currentStats: Record<string, number>,
  previousStats: Record<string, number>,
): ProgressComparison[] {
  const comparisons: ProgressComparison[] = [];
  
  const metrics = [
    { key: 'avgSleepHours', name: 'Avg Sleep', icon: '😴', unit: 'hrs' },
    { key: 'habitsPerWeek', name: 'Habits/Week', icon: '✅', unit: '' },
    { key: 'workoutsPerWeek', name: 'Workouts/Week', icon: '💪', unit: '' },
    { key: 'leetcodeSolved', name: 'LeetCode', icon: '💻', unit: 'problems' },
    { key: 'monthlySpending', name: 'Spending', icon: '💸', unit: '₹' },
    { key: 'disciplineScore', name: 'Discipline', icon: '🎯', unit: '' },
  ];
  
  for (const metric of metrics) {
    const current = currentStats[metric.key] || 0;
    const previous = previousStats[metric.key] || 0;
    const diff = current - previous;
    
    let trend: 'up' | 'down' | 'neutral' = 'neutral';
    if (diff > 0) trend = metric.key === 'monthlySpending' ? 'down' : 'up';
    if (diff < 0) trend = metric.key === 'monthlySpending' ? 'up' : 'down';
    
    const changeAbs = Math.abs(diff);
    const changeStr = metric.key === 'monthlySpending'
      ? `${diff > 0 ? '+' : '-'}₹${changeAbs.toLocaleString()}`
      : `${diff > 0 ? '+' : ''}${changeAbs.toFixed(1)}`;
    
    comparisons.push({
      metric: metric.name,
      icon: metric.icon,
      current,
      previous,
      unit: metric.unit,
      trend,
      change: changeStr,
    });
  }
  
  return comparisons.filter(c => c.current !== c.previous || c.current > 0);
}

