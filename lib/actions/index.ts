// Server Actions - Central Export

// Habits
export {
  getHabitsWithLogs,
  toggleHabit,
  saveHabitsForDay,
  createHabit,
  updateHabit,
  deleteHabit,
} from './habits';

// Finance
export {
  getAccounts,
  createAccount,
  addTransaction,
  getFinanceOverview,
  getRecentTransactions,
  deleteTransaction,
  getSpendingByCategory,
} from './finance';

// Fitness
export {
  logWorkout,
  logRestDay,
  getTodayWorkout,
  getRecentWorkouts,
  getWeeklyWorkoutStats,
  deleteWorkout,
} from './fitness';

// Learning
export {
  logLearning,
  getTodayLearning,
  getLearningStats,
  incrementLeetCode,
  addStudyHours,
} from './learning';

// Daily Log (Unified)
export {
  getDailyLog,
  saveDailyLog,
  saveReflection,
} from './daily-log';

