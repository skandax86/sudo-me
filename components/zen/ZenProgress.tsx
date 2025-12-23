'use client';

import { motion } from 'framer-motion';

export interface ZenProgressProps {
  value: number; // 0-100
  gold?: boolean;
  isElite?: boolean; // Alias for gold
  className?: string;
  showPulse?: boolean;
}

/**
 * ZenProgress - Minimal progress bar following Digital Zen
 * 
 * - Thin stroke, full width
 * - Gold pulse at tip when earned
 * - No loud colors, just subtle indication
 */
export function ZenProgress({ 
  value, 
  gold = false,
  isElite = false,
  className = '',
  showPulse = true,
}: ZenProgressProps) {
  const isGold = gold || isElite;
  const clampedValue = Math.min(100, Math.max(0, value));
  
  return (
    <div className={`relative w-full h-[2px] bg-[var(--border-subtle)] rounded-full overflow-hidden ${className}`}>
      {/* Progress fill */}
      <motion.div
        className={`
          absolute left-0 top-0 h-full rounded-full
          ${isGold ? 'bg-[var(--gold-primary)]' : 'bg-[var(--text-muted)]'}
        `}
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ 
          duration: 0.8, 
          ease: [0.22, 1, 0.36, 1] 
        }}
      />
      
      {/* Gold pulse at tip */}
      {isGold && showPulse && clampedValue > 0 && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--gold-bright)]"
          style={{ left: `${clampedValue}%`, marginLeft: -4 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

