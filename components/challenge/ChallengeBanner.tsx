'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ============================================================================
// TYPES
// ============================================================================

interface ChallengeStatus {
  active: boolean;
  session_id?: string;
  challenge_type?: '75_hard' | '75_soft';
  current_day?: number;
  total_days?: number;
  remaining_tasks?: string[];
  on_track?: boolean;
  progress_percent?: number;
  completed_days?: number;
}

// ============================================================================
// BANNER COMPONENT
// ============================================================================

export default function ChallengeBanner() {
  const [status, setStatus] = useState<ChallengeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/challenge/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching challenge status:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-24 bg-slate-100 rounded-2xl animate-pulse mb-6" />
    );
  }

  if (!status?.active) {
    return null; // No active challenge
  }

  const isHard = status.challenge_type === '75_hard';
  const remaining = status.remaining_tasks?.length || 0;
  const allDone = remaining === 0;

  return (
    <Link href="/dashboard/discipline" className="block">
      <div
        className={`relative overflow-hidden rounded-2xl p-6 mb-6 transition-all hover:scale-[1.01] hover:shadow-xl cursor-pointer ${
          isHard
            ? 'bg-gradient-to-r from-red-500 via-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500'
        } text-white`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative flex items-center justify-between">
          {/* Left: Day Counter */}
          <div className="flex items-center gap-4">
            <div className="text-5xl">
              {isHard ? '🔥' : '🌱'}
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wide">
                {isHard ? '75 Hard' : '75 Soft'} • Day
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">{status.current_day}</span>
                <span className="text-xl text-white/70">/ 75</span>
              </div>
            </div>
          </div>

          {/* Middle: Progress Bar */}
          <div className="flex-1 mx-8 hidden md:block">
            <div className="bg-white/20 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-500"
                style={{ width: `${status.progress_percent || 0}%` }}
              />
            </div>
            <p className="text-xs text-white/70 mt-1 text-center">
              {status.progress_percent}% complete
            </p>
          </div>

          {/* Right: Status */}
          <div className="text-right">
            {allDone ? (
              <div>
                <p className="text-2xl font-bold">✅ Done!</p>
                <p className="text-sm text-white/80">All tasks complete</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold">{remaining} left</p>
                <p className="text-sm text-white/80">
                  {isHard ? 'Complete all to pass' : 'Keep pushing'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning for 75 Hard */}
        {isHard && !allDone && (
          <div className="mt-4 bg-black/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <span>⚠️</span>
            <span className="text-sm">
              Miss any task today and your 75 Hard resets to Day 1
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// COMPACT VERSION (for sidebar or header)
// ============================================================================

export function ChallengeBadge() {
  const [status, setStatus] = useState<ChallengeStatus | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/challenge/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Error fetching challenge status:', error);
      }
    }

    fetchStatus();
  }, []);

  if (!status?.active) return null;

  const isHard = status.challenge_type === '75_hard';

  return (
    <Link
      href="/dashboard/discipline"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
        isHard
          ? 'bg-red-100 text-red-700'
          : 'bg-emerald-100 text-emerald-700'
      }`}
    >
      <span>{isHard ? '🔥' : '🌱'}</span>
      Day {status.current_day}/75
    </Link>
  );
}

