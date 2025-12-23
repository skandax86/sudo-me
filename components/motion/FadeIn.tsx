'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
}

const getDirectionOffset = (direction: string, distance: number) => {
  switch (direction) {
    case 'up': return { y: distance };
    case 'down': return { y: -distance };
    case 'left': return { x: distance };
    case 'right': return { x: -distance };
    default: return {};
  }
};

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className = '',
  direction = 'up',
  distance = 20
}: FadeInProps) {
  const initial = { opacity: 0, ...getDirectionOffset(direction, distance) };
  
  return (
    <motion.div
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ 
        duration, 
        delay,
        ease: [0.25, 0.4, 0.25, 1] // Custom ease for premium feel
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animations
interface FadeInStaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1]
    }
  }
};

export function FadeInStagger({ children, staggerDelay = 0.1, className = '' }: FadeInStaggerProps) {
  return (
    <motion.div
      variants={{
        ...containerVariants,
        visible: {
          ...containerVariants.visible,
          transition: { staggerChildren: staggerDelay, delayChildren: 0.1 }
        }
      }}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Child item for stagger
export function FadeInItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
}

