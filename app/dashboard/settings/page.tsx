'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { DomainId, getAllDomains, getDomainConfig, DomainConfig } from '@/lib/domains';
import { Profile } from '@/types/database';

interface SettingsData {
  profile: Profile | null;
  selectedDomains: DomainId[];
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [selectedDomains, setSelectedDomains] = useState<DomainId[]>([]);
  const [success, setSuccess] = useState(false);

  const allDomains = getAllDomains();

  useEffect(() => {
    async function fetchData() {
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

        if (profile) {
          // Extract focus areas from preferences
          let focusAreas: string[] = [];
          if (profile.preferences?.focusAreas) {
            focusAreas = profile.preferences.focusAreas;
          } else if ((profile.preferences as any)?.primaryFocus) {
            focusAreas = [(profile.preferences as any).primaryFocus];
          }

          const domains = focusAreas
            .map(area => area as DomainId)
            .filter(id => allDomains.some(d => d.id === id));

          setData({ profile, selectedDomains: domains });
          setSelectedDomains(domains);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router, allDomains]);

  const toggleDomain = (domainId: DomainId) => {
    setSelectedDomains(prev => {
      if (prev.includes(domainId)) {
        return prev.filter(id => id !== domainId);
      } else {
        return [...prev, domainId];
      }
    });
  };

  const handleSave = async () => {
    if (!data?.profile || selectedDomains.length === 0) return;

    setSaving(true);
    setSuccess(false);

    try {
      const supabase = getSupabaseClient();
      
      // Update preferences with new focus areas
      const updatedPreferences = {
        ...(data.profile.preferences || {}),
        focusAreas: selectedDomains,
      };

      const { error } = await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', data.profile.id);

      if (error) throw error;

      setSuccess(true);
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseReady()) return;
    
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage your account and preferences</p>
        </div>
        <Link
          href="/dashboard"
          className="text-violet-600 hover:underline font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Profile Section */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Name</label>
            <p className="text-slate-800 font-medium">{data?.profile?.name || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
            <p className="text-slate-800 font-medium">{data?.profile?.email || 'Not set'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Current Streak</label>
            <p className="text-slate-800 font-medium">🔥 {data?.profile?.current_streak || 0} days</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Level</label>
            <p className="text-slate-800 font-medium">{data?.profile?.level || 'Beginner'}</p>
          </div>
        </div>
      </section>

      {/* Focus Areas Section */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Focus Areas</h2>
        <p className="text-slate-500 text-sm mb-4">
          Select the domains you want to track. These will appear in your sidebar and home dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {allDomains.map((domain) => {
            const isSelected = selectedDomains.includes(domain.id);
            
            return (
              <button
                key={domain.id}
                onClick={() => toggleDomain(domain.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? `${domain.color.bg} border-${domain.color.accent} ring-2 ring-${domain.color.accent}/20`
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{domain.icon}</span>
                  <div className="flex-1">
                    <h3 className={`font-bold ${isSelected ? domain.color.text : 'text-slate-700'}`}>
                      {domain.name}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-1">
                      {domain.description}
                    </p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? `bg-${domain.color.accent} border-${domain.color.accent}`
                      : 'border-slate-300'
                  }`}>
                    {isSelected && <span className="text-white text-sm">✓</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedDomains.length === 0 && (
          <p className="text-amber-600 text-sm mt-4">
            ⚠️ Please select at least one focus area
          </p>
        )}

        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mt-4">
            ✅ Settings saved! Refreshing...
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || selectedDomains.length === 0}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-600 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </section>

      {/* Plan Management */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Your Plan</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-700">
              {data?.profile?.generated_plan?.planName || 'Custom Plan'}
            </p>
            <p className="text-sm text-slate-500">
              {data?.profile?.generated_plan?.duration || 90} day program
            </p>
          </div>
          <Link
            href="/onboarding/edit-plan"
            className="px-4 py-2 bg-violet-100 text-violet-700 rounded-xl font-medium hover:bg-violet-200 transition"
          >
            ✏️ Edit Plan
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white rounded-2xl p-6 border border-red-200 mb-6">
        <h2 className="text-lg font-bold text-red-600 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-700 font-medium">Sign Out</p>
            <p className="text-sm text-slate-500">
              Sign out of your account on this device
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Version Info */}
      <p className="text-center text-sm text-slate-400">
        Tracky v1.0.0 • Made with ❤️
      </p>
    </div>
  );
}

