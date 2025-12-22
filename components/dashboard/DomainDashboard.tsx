'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { DomainConfig } from '@/lib/domains';

// ============================================================================
// DOMAIN DASHBOARD HEADER
// ============================================================================

interface DomainHeaderProps {
  config: DomainConfig;
  streak?: number;
  todayProgress?: { current: number; total: number };
}

export function DomainHeader({ config, streak, todayProgress }: DomainHeaderProps) {
  const progressPercentage = todayProgress
    ? Math.round((todayProgress.current / Math.max(todayProgress.total, 1)) * 100)
    : 0;

  return (
    <div className={`bg-gradient-to-r ${config.color.primary} ${config.color.secondary} rounded-2xl p-6 mb-6 text-white`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">
            {config.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{config.name}</h1>
            <p className="text-white/80">{config.description}</p>
          </div>
        </div>
        {streak !== undefined && streak > 0 && (
          <div className="text-right">
            <div className="text-3xl font-bold">{streak}</div>
            <p className="text-white/80 text-sm">🔥 Day Streak</p>
          </div>
        )}
      </div>

      {todayProgress && todayProgress.total > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/80">Today&apos;s Progress</span>
            <span className="font-medium">
              {todayProgress.current}/{todayProgress.total} ({progressPercentage}%)
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DOMAIN DASHBOARD LAYOUT
// ============================================================================

interface DomainDashboardProps {
  config: DomainConfig;
  children: ReactNode;
  streak?: number;
  todayProgress?: { current: number; total: number };
}

export function DomainDashboard({
  config,
  children,
  streak,
  todayProgress,
}: DomainDashboardProps) {
  return (
    <div className="p-4 md:p-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        <Link href="/dashboard" className="hover:text-violet-600">
          Home
        </Link>
        <span>→</span>
        <span className={config.color.text}>{config.name}</span>
      </nav>

      {/* Header */}
      <DomainHeader
        config={config}
        streak={streak}
        todayProgress={todayProgress}
      />

      {/* Content */}
      {children}
    </div>
  );
}

// ============================================================================
// DOMAIN FEATURE SECTION
// ============================================================================

interface FeatureSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  actionHref?: string;
  actionLabel?: string;
}

export function FeatureSection({
  title,
  description,
  children,
  actionHref,
  actionLabel,
}: FeatureSectionProps) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          {description && (
            <p className="text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="text-violet-600 text-sm font-medium hover:underline"
          >
            {actionLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// ============================================================================
// COMING SOON PLACEHOLDER
// ============================================================================

interface ComingSoonProps {
  feature: string;
  description?: string;
}

export function ComingSoon({ feature, description }: ComingSoonProps) {
  return (
    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
      <div className="text-4xl mb-3">🚧</div>
      <h3 className="text-lg font-bold text-slate-700 mb-2">{feature}</h3>
      <p className="text-slate-500 text-sm">
        {description || 'This feature is coming soon. Stay tuned!'}
      </p>
    </div>
  );
}

// ============================================================================
// EMPTY DOMAIN STATE
// ============================================================================

interface EmptyDomainStateProps {
  config: DomainConfig;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyDomainState({
  config,
  actionLabel = 'Get Started',
  actionHref,
}: EmptyDomainStateProps) {
  return (
    <div className={`${config.color.bg} rounded-2xl p-12 text-center`}>
      <div className="text-6xl mb-4">{config.icon}</div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">
        Welcome to {config.name}
      </h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Start tracking your progress in this area. Add your first entry to see
        insights and recommendations.
      </p>
      {actionHref && (
        <Link
          href={actionHref}
          className={`inline-block px-6 py-3 bg-gradient-to-r ${config.color.primary} ${config.color.secondary} text-white font-bold rounded-xl hover:opacity-90 transition`}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

