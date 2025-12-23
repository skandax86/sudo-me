'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, Flame, ArrowRight, Construction } from 'lucide-react';
import { DomainConfig } from '@/lib/domains';
import { ZenFade, ZenCard, ZenProgress } from '@/components/zen';

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

  const isElite = streak && streak >= 7;

  return (
    <ZenFade delay={0.1}>
      <motion.div 
        className={`relative overflow-hidden rounded-[28px] p-6 md:p-8 mb-6 bg-gradient-to-br ${config.color.primary} ${config.color.secondary}`}
        whileHover={{ scale: 1.005 }}
        transition={{ duration: 0.3 }}
      >
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/20 blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-black/10 blur-2xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl md:text-4xl">
              {config.icon}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">{config.name}</h1>
              <p className="text-white/70 text-sm md:text-base">{config.description}</p>
            </div>
          </div>
          
          {streak !== undefined && streak > 0 && (
            <motion.div 
              className="text-right"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className={`text-2xl md:text-3xl font-light text-white ${isElite ? 'drop-shadow-[0_0_10px_rgba(198,169,106,0.5)]' : ''}`}>
                {streak}
              </div>
              <p className="text-white/70 text-sm flex items-center gap-1 justify-end">
                <Flame size={14} className={isElite ? 'text-[#C6A96A]' : ''} />
                Day Streak
              </p>
            </motion.div>
          )}
        </div>

        {todayProgress && todayProgress.total > 0 && (
          <div className="relative mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/70">Today's Progress</span>
              <span className="font-medium text-white">
                {todayProgress.current}/{todayProgress.total} ({progressPercentage}%)
              </span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </ZenFade>
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
    <div className="p-4 md:p-8 min-h-screen bg-[var(--background)]">
      {/* Breadcrumb */}
      <ZenFade>
        <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
          <Link href="/dashboard" className="hover:text-[var(--gold-primary)] transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-[var(--text-ghost)]" />
          <span className="text-[var(--gold-primary)]">{config.name}</span>
        </nav>
      </ZenFade>

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
  delay?: number;
}

export function FeatureSection({
  title,
  description,
  children,
  actionHref,
  actionLabel,
  delay = 0.2,
}: FeatureSectionProps) {
  return (
    <ZenFade delay={delay}>
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-[var(--text-primary)]">{title}</h2>
            {description && (
              <p className="text-sm text-[var(--text-muted)]">{description}</p>
            )}
          </div>
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="text-[var(--gold-primary)] text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              {actionLabel}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {children}
      </section>
    </ZenFade>
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
    <ZenCard className="p-8 text-center border-2 border-dashed border-[var(--border-subtle)]">
      <Construction size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
      <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">{feature}</h3>
      <p className="text-[var(--text-muted)] text-sm">
        {description || 'This feature is coming soon. Stay tuned!'}
      </p>
    </ZenCard>
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
    <ZenCard className="p-12 text-center">
      <div className="text-6xl mb-4">{config.icon}</div>
      <h3 className="text-xl font-medium text-[var(--text-primary)] mb-2">
        Welcome to {config.name}
      </h3>
      <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">
        Start tracking your progress in this area. Add your first entry to see
        insights and recommendations.
      </p>
      {actionHref && (
        <Link href={actionHref}>
          <motion.button
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold-primary)] text-[var(--obsidian-deepest)] font-medium rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {actionLabel}
            <ArrowRight size={16} />
          </motion.button>
        </Link>
      )}
    </ZenCard>
  );
}
