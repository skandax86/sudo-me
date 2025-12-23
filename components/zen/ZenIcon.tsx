'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ZenIconProps {
  icon: LucideIcon;
  size?: number;
  gold?: boolean;
  className?: string;
  animate?: boolean;
}

/**
 * ZenIcon - Icon wrapper following Digital Zen principles
 * 
 * - Stroke-based by default in muted gray
 * - Transitions to gold when elite state achieved
 * - Subtle animation on state change
 */
export function ZenIcon({ 
  icon: Icon, 
  size = 24, 
  gold = false,
  className = '',
  animate = true,
}: ZenIconProps) {
  return (
    <motion.div
      className={`inline-flex items-center justify-center ${className}`}
      initial={animate ? { opacity: 0, scale: 0.8 } : undefined}
      animate={animate ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={gold ? {
          color: 'var(--gold-primary)',
          filter: 'drop-shadow(0 0 8px rgba(198, 169, 106, 0.4))',
        } : {
          color: 'var(--text-muted)',
          filter: 'none',
        }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Icon size={size} strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}

