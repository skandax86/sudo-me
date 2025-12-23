'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { DomainId, mapFocusAreasToDomains } from '@/lib/domains';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

interface DashboardLayoutWrapperProps {
  children: ReactNode;
}

export default function DashboardLayoutWrapper({ children }: DashboardLayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{
    name: string;
    domains: DomainId[];
    streak: number;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      if (!isSupabaseReady()) {
        router.push('/setup');
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          router.push('/auth/login');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          router.push('/auth/login');
          return;
        }

        // Check onboarding
        if (!profile.onboarding_complete) {
          router.push('/onboarding');
          return;
        }

        // Extract focus areas - handle both old and new data structures
        let focusAreas: string[] = [];
        if (profile.preferences?.focusAreas) {
          focusAreas = profile.preferences.focusAreas;
        } else if ((profile.preferences as any)?.primaryFocus) {
          focusAreas = [(profile.preferences as any).primaryFocus];
        }
        
        // Also check generated_plan for focus areas
        if (focusAreas.length === 0 && profile.generated_plan) {
          // Try to extract from generated plan or use defaults
          focusAreas = ['discipline']; // Default fallback
        }

        const domains = mapFocusAreasToDomains(focusAreas);

        setUserData({
          name: profile.name || 'User',
          domains: domains.length > 0 ? domains : ['discipline'], // Fallback
          streak: profile.current_streak || 0,
        });
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <DashboardLayout
      userDomains={userData.domains}
      userName={userData.name}
      currentStreak={userData.streak}
    >
      {children}
    </DashboardLayout>
  );
}

