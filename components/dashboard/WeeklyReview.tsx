'use client';

import { useState } from 'react';
import { DailyLog } from '@/types/database';
import { ProgressComparison } from '@/lib/gamification';

// ============================================================================
// WEEKLY REVIEW MODAL
// ============================================================================

interface WeeklyReviewProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  weekData: WeekData;
}

export interface WeekData {
  // Summary stats
  daysLogged: number;
  habitsCompleted: number;
  totalHabits: number;
  workoutsCompleted: number;
  avgDisciplineScore: number;
  
  // Learning
  leetCodeSolved: number;
  pagesRead: number;
  studyHours: number;
  
  // Finance
  totalSpent: number;
  budgetStatus: 'under' | 'over' | 'on_track';
  savedAmount: number;
  
  // Streak
  currentStreak: number;
  streakMaintained: boolean;
  
  // Comparisons
  vsLastWeek: ProgressComparison[];
  
  // AI insights (optional)
  aiInsight?: string;
  focusForNextWeek?: string;
}

export function WeeklyReview({ isOpen, onClose, weekNumber, weekData }: WeeklyReviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  if (!isOpen) return null;

  const habitPercentage = weekData.totalHabits > 0 
    ? Math.round((weekData.habitsCompleted / weekData.totalHabits) * 100) 
    : 0;

  const slides = [
    // Slide 1: Overview
    {
      title: `Week ${weekNumber} Complete! 🎉`,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {weekData.avgDisciplineScore >= 80 ? '🏆' : 
               weekData.avgDisciplineScore >= 60 ? '💪' : 
               weekData.avgDisciplineScore >= 40 ? '📈' : '🌱'}
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {weekData.daysLogged}/7 days logged
            </p>
            <p className="text-slate-500">
              Avg Discipline Score: <span className="font-bold text-violet-600">{weekData.avgDisciplineScore}</span>
            </p>
          </div>
          
          {weekData.streakMaintained && weekData.currentStreak > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <span className="text-2xl">🔥</span>
              <p className="font-bold text-orange-700">
                {weekData.currentStreak} day streak maintained!
              </p>
            </div>
          )}
        </div>
      ),
    },
    
    // Slide 2: Habits & Fitness
    {
      title: 'Habits & Fitness',
      content: (
        <div className="space-y-6">
          <div className="bg-emerald-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600">Habits Completed</span>
              <span className="text-2xl font-bold text-emerald-600">{habitPercentage}%</span>
            </div>
            <div className="h-3 bg-emerald-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${habitPercentage}%` }}
              />
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {weekData.habitsCompleted} of {weekData.totalHabits} habits done
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{weekData.workoutsCompleted}</p>
              <p className="text-sm text-slate-500">Workouts</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{weekData.avgDisciplineScore}</p>
              <p className="text-sm text-slate-500">Avg Score</p>
            </div>
          </div>
        </div>
      ),
    },
    
    // Slide 3: Learning
    {
      title: 'Learning Progress',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-cyan-50 rounded-xl p-4 text-center">
              <span className="text-2xl">💻</span>
              <p className="text-2xl font-bold text-cyan-600">{weekData.leetCodeSolved}</p>
              <p className="text-xs text-slate-500">LeetCode</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <span className="text-2xl">📚</span>
              <p className="text-2xl font-bold text-blue-600">{weekData.pagesRead}</p>
              <p className="text-xs text-slate-500">Pages</p>
            </div>
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <span className="text-2xl">⏱️</span>
              <p className="text-2xl font-bold text-indigo-600">{weekData.studyHours}h</p>
              <p className="text-xs text-slate-500">Study</p>
            </div>
          </div>
          
          {weekData.leetCodeSolved > 10 && (
            <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-xl p-4 text-center">
              <span className="text-xl">🎯</span>
              <p className="font-medium text-cyan-800">
                Great week for LeetCode! Keep this momentum.
              </p>
            </div>
          )}
        </div>
      ),
    },
    
    // Slide 4: Finance
    {
      title: 'Money Matters',
      content: (
        <div className="space-y-4">
          <div className={`rounded-xl p-6 text-center ${
            weekData.budgetStatus === 'under' ? 'bg-emerald-50' :
            weekData.budgetStatus === 'over' ? 'bg-red-50' :
            'bg-amber-50'
          }`}>
            <span className="text-3xl">
              {weekData.budgetStatus === 'under' ? '✅' :
               weekData.budgetStatus === 'over' ? '⚠️' : '📊'}
            </span>
            <p className={`text-xl font-bold mt-2 ${
              weekData.budgetStatus === 'under' ? 'text-emerald-700' :
              weekData.budgetStatus === 'over' ? 'text-red-700' :
              'text-amber-700'
            }`}>
              {weekData.budgetStatus === 'under' ? 'Under Budget!' :
               weekData.budgetStatus === 'over' ? 'Over Budget' :
               'On Track'}
            </p>
            <p className="text-slate-500 mt-1">
              Spent: ₹{weekData.totalSpent.toLocaleString()}
            </p>
          </div>
          
          {weekData.savedAmount > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="font-medium text-green-700">
                💰 Saved ₹{weekData.savedAmount.toLocaleString()} this week
              </p>
            </div>
          )}
        </div>
      ),
    },
    
    // Slide 5: Comparison & Next Week
    {
      title: 'You vs Last Week',
      content: (
        <div className="space-y-4">
          {weekData.vsLastWeek.length > 0 ? (
            <div className="space-y-3">
              {weekData.vsLastWeek.map((comp) => (
                <div 
                  key={comp.metric}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    comp.trend === 'up' ? 'bg-emerald-50' :
                    comp.trend === 'down' ? 'bg-red-50' :
                    'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{comp.icon}</span>
                    <span className="text-slate-700">{comp.metric}</span>
                  </div>
                  <span className={`font-bold ${
                    comp.trend === 'up' ? 'text-emerald-600' :
                    comp.trend === 'down' ? 'text-red-600' :
                    'text-slate-500'
                  }`}>
                    {comp.change} {comp.trend === 'up' ? '↑' : comp.trend === 'down' ? '↓' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">
              Complete this week to see comparisons!
            </p>
          )}
          
          {weekData.focusForNextWeek && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
              <p className="text-sm text-violet-600 font-medium mb-1">Focus for Week {weekNumber + 1}:</p>
              <p className="text-violet-800">{weekData.focusForNextWeek}</p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 p-6 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{slides[currentSlide].title}</h2>
            <button onClick={onClose} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
          
          {/* Slide indicators */}
          <div className="flex gap-1 mt-4">
            {slides.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 flex-1 rounded-full transition-all ${
                  idx === currentSlide ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 min-h-[300px]">
          {slides[currentSlide].content}
        </div>
        
        {/* Navigation */}
        <div className="p-6 pt-0 flex justify-between">
          <button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            className="px-4 py-2 text-slate-500 disabled:opacity-30"
          >
            ← Back
          </button>
          
          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => setCurrentSlide(currentSlide + 1)}
              className="px-6 py-2 bg-violet-500 text-white font-bold rounded-xl hover:bg-violet-600"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl hover:from-violet-600 hover:to-indigo-600"
            >
              Let&apos;s Go! 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// WEEK REVIEW TRIGGER CARD
// ============================================================================

interface WeekReviewTriggerProps {
  weekNumber: number;
  onClick: () => void;
  isAvailable: boolean;
}

export function WeekReviewTrigger({ weekNumber, onClick, isAvailable }: WeekReviewTriggerProps) {
  if (!isAvailable) return null;

  return (
    <button
      onClick={onClick}
      className="w-full bg-gradient-to-r from-violet-100 to-indigo-100 border-2 border-violet-300 rounded-2xl p-4 text-left hover:from-violet-200 hover:to-indigo-200 transition-all mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <p className="font-bold text-violet-800">Week {weekNumber} Review Ready!</p>
            <p className="text-sm text-violet-600">See your progress summary</p>
          </div>
        </div>
        <span className="text-violet-500">→</span>
      </div>
    </button>
  );
}

