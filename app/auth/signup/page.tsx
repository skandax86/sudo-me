'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { ZenFade } from '@/components/zen';
import { AppHeader } from '@/components/layout';

// Password strength calculation
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'var(--status-error)' };
  if (score <= 2) return { score, label: 'Fair', color: 'var(--status-warning)' };
  if (score <= 3) return { score, label: 'Good', color: 'var(--status-info)' };
  return { score, label: 'Strong', color: 'var(--status-success)' };
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isSupabaseReady()) {
        setError('Database not connected. Please configure Supabase first.');
        router.push('/setup');
        return;
      }

      const supabase = getSupabaseClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        router.replace('/onboarding/template');
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-12 pt-24 relative"
      style={{ background: 'var(--gradient-primary)' }}
    >
      {/* Fixed Header */}
      <AppHeader variant="auth" showBack backHref="/" />
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <ZenFade>
          <Link href="/" className="flex flex-col items-center mb-12">
            <Rocket size={48} strokeWidth={1} className="text-[var(--gold-primary)] mb-4" />
            <h1 className="text-3xl font-light text-[var(--text-primary)] tracking-tight">
              Tracky
            </h1>
            <p className="text-[var(--text-ghost)] mt-2">
              Begin your transformation
            </p>
          </Link>
        </ZenFade>

        {/* Form Card */}
        <ZenFade delay={0.1}>
          <motion.div 
            className="p-8 rounded-[28px] border border-[var(--border-subtle)] bg-[var(--surface-card)]"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-light text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <span className="text-[var(--gold-primary)]">✦</span>
              Create Account
            </h2>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 rounded-[16px] bg-[var(--status-error)]/10 border border-[var(--status-error)]/30 text-[var(--status-error)] text-sm flex items-center gap-3"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="text-[var(--text-muted)] text-sm mb-2 block">Name</label>
                <div className={`
                  relative flex items-center rounded-[16px] border bg-[var(--surface-2)] transition-all duration-300
                  ${focusedField === 'name' ? 'border-[var(--gold-primary)]' : 'border-[var(--border-subtle)]'}
                `}>
                  <User size={18} className="absolute left-4 text-[var(--text-ghost)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Your name"
                    className="w-full py-4 pl-12 pr-4 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[var(--text-muted)] text-sm mb-2 block">Email</label>
                <div className={`
                  relative flex items-center rounded-[16px] border bg-[var(--surface-2)] transition-all duration-300
                  ${focusedField === 'email' ? 'border-[var(--gold-primary)]' : 'border-[var(--border-subtle)]'}
                `}>
                  <Mail size={18} className="absolute left-4 text-[var(--text-ghost)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    className="w-full py-4 pl-12 pr-4 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[var(--text-muted)] text-sm mb-2 block">Password</label>
                <div className={`
                  relative flex items-center rounded-[16px] border bg-[var(--surface-2)] transition-all duration-300
                  ${focusedField === 'password' ? 'border-[var(--gold-primary)]' : 'border-[var(--border-subtle)]'}
                `}>
                  <Lock size={18} className="absolute left-4 text-[var(--text-ghost)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Create a strong password"
                    className="w-full py-4 pl-12 pr-4 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-ghost)] focus:outline-none"
                    required
                    minLength={8}
                  />
                </div>

                {/* Password strength indicator */}
                {password && (
                  <motion.div 
                    className="mt-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <motion.div
                          key={level}
                          className="flex-1 h-1 rounded-full"
                          style={{
                            backgroundColor: level <= passwordStrength.score 
                              ? passwordStrength.color 
                              : 'var(--surface-3)'
                          }}
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: level * 0.05 }}
                        />
                      ))}
                    </div>
                    <p className="text-xs" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-[16px] bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>

            {/* Login link */}
            <p className="text-[var(--text-ghost)] text-sm text-center mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-[var(--gold-primary)] hover:underline">
                Log in
              </Link>
            </p>
          </motion.div>
        </ZenFade>

        {/* Footer */}
        <ZenFade delay={0.3}>
          <p className="text-[var(--text-ghost)] text-xs text-center mt-8">
            By creating an account, you agree to our Terms of Service
          </p>
        </ZenFade>
      </div>
    </div>
  );
}
