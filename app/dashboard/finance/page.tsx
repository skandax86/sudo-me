'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  PiggyBank,
  Target,
  ArrowRight,
  Plus,
  Receipt,
  Home,
  Gamepad2,
  BarChart3
} from 'lucide-react';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { getDomainConfig } from '@/lib/domains';
import { DomainDashboard } from '@/components/dashboard/DomainDashboard';
import { ZenCard, ZenFade, ZenNumber, ZenProgress } from '@/components/zen';
import { 
  WeeklyRhythmLayer, 
  LongTermVisionLayer 
} from '@/components/layers';
import { LayerHeader } from '@/components/layers/LayerHeader';
import { Transaction, GeneratedPlan } from '@/types/database';
import { BUDGET_LIMITS } from '@/lib/constants';

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

// ============================================================================
// BUDGET CARD
// ============================================================================

interface BudgetCardProps {
  name: string;
  spent: number;
  limit: number;
  icon: typeof Home;
  delay?: number;
}

function BudgetCard({ name, spent, limit, icon: Icon, delay = 0 }: BudgetCardProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  const remaining = limit - spent;
  const isOverBudget = spent > limit;
  const isWarning = percentage >= 80 && !isOverBudget;
  const isElite = remaining > 0 && percentage < 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <ZenCard className="p-5" variant={isElite ? 'gold' : 'default'}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isOverBudget 
                ? 'bg-red-500/10' 
                : isWarning 
                ? 'bg-amber-500/10' 
                : 'bg-[var(--surface-2)]'
            }`}>
              <Icon size={20} className={
                isOverBudget 
                  ? 'text-red-500' 
                  : isWarning 
                  ? 'text-amber-500' 
                  : 'text-[var(--text-muted)]'
              } />
            </div>
            <div>
              <p className="text-[var(--text-primary)] font-medium">{name}</p>
              <p className="text-[var(--text-ghost)] text-xs">
                ₹{spent.toLocaleString()} / ₹{limit.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-medium ${
              isOverBudget 
                ? 'text-red-500' 
                : isElite 
                ? 'text-[var(--gold-primary)]' 
                : 'text-[var(--text-primary)]'
            }`}>
              {isOverBudget ? '-' : ''}₹{Math.abs(remaining).toLocaleString()}
            </p>
            <p className="text-[var(--text-ghost)] text-xs">
              {isOverBudget ? 'over' : 'left'}
            </p>
          </div>
        </div>

        <ZenProgress value={percentage} gold={isElite} />
      </ZenCard>
    </motion.div>
  );
}

// ============================================================================
// TRANSACTION FORM
// ============================================================================

