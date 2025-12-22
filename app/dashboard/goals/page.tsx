'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { Goal } from '@/types/database';

export default function GoalsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<'short' | 'mid' | 'long'>('short');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    fetchGoals();
  }, [router]);

  const fetchGoals = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setGoals(data);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Calculate due date based on timeframe
      const dueDate = new Date();
      if (activeTimeframe === 'short') {
        dueDate.setDate(dueDate.getDate() + 90);
      } else if (activeTimeframe === 'mid') {
        dueDate.setMonth(dueDate.getMonth() + 6);
      } else {
        dueDate.setFullYear(dueDate.getFullYear() + 1);
      }

      const { error: insertError } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title,
          description,
          timeframe: activeTimeframe,
          category,
          target_value: targetValue ? parseFloat(targetValue) : null,
          current_value: 0,
          unit: unit || null,
          status: 'active',
          due_date: dueDate.toISOString().split('T')[0],
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setTitle('');
      setDescription('');
      setTargetValue('');
      setUnit('');
      fetchGoals();
    } catch (err: any) {
      setError(err.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;

      fetchGoals();
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const completeGoal = async (goalId: string) => {
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('goals')
        .update({ status: 'completed' })
        .eq('id', goalId);

      if (error) throw error;

      fetchGoals();
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const filteredGoals = goals.filter(g => g.timeframe === activeTimeframe);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">🎯 Goals</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Timeframe Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'short', label: 'Short-term (90 days)' },
            { key: 'mid', label: 'Mid-term (6 months)' },
            { key: 'long', label: 'Long-term (1 year)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTimeframe(tab.key as 'short' | 'mid' | 'long')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTimeframe === tab.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Add Goal Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Goal</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
                ✅ Goal created!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., Complete AWS Certification"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Why is this goal important?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Finance">Finance</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Career">Career</option>
                  <option value="Learning">Learning</option>
                  <option value="Personal">Personal</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value
                  </label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="problems, ₹, kg, etc."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </form>
          </div>

          {/* Goals List */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {activeTimeframe === 'short' && 'Short-term Goals (90 days)'}
              {activeTimeframe === 'mid' && 'Mid-term Goals (6 months)'}
              {activeTimeframe === 'long' && 'Long-term Goals (1 year)'}
            </h2>

            {filteredGoals.length > 0 ? (
              <ul className="space-y-4">
                {filteredGoals.map((goal) => {
                  const progress = goal.target_value 
                    ? (Number(goal.current_value) / Number(goal.target_value)) * 100 
                    : 0;
                  
                  return (
                    <li key={goal.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {goal.category}
                          </span>
                        </div>
                        <button
                          onClick={() => completeGoal(goal.id)}
                          className="text-green-600 hover:text-green-700 text-sm"
                        >
                          ✓ Complete
                        </button>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                      )}
                      
                      {goal.target_value && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{goal.current_value} / {goal.target_value} {goal.unit}</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <input
                            type="number"
                            placeholder="Update progress"
                            className="mt-2 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const value = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(value)) {
                                  updateGoalProgress(goal.id, value);
                                  (e.target as HTMLInputElement).value = '';
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                      
                      {goal.due_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          Due: {new Date(goal.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No goals yet. Create your first goal!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
