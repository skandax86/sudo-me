'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface ZenFadeProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  className?: string;
}

/**
 * ZenFade - Entry animation following Digital Zen motion
 * 
 * - Elements fade in with slight upward drift
 * - Weighted, purposeful motion
 */
export function ZenFade({ 
  children, 
  delay = 0,
  direction = 'up',
  distance = 20,
  className = '',
  ...props
}: ZenFadeProps) {
  const directionOffset = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        delay,
        duration: 0.5, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

