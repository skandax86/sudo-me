'use client';

import { DailyWin } from '@/lib/gamification';

interface WinsSectionProps {
  wins: DailyWin[];
  streak: number;
}

export function WinsSection({ wins, streak }: WinsSectionProps) {
  if (wins.length === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-6 mb-6 border border-slate-200">
        <h3 className="font-bold text-slate-600 mb-2">Today's Wins</h3>
        <p className="text-slate-400 text-sm">
          Complete some habits to see your wins here! 💪
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-6 mb-6 border border-emerald-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-emerald-800 flex items-center gap-2">
          <span className="text-xl">🏆</span> Today&apos;s Wins
        </h3>
        {streak > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
            🔥 {streak} day streak
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {wins.map((win) => (
          <div
            key={win.id}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-xl border border-emerald-200 shadow-sm"
          >
            <span className="text-lg">{win.icon}</span>
            <span className="text-emerald-800 font-medium text-sm">{win.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CELEBRATION MODAL
// ============================================================================

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emoji: string;
  xpEarned?: number;
}

export function CelebrationModal({ isOpen, onClose, title, message, emoji, xpEarned }: CelebrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl animate-bounce-in">
        {/* Confetti effect via CSS */}
        <div className="text-7xl mb-4 animate-bounce">{emoji}</div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
        <p className="text-slate-600 mb-6">{message}</p>
        
        {xpEarned && (
          <div className="inline-block px-4 py-2 bg-violet-100 text-violet-700 rounded-full font-bold mb-6">
            +{xpEarned} XP
          </div>
        )}
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-600 transition"
        >
          Keep Going! 🚀
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PROGRESS COMPARISON CARD
// ============================================================================

import { ProgressComparison } from '@/lib/gamification';

interface ProgressComparisonCardProps {
  title: string;
  comparisons: ProgressComparison[];
  period: string;
}

export function ProgressComparisonCard({ title, comparisons, period }: ProgressComparisonCardProps) {
  if (comparisons.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-4">{period}</p>
      
      <div className="space-y-3">
        {comparisons.map((comp) => (
          <div key={comp.metric} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>{comp.icon}</span>
              <span className="text-slate-700">{comp.metric}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                comp.trend === 'up' ? 'text-emerald-600' : 
                comp.trend === 'down' ? 'text-red-500' : 
                'text-slate-500'
              }`}>
                {comp.change}
              </span>
              {comp.trend === 'up' && <span className="text-emerald-500">↑</span>}
              {comp.trend === 'down' && <span className="text-red-500">↓</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// LEVEL PROGRESS CARD
// ============================================================================

import { Level, getXPProgress } from '@/lib/gamification';

interface LevelCardProps {
  level: Level;
  xp: number;
}

export function LevelCard({ level, xp }: LevelCardProps) {
  const progress = getXPProgress(xp);

  return (
    <div className={`bg-gradient-to-r ${level.color} rounded-2xl p-6 text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white/70 text-sm">Level {level.level}</p>
          <h3 className="text-2xl font-bold">{level.title}</h3>
        </div>
        <span className="text-4xl">{level.icon}</span>
      </div>
      
      <p className="text-white/80 text-sm mb-4">{level.description}</p>
      
      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-white h-full transition-all duration-500 rounded-full"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-sm text-white/80">
        <span>{progress.current} XP</span>
        <span>{progress.needed} XP to next level</span>
      </div>
    </div>
  );
}

// ============================================================================
// STREAK PROTECTION INDICATOR
// ============================================================================

interface StreakProtectionProps {
  forgivenessDaysRemaining: number;
  currentStreak: number;
}

export function StreakProtection({ forgivenessDaysRemaining, currentStreak }: StreakProtectionProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛡️</span>
          <span className="font-medium text-amber-800">Streak Protection</span>
        </div>
        <span className="text-amber-600 text-sm">
          {forgivenessDaysRemaining} forgiveness {forgivenessDaysRemaining === 1 ? 'day' : 'days'} left
        </span>
      </div>
      {currentStreak > 7 && (
        <p className="text-amber-600 text-sm mt-2">
          Life happens. Use a forgiveness day to protect your {currentStreak}-day streak.
        </p>
      )}
    </div>
  );
}

