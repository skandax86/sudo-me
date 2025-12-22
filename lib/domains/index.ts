/**
 * Domain Registry and Configuration
 * 
 * This module defines all available domains and provides utilities
 * for domain-based access control and configuration.
 */

// ============================================================================
// DOMAIN TYPES
// ============================================================================

export type DomainId = 
  | 'health' 
  | 'career' 
  | 'finance' 
  | 'discipline' 
  | 'learning' 
  | 'personal';

export interface DomainConfig {
  id: DomainId;
  name: string;
  description: string;
  icon: string;
  color: {
    primary: string;      // Tailwind gradient from
    secondary: string;    // Tailwind gradient to
    bg: string;           // Background color for cards
    text: string;         // Text color
    accent: string;       // Accent/highlight color
  };
  route: string;
  features: DomainFeature[];
  widgets: WidgetConfig[];
  trackingMetrics: string[];
  isPremium: boolean;
}

export interface DomainFeature {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  isEnabled: boolean;
}

export interface WidgetConfig {
  id: string;
  name: string;
  component: string;     // Component path for lazy loading
  size: 'small' | 'medium' | 'large' | 'full';
  position: number;
  isVisible: boolean;
}

export interface DomainSummary {
  domainId: DomainId;
  todayActions: number;
  completedActions: number;
  streak: number;
  primaryMetric: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
    change?: string;
  };
  nextAction?: {
    title: string;
    time?: string;
  };
}

// ============================================================================
// DOMAIN REGISTRY
// ============================================================================

