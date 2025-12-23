'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle } from 'lucide-react';
import { ReactNode } from 'react';
import { LayerHeader } from './LayerHeader';
import { ZenCard, ZenFade } from '@/components/zen';

interface DailyAction {
  id: string;
  label: string;
  icon: ReactNode;
  completed: boolean;
  onToggle?: () => void;
}

interface DailyActionsLayerProps {
  actions: DailyAction[];
  completedCount?: number;
  totalCount?: number;
  onActionToggle?: (id: string) => void;
}

/**
 * LAYER 1 - DAILY ACTIONS
 * 
 * "What do I need to do TODAY?"
 * 
 * Rules:
 * - Max 5-7 items visible
 * - Binary checkboxes only
 * - Nothing that takes weeks/months
 * - Clear, finite, achievable TODAY
 * 
 * This layer should feel like:
 * "I can finish this. I know exactly what to do."
 */
export function DailyActionsLayer({
  actions,
  completedCount,
  totalCount,
  onActionToggle,
}: DailyActionsLayerProps) {
  const completed = completedCount ?? actions.filter(a => a.completed).length;
  const total = totalCount ?? actions.length;
  const allDone = completed === total && total > 0;

  return (
    <ZenFade>
      <div className="mb-8">
        <LayerHeader
          title="Today's Actions"
          subtitle="Complete these to close your day"
          badge={`${completed}/${total}`}
          badgeColor={allDone ? 'gold' : 'muted'}
        />

        <ZenCard variant={allDone ? 'gold' : 'default'} halo={allDone}>
          <div className="space-y-1">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                onClick={() => onActionToggle?.(action.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-[16px] transition-all
                  ${action.completed 
                    ? 'bg-[var(--status-success)]/10' 
                    : 'hover:bg-[var(--surface-2)]'
                  }
                `}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                  ${action.completed 
                    ? 'bg-[var(--status-success)] border-[var(--status-success)]' 
                    : 'border-[var(--border-medium)]'
                  }
                `}>
                  <AnimatePresence>
                    {action.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <Check size={14} className="text-[var(--obsidian-deepest)]" strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Icon */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center text-sm
                  ${action.completed ? 'opacity-60' : 'bg-[var(--surface-2)]'}
                `}>
                  {action.icon}
                </div>

                {/* Label */}
                <span className={`
                  flex-1 text-left font-medium transition-all
                  ${action.completed 
                    ? 'text-[var(--text-muted)] line-through' 
                    : 'text-[var(--text-primary)]'
                  }
                `}>
                  {action.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Completion Message */}
          <AnimatePresence>
            {allDone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-center"
              >
                <span className="text-[var(--gold-primary)] font-medium">
                  ✨ All daily actions complete!
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </ZenCard>
      </div>
    </ZenFade>
  );
}

