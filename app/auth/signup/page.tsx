'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setSupabaseReady(isSupabaseReady());
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!supabaseReady) {
      setError('Database is not configured. Please set up .env.local file.');
      return;
    }

    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      
      // Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // Update profile with name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ name: name })
          .eq('id', data.user.id);

        if (profileError) {
          console.warn('Profile update warning:', profileError);
        }

        // Redirect to onboarding for personalized plan creation
        router.push('/onboarding');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (!supabaseReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <div className="text-center mb-6">
            <span className="text-4xl">⚠️</span>
            <h1 className="text-2xl font-bold text-slate-800 mt-4">Database Not Configured</h1>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 text-amber-800 px-5 py-4 rounded-xl mb-6">
            <p className="font-semibold mb-2">Setup Required</p>
            <p className="text-sm mb-4">
              Supabase (PostgreSQL) configuration is missing. Please set up your .env.local file.
            </p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Create a Supabase project at supabase.com</li>
              <li>Copy your project URL and anon key</li>
              <li>Run the SQL migration</li>
              <li>Add config to .env.local file</li>
            </ul>
          </div>
          <Link
            href="/setup"
            className="block text-center bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-violet-700 hover:to-indigo-700 transition"
          >
            View Setup Instructions
          </Link>
          <Link
            href="/"
            className="block text-center mt-4 text-slate-500 hover:text-violet-600 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50 to-indigo-50 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Tracky
            </h1>
          </Link>
          <p className="text-slate-500 mt-2">Start your transformation journey today!</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h2>
          
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:from-violet-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-lg shadow-violet-200"
            >
              {loading ? '🔄 Creating account...' : '🚀 Get Started'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-violet-600 font-semibold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-6">
          By signing up, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
