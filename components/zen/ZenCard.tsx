'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

export interface ZenCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'gold';
  halo?: boolean;
  isElite?: boolean; // Alias for gold variant + halo
  className?: string;
}

/**
 * ZenCard - A card component following Digital Zen principles
 * 
 * - Soft, pebble-like corners (28px radius)
 * - Subtle elevation with grounding shadows
 * - Optional gold halo for elite states
 */
export function ZenCard({ 
  children, 
  variant = 'default', 
  halo = false,
  isElite = false,
  className = '',
  ...props 
}: ZenCardProps) {
  // isElite activates gold variant and halo effect
  const effectiveVariant = isElite ? 'gold' : variant;
  const effectiveHalo = isElite || halo;
  const baseClasses = `
    relative rounded-[28px] p-6 md:p-8
    border transition-all duration-500
  `;
  
  const variantClasses = {
    default: `
      bg-[var(--surface-card)] 
      border-[var(--border-subtle)]
    `,
    elevated: `
      bg-[var(--obsidian-elevated)] 
      border-[var(--border-medium)]
      shadow-lg
    `,
    gold: `
      bg-gradient-to-br from-[var(--gold-soft)] to-transparent
      border-[var(--gold-primary)]/20
    `,
  };

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[effectiveVariant]} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.3 }
      }}
      {...props}
    >
      {/* Gold Halo Effect */}
      {effectiveHalo && (
        <motion.div
          className="absolute inset-0 rounded-[28px] -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, var(--gold-soft) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        />
      )}
      {children}
    </motion.div>
  );
}

