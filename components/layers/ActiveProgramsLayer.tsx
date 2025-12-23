'use client';

import { motion } from 'framer-motion';
import { Calendar, TrendingUp, ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';
import { LayerHeader } from './LayerHeader';
import { ZenCard, ZenFade } from '@/components/zen';

interface ActiveProgram {
  id: string;
  name: string;
  icon: ReactNode;
  category: string; // "Physical Training", "Skill Building", etc.
  startDate: string;
  currentLevel: string;
  nextMilestone: string;
  progressPercent: number;
}

interface ActiveProgramsLayerProps {
  programs: ActiveProgram[];
}

/**
 * LAYER 3 - ACTIVE PROGRAMS
 * 
 * "What am I learning/training over MONTHS?"
 * 
 * Rules:
 * - Long-term skill development
 * - Shows start date + progress
 * - Milestone-based, not daily
 * - Activities that require weeks/months of practice
 * 
 * This layer should feel like:
 * "I'm growing. These take time."
 * 
 * Examples:
 * - Calisthenics training
 * - Learning to swim
 * - Martial arts
 * - Musical instrument
 * - Language learning
 */
export function ActiveProgramsLayer({ programs }: ActiveProgramsLayerProps) {
  if (programs.length === 0) {
    return null; // Don't show if no active programs
  }

  return (
    <ZenFade delay={0.2}>
      <div className="mb-8">
        <LayerHeader
          title="Active Programs"
          subtitle="Skills that take time to build"
          badge={`${programs.length} active`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <ZenCard className="p-5 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--gold-soft)] to-[var(--surface-2)] flex items-center justify-center text-xl">
                      {program.icon}
                    </div>
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">{program.name}</p>
                      <p className="text-[var(--text-ghost)] text-xs">{program.category}</p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">Progress</span>
                    <span className="text-[var(--text-primary)]">{program.progressPercent}%</span>
                  </div>
                  <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[var(--gold-medium)] to-[var(--gold-primary)] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${program.progressPercent}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <Calendar size={14} />
                    <span>Started: {program.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-muted)]">
                    <TrendingUp size={14} />
                    <span>Level: {program.currentLevel}</span>
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-ghost)] mb-1">Next milestone</p>
                  <div className="flex items-center justify-between">
                    <p className="text-[var(--text-primary)] text-sm font-medium">{program.nextMilestone}</p>
                    <ArrowRight size={14} className="text-[var(--gold-primary)]" />
                  </div>
                </div>
              </ZenCard>
            </motion.div>
          ))}
        </div>
      </div>
    </ZenFade>
  );
}

