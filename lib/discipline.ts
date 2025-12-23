/**
 * Discipline Score Calculation
 * 
 * Mathematical formula for calculating daily discipline score.
 * Max score: 100 points
 * 
 * Score Breakdown:
 * - Habits:   60% (weighted by individual habit weights)
 * - Fitness:  20% (workout logged, effort bonus)
 * - Learning: 20% (leetcode, study hours, reading)
 */

// ============================================
// TYPES
// ============================================

export interface HabitData {
  id: string;
  weight: number;
  completed: boolean;
}

export interface FitnessData {
  workedOut: boolean;
  isRestDay: boolean;
  effort?: number; // 1-10
  duration?: number; // minutes
}

export interface LearningData {
  leetcodeSolved: number;
  studyHours: number;
  pagesRead: number;
}

export interface DisciplineScoreResult {
  habits: number;      // 0-60
  fitness: number;     // 0-20
  learning: number;    // 0-20
  total: number;       // 0-100
  breakdown: {
    habitsDetail: string;
    fitnessDetail: string;
    learningDetail: string;
  };
}

// ============================================
// CONSTANTS
// ============================================

const WEIGHTS = {
  HABITS: 60,    // 60% of total
  FITNESS: 20,   // 20% of total
  LEARNING: 20,  // 20% of total
};

const LEARNING_POINTS = {
  LEETCODE: 5,           // per problem
  STUDY_HOUR: 4,         // per hour
  PAGES: 0.2,            // per page (50 pages = 10 points)
  MAX_LEETCODE: 10,      // max points from leetcode
  MAX_STUDY: 8,          // max points from study
  MAX_PAGES: 4,          // max points from reading
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate habits score (0-60)
 * Uses weighted average of completed habits
 */
export function calculateHabitsScore(habits: HabitData[]): { score: number; detail: string } {
  if (habits.length === 0) {
    return { score: 0, detail: 'No habits configured' };
  }

  const totalWeight = habits.reduce((sum, h) => sum + h.weight, 0);
  const completedWeight = habits
    .filter(h => h.completed)
    .reduce((sum, h) => sum + h.weight, 0);

  if (totalWeight === 0) {
    return { score: 0, detail: 'No habit weights' };
  }

  const percentage = completedWeight / totalWeight;
  const score = Math.round(percentage * WEIGHTS.HABITS);
  const completedCount = habits.filter(h => h.completed).length;

  return {
    score,
    detail: `${completedCount}/${habits.length} habits (${Math.round(percentage * 100)}%)`,
  };
}

/**
 * Calculate fitness score (0-20)
 * - Active workout: 15-20 points (based on effort)
 * - Planned rest day: 10 points
 * - No workout: 0 points
 */
export function calculateFitnessScore(fitness: FitnessData): { score: number; detail: string } {
  if (!fitness.workedOut && !fitness.isRestDay) {
    return { score: 0, detail: 'No workout' };
  }

  if (fitness.isRestDay) {
    return { score: 10, detail: 'Rest day' };
  }

  // Base 15 points for working out
  let score = 15;
  
  // Bonus points for effort (1-10 scale → 0-5 bonus points)
  if (fitness.effort) {
    const effortBonus = Math.round((fitness.effort / 10) * 5);
    score += effortBonus;
  }

  score = Math.min(score, WEIGHTS.FITNESS);

  const effortStr = fitness.effort ? ` (effort: ${fitness.effort}/10)` : '';
  return {
    score,
    detail: `Workout completed${effortStr}`,
  };
}

/**
 * Calculate learning score (0-20)
 * Points from:
 * - LeetCode: 5 points per problem (max 10)
 * - Study hours: 4 points per hour (max 8)
 * - Reading: 0.2 points per page (max 4)
 */
export function calculateLearningScore(learning: LearningData): { score: number; detail: string } {
  const leetcodePoints = Math.min(
    learning.leetcodeSolved * LEARNING_POINTS.LEETCODE,
    LEARNING_POINTS.MAX_LEETCODE
  );
  
  const studyPoints = Math.min(
    learning.studyHours * LEARNING_POINTS.STUDY_HOUR,
    LEARNING_POINTS.MAX_STUDY
  );
  
  const readingPoints = Math.min(
    learning.pagesRead * LEARNING_POINTS.PAGES,
    LEARNING_POINTS.MAX_PAGES
  );

  const rawScore = leetcodePoints + studyPoints + readingPoints;
  const score = Math.min(Math.round(rawScore), WEIGHTS.LEARNING);

  const parts: string[] = [];
  if (learning.leetcodeSolved > 0) parts.push(`${learning.leetcodeSolved} LC`);
  if (learning.studyHours > 0) parts.push(`${learning.studyHours}h study`);
  if (learning.pagesRead > 0) parts.push(`${learning.pagesRead} pages`);

  return {
    score,
    detail: parts.length > 0 ? parts.join(', ') : 'No learning logged',
  };
}

/**
 * Calculate complete discipline score
 */
export function calculateDisciplineScore(
  habits: HabitData[],
  fitness: FitnessData,
  learning: LearningData
): DisciplineScoreResult {
  const habitsResult = calculateHabitsScore(habits);
  const fitnessResult = calculateFitnessScore(fitness);
  const learningResult = calculateLearningScore(learning);

  const total = habitsResult.score + fitnessResult.score + learningResult.score;

  return {
    habits: habitsResult.score,
    fitness: fitnessResult.score,
    learning: learningResult.score,
    total: Math.min(total, 100),
    breakdown: {
      habitsDetail: habitsResult.detail,
      fitnessDetail: fitnessResult.detail,
      learningDetail: learningResult.detail,
    },
  };
}

// ============================================
// SCORE INTERPRETATION
// ============================================

export interface ScoreInterpretation {
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
  message: string;
}

export function interpretScore(score: number): ScoreInterpretation {
  if (score >= 90) {
    return {
      grade: 'S',
      label: 'Exceptional',
      color: 'text-yellow-400',
      message: "You're in the top 1%. Legendary discipline.",
    };
  }
  if (score >= 80) {
    return {
      grade: 'A',
      label: 'Excellent',
      color: 'text-green-400',
      message: 'Outstanding day. Keep this energy.',
    };
  }
  if (score >= 70) {
    return {
      grade: 'B',
      label: 'Good',
      color: 'text-blue-400',
      message: 'Solid progress. Push a bit harder tomorrow.',
    };
  }
  if (score >= 50) {
    return {
      grade: 'C',
      label: 'Average',
      color: 'text-yellow-500',
      message: 'Room for improvement. What held you back?',
    };
  }
  if (score >= 30) {
    return {
      grade: 'D',
      label: 'Below Average',
      color: 'text-orange-500',
      message: "Tough day. Tomorrow is a fresh start.",
    };
  }
  return {
    grade: 'F',
    label: 'Needs Work',
    color: 'text-red-500',
    message: "Everyone has off days. Get back on track.",
  };
}

// ============================================
// WEEKLY AGGREGATION
// ============================================

export interface WeeklyScoreData {
  date: string;
  total: number;
  habits: number;
  fitness: number;
  learning: number;
}

export function calculateWeeklyAverage(scores: WeeklyScoreData[]): {
  average: number;
  trend: 'up' | 'down' | 'stable';
  consistency: number; // 0-100 (percentage of days logged)
} {
  if (scores.length === 0) {
    return { average: 0, trend: 'stable', consistency: 0 };
  }

  const average = Math.round(
    scores.reduce((sum, s) => sum + s.total, 0) / scores.length
  );

  // Calculate trend (compare first half to second half)
  const midpoint = Math.floor(scores.length / 2);
  const firstHalf = scores.slice(0, midpoint);
  const secondHalf = scores.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, s) => sum + s.total, 0) / (firstHalf.length || 1);
  const secondAvg = secondHalf.reduce((sum, s) => sum + s.total, 0) / (secondHalf.length || 1);

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (secondAvg > firstAvg + 5) trend = 'up';
  if (secondAvg < firstAvg - 5) trend = 'down';

  // Consistency: days logged out of 7
  const consistency = Math.round((scores.length / 7) * 100);

  return { average, trend, consistency };
}

