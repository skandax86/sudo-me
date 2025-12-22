'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { Profile, GeneratedPlan, UserPreferences } from '@/types/database';
import { DomainId, mapFocusAreasToDomains, DomainSummary, getDomainConfig } from '@/lib/domains';

// ============================================================================
// TYPES
// ============================================================================

export interface UserState {
  // Auth
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile
  userId: string | null;
  email: string | null;
  name: string;
  
  // Onboarding
  onboardingComplete: boolean;
  selectedDomains: DomainId[];
  preferences: UserPreferences | null;
  generatedPlan: GeneratedPlan | null;
  
  // Stats
  currentStreak: number;
  totalXp: number;
  level: string;
  startDate: string | null;
  
  // Domain Summaries (for Home dashboard)
  domainSummaries: Record<DomainId, DomainSummary | null>;
}

export interface UserContextValue extends UserState {
  refreshUser: () => Promise<void>;
  refreshDomainSummary: (domainId: DomainId) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_STATE: UserState = {
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  email: null,
  name: '',
  onboardingComplete: false,
  selectedDomains: [],
  preferences: null,
  generatedPlan: null,
  currentStreak: 0,
  totalXp: 0,
  level: 'Beginner',
  startDate: null,
  domainSummaries: {} as Record<DomainId, DomainSummary | null>,
};

// ============================================================================
// CONTEXT
// ============================================================================

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [state, setState] = useState<UserState>(DEFAULT_STATE);
  const router = useRouter();

  // Fetch user data
  const refreshUser = useCallback(async () => {
    if (!isSupabaseReady()) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState({ ...DEFAULT_STATE, isLoading: false });
        return;
      }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Extract focus areas from preferences
        const focusAreas = profile.preferences?.focusAreas || 
                          (profile.preferences as any)?.primaryFocus ? 
                            [(profile.preferences as any).primaryFocus] : [];
        
        const selectedDomains = mapFocusAreasToDomains(focusAreas);

        setState({
          isAuthenticated: true,
          isLoading: false,
          userId: user.id,
          email: user.email || null,
          name: profile.name || '',
          onboardingComplete: profile.onboarding_complete || false,
          selectedDomains,
          preferences: profile.preferences || null,
          generatedPlan: profile.generated_plan || null,
          currentStreak: profile.current_streak || 0,
          totalXp: profile.total_xp || 0,
          level: profile.level || 'Beginner',
          startDate: profile.start_date || null,
          domainSummaries: {} as Record<DomainId, DomainSummary | null>,
        });

        // Fetch domain summaries in background
        selectedDomains.forEach(domainId => {
          fetchDomainSummary(user.id, domainId);
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setState({ ...DEFAULT_STATE, isLoading: false });
    }
  }, []);

  // Fetch domain summary
  const fetchDomainSummary = async (userId: string, domainId: DomainId) => {
    try {
      const supabase = getSupabaseClient();
      const today = new Date().toISOString().split('T')[0];
      const config = getDomainConfig(domainId);

      let summary: DomainSummary = {
        domainId,
        todayActions: 0,
        completedActions: 0,
        streak: 0,
        primaryMetric: {
          label: 'No data',
          value: '-',
        },
      };

      // Fetch domain-specific data
      switch (domainId) {
        case 'health': {
          const { data: logs } = await supabase
            .from('daily_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('log_date', today)
            .single();

          if (logs) {
            summary = {
              domainId,
              todayActions: 5,
              completedActions: [
                logs.woke_up_at_6am,
                logs.cold_shower,
                logs.no_phone_first_hour,
                logs.meditated,
                logs.planned_tomorrow,
              ].filter(Boolean).length,
              streak: 0,
              primaryMetric: {
                label: 'Discipline Score',
                value: `${logs.discipline_score || 0}%`,
              },
            };
          }
          break;
        }

        case 'finance': {
          const { data: txs } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId)
            .gte('transaction_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

          if (txs && txs.length > 0) {
            type TxEntry = { type: string; amount: number };
            const totalSpent = txs
              .filter((tx: TxEntry) => tx.type === 'Expense')
              .reduce((sum: number, tx: TxEntry) => sum + Number(tx.amount), 0);

            summary = {
              domainId,
              todayActions: 1,
              completedActions: txs.length > 0 ? 1 : 0,
              streak: 0,
              primaryMetric: {
                label: 'Spent This Month',
                value: `₹${totalSpent.toLocaleString()}`,
              },
            };
          }
          break;
        }

        case 'discipline': {
          const { data: logs } = await supabase
            .from('daily_logs')
            .select('discipline_score')
            .eq('user_id', userId)
            .order('log_date', { ascending: false })
            .limit(7);

          if (logs && logs.length > 0) {
            type LogEntry = { discipline_score: number | null };
            const avgScore = Math.round(
              logs.reduce((sum: number, log: LogEntry) => sum + (log.discipline_score || 0), 0) / logs.length
            );

            summary = {
              domainId,
              todayActions: 5,
              completedActions: 0,
              streak: logs.length,
              primaryMetric: {
                label: 'Avg. Score (7d)',
                value: `${avgScore}%`,
              },
            };
          }
          break;
        }

        case 'learning': {
          const { data: logs } = await supabase
            .from('daily_logs')
            .select('leetcode_solved, pages_read, study_hours')
            .eq('user_id', userId);

          if (logs && logs.length > 0) {
            type LearningLog = { leetcode_solved: number | null; pages_read: number | null };
            const totalLeetcode = logs.reduce((sum: number, log: LearningLog) => sum + (log.leetcode_solved || 0), 0);
            const totalPages = logs.reduce((sum: number, log: LearningLog) => sum + (log.pages_read || 0), 0);

            summary = {
              domainId,
              todayActions: 3,
              completedActions: 0,
              streak: 0,
              primaryMetric: {
                label: 'LeetCode Solved',
                value: totalLeetcode,
              },
            };
          }
          break;
        }

        default:
          // For other domains, use generic empty state
          break;
      }

      setState(prev => ({
        ...prev,
        domainSummaries: {
          ...prev.domainSummaries,
          [domainId]: summary,
        },
      }));
    } catch (error) {
      console.error(`Error fetching summary for ${domainId}:`, error);
    }
  };

  const refreshDomainSummary = async (domainId: DomainId) => {
    if (state.userId) {
      await fetchDomainSummary(state.userId, domainId);
    }
  };

  const logout = async () => {
    if (!isSupabaseReady()) return;
    
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setState({ ...DEFAULT_STATE, isLoading: false });
    router.push('/');
  };

  // Initial load
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Listen for auth changes
  useEffect(() => {
    if (!isSupabaseReady()) return;

    const supabase = getSupabaseClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: unknown) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshUser();
      } else if (event === 'SIGNED_OUT') {
        setState({ ...DEFAULT_STATE, isLoading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const contextValue: UserContextValue = {
    ...state,
    refreshUser,
    refreshDomainSummary,
    logout,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// ============================================================================
// ACCESS CONTROL HOOK
// ============================================================================

export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export function useRequireOnboarding(redirectTo = '/onboarding') {
  const { isAuthenticated, isLoading, onboardingComplete } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && !onboardingComplete) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, onboardingComplete, router, redirectTo]);

  return { isAuthenticated, isLoading, onboardingComplete };
}

export function useRequireDomain(domainId: DomainId, redirectTo = '/dashboard') {
  const { selectedDomains, isLoading } = useUser();
  const router = useRouter();
  const hasAccess = selectedDomains.includes(domainId);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push(redirectTo);
    }
  }, [hasAccess, isLoading, router, redirectTo]);

  return { hasAccess, isLoading };
}

