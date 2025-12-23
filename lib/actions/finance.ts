'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Account, Transaction, TransactionType } from '@/types/database';

/**
 * Get all accounts for user
 */
export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return accounts || [];
}

/**
 * Create a new account
 */
export async function createAccount(
  name: string,
  type: 'bank' | 'cash' | 'wallet' | 'credit',
  openingBalance: number = 0
): Promise<Account> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Check if this should be default (first account)
  const { count } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { data: account, error } = await supabase
    .from('accounts')
    .insert({
      user_id: user.id,
      name,
      type,
      opening_balance: openingBalance,
      current_balance: openingBalance,
      is_default: count === 0,
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard/finance');
  return account;
}

/**
 * Quick add transaction (minimal fields)
 */
export async function addTransaction(
  amount: number,
  type: TransactionType,
  category: string,
  accountId?: string,
  note?: string,
  subcategory?: string
): Promise<Transaction> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const now = new Date();
  const adjustedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      datetime: now.toISOString(),
      type,
      account_id: accountId || null,
      amount: adjustedAmount,
      amount_inr: adjustedAmount,
      category,
      subcategory: subcategory || null,
      description: note || null,
      transaction_date: now.toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finance');

  return transaction;
}

/**
 * Get finance overview (summary)
 */
export async function getFinanceOverview(): Promise<{
  balance: number;
  spent_this_month: number;
  income_this_month: number;
  budget_health: 'green' | 'yellow' | 'red';
  spending_by_category: Record<string, number>;
}> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const today = new Date();
  const monthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

  const [accountsResult, transactionsResult, profileResult] = await Promise.all([
    supabase.from('accounts').select('current_balance').eq('user_id', user.id),
    supabase.from('transactions')
      .select('amount, type, category')
      .eq('user_id', user.id)
      .gte('transaction_date', monthStart),
    supabase.from('profiles').select('preferences').eq('id', user.id).single(),
  ]);

  const accounts = accountsResult.data || [];
  const transactions = transactionsResult.data || [];
  const monthlyBudget = profileResult.data?.preferences?.monthlyBudget || 50000;

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const spendingByCategory: Record<string, number> = {};
  let totalSpent = 0;
  let totalIncome = 0;

  transactions.forEach(t => {
    if (t.type === 'expense' || t.amount < 0) {
      const amount = Math.abs(t.amount);
      totalSpent += amount;
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + amount;
    } else if (t.type === 'income' || t.amount > 0) {
      totalIncome += Math.abs(t.amount);
    }
  });

  let budgetHealth: 'green' | 'yellow' | 'red' = 'green';
  if (totalSpent > monthlyBudget * 0.9) {
    budgetHealth = 'red';
  } else if (totalSpent > monthlyBudget * 0.7) {
    budgetHealth = 'yellow';
  }

  return {
    balance: totalBalance,
    spent_this_month: totalSpent,
    income_this_month: totalIncome,
    budget_health: budgetHealth,
    spending_by_category: spendingByCategory,
  };
}

/**
 * Get recent transactions
 */
export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('datetime', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return transactions || [];
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', user.id);

  if (error) throw error;

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/finance');
}

/**
 * Get spending by category for a period
 */
export async function getSpendingByCategory(
  startDate: string,
  endDate: string
): Promise<Record<string, number>> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  const spending: Record<string, number> = {};
  transactions?.forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + Math.abs(t.amount);
  });

  return spending;
}