export const DOMAIN_REGISTRY: Record<DomainId, DomainConfig> = {
  health: {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Track workouts, nutrition, sleep, and wellness habits',
    icon: '💪',
    color: {
      primary: 'from-green-500',
      secondary: 'to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      accent: 'green-500',
    },
    route: '/dashboard/health',
    features: [
      { id: 'workout_tracking', name: 'Workout Tracking', description: 'Log and track workouts', isPremium: false, isEnabled: true },
      { id: 'nutrition', name: 'Nutrition', description: 'Track meals and calories', isPremium: false, isEnabled: true },
      { id: 'sleep', name: 'Sleep Tracking', description: 'Monitor sleep patterns', isPremium: false, isEnabled: true },
      { id: 'ai_coach', name: 'AI Fitness Coach', description: 'Get personalized recommendations', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'workout_summary', name: 'Workout Summary', component: 'HealthWorkoutWidget', size: 'medium', position: 1, isVisible: true },
      { id: 'water_intake', name: 'Water Intake', component: 'HealthWaterWidget', size: 'small', position: 2, isVisible: true },
      { id: 'sleep_chart', name: 'Sleep Chart', component: 'HealthSleepWidget', size: 'large', position: 3, isVisible: true },
      { id: 'body_metrics', name: 'Body Metrics', component: 'HealthMetricsWidget', size: 'medium', position: 4, isVisible: true },
    ],
    trackingMetrics: ['workouts', 'water', 'sleep', 'weight', 'calories'],
    isPremium: false,
  },
  career: {
    id: 'career',
    name: 'Career & Work',
    description: 'Manage professional goals, skills, and productivity',
    icon: '💼',
    color: {
      primary: 'from-blue-500',
      secondary: 'to-indigo-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      accent: 'blue-500',
    },
    route: '/dashboard/career',
    features: [
      { id: 'skill_tracking', name: 'Skill Progress', description: 'Track skill development', isPremium: false, isEnabled: true },
      { id: 'certifications', name: 'Certifications', description: 'Manage certification goals', isPremium: false, isEnabled: true },
      { id: 'networking', name: 'Networking', description: 'Track professional connections', isPremium: false, isEnabled: true },
      { id: 'ai_career', name: 'AI Career Advisor', description: 'Get career recommendations', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'tasks_today', name: 'Tasks Today', component: 'CareerTasksWidget', size: 'medium', position: 1, isVisible: true },
      { id: 'skill_progress', name: 'Skill Progress', component: 'CareerSkillsWidget', size: 'large', position: 2, isVisible: true },
      { id: 'learning_hours', name: 'Learning Hours', component: 'CareerLearningWidget', size: 'small', position: 3, isVisible: true },
    ],
    trackingMetrics: ['tasks', 'learning', 'networking', 'projects'],
    isPremium: false,
  },
  finance: {
    id: 'finance',
    name: 'Money & Wealth',
    description: 'Budget, save, invest, and grow your wealth',
    icon: '💰',
    color: {
      primary: 'from-amber-500',
      secondary: 'to-yellow-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      accent: 'amber-500',
    },
    route: '/dashboard/finance',
    features: [
      { id: 'budgeting', name: 'Budget Tracking', description: 'Track income and expenses', isPremium: false, isEnabled: true },
      { id: 'savings', name: 'Savings Goals', description: 'Set and track savings targets', isPremium: false, isEnabled: true },
      { id: 'investments', name: 'Investment Portfolio', description: 'Track investments', isPremium: false, isEnabled: true },
      { id: 'ai_finance', name: 'AI Financial Advisor', description: 'Get personalized advice', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'budget_overview', name: 'Budget Overview', component: 'FinanceBudgetWidget', size: 'large', position: 1, isVisible: true },
      { id: 'spending_chart', name: 'Spending Chart', component: 'FinanceSpendingWidget', size: 'medium', position: 2, isVisible: true },
      { id: 'savings_progress', name: 'Savings Progress', component: 'FinanceSavingsWidget', size: 'medium', position: 3, isVisible: true },
      { id: 'transactions', name: 'Recent Transactions', component: 'FinanceTransactionsWidget', size: 'full', position: 4, isVisible: true },
    ],
    trackingMetrics: ['spending', 'savings', 'investments', 'budget'],
    isPremium: false,
  },
  discipline: {
    id: 'discipline',
    name: 'Discipline & Habits',
    description: 'Build routines, track habits, and stay consistent',
    icon: '🎯',
    color: {
      primary: 'from-purple-500',
      secondary: 'to-pink-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      accent: 'purple-500',
    },
    route: '/dashboard/discipline',
    features: [
      { id: 'habit_tracking', name: 'Habit Tracking', description: 'Track daily habits', isPremium: false, isEnabled: true },
      { id: 'routines', name: 'Routines', description: 'Morning and evening routines', isPremium: false, isEnabled: true },
      { id: 'streaks', name: 'Streaks', description: 'Track consistency streaks', isPremium: false, isEnabled: true },
      { id: 'ai_accountability', name: 'AI Accountability', description: 'Get motivation reminders', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'habits_today', name: 'Today\'s Habits', component: 'DisciplineHabitsWidget', size: 'large', position: 1, isVisible: true },
      { id: 'streak_tracker', name: 'Streak Tracker', component: 'DisciplineStreakWidget', size: 'small', position: 2, isVisible: true },
      { id: 'routine_progress', name: 'Routine Progress', component: 'DisciplineRoutineWidget', size: 'medium', position: 3, isVisible: true },
      { id: 'discipline_score', name: 'Discipline Score', component: 'DisciplineScoreWidget', size: 'small', position: 4, isVisible: true },
    ],
    trackingMetrics: ['habits', 'wake_time', 'screen_time', 'meditation'],
    isPremium: false,
  },
  learning: {
    id: 'learning',
    name: 'Learning & Skills',
    description: 'Track courses, books, and skill development',
    icon: '📚',
    color: {
      primary: 'from-cyan-500',
      secondary: 'to-blue-500',
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      accent: 'cyan-500',
    },
    route: '/dashboard/learning',
    features: [
      { id: 'courses', name: 'Course Tracking', description: 'Track online courses', isPremium: false, isEnabled: true },
      { id: 'books', name: 'Reading List', description: 'Track books and pages', isPremium: false, isEnabled: true },
      { id: 'skills', name: 'Skill Development', description: 'Track skill progress', isPremium: false, isEnabled: true },
      { id: 'ai_learning', name: 'AI Learning Path', description: 'Personalized curriculum', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'study_hours', name: 'Study Hours', component: 'LearningHoursWidget', size: 'medium', position: 1, isVisible: true },
      { id: 'books_progress', name: 'Books Progress', component: 'LearningBooksWidget', size: 'medium', position: 2, isVisible: true },
      { id: 'courses_list', name: 'Active Courses', component: 'LearningCoursesWidget', size: 'large', position: 3, isVisible: true },
    ],
    trackingMetrics: ['study_hours', 'courses', 'books', 'practice'],
    isPremium: false,
  },
  personal: {
    id: 'personal',
    name: 'Personal Growth',
    description: 'Journal, reflect, and track personal development',
    icon: '✨',
    color: {
      primary: 'from-rose-500',
      secondary: 'to-red-500',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      accent: 'rose-500',
    },
    route: '/dashboard/personal',
    features: [
      { id: 'journaling', name: 'Daily Journal', description: 'Reflect and journal daily', isPremium: false, isEnabled: true },
      { id: 'mood', name: 'Mood Tracking', description: 'Track emotional wellness', isPremium: false, isEnabled: true },
      { id: 'gratitude', name: 'Gratitude', description: 'Practice gratitude', isPremium: false, isEnabled: true },
      { id: 'ai_insights', name: 'AI Self-Insights', description: 'Pattern analysis', isPremium: true, isEnabled: false },
    ],
    widgets: [
      { id: 'mood_tracker', name: 'Mood Tracker', component: 'PersonalMoodWidget', size: 'small', position: 1, isVisible: true },
      { id: 'journal_entry', name: 'Today\'s Journal', component: 'PersonalJournalWidget', size: 'large', position: 2, isVisible: true },
      { id: 'gratitude_list', name: 'Gratitude', component: 'PersonalGratitudeWidget', size: 'medium', position: 3, isVisible: true },
      { id: 'goals_reflection', name: 'Goals Reflection', component: 'PersonalGoalsWidget', size: 'medium', position: 4, isVisible: true },
    ],
    trackingMetrics: ['mood', 'gratitude', 'social', 'journal'],
    isPremium: false,
  },
};

