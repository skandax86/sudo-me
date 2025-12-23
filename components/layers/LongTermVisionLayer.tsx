'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Star, ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';
import { LayerHeader } from './LayerHeader';
import { ZenCard, ZenFade } from '@/components/zen';

interface VisionGoal {
  id: string;
  title: string;
  icon: ReactNode;
  timeframe: 'short' | 'mid' | 'long'; // 0-1 year, 1-3 years, 3+ years
  domain: string;
  progress?: number; // Optional progress percentage
  motivationalNote?: string;
}

interface LongTermVisionLayerProps {
  goals: VisionGoal[];
  defaultCollapsed?: boolean;
}

const timeframeLabels = {
  short: 'This Year',
  mid: '1-3 Years',
  long: 'Life Goals',
};

const timeframeColors = {
  short: 'text-[var(--status-success)]',
  mid: 'text-[var(--gold-primary)]',
  long: 'text-[var(--status-info)]',
};

/**
 * LAYER 4 - LONG-TERM VISION
 * 
 * "Why am I doing all this?"
 * 
 * Rules:
 * - Identity-level goals only
 * - NEVER in daily habit views
 * - Collapsed by default
 * - No daily pressure
 * - Feels inspiring, not demanding
 * 
 * This layer should feel like:
 * "This is who I'm becoming. No rush."
 * 
 * Examples:
 * - Body transformation
 * - Career switch / Move abroad
 * - Build ₹5L assets
 * - Run a marathon
 * - Write a book
 */
export function LongTermVisionLayer({ 
  goals, 
  defaultCollapsed = true 
}: LongTermVisionLayerProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Group by timeframe
  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.timeframe]) acc[goal.timeframe] = [];
    acc[goal.timeframe].push(goal);
    return acc;
  }, {} as Record<string, VisionGoal[]>);

  return (
    <ZenFade delay={0.3}>
      <div className="mb-8">
        <LayerHeader
          title="Long-Term Vision"
          subtitle="The bigger picture"
          collapsible
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          badge={`${goals.length} goals`}
          action={
            !collapsed && (
              <span className="text-xs text-[var(--text-ghost)]">
                These don't need daily action
              </span>
            )
          }
        />

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ZenCard className="p-6" variant="elevated">
                {/* Motivational Header */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-gradient-to-r from-[var(--gold-soft)] to-transparent">
                  <Star className="text-[var(--gold-primary)]" size={20} />
                  <p className="text-[var(--text-primary)] text-sm">
                    These goals guide your journey. Daily actions move you closer.
                  </p>
                </div>

                {/* Goals by Timeframe */}
                <div className="space-y-6">
                  {(['short', 'mid', 'long'] as const).map((timeframe) => {
                    const timeframeGoals = groupedGoals[timeframe];
                    if (!timeframeGoals || timeframeGoals.length === 0) return null;

                    return (
                      <div key={timeframe}>
                        <h3 className={`text-sm font-medium mb-3 ${timeframeColors[timeframe]}`}>
                          {timeframeLabels[timeframe]}
                        </h3>
                        <div className="space-y-3">
                          {timeframeGoals.map((goal, index) => (
                            <motion.div
                              key={goal.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[var(--surface-card)] flex items-center justify-center text-lg">
                                {goal.icon}
                              </div>
                              <div className="flex-1">
                                <p className="text-[var(--text-primary)] font-medium">{goal.title}</p>
                                <p className="text-[var(--text-ghost)] text-xs">{goal.domain}</p>
                              </div>
                              {goal.progress !== undefined && (
                                <div className="text-right">
                                  <p className="text-[var(--gold-primary)] font-medium text-sm">
                                    {goal.progress}%
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gentle Reminder */}
                <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
                  <p className="text-[var(--text-ghost)] text-xs italic">
                    "Focus on today. These goals will be reached one habit at a time."
                  </p>
                </div>
              </ZenCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed Preview */}
        <AnimatePresence>
          {collapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCollapsed(false)}
              className="w-full p-4 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)] transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Target size={18} className="text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)]">
                  {goals.length} long-term goals guiding your journey
                </span>
              </div>
              <ChevronRight size={18} className="text-[var(--text-ghost)]" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ZenFade>
  );
}

