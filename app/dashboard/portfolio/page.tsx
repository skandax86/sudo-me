'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isSupabaseReady, getSupabaseClient } from '@/lib/supabase/client';
import { INVESTMENT_ALLOCATION } from '@/lib/constants';
import { allocateInvestment } from '@/lib/calculations';

interface PortfolioData {
  totalValue: number;
  allocations: {
    lowRisk: { amount: number; percentage: number; instruments: string[] };
    midRisk: { amount: number; percentage: number; instruments: string[] };
    highRisk: { amount: number; percentage: number; instruments: string[] };
  };
  emergencyFund: number;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseReady()) {
      router.push('/setup');
      return;
    }

    fetchPortfolio();
  }, [router]);

  const fetchPortfolio = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get all investment transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'Investments');

      const totalInvested = transactions
        ? transactions.reduce((sum: number, t: { amount: number }) => sum + Number(t.amount), 0)
        : 0;

      const allocation = allocateInvestment(totalInvested);

      // Get or create portfolio data
      const { data: portfolioData } = await supabase
        .from('investment_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1)
        .single();

      setPortfolio({
        totalValue: totalInvested,
        allocations: {
          lowRisk: {
            amount: allocation.lowRisk,
            percentage: INVESTMENT_ALLOCATION.LOW_RISK * 100,
            instruments: ['Liquid Funds', 'Emergency Fund'],
          },
          midRisk: {
            amount: allocation.midRisk,
            percentage: INVESTMENT_ALLOCATION.MID_RISK * 100,
            instruments: ['Nifty ETF', 'Gold SIP', 'Silver SIP'],
          },
          highRisk: {
            amount: allocation.highRisk,
            percentage: INVESTMENT_ALLOCATION.HIGH_RISK * 100,
            instruments: ['Tech Stocks', 'Sectoral Funds'],
          },
        },
        emergencyFund: portfolioData?.emergency_fund_balance || 0,
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading portfolio...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">📈 Portfolio</h1>
            <Link href="/dashboard" className="text-indigo-600 hover:underline">
              ← Back
            </Link>
          </div>
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <p className="text-gray-500 mb-4">No investments yet.</p>
            <Link
              href="/dashboard/finance"
              className="text-indigo-600 hover:underline"
            >
              Add your first investment →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📈 Investment Portfolio</h1>
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            ← Back
          </Link>
        </div>

        {/* Total Value */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Total Portfolio Value</h2>
          <p className="text-4xl font-bold text-indigo-600">
            ₹{portfolio.totalValue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Target: ₹5,00,000 ({((portfolio.totalValue / 500000) * 100).toFixed(1)}%)
          </p>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((portfolio.totalValue / 500000) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Allocations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Low Risk */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600">Low Risk (30%)</h3>
            <p className="text-2xl font-bold mb-2">
              ₹{portfolio.allocations.lowRisk.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {portfolio.allocations.lowRisk.percentage}% allocation
            </p>
            <div className="space-y-1">
              {portfolio.allocations.lowRisk.instruments.map((instrument, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {instrument}</div>
              ))}
            </div>
          </div>

          {/* Mid Risk */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-yellow-600">Mid Risk (40%)</h3>
            <p className="text-2xl font-bold mb-2">
              ₹{portfolio.allocations.midRisk.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {portfolio.allocations.midRisk.percentage}% allocation
            </p>
            <div className="space-y-1">
              {portfolio.allocations.midRisk.instruments.map((instrument, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {instrument}</div>
              ))}
            </div>
          </div>

          {/* High Risk */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">High Risk (30%)</h3>
            <p className="text-2xl font-bold mb-2">
              ₹{portfolio.allocations.highRisk.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {portfolio.allocations.highRisk.percentage}% allocation
            </p>
            <div className="space-y-1">
              {portfolio.allocations.highRisk.instruments.map((instrument, idx) => (
                <div key={idx} className="text-sm text-gray-600">• {instrument}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Fund */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">🛡️ Emergency Fund</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">₹{portfolio.emergencyFund.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Target: ₹5,00,000</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-indigo-600">
                {((portfolio.emergencyFund / 500000) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">of target</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min((portfolio.emergencyFund / 500000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