// ============================================
// COACHING INSIGHTS
// ============================================

export function generateInsight(scores: WeeklyScoreData[]): string {
  if (scores.length === 0) {
    return 'Start logging to get personalized insights.';
  }

  const { average, trend, consistency } = calculateWeeklyAverage(scores);

  // Find weakest area
  const avgHabits = scores.reduce((sum, s) => sum + s.habits, 0) / scores.length;
  const avgFitness = scores.reduce((sum, s) => sum + s.fitness, 0) / scores.length;
  const avgLearning = scores.reduce((sum, s) => sum + s.learning, 0) / scores.length;

  const weakest = Math.min(avgHabits / 60, avgFitness / 20, avgLearning / 20);

  if (consistency < 50) {
    return `You logged ${scores.length}/7 days. Consistency is key — try to log daily.`;
  }

  if (trend === 'up') {
    return `Your discipline is trending up! Average: ${average}. Keep the momentum.`;
  }

  if (trend === 'down') {
    return `Slight dip this week (avg: ${average}). What changed? Identify and adjust.`;
  }

  if (weakest === avgHabits / 60) {
    return `Habits are your growth area. Focus on completing core habits first.`;
  }

  if (weakest === avgFitness / 20) {
    return `Fitness could use attention. Even a short workout counts.`;
  }

  if (weakest === avgLearning / 20) {
    return `Learning is lagging. Even 30 mins of study makes a difference.`;
  }

  return `Solid week with ${average} average. Stay consistent.`;
}

