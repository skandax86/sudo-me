'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowPulseProps {
  children: ReactNode;
  color?: string;
  active?: boolean;
  className?: string;
}

export function GlowPulse({ 
  children, 
  color = 'rgba(139, 92, 246, 0.5)', // Purple glow
  active = false,
  className = '' 
}: GlowPulseProps) {
  return (
    <motion.div
      className={className}
      animate={active ? {
        boxShadow: [
          `0 0 0px ${color.replace('0.5', '0')}`,
          `0 0 30px ${color}`,
          `0 0 0px ${color.replace('0.5', '0')}`
        ]
      } : {}}
      transition={{ 
        duration: 2, 
        repeat: active ? Infinity : 0,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

// Success glow (green pulse)
export function SuccessGlow({ children, trigger, className = '' }: { 
  children: ReactNode; 
  trigger: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      animate={trigger ? {
        boxShadow: [
          '0 0 0px rgba(74, 222, 128, 0)',
          '0 0 40px rgba(74, 222, 128, 0.6)',
          '0 0 0px rgba(74, 222, 128, 0)'
        ]
      } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

