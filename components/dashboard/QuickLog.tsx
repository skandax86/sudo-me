'use client';

import { useState } from 'react';

// ============================================================================
// QUICK LOG SHORTCUTS
// ============================================================================

interface QuickLogProps {
  onQuickAction: (action: QuickAction) => void;
  todayLogExists: boolean;
  lastLogData?: LastLogData;
}

export type QuickAction = 
  | { type: 'same_as_yesterday' }
  | { type: 'rest_day' }
  | { type: 'all_habits_done' }
  | { type: 'quick_workout'; workoutType: string }
  | { type: 'quick_expense'; amount: number; category: string };

interface LastLogData {
  workout_type?: string;
  water_intake_oz?: number;
  sleep_hours?: number;
  woke_up_at_6am?: boolean;
  cold_shower?: boolean;
  no_phone_first_hour?: boolean;
  meditated?: boolean;
  planned_tomorrow?: boolean;
}

export function QuickLogBar({ onQuickAction, todayLogExists, lastLogData }: QuickLogProps) {
  if (todayLogExists) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-medium text-amber-800">Quick Log</span>
        </div>
        <span className="text-xs text-amber-600">One tap = done</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {lastLogData && (
          <button
            onClick={() => onQuickAction({ type: 'same_as_yesterday' })}
            className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-amber-700 font-medium hover:bg-amber-100 transition text-sm"
          >
            📋 Same as yesterday
          </button>
        )}
        
        <button
          onClick={() => onQuickAction({ type: 'all_habits_done' })}
          className="px-4 py-2 bg-white border border-emerald-300 rounded-xl text-emerald-700 font-medium hover:bg-emerald-100 transition text-sm"
        >
          ✅ All habits done
        </button>
        
        <button
          onClick={() => onQuickAction({ type: 'rest_day' })}
          className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-slate-600 font-medium hover:bg-slate-100 transition text-sm"
        >
          😴 Rest day
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK WORKOUT BUTTONS
// ============================================================================

interface QuickWorkoutProps {
  onSelect: (type: string) => void;
  selected?: string;
}

export function QuickWorkoutButtons({ onSelect, selected }: QuickWorkoutProps) {
  const workoutTypes = [
    { id: 'gym', icon: '🏋️', label: 'Gym' },
    { id: 'cardio', icon: '🏃', label: 'Cardio' },
    { id: 'yoga', icon: '🧘', label: 'Yoga' },
    { id: 'sports', icon: '⚽', label: 'Sports' },
    { id: 'rest', icon: '😴', label: 'Rest' },
  ];

  return (
    <div className="grid grid-cols-5 gap-2">
      {workoutTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.id)}
          className={`p-3 rounded-xl text-center transition ${
            selected === type.id
              ? 'bg-violet-100 border-2 border-violet-400'
              : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
          }`}
        >
          <span className="text-2xl block">{type.icon}</span>
          <span className="text-xs text-slate-600">{type.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// QUICK EXPENSE MODAL
// ============================================================================

interface QuickExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number, category: string, note: string) => void;
}

export function QuickExpenseModal({ isOpen, onClose, onSubmit }: QuickExpenseProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Essentials');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const presetAmounts = [100, 200, 500, 1000, 2000];
  const categories = [
    { id: 'Essentials', icon: '🏠' },
    { id: 'Wants', icon: '🎮' },
    { id: 'Food', icon: '🍔' },
    { id: 'Transport', icon: '🚗' },
    { id: 'Shopping', icon: '🛍️' },
  ];

  const handleSubmit = () => {
    if (!amount) return;
    onSubmit(parseFloat(amount), category, note);
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Quick Expense</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          
          {/* Amount Input */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-3xl font-bold text-slate-800 justify-center mb-4">
              <span>₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-32 text-center border-b-2 border-slate-300 focus:border-violet-500 outline-none"
              />
            </div>
            
            {/* Preset amounts */}
            <div className="flex justify-center gap-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset.toString())}
                  className="px-3 py-1 bg-slate-100 rounded-lg text-sm text-slate-600 hover:bg-slate-200"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
          
          {/* Category */}
          <div className="mb-4">
            <p className="text-sm text-slate-500 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                    category === cat.id
                      ? 'bg-violet-100 text-violet-700 border-2 border-violet-300'
                      : 'bg-slate-50 text-slate-600 border-2 border-transparent'
                  }`}
                >
                  {cat.icon} {cat.id}
                </button>
              ))}
            </div>
          </div>
          
          {/* Note (optional) */}
          <div className="mb-6">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What was this for? (optional)"
              className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-violet-400 outline-none"
            />
          </div>
          
          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!amount}
            className="w-full py-4 bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold rounded-xl disabled:opacity-50"
          >
            Log Expense
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FLOATING ACTION BUTTON
// ============================================================================

interface FloatingLogButtonProps {
  onLogClick: () => void;
  onExpenseClick: () => void;
  hasLoggedToday: boolean;
}

export function FloatingLogButton({ onLogClick, onExpenseClick, hasLoggedToday }: FloatingLogButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isExpanded && (
        <div className="absolute bottom-16 right-0 space-y-2 animate-fade-in">
          <button
            onClick={() => { onLogClick(); setIsExpanded(false); }}
            className="flex items-center gap-2 px-4 py-3 bg-white shadow-lg rounded-full text-slate-700 hover:bg-slate-50"
          >
            <span>📝</span>
            <span className="font-medium">{hasLoggedToday ? 'Update Log' : 'Daily Log'}</span>
          </button>
          <button
            onClick={() => { onExpenseClick(); setIsExpanded(false); }}
            className="flex items-center gap-2 px-4 py-3 bg-white shadow-lg rounded-full text-slate-700 hover:bg-slate-50"
          >
            <span>💸</span>
            <span className="font-medium">Quick Expense</span>
          </button>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all ${
          isExpanded
            ? 'bg-slate-200 rotate-45'
            : 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white'
        }`}
      >
        {isExpanded ? '✕' : '+'}
      </button>
    </div>
  );
}

// ============================================================================
// HABIT TOGGLE ROW (For quick daily logging)
// ============================================================================

interface HabitToggleRowProps {
  habits: Array<{
    id: string;
    label: string;
    icon: string;
    checked: boolean;
  }>;
  onToggle: (id: string) => void;
}

export function HabitToggleRow({ habits, onToggle }: HabitToggleRowProps) {
  return (
    <div className="space-y-2">
      {habits.map((habit) => (
        <button
          key={habit.id}
          onClick={() => onToggle(habit.id)}
          className={`w-full flex items-center gap-3 p-4 rounded-xl transition ${
            habit.checked
              ? 'bg-emerald-50 border-2 border-emerald-300'
              : 'bg-white border-2 border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-2xl">{habit.icon}</span>
          <span className={`flex-1 text-left font-medium ${
            habit.checked ? 'text-emerald-700' : 'text-slate-700'
          }`}>
            {habit.label}
          </span>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
            habit.checked ? 'bg-emerald-500 text-white' : 'bg-slate-200'
          }`}>
            {habit.checked ? '✓' : ''}
          </span>
        </button>
      ))}
    </div>
  );
}

