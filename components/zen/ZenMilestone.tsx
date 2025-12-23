'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface ZenMilestoneProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
}

/**
 * ZenMilestone - "The Horizon Rise" celebration
 * 
 * - Screen dims
 * - Moment of stillness (700ms pause)
 * - Gold circular rim fades in
 * - Achievement appears with weight
 */
export function ZenMilestone({ 
  isOpen, 
  onClose,
  title,
  subtitle,
}: ZenMilestoneProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
        >
          {/* Dimmed backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
          />
          
          {/* Content container */}
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }} // Pause before content
          >
            {/* Gold circular rim */}
            <motion.div
              className="relative w-32 h-32 mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.9,
                duration: 0.8, 
                ease: [0.22, 1, 0.36, 1] 
              }}
            >
              {/* Outer glow */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle, var(--gold-soft) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              
              {/* Gold rim */}
              <div className="absolute inset-0 rounded-full border-2 border-[var(--gold-primary)]/30" />
              <div className="absolute inset-2 rounded-full border border-[var(--gold-primary)]/50" />
              
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy 
                  size={48} 
                  className="text-[var(--gold-primary)]"
                  strokeWidth={1}
                />
              </div>
            </motion.div>
            
            {/* Title */}
            <motion.h2
              className="text-3xl font-light text-[var(--text-primary)] tracking-wide mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              {title}
            </motion.h2>
            
            {/* Subtitle */}
            {subtitle && (
              <motion.p
                className="text-[var(--text-muted)] text-lg font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                {subtitle}
              </motion.p>
            )}
            
            {/* Dismiss hint */}
            <motion.p
              className="text-[var(--text-ghost)] text-sm mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

