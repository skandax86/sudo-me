'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Mail,
  Flame,
  Trophy,
  Settings,
  LogOut,
  Check,
  Loader2,
  Activity,
  Brain,
  Wallet,
  BookOpen,
  Briefcase,
  Heart,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { DomainId, getAllDomains } from '@/lib/domains';
import { Profile } from '@/types/database';
import { ZenCard, ZenFade, ZenIcon } from '@/components/zen';
import { useTheme } from '@/components/theme';

// Domain icons mapping
const domainIcons: Record<DomainId, typeof Activity> = {
  health: Activity,
  discipline: Brain,
  finance: Wallet,
  learning: BookOpen,
  career: Briefcase,
  personal: Heart,
};

interface SettingsData {
  profile: Profile | null;
  selectedDomains: DomainId[];
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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
          let focusAreas: string[] = [];
          if (profile.preferences?.focusAreas) {
            focusAreas = profile.preferences.focusAreas;
          } else if ((profile.preferences as Record<string, unknown>)?.primaryFocus) {
            focusAreas = [(profile.preferences as Record<string, unknown>).primaryFocus as string];
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
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-[var(--gold-primary)] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-10 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <motion.div 
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={20} strokeWidth={1.5} />
              <span className="text-sm font-medium">Back</span>
            </motion.div>
          </Link>
          <ZenIcon icon={Settings} />
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Title */}
        <ZenFade>
          <div className="mb-8">
            <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight mb-2">
              Settings
            </h1>
            <p className="text-[var(--text-ghost)]">Manage your preferences with intention.</p>
          </div>
        </ZenFade>

        {/* Success Message */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-[20px] bg-[var(--status-success)]/10 border border-[var(--status-success)]/30 text-[var(--status-success)] flex items-center gap-3"
            >
              <Check size={20} />
              <span>Settings saved successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {/* Profile Section */}
          <ZenFade delay={0.1}>
            <ZenCard>
              <h2 className="text-[var(--text-primary)] font-light text-lg tracking-wide mb-6 flex items-center gap-3">
                <ZenIcon icon={User} size={20} />
                Profile
              </h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">Name</p>
                  <p className="text-[var(--text-primary)]">{data?.profile?.name || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">Email</p>
                  <p className="text-[var(--text-primary)]">{data?.profile?.email || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">Streak</p>
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Flame size={16} className="text-[var(--gold-primary)]" />
                    <span>{data?.profile?.current_streak || 0} days</span>
                  </div>
                </div>
                <div>
                  <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">Level</p>
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <Trophy size={16} className="text-[var(--gold-primary)]" />
                    <span>{data?.profile?.level || 'Beginner'}</span>
                  </div>
                </div>
              </div>
            </ZenCard>
          </ZenFade>

          {/* Appearance Section */}
          <ZenFade delay={0.2}>
            <ZenCard>
              <h2 className="text-[var(--text-primary)] font-light text-lg tracking-wide mb-6 flex items-center gap-3">
                <ZenIcon icon={Palette} size={20} />
                Appearance
              </h2>
              
              <div className="flex items-center justify-between p-4 rounded-[20px] bg-[var(--surface-2)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-4">
                  {theme === 'dark' ? (
                    <Moon size={20} className="text-[var(--text-muted)]" />
                  ) : (
                    <Sun size={20} className="text-[var(--gold-primary)]" />
                  )}
                  <div>
                    <p className="text-[var(--text-primary)] font-medium">Theme</p>
                    <p className="text-[var(--text-ghost)] text-sm">
                      {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-medium)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Switch to {theme === 'dark' ? 'light' : 'dark'}
                </motion.button>
              </div>
            </ZenCard>
          </ZenFade>

          {/* Focus Areas Section */}
          <ZenFade delay={0.3}>
            <ZenCard>
              <h2 className="text-[var(--text-primary)] font-light text-lg tracking-wide mb-2 flex items-center gap-3">
                <ZenIcon icon={Activity} size={20} />
                Focus Areas
              </h2>
              <p className="text-[var(--text-ghost)] text-sm mb-6">
                Select the domains that matter most to your journey.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {allDomains.map((domain, idx) => {
                  const isSelected = selectedDomains.includes(domain.id);
                  const Icon = domainIcons[domain.id];
                  
                  return (
                    <motion.button
                      key={domain.id}
                      onClick={() => toggleDomain(domain.id)}
                      className={`
                        p-4 rounded-[20px] border text-left transition-all
                        ${isSelected 
                          ? 'bg-[var(--gold-soft)] border-[var(--gold-primary)]/30' 
                          : 'bg-[var(--surface-card)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                        }
                      `}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center
                          ${isSelected ? 'bg-[var(--gold-medium)]' : 'bg-[var(--surface-2)]'}
                        `}>
                          <Icon 
                            size={20} 
                            strokeWidth={1.5}
                            className={isSelected ? 'text-[var(--gold-primary)]' : 'text-[var(--text-muted)]'} 
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                            {domain.name}
                          </p>
                          <p className="text-[var(--text-ghost)] text-xs line-clamp-1">
                            {domain.description}
                          </p>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-[var(--gold-primary)] flex items-center justify-center"
                          >
                            <Check size={12} className="text-[var(--obsidian-deepest)]" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={saving || selectedDomains.length === 0}
                className={`
                  w-full py-3 rounded-[16px] font-medium transition-all
                  ${selectedDomains.length > 0 
                    ? 'bg-[var(--gold-primary)] text-[var(--obsidian-deepest)]' 
                    : 'bg-[var(--surface-2)] text-[var(--text-ghost)] cursor-not-allowed'
                  }
                  disabled:opacity-50
                `}
                whileHover={selectedDomains.length > 0 ? { y: -2 } : {}}
                whileTap={selectedDomains.length > 0 ? { scale: 0.98 } : {}}
              >
                {saving ? (
                  <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </ZenCard>
          </ZenFade>

          {/* Account Actions */}
          <ZenFade delay={0.5}>
            <ZenCard>
              <h2 className="text-[var(--text-primary)] font-light text-lg tracking-wide mb-6">
                Account
              </h2>
              
              <motion.button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-[20px] bg-[var(--status-error)]/10 border border-[var(--status-error)]/20 text-[var(--status-error)] hover:bg-[var(--status-error)]/20 transition-colors"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut size={20} strokeWidth={1.5} />
                <span className="font-medium">Sign Out</span>
              </motion.button>
            </ZenCard>
          </ZenFade>
        </div>
      </div>
    </div>
  );
}
