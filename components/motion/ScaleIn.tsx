'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScaleIn({ children, delay = 0, className = '' }: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// For milestone celebrations
export function CelebrationPop({ children, trigger, className = '' }: { 
  children: ReactNode; 
  trigger: boolean;
  className?: string;
}) {
  return (
    <motion.div
      animate={trigger ? {
        scale: [1, 1.2, 0.95, 1.05, 1],
        rotate: [0, -5, 5, -3, 0]
      } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