function QuickAddTransaction({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [category, setCategory] = useState('Essentials');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      await supabase.from('transactions').insert({
        user_id: user.id,
        amount: parseFloat(amount),
        type,
        category,
        description,
        transaction_date: new Date().toISOString().split('T')[0],
      });

      setAmount('');
      setDescription('');
      onSuccess();
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[var(--text-muted)] text-xs mb-2">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-[var(--text-muted)] text-xs mb-2">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'Income' | 'Expense')}
            className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition"
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[var(--text-muted)] text-xs mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition"
        >
          <option value="Essentials">🏠 Essentials</option>
          <option value="Wants">🎮 Wants</option>
          <option value="Investments">📈 Investments</option>
          <option value="Savings">🏦 Savings</option>
          <option value="Goals">🎯 Goals</option>
        </select>
      </div>

      <div>
        <label className="block text-[var(--text-muted)] text-xs mb-2">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold-primary)] transition"
          placeholder="What was this for?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Transaction'}
      </button>
    </form>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function FinancePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceData | null>(null);

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
        .maybeSingle();

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
          if (tx.type === 'expense') {
            const cat = tx.category.toLowerCase() as keyof typeof spending;
            if (cat in spending) {
              spending[cat] += Number(tx.amount);
            }
          } else if (tx.type === 'income') {
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

  useEffect(() => {
    // Reset state on mount
    setLoading(true);
    setData(null);
    
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }
    fetchData();
  }, [pathname]);

  if (loading) {
    return (
      <div className="p-8 bg-[var(--background)] min-h-screen">
        <div className="animate-pulse">
          <div className="h-48 bg-[var(--surface-card)] rounded-[28px] mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-[var(--surface-card)] rounded-[20px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { transactions, monthlySpending, monthlyIncome } = data;
  const totalSpent = Object.values(monthlySpending).reduce((a, b) => a + b, 0);
  const netSavings = monthlyIncome - totalSpent;
  const isPositive = netSavings >= 0;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;
  const isEliteSaver = savingsRate >= 30;

  // ============================================================================
  // LAYER 2: WEEKLY/MONTHLY RHYTHM
  // ============================================================================
  const layer2Rhythms = [
    { 
      id: 'savings', 
      label: 'Savings Rate', 
      icon: '💰',
      current: Math.max(savingsRate, 0), 
      target: 30,
      unit: '%',
      frequency: 'Monthly target'
    },
    { 
      id: 'investments', 
      label: 'Investments', 
      icon: '📈',
      current: monthlySpending.investments, 
      target: 15000,
      unit: '₹',
      frequency: '₹15k/month'
    },
    { 
      id: 'budget', 
      label: 'Stay Under Budget', 
      icon: '🎯',
      current: totalSpent <= 70000 ? 100 : Math.round((70000 / totalSpent) * 100), 
      target: 100,
      unit: '%',
      frequency: 'This month'
    },
  ];

  // ============================================================================
  // LAYER 4: LONG-TERM VISION
  // ============================================================================
  const layer4Goals = [
    {
      id: 'assets',
      title: 'Build ₹5L in assets',
      icon: '💎',
      timeframe: 'short' as const,
      domain: 'Wealth',
      progress: 20, // Would calculate from actual net worth
    },
    {
      id: 'emergency',
      title: '₹1L Emergency Fund',
      icon: '🛡️',
      timeframe: 'short' as const,
      domain: 'Security',
      progress: 50,
    },
    {
      id: 'investment',
      title: 'Consistent ₹20k/month investing',
      icon: '📈',
      timeframe: 'short' as const,
      domain: 'Habit',
      progress: Math.min((monthlySpending.investments / 20000) * 100, 100),
    },
    {
      id: 'fi',
      title: 'Financial independence',
      icon: '🌴',
      timeframe: 'long' as const,
      domain: 'Life Goal',
    },
  ];

  const budgetCategories = [
    { name: 'Essentials', spent: monthlySpending.essentials, limit: BUDGET_LIMITS.ESSENTIALS, icon: Home },
    { name: 'Wants', spent: monthlySpending.wants, limit: BUDGET_LIMITS.WANTS, icon: Gamepad2 },
    { name: 'Investments', spent: monthlySpending.investments, limit: BUDGET_LIMITS.INVESTMENTS, icon: TrendingUp },
    { name: 'Savings', spent: monthlySpending.savings, limit: BUDGET_LIMITS.SAVINGS, icon: PiggyBank },
    { name: 'Goals', spent: monthlySpending.goals, limit: BUDGET_LIMITS.GOALS, icon: Target },
  ];

  return (
    <DomainDashboard config={domainConfig}>
      {/* Hero Stats */}
      <ZenFade>
        <ZenCard className="mb-8 p-6" variant={isEliteSaver ? 'gold' : 'elevated'} halo={isEliteSaver}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-[var(--text-ghost)] text-xs uppercase tracking-[0.1em] mb-1">
                This Month
              </p>
              <div className="flex items-baseline gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-[var(--status-success)]" />
                    <ZenNumber 
                      value={monthlyIncome} 
                      prefix="₹"
                      className="text-3xl"
                    />
                  </div>
                  <p className="text-[var(--text-ghost)] text-xs">Income</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingDown size={20} className="text-red-500" />
                    <ZenNumber 
                      value={totalSpent} 
                      prefix="₹"
                      className="text-3xl"
                    />
                  </div>
                  <p className="text-[var(--text-ghost)] text-xs">Spent</p>
                </div>
                <div>
                  <ZenNumber 
                    value={Math.abs(netSavings)} 
                    prefix={isPositive ? '+₹' : '-₹'}
                    className="text-3xl"
                    gold={isPositive}
                  />
                  <p className="text-[var(--text-ghost)] text-xs">
                    {isPositive ? 'Saved' : 'Deficit'}
                  </p>
                </div>
              </div>
            </div>

            {isEliteSaver && (
              <div className="px-4 py-2 bg-[var(--gold-soft)] rounded-2xl">
                <span className="text-[var(--gold-primary)] font-medium">
                  🌟 {savingsRate}% savings rate!
                </span>
              </div>
            )}
          </div>
        </ZenCard>
      </ZenFade>

      {/* Budget Categories - LAYER 1 equivalent (Daily/Ongoing Actions) */}
      <ZenFade delay={0.1}>
        <div className="mb-8">
          <LayerHeader
            title="Monthly Budget"
            subtitle="Stay within your limits"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetCategories.map((cat, idx) => (
              <BudgetCard
                key={cat.name}
                name={cat.name}
                spent={cat.spent}
                limit={cat.limit}
                icon={cat.icon}
                delay={0.1 + idx * 0.05}
              />
            ))}
          </div>
        </div>
      </ZenFade>

      {/* LAYER 2: Monthly Rhythm */}
      <WeeklyRhythmLayer rhythms={layer2Rhythms} />

      {/* Quick Add + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ZenFade delay={0.2}>
          <div>
            <LayerHeader title="Quick Add" subtitle="Log a transaction" />
            <ZenCard className="p-6">
              <QuickAddTransaction onSuccess={fetchData} />
            </ZenCard>
          </div>
        </ZenFade>

        <ZenFade delay={0.25}>
          <div>
            <LayerHeader 
              title="Recent Transactions" 
              subtitle={`${transactions.length} this month`}
            />
            <ZenCard className="p-0 overflow-hidden">
              {transactions.length > 0 ? (
                <div className="divide-y divide-[var(--border-subtle)] max-h-[400px] overflow-y-auto">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-[var(--surface-2)] transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-amber-500/10'
                        }`}>
                          {tx.type === 'income' ? (
                            <TrendingUp size={18} className="text-emerald-500" />
                          ) : (
                            <Receipt size={18} className="text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-[var(--text-primary)] font-medium">
                            {tx.description || tx.category}
                          </p>
                          <p className="text-[var(--text-ghost)] text-xs">
                            {new Date(tx.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`font-medium ${
                        tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Wallet size={32} className="text-[var(--text-ghost)] mx-auto mb-3" />
                  <p className="text-[var(--text-muted)]">No transactions yet</p>
                </div>
              )}
            </ZenCard>
          </div>
        </ZenFade>
      </div>

      {/* LAYER 4: Long-Term Vision */}
      <LongTermVisionLayer goals={layer4Goals} defaultCollapsed={true} />
    </DomainDashboard>
  );
}
