'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useToast } from '@/components/ui/Toast';
import { HabitWithLog } from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

interface HabitTrackerProps {
  date?: string;
  onScoreChange?: (score: number) => void;
  compact?: boolean;
}

interface DisciplineScore {
  habits: number;
  fitness: number;
  learning: number;
  total: number;
}

// ============================================================================
// HABIT ITEM COMPONENT
// ============================================================================

interface HabitItemProps {
  habit: HabitWithLog & { completed?: boolean };
  onToggle: (habitId: string, completed: boolean) => void;
  isPending: boolean;
}

function HabitItem({ habit, onToggle, isPending }: HabitItemProps) {
  const isCompleted = habit.completed || habit.log?.completed || false;
  
  return (
    <button
      onClick={() => onToggle(habit.id, !isCompleted)}
      disabled={isPending}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${
        isCompleted
          ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200'
          : 'bg-white border-2 border-slate-100 hover:border-slate-200 hover:shadow-sm'
      } ${isPending ? 'opacity-60' : ''}`}
    >
      {/* Checkbox */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-emerald-500 text-white animate-check'
            : 'border-2 border-slate-300'
        }`}
      >
        {isCompleted && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      
      {/* Icon */}
      <span className="text-2xl">{habit.icon}</span>
      
      {/* Name */}
      <span className={`flex-1 text-left font-medium ${
        isCompleted ? 'text-emerald-700' : 'text-slate-700'
      }`}>
        {habit.name}
      </span>
      
      {/* Weight badge */}
      <span className={`text-xs px-2 py-1 rounded-full ${
        isCompleted
          ? 'bg-emerald-100 text-emerald-600'
          : 'bg-slate-100 text-slate-500'
      }`}>
        +{habit.weight}
      </span>
    </button>
  );
}

// ============================================================================
// SCORE PREVIEW COMPONENT
// ============================================================================

interface ScorePreviewProps {
  score: DisciplineScore | null;
  loading: boolean;
}

