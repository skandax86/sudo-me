'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';

export default function SetupPage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      if (isSupabaseReady()) {
        setIsConfigured(true);
        try {
          const supabase = getSupabaseClient();
          // Test connection by making a simple query
          await supabase.from('profiles').select('count').limit(1);
          setConnectionStatus('connected');
        } catch {
          setConnectionStatus('error');
        }
      } else {
        setIsConfigured(false);
        setConnectionStatus('error');
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 Setup Guide
          </h1>
          <p className="text-gray-600 mb-8">
            Tracky - PostgreSQL with Supabase
          </p>

          {/* Status */}
          <div className={`p-4 rounded-lg mb-8 ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 border border-green-400'
              : 'bg-yellow-100 border border-yellow-400'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {connectionStatus === 'connected' ? '✅' : '⚠️'}
              </span>
              <div>
                <p className="font-semibold">
                  {connectionStatus === 'connected' 
                    ? 'Connected! You\'re all set.'
                    : 'Database Not Configured'}
                </p>
                <p className="text-sm">
                  {connectionStatus === 'connected'
                    ? 'Supabase is working correctly.'
                    : 'Follow the steps below to set up Supabase.'}
                </p>
              </div>
            </div>
            {connectionStatus === 'connected' && (
              <Link
                href="/auth/signup"
                className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
              >
                Get Started →
              </Link>
            )}
          </div>

          {/* Steps */}
          <div className="space-y-6">
            <div className="border-l-4 border-indigo-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 1: Create Supabase Project</h2>
              <ol className="mt-2 text-gray-600 space-y-2 list-decimal list-inside">
                <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">supabase.com</a></li>
                <li>Click &quot;Start your project&quot; (free)</li>
                <li>Sign in with GitHub</li>
                <li>Click &quot;New project&quot;</li>
                <li>Name: <code className="bg-gray-100 px-1 rounded">sudo-me</code></li>
                <li>Set a database password (save this!)</li>
                <li>Select region closest to you</li>
                <li>Click &quot;Create new project&quot;</li>
                <li>Wait ~2 minutes for setup</li>
              </ol>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 2: Get Your Credentials</h2>
              <ol className="mt-2 text-gray-600 space-y-2 list-decimal list-inside">
                <li>In Supabase dashboard, go to <strong>Settings → API</strong></li>
                <li>Copy the <strong>Project URL</strong></li>
                <li>Copy the <strong>anon public</strong> key</li>
              </ol>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 3: Run Database Migration</h2>
              <ol className="mt-2 text-gray-600 space-y-2 list-decimal list-inside">
                <li>In Supabase dashboard, go to <strong>SQL Editor</strong></li>
                <li>Click &quot;New query&quot;</li>
                <li>Copy contents from <code className="bg-gray-100 px-1 rounded">supabase/migrations/001_initial_schema.sql</code></li>
                <li>Paste into the SQL editor</li>
                <li>Click &quot;Run&quot; (or Cmd/Ctrl + Enter)</li>
                <li>Verify success (green checkmark)</li>
              </ol>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 4: Create .env.local File</h2>
              <p className="mt-2 text-gray-600 mb-3">
                Create a file named <code className="bg-gray-100 px-1 rounded">.env.local</code> in your project root:
              </p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: LLM (Gemini)
GEMINI_API_KEY=your_gemini_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
              </pre>
            </div>

            <div className="border-l-4 border-indigo-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 5: Restart Server</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mt-2">
{`# Stop the current server (Ctrl+C)
# Then restart:
npm run dev`}
              </pre>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h2 className="text-lg font-semibold text-gray-800">Step 6: Test It!</h2>
              <ol className="mt-2 text-gray-600 space-y-2 list-decimal list-inside">
                <li>Refresh this page to check connection</li>
                <li>Go to <Link href="/auth/signup" className="text-indigo-600 hover:underline">/auth/signup</Link></li>
                <li>Create an account</li>
                <li>You should see the dashboard!</li>
              </ol>
            </div>
          </div>

          {/* Why Supabase */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Why Supabase + PostgreSQL?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ <strong>Free tier:</strong> 500MB database, 50K monthly active users</li>
              <li>✅ <strong>PostgreSQL:</strong> Industry-standard relational database</li>
              <li>✅ <strong>Built-in Auth:</strong> Email/password, OAuth, Magic links</li>
              <li>✅ <strong>Real-time:</strong> Live updates without polling</li>
              <li>✅ <strong>Row Level Security:</strong> Your data is private</li>
              <li>✅ <strong>Open Source:</strong> No vendor lock-in</li>
            </ul>
          </div>

          {/* Links */}
          <div className="mt-8 flex gap-4">
            <Link
              href="/"
              className="text-indigo-600 hover:underline"
            >
              ← Back to Home
            </Link>
            {isConfigured && (
              <Link
                href="/auth/signup"
                className="text-indigo-600 hover:underline"
              >
                Sign Up →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

