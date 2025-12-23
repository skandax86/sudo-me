'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SlideUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function SlideUp({ children, delay = 0, duration = 0.6, className = '' }: SlideUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration, 
        delay,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: 'left' | 'right';
  delay?: number;
  className?: string;
}

export function SlideIn({ children, direction = 'left', delay = 0, className = '' }: SlideInProps) {
  const xOffset = direction === 'left' ? -50 : 50;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: xOffset }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.25, 0.4, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// For number/text transitions
interface AnimatedPresenceWrapperProps {
  children: ReactNode;
  keyValue: string | number;
  className?: string;
}

export function AnimatedValue({ children, keyValue, className = '' }: AnimatedPresenceWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={keyValue}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