// ============================================================================
// DOMAIN UTILITIES
// ============================================================================

/**
 * Get domain configuration by ID
 */
export function getDomainConfig(domainId: DomainId): DomainConfig {
  return DOMAIN_REGISTRY[domainId];
}

/**
 * Get all available domains
 */
export function getAllDomains(): DomainConfig[] {
  return Object.values(DOMAIN_REGISTRY);
}

/**
 * Get domains by IDs (for filtering by user selection)
 */
export function getDomainsByIds(domainIds: DomainId[]): DomainConfig[] {
  return domainIds
    .filter(id => DOMAIN_REGISTRY[id])
    .map(id => DOMAIN_REGISTRY[id]);
}

/**
 * Check if user has access to a domain
 */
export function hasAccessToDomain(
  userDomains: DomainId[],
  domainId: DomainId
): boolean {
  return userDomains.includes(domainId);
}

/**
 * Get domain route by ID
 */
export function getDomainRoute(domainId: DomainId): string {
  return DOMAIN_REGISTRY[domainId]?.route || '/dashboard';
}

/**
 * Map onboarding focus areas to domain IDs
 */
export function mapFocusAreasToDomains(focusAreas: string[]): DomainId[] {
  const mapping: Record<string, DomainId> = {
    'health': 'health',
    'career': 'career',
    'finance': 'finance',
    'discipline': 'discipline',
    'learning': 'learning',
    'personal': 'personal',
  };
  
  return focusAreas
    .map(area => mapping[area])
    .filter((id): id is DomainId => id !== undefined);
}

/**
 * Get sidebar navigation items based on user domains
 */
export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive: boolean;
  color?: string;
}

export function getSidebarItems(
  userDomains: DomainId[],
  currentPath: string
): SidebarItem[] {
  const items: SidebarItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      href: '/dashboard',
      isActive: currentPath === '/dashboard',
    },
  ];

  // Add user's selected domains
  userDomains.forEach(domainId => {
    const config = DOMAIN_REGISTRY[domainId];
    if (config) {
      items.push({
        id: config.id,
        label: config.name,
        icon: config.icon,
        href: config.route,
        isActive: currentPath.startsWith(config.route),
        color: config.color.accent,
      });
    }
  });

  // Add settings at the end
  items.push({
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    href: '/dashboard/settings',
    isActive: currentPath === '/dashboard/settings',
  });

  return items;
}

// ============================================================================
// DOMAIN STATE TYPE
// ============================================================================

export interface UserDomainState {
  selectedDomains: DomainId[];
  domainPreferences: Record<DomainId, DomainPreference>;
  lastVisited: DomainId | null;
}

export interface DomainPreference {
  widgetOrder: string[];
  hiddenWidgets: string[];
  notifications: boolean;
}

export const DEFAULT_DOMAIN_STATE: UserDomainState = {
  selectedDomains: [],
  domainPreferences: {} as Record<DomainId, DomainPreference>,
  lastVisited: null,
};

