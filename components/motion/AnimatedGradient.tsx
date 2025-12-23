'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedGradientProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  duration?: number;
}

export function AnimatedGradient({ 
  children, 
  className = '',
  colors = ['#7c3aed', '#6366f1', '#8b5cf6', '#a78bfa'],
  duration = 8
}: AnimatedGradientProps) {
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]}, ${colors[3]})`
      }}
    >
      {/* Animated overlay for shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          backgroundSize: '200% 100%'
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0']
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

// Breathing gradient (subtle color shift)
export function BreathingGradient({ 
  children, 
  className = '',
  baseColors = ['from-violet-600', 'via-purple-600', 'to-indigo-600']
}: { 
  children: ReactNode; 
  className?: string;
  baseColors?: string[];
}) {
  return (
    <motion.div
      className={`bg-gradient-to-r ${baseColors.join(' ')} ${className}`}
      animate={{
        opacity: [1, 0.9, 1],
        scale: [1, 1.002, 1]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  );
}

