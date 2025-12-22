'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { Transaction, GeneratedPlan } from '@/types/database';
import { BUDGET_LIMITS } from '@/lib/constants';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard, FeatureSection, ComingSoon } from '@/components/dashboard/DomainDashboard';
import { MetricWidget } from '@/components/dashboard/widgets/BaseWidget';

const domainConfig = getDomainConfig('finance');

interface FinanceData {
  transactions: Transaction[];
  monthlySpending: {
    essentials: number;
    wants: number;
    investments: number;
    savings: number;
    goals: number;
  };
  monthlyIncome: number;
  budgetAllocation: GeneratedPlan['budgetAllocation'] | null;
}

export default function FinancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState<string>('Essentials');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Fetch profile for budget allocation
      const { data: profile } = await supabase
        .from('profiles')
        .select('generated_plan')
        .eq('id', user.id)
        .single();

      // Get current month's transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false });

      if (transactions) {
        const spending = {
          essentials: 0,
          wants: 0,
          investments: 0,
          savings: 0,
          goals: 0,
        };

        let income = 0;

        transactions.forEach((tx: Transaction) => {
          if (tx.type === 'Expense') {
            const cat = tx.category.toLowerCase() as keyof typeof spending;
            if (cat in spending) {
              spending[cat] += Number(tx.amount);
            }
          } else {
            income += Number(tx.amount);
          }
        });

        setData({
          transactions,
          monthlySpending: spending,
          monthlyIncome: income,
          budgetAllocation: profile?.generated_plan?.budgetAllocation || null,
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: parseFloat(amount),
          type,
          category,
          description,
          transaction_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setAmount('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to add transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const getBudgetHealth = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { color: 'bg-red-500', status: 'danger' };
    if (percentage >= 90) return { color: 'bg-orange-500', status: 'warning' };
    if (percentage >= 75) return { color: 'bg-amber-500', status: 'caution' };
    return { color: 'bg-emerald-500', status: 'good' };
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-40 bg-slate-200 rounded-2xl mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { transactions, monthlySpending, monthlyIncome } = data;
  const totalSpent = Object.values(monthlySpending).reduce((a, b) => a + b, 0);
  const netSavings = monthlyIncome - totalSpent;

  return (
    <DomainDashboard config={domainConfig}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricWidget
          title="Income"
          value={`₹${monthlyIncome.toLocaleString()}`}
          icon="💵"
          subtitle="This month"
          color="success"
        />
        <MetricWidget
          title="Spent"
          value={`₹${totalSpent.toLocaleString()}`}
          icon="💳"
          subtitle="This month"
        />
        <MetricWidget
          title="Net"
          value={`₹${Math.abs(netSavings).toLocaleString()}`}
          icon={netSavings >= 0 ? '📈' : '📉'}
          subtitle={netSavings >= 0 ? 'Saved' : 'Deficit'}
          color={netSavings >= 0 ? 'success' : 'danger'}
        />
        <MetricWidget
          title="Transactions"
          value={transactions.length}
          icon="🧾"
          subtitle="This month"
        />
      </div>

      {/* Budget Overview */}
      <FeatureSection title="Monthly Budget">
        <div className="bg-white rounded-2xl p-6 border border-slate-100">
          <div className="space-y-4">
            {[
              { name: 'Essentials', spent: monthlySpending.essentials, limit: BUDGET_LIMITS.ESSENTIALS, icon: '🏠' },
              { name: 'Wants', spent: monthlySpending.wants, limit: BUDGET_LIMITS.WANTS, icon: '🎮' },
              { name: 'Investments', spent: monthlySpending.investments, limit: BUDGET_LIMITS.INVESTMENTS, icon: '📈' },
              { name: 'Savings', spent: monthlySpending.savings, limit: BUDGET_LIMITS.SAVINGS, icon: '🏦' },
              { name: 'Goals', spent: monthlySpending.goals, limit: BUDGET_LIMITS.GOALS, icon: '🎯' },
            ].map((item) => {
              const health = getBudgetHealth(item.spent, item.limit);
              const percentage = Math.min((item.spent / item.limit) * 100, 100);
              
              return (
                <div key={item.name} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-sm text-slate-600">
                      ₹{item.spent.toLocaleString()} / ₹{item.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full ${health.color} transition-all duration-500 rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">{percentage.toFixed(0)}% used</span>
                    <span className="text-xs text-slate-500">
                      ₹{(item.limit - item.spent).toLocaleString()} left
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FeatureSection>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Transaction Form */}
        <FeatureSection title="Add Transaction">
          <div className="bg-white rounded-2xl p-6 border border-slate-100">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-4 text-sm">
                ✅ Transaction added!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  >
                    <option value="Essentials">🏠 Essentials</option>
                    <option value="Wants">🎮 Wants</option>
                    <option value="Investments">📈 Investments</option>
                    <option value="Savings">🏦 Savings</option>
                    <option value="Goals">🎯 Goals</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  placeholder="What was this for?"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-3 rounded-xl font-bold hover:from-amber-600 hover:to-yellow-600 transition disabled:opacity-50"
              >
                {formLoading ? 'Adding...' : 'Add Transaction'}
              </button>
            </form>
          </div>
        </FeatureSection>

        {/* Recent Transactions */}
        <FeatureSection title="Recent Transactions">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {transactions.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === 'Income' ? 'bg-emerald-100' : 'bg-amber-100'
                      }`}>
                        {tx.category === 'Essentials' && '🏠'}
                        {tx.category === 'Wants' && '🎮'}
                        {tx.category === 'Investments' && '📈'}
                        {tx.category === 'Savings' && '🏦'}
                        {tx.category === 'Goals' && '🎯'}
                        {tx.type === 'Income' && '💵'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {tx.description || tx.category}
                        </p>
                        <p className="text-xs text-slate-500">
                          {tx.category} • {new Date(tx.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${
                      tx.type === 'Income' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {tx.type === 'Income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-4xl mb-3">💰</p>
                <p>No transactions this month</p>
              </div>
            )}
          </div>
        </FeatureSection>
      </div>

      {/* AI Financial Advisor */}
      <FeatureSection title="AI Financial Advisor">
        <ComingSoon
          feature="Smart Money Insights"
          description="Get personalized spending analysis, savings recommendations, and investment tips based on your financial habits."
        />
      </FeatureSection>
    </DomainDashboard>
  );
}
