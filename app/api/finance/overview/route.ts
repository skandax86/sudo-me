import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FinanceOverview } from '@/types/database';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

    // Fetch accounts and transactions in parallel
    const [accountsResult, transactionsResult, budgetResult, profileResult] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', user.id),
      supabase.from('transactions')
        .select('amount, type, category')
        .eq('user_id', user.id)
        .gte('transaction_date', monthStart),
      supabase.from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', monthStart)
        .maybeSingle(),
      supabase.from('profiles').select('preferences').eq('id', user.id).single(),
    ]);

    const accounts = accountsResult.data || [];
    const transactions = transactionsResult.data || [];
    const budget = budgetResult.data;
    const monthlyBudget = profileResult.data?.preferences?.monthlyBudget || 50000;

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    let totalSpent = 0;

    transactions.forEach(t => {
      if (t.type === 'expense' || t.amount < 0) {
        const amount = Math.abs(t.amount);
        totalSpent += amount;
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + amount;
      }
    });

    // Calculate income
    const totalIncome = transactions
      .filter(t => t.type === 'income' || t.amount > 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Determine budget health
    const budgetLimit = budget?.wants_limit 
      ? (budget.essentials_limit + budget.wants_limit + budget.goals_target)
      : monthlyBudget;
    
    let budgetHealth: 'green' | 'yellow' | 'red' = 'green';
    if (totalSpent > budgetLimit * 0.9) {
      budgetHealth = 'red';
    } else if (totalSpent > budgetLimit * 0.7) {
      budgetHealth = 'yellow';
    }

    const overview: FinanceOverview = {
      balance: totalBalance,
      spent_this_month: totalSpent,
      budget_health: budgetHealth,
      accounts: accounts.map(acc => ({
        id: acc.id,
        name: acc.name,
        balance: acc.current_balance,
      })),
      spending_by_category: spendingByCategory,
    };

    return NextResponse.json({
      ...overview,
      income_this_month: totalIncome,
      budget_limit: budgetLimit,
      remaining: budgetLimit - totalSpent,
    });
  } catch (error) {
    console.error('Finance overview error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview' }, { status: 500 });
  }
}

