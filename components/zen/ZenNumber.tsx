'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

export interface ZenNumberProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  className?: string;
  gold?: boolean;
  isElite?: boolean; // Alias for gold
}

/**
 * ZenNumber - Animated number with heavy, weighted motion
 * 
 * Following Digital Zen motion philosophy:
 * - Heavy, slow animation for hero numbers
 * - Gold state when threshold is met
 */
export function ZenNumber({ 
  value, 
  duration = 800,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  gold = false,
  isElite = false,
}: ZenNumberProps) {
  const isGold = gold || isElite;
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 20,
    mass: 1.5, // Heavy, weighty feel
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span 
      className={`
        font-light tracking-tight
        ${isGold ? 'text-[var(--gold-primary)]' : 'text-[var(--text-primary)]'}
        ${className}
      `}
      style={isGold ? { 
        textShadow: '0 0 40px rgba(198, 169, 106, 0.3)',
      } : undefined}
    >
      {display}
    </motion.span>
  );
}

