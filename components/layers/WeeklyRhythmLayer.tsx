'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LayerHeader } from './LayerHeader';
import { ZenCard, ZenFade, ZenProgress } from '@/components/zen';

interface WeeklyRhythm {
  id: string;
  label: string;
  icon: ReactNode;
  current: number;
  target: number;
  unit: string;
  frequency: string; // "4x/week", "2x/week", "once/week"
}

interface WeeklyRhythmLayerProps {
  rhythms: WeeklyRhythm[];
}

/**
 * LAYER 2 - WEEKLY RHYTHM
 * 
 * "What am I building THIS WEEK?"
 * 
 * Rules:
 * - Non-daily routines only
 * - Shown as PROGRESS BARS, not checklists
 * - Frequency-based (4x/week, 2x/week)
 * - No pressure to do everything today
 * 
 * This layer should feel like:
 * "I'm on track. No rush."
 */
export function WeeklyRhythmLayer({ rhythms }: WeeklyRhythmLayerProps) {
  const totalProgress = rhythms.reduce((sum, r) => sum + (r.current / r.target), 0) / rhythms.length * 100;
  const isOnTrack = totalProgress >= 50;

  return (
    <ZenFade delay={0.1}>
      <div className="mb-8">
        <LayerHeader
          title="Weekly Rhythm"
          subtitle="Stay on pace, not in a race"
          badge={isOnTrack ? 'On Track' : 'Behind'}
          badgeColor={isOnTrack ? 'success' : 'muted'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rhythms.map((rhythm, index) => {
            const percentage = Math.min((rhythm.current / rhythm.target) * 100, 100);
            const isComplete = rhythm.current >= rhythm.target;

            return (
              <motion.div
                key={rhythm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <ZenCard className="p-5" variant={isComplete ? 'gold' : 'default'}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center text-lg">
                        {rhythm.icon}
                      </div>
                      <div>
                        <p className="text-[var(--text-primary)] font-medium">{rhythm.label}</p>
                        <p className="text-[var(--text-ghost)] text-xs">{rhythm.frequency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${isComplete ? 'text-[var(--gold-primary)]' : 'text-[var(--text-primary)]'}`}>
                        {rhythm.current}/{rhythm.target}
                      </p>
                      <p className="text-[var(--text-ghost)] text-xs">{rhythm.unit}</p>
                    </div>
                  </div>

                  <ZenProgress value={percentage} gold={isComplete} />

                  {isComplete && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-[var(--gold-primary)] mt-2 text-center"
                    >
                      ✓ Weekly goal hit!
                    </motion.p>
                  )}
                </ZenCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ZenFade>
  );
}

