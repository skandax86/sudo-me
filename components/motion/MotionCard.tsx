'use client';

import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface MotionCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  tiltAmount?: number;
  glowOnHover?: boolean;
  onClick?: () => void;
}

export function MotionCard({ 
  children, 
  className = '',
  hoverScale = 1.02,
  tiltAmount = 5,
  glowOnHover = true,
  onClick
}: MotionCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Mouse position for tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth the values
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltAmount, -tiltAmount]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltAmount, tiltAmount]), springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set((event.clientX - centerX) / rect.width);
    y.set((event.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`${className} transition-shadow duration-300 ${glowOnHover ? 'hover:shadow-xl hover:shadow-purple-500/10' : ''}`}
      style={{ 
        rotateX, 
        rotateY,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d'
      }}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Simpler hover card without tilt
export function HoverCard({ 
  children, 
  className = '',
  onClick
}: { 
  children: ReactNode; 
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
}

export function AnimatedProgress({ 
  value, 
  max = 100, 
  className = '',
  barClassName = 'bg-gradient-to-r from-violet-500 to-purple-500'
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`overflow-hidden rounded-full bg-white/10 ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClassName}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1] }}
      />
    </div>
  );
}

