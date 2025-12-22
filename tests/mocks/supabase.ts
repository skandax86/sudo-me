/**
 * Supabase Client Mock
 * Provides a mock implementation of the Supabase client for testing
 */

import { Profile, DailyLog, Transaction, Goal } from '@/types/database';

// Mock data factories
export const createMockProfile = (overrides: Partial<Profile> = {}): Profile => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  wake_time: '06:00',
  start_date: '2024-01-01',
  long_term_goals: ['Goal 1', 'Goal 2'],
  target_weight: 75,
  salary: 100000,
  current_streak: 5,
  total_xp: 1500,
  level: 'Intermediate',
  onboarding_complete: true,
  preferences: null,
  generated_plan: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockDailyLog = (overrides: Partial<DailyLog> = {}): DailyLog => ({
  id: 'test-log-id',
  user_id: 'test-user-id',
  log_date: new Date().toISOString().split('T')[0],
  woke_up_at_6am: true,
  cold_shower: true,
  no_phone_first_hour: true,
  meditated: true,
  planned_tomorrow: true,
  workout_type: 'Gym',
  water_intake_oz: 100,
  sleep_hours: 7.5,
  leetcode_solved: 3,
  pages_read: 20,
  study_hours: 2,
  impulse_control_rating: 4,
  notes: 'Test notes',
  discipline_score: 85,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'test-transaction-id',
  user_id: 'test-user-id',
  amount: 1000,
  type: 'Expense',
  category: 'Essentials',
  description: 'Test transaction',
  transaction_date: new Date().toISOString().split('T')[0],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'test-goal-id',
  user_id: 'test-user-id',
  title: 'Test Goal',
  description: 'A test goal description',
  timeframe: 'mid',
  category: 'Fitness',
  target_value: 100,
  current_value: 50,
  unit: 'kg',
  status: 'active',
  due_date: '2024-12-31',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

// Mock query builder interface
interface MockQueryBuilder<T> {
  select: jest.Mock<MockQueryBuilder<T>>;
  insert: jest.Mock<MockQueryBuilder<T>>;
  update: jest.Mock<MockQueryBuilder<T>>;
  delete: jest.Mock<MockQueryBuilder<T>>;
  eq: jest.Mock<MockQueryBuilder<T>>;
  neq: jest.Mock<MockQueryBuilder<T>>;
  gt: jest.Mock<MockQueryBuilder<T>>;
  lt: jest.Mock<MockQueryBuilder<T>>;
  gte: jest.Mock<MockQueryBuilder<T>>;
  lte: jest.Mock<MockQueryBuilder<T>>;
  like: jest.Mock<MockQueryBuilder<T>>;
  ilike: jest.Mock<MockQueryBuilder<T>>;
  in: jest.Mock<MockQueryBuilder<T>>;
  order: jest.Mock<MockQueryBuilder<T>>;
  limit: jest.Mock<MockQueryBuilder<T>>;
  range: jest.Mock<MockQueryBuilder<T>>;
  single: jest.Mock<Promise<{ data: T | null; error: Error | null }>>;
  maybeSingle: jest.Mock<Promise<{ data: T | null; error: Error | null }>>;
  then: (resolve: (result: { data: T | T[] | null; error: Error | null }) => void) => void;
}

// Mock query builder
const createQueryBuilder = <T>(data: T | T[] | null, error: Error | null = null): MockQueryBuilder<T> => {
  const builder: MockQueryBuilder<T> = {} as MockQueryBuilder<T>;
  
  builder.select = jest.fn(() => builder);
  builder.insert = jest.fn(() => builder);
  builder.update = jest.fn(() => builder);
  builder.delete = jest.fn(() => builder);
  builder.eq = jest.fn(() => builder);
  builder.neq = jest.fn(() => builder);
  builder.gt = jest.fn(() => builder);
  builder.lt = jest.fn(() => builder);
  builder.gte = jest.fn(() => builder);
  builder.lte = jest.fn(() => builder);
  builder.like = jest.fn(() => builder);
  builder.ilike = jest.fn(() => builder);
  builder.in = jest.fn(() => builder);
  builder.order = jest.fn(() => builder);
  builder.limit = jest.fn(() => builder);
  builder.range = jest.fn(() => builder);
  builder.single = jest.fn(() => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error }));
  builder.maybeSingle = jest.fn(() => Promise.resolve({ data: Array.isArray(data) ? data[0] : data, error }));
  builder.then = (resolve: (result: { data: T | T[] | null; error: Error | null }) => void) => resolve({ data, error });
  
  return builder;
};

// Mock Supabase Auth
export const createMockAuth = (user: { id: string; email: string } | null = null) => ({
  getUser: jest.fn(() => Promise.resolve({
    data: { user },
    error: null,
  })),
  getSession: jest.fn(() => Promise.resolve({
    data: { session: user ? { user, access_token: 'test-token' } : null },
    error: null,
  })),
  signInWithPassword: jest.fn(() => Promise.resolve({
    data: { user, session: { user, access_token: 'test-token' } },
    error: null,
  })),
  signUp: jest.fn(() => Promise.resolve({
    data: { user, session: { user, access_token: 'test-token' } },
    error: null,
  })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  onAuthStateChange: jest.fn(() => ({
    data: { subscription: { unsubscribe: jest.fn() } },
  })),
});

// Mock Supabase Client
export const createMockSupabaseClient = (options: {
  user?: { id: string; email: string } | null;
  profiles?: Profile[];
  dailyLogs?: DailyLog[];
  transactions?: Transaction[];
  goals?: Goal[];
} = {}) => {
  const {
    user = { id: 'test-user-id', email: 'test@example.com' },
    profiles = [createMockProfile()],
    dailyLogs = [createMockDailyLog()],
    transactions = [createMockTransaction()],
    goals = [createMockGoal()],
  } = options;

  return {
    auth: createMockAuth(user),
    from: jest.fn((table: string) => {
      switch (table) {
        case 'profiles':
          return createQueryBuilder(profiles);
        case 'daily_logs':
          return createQueryBuilder(dailyLogs);
        case 'transactions':
          return createQueryBuilder(transactions);
        case 'goals':
          return createQueryBuilder(goals);
        default:
          return createQueryBuilder(null);
      }
    }),
  };
};

// Jest mock for Supabase client module
export const mockSupabaseModule = () => {
  const mockClient = createMockSupabaseClient();
  
  jest.mock('@/lib/supabase/client', () => ({
    isSupabaseReady: jest.fn(() => true),
    getSupabaseClient: jest.fn(() => mockClient),
    createClient: jest.fn(() => mockClient),
  }));

  return mockClient;
};