function ScorePreview({ score, loading }: ScorePreviewProps) {
  if (loading || !score) {
    return (
      <div className="bg-slate-100 rounded-2xl p-6 animate-pulse">
        <div className="h-16 bg-slate-200 rounded-xl" />
      </div>
    );
  }
  
  const getGrade = (total: number) => {
    if (total >= 90) return { grade: 'S', color: 'text-yellow-500', bg: 'bg-yellow-50', message: 'Exceptional!' };
    if (total >= 80) return { grade: 'A', color: 'text-emerald-500', bg: 'bg-emerald-50', message: 'Excellent work!' };
    if (total >= 70) return { grade: 'B', color: 'text-blue-500', bg: 'bg-blue-50', message: 'Good progress!' };
    if (total >= 50) return { grade: 'C', color: 'text-amber-500', bg: 'bg-amber-50', message: 'Keep pushing!' };
    return { grade: 'D', color: 'text-slate-500', bg: 'bg-slate-50', message: 'Every step counts' };
  };
  
  const gradeInfo = getGrade(score.total);
  
  return (
    <div className={`${gradeInfo.bg} rounded-2xl p-6 border-2 border-white animate-pulse-glow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">Today's Discipline Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-5xl font-bold ${gradeInfo.color}`}>{score.total}</span>
            <span className="text-2xl text-slate-400">/100</span>
          </div>
          <p className="text-sm mt-1 text-slate-600">{gradeInfo.message}</p>
        </div>
        
        {/* Grade badge */}
        <div className={`w-16 h-16 rounded-2xl ${gradeInfo.bg} border-2 border-current ${gradeInfo.color} flex items-center justify-center`}>
          <span className="text-3xl font-black">{gradeInfo.grade}</span>
        </div>
      </div>
      
      {/* Score breakdown */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/50">
        <div className="text-center">
          <p className="text-xs text-slate-500">Habits</p>
          <p className="font-bold text-slate-700">{score.habits}/60</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Fitness</p>
          <p className="font-bold text-slate-700">{score.fitness}/20</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-500">Learning</p>
          <p className="font-bold text-slate-700">{score.learning}/20</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN HABIT TRACKER COMPONENT
// ============================================================================

export default function HabitTracker({ date, onScoreChange, compact = false }: HabitTrackerProps) {
  const [habits, setHabits] = useState<(HabitWithLog & { completed?: boolean })[]>([]);
  const [score, setScore] = useState<DisciplineScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { success, error } = useToast();
  
  const targetDate = date || new Date().toISOString().split('T')[0];

  // Fetch habits and score
  const fetchData = useCallback(async () => {
    try {
      const [habitsRes, scoreRes] = await Promise.all([
        fetch(`/api/habits?date=${targetDate}`),
        fetch(`/api/discipline/score?date=${targetDate}`),
      ]);
      
      if (habitsRes.ok) {
        const data = await habitsRes.json();
        setHabits(data.habits || []);
      }
      
      if (scoreRes.ok) {
        const scoreData = await scoreRes.json();
        setScore(scoreData);
        onScoreChange?.(scoreData.total);
      }
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  }, [targetDate, onScoreChange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Toggle habit (auto-save)
  const handleToggle = async (habitId: string, completed: boolean) => {
    // Optimistic update
    setHabits(prev => prev.map(h => 
      h.id === habitId ? { ...h, completed } : h
    ));
    
    startTransition(async () => {
      try {
        const res = await fetch('/api/habits/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ habit_id: habitId, date: targetDate, completed }),
        });
        
        if (!res.ok) throw new Error('Failed to save');
        
        const data = await res.json();
        
        // Update score
        if (data.score) {
          setScore(data.score);
          onScoreChange?.(data.score.total);
        }
        
        success(completed ? 'Habit completed! 💪' : 'Habit unmarked');
      } catch (err) {
        // Revert on error
        setHabits(prev => prev.map(h => 
          h.id === habitId ? { ...h, completed: !completed } : h
        ));
        error('Failed to save. Try again.');
      }
    });
  };

  // Mark all as done
  const handleMarkAllDone = async () => {
    const allCompleted = habits.every(h => h.completed || h.log?.completed);
    const newState = !allCompleted;
    
    // Optimistic update
    setHabits(prev => prev.map(h => ({ ...h, completed: newState })));
    
    startTransition(async () => {
      try {
        const res = await fetch('/api/habits/log', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: targetDate,
            habits: habits.map(h => ({ habit_id: h.id, completed: newState })),
          }),
        });
        
        if (!res.ok) throw new Error('Failed to save');
        
        const data = await res.json();
        
        if (data.score) {
          setScore(data.score);
          onScoreChange?.(data.score.total);
        }
        
        success(newState ? 'All habits completed! 🎉' : 'Habits reset');
      } catch (err) {
        fetchData(); // Refresh on error
        error('Failed to save. Try again.');
      }
    });
  };

  // Same as yesterday
  const handleSameAsYesterday = async () => {
    startTransition(async () => {
      try {
        const yesterday = new Date(targetDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        const res = await fetch(`/api/habits?date=${yesterdayStr}`);
        if (!res.ok) throw new Error('Failed to fetch');
        
        const data = await res.json();
        const yesterdayHabits = data.habits || [];
        
        // Apply yesterday's states
        const updates = habits.map(h => {
          const yHabit = yesterdayHabits.find((yh: any) => yh.id === h.id);
          return { habit_id: h.id, completed: yHabit?.completed || false };
        });
        
        // Optimistic update
        setHabits(prev => prev.map(h => {
          const update = updates.find(u => u.habit_id === h.id);
          return { ...h, completed: update?.completed || false };
        }));
        
        const saveRes = await fetch('/api/habits/log', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: targetDate, habits: updates }),
        });
        
        if (!saveRes.ok) throw new Error('Failed to save');
        
        const saveData = await saveRes.json();
        
        if (saveData.score) {
          setScore(saveData.score);
          onScoreChange?.(saveData.score.total);
        }
        
        success('Applied yesterday\'s habits! 📋');
      } catch (err) {
        fetchData();
        error('Could not copy from yesterday');
      }
    });
  };

  // Calculate stats
  const completedCount = habits.filter(h => h.completed || h.log?.completed).length;
  const totalCount = habits.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl">
        <span className="text-5xl mb-4 block">🎯</span>
        <p className="text-slate-600 font-medium mb-2">No habits set up yet</p>
        <p className="text-sm text-slate-500">
          Complete onboarding to get started with your personalized habits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Preview (unless compact) */}
      {!compact && <ScorePreview score={score} loading={loading} />}
      
      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleMarkAllDone}
          disabled={isPending}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            allDone
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200'
          } disabled:opacity-50`}
        >
          {allDone ? '↩ Reset All' : '✨ Mark All Done'}
        </button>
        
        <button
          onClick={handleSameAsYesterday}
          disabled={isPending}
          className="py-3 px-4 rounded-xl font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-all disabled:opacity-50"
        >
          📋 Same as Yesterday
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-500"
          style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
        />
      </div>
      
      {/* Progress text */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-500">
          {completedCount}/{totalCount} habits complete
        </span>
        {allDone && (
          <span className="text-emerald-600 font-semibold animate-check">
            🎉 Perfect day!
          </span>
        )}
      </div>
      
      {/* Habits List */}
      <div className="space-y-3">
        {habits.map(habit => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={handleToggle}
            isPending={isPending}
          />
        ))}
      </div>
      
      {/* Encouragement based on progress */}
      {completedCount > 0 && completedCount < totalCount && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 text-center">
          <p className="text-violet-700 font-medium">
            {completedCount === totalCount - 1
              ? '🔥 One more to go! You got this!'
              : `💪 ${totalCount - completedCount} habits left. Keep the momentum!`}
          </p>
        </div>
      )}
    </div>
  );
}

