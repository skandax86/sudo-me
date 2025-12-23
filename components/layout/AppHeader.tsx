'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Rocket, ChevronRight, User, LogOut, ChevronLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/theme';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';

interface AppHeaderProps {
  showBack?: boolean;
  backHref?: string;
  variant?: 'landing' | 'auth' | 'app';
}

export function AppHeader({ showBack = false, backHref = '/', variant = 'landing' }: AppHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      if (!isSupabaseReady()) return;
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { email: user.email } : null);
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    if (!isSupabaseReady()) return;
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Left: Logo or Back */}
        {showBack ? (
          <Link href={backHref}>
            <motion.button
              className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              whileHover={{ x: -2 }}
            >
              <ChevronLeft size={20} />
              <span className="text-sm">Back</span>
            </motion.button>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-3">
            <Rocket size={28} className="text-[var(--gold-primary)]" />
            <span className="text-xl font-medium text-[var(--text-primary)]">Tracky</span>
          </Link>
        )}

        {/* Center: Navigation (only on landing) */}
        {variant === 'landing' && (
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#challenges" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
              Challenges
            </Link>
            <Link href="#features" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm transition-colors">
              Features
            </Link>
          </nav>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {user ? (
            // Logged in user
            <div className="relative">
              <motion.button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-soft)] flex items-center justify-center">
                  <User size={14} className="text-[var(--obsidian-deepest)]" />
                </div>
                <span className="text-[var(--text-muted)] text-sm hidden sm:block max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </motion.button>

              {/* Dropdown */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[var(--surface-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden z-50"
                  >
                    <Link 
                      href="/dashboard" 
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <Rocket size={16} />
                      Dashboard
                    </Link>
                    <Link 
                      href="/dashboard/settings" 
                      className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[var(--status-error)] hover:bg-[var(--status-error)]/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </motion.div>
                </>
              )}
            </div>
          ) : variant !== 'auth' ? (
            // Not logged in and not on auth pages
            <Link href="/auth/signup">
              <motion.button
                className="px-5 py-2.5 rounded-xl bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium text-sm flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
                <ChevronRight size={16} />
              </motion.button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;

