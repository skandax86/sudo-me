'use client';

import Link from 'next/link';
import { DomainConfig, DomainSummary } from '@/lib/domains';

// ============================================================================
// DOMAIN SUMMARY CARD
// ============================================================================

interface DomainCardProps {
  config: DomainConfig;
  summary?: DomainSummary;
  isLoading?: boolean;
}

export function DomainCard({ config, summary, isLoading = false }: DomainCardProps) {
  const completionRate = summary 
    ? Math.round((summary.completedActions / Math.max(summary.todayActions, 1)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-5 bg-slate-200 rounded w-2/3 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="h-20 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  return (
    <Link
      href={config.route}
      className="group block bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${config.color.bg} rounded-xl flex items-center justify-center text-2xl`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 group-hover:text-violet-600 transition">
              {config.name}
            </h3>
            {summary?.streak && summary.streak > 0 ? (
              <p className="text-sm text-orange-500 font-medium">
                🔥 {summary.streak} day streak
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                {config.description.slice(0, 40)}...
              </p>
            )}
          </div>
        </div>
        <span className="text-slate-400 group-hover:text-violet-500 transition text-xl">
          →
        </span>
      </div>

      {/* Progress Bar */}
      {summary && summary.todayActions > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Today&apos;s Progress</span>
            <span className={`font-medium ${config.color.text}`}>
              {summary.completedActions}/{summary.todayActions}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${config.color.primary} ${config.color.secondary} rounded-full transition-all duration-500`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Primary Metric */}
      {summary?.primaryMetric && (
        <div className={`${config.color.bg} rounded-xl p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">{summary.primaryMetric.label}</p>
              <p className={`text-2xl font-bold ${config.color.text}`}>
                {summary.primaryMetric.value}
              </p>
            </div>
            {summary.primaryMetric.trend && summary.primaryMetric.change && (
              <div className={`text-sm font-medium ${
                summary.primaryMetric.trend === 'up' ? 'text-emerald-600' :
                summary.primaryMetric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
              }`}>
                {summary.primaryMetric.trend === 'up' && '↑'}
                {summary.primaryMetric.trend === 'down' && '↓'}
                {summary.primaryMetric.change}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next Action */}
      {summary?.nextAction && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <span className="text-violet-500">⏰</span>
          <span>Next: {summary.nextAction.title}</span>
          {summary.nextAction.time && (
            <span className="text-slate-400 ml-auto">{summary.nextAction.time}</span>
          )}
        </div>
      )}

      {/* Empty State */}
      {!summary && (
        <div className={`${config.color.bg} rounded-xl p-4 text-center`}>
          <p className="text-slate-500 text-sm">
            No data yet — start tracking to see insights
          </p>
        </div>
      )}
    </Link>
  );
}

// ============================================================================
// MINI DOMAIN CARD (for widgets)
// ============================================================================

interface MiniDomainCardProps {
  config: DomainConfig;
  value?: string | number;
  label?: string;
}

export function MiniDomainCard({ config, value, label }: MiniDomainCardProps) {
  return (
    <Link
      href={config.route}
      className={`block p-4 rounded-xl ${config.color.bg} hover:opacity-90 transition`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`text-sm font-medium ${config.color.text}`}>
          {config.name.split(' ')[0]}
        </span>
      </div>
      {value !== undefined && (
        <p className={`text-2xl font-bold ${config.color.text}`}>{value}</p>
      )}
      {label && (
        <p className="text-xs text-slate-500">{label}</p>
      )}
    </Link>
  );
}

// ============================================================================
// DOMAIN ACTION BUTTON
// ============================================================================

interface DomainActionProps {
  config: DomainConfig;
  label: string;
}

export function DomainActionButton({ config, label }: DomainActionProps) {
  return (
    <Link
      href={config.route}
      className={`bg-gradient-to-r ${config.color.primary} ${config.color.secondary} text-white rounded-2xl p-6 text-center hover:opacity-90 transition shadow-lg`}
    >
      <span className="text-3xl block mb-2">{config.icon}</span>
      <span className="font-bold">{label}</span>
    </Link>
  );
}

