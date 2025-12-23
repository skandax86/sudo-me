'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValue, useInView } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function CountUp({ 
  value, 
  duration = 1, 
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 100,
    damping: 30,
    duration: duration * 1000
  });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Number(latest.toFixed(decimals)));
    });
    return unsubscribe;
  }, [springValue, decimals]);

  // Also update when value changes (not just on first view)
  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <motion.span 
      ref={ref} 
      className={className}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 0.3, delay: duration }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

// Percentage variant with visual feedback
interface CountUpPercentProps {
  value: number;
  previousValue?: number;
  className?: string;
}

export function CountUpPercent({ value, previousValue, className = '' }: CountUpPercentProps) {
  const improved = previousValue !== undefined && value > previousValue;
  
  return (
    <motion.span
      className={`${className} ${improved ? 'text-green-400' : ''}`}
      animate={improved ? { 
        scale: [1, 1.1, 1],
        textShadow: ['0 0 0px rgba(74, 222, 128, 0)', '0 0 20px rgba(74, 222, 128, 0.8)', '0 0 0px rgba(74, 222, 128, 0)']
      } : {}}
      transition={{ duration: 0.5 }}
    >
      <CountUp value={value} suffix="%" duration={0.8} />
    </motion.span>
  );
}

