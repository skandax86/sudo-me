'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon?: LucideIcon;
}

interface ZenFocusTabProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * ZenFocusTab - Tab component with "The Underline Signal"
 * 
 * - Inactive: muted gray text
 * - Active: primary text with gold underline
 * - Underline slides between tabs like liquid metal
 */
export function ZenFocusTab({ 
  tabs, 
  activeTab, 
  onChange,
  className = '',
}: ZenFocusTabProps) {
  return (
    <div className={`flex items-center gap-8 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex items-center gap-2 py-2 focus:outline-none"
          >
            {/* Icon */}
            {Icon && (
              <motion.div
                animate={{
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={18} strokeWidth={1.5} />
              </motion.div>
            )}
            
            {/* Label */}
            <motion.span
              className="text-sm font-medium tracking-wide"
              animate={{
                color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
              transition={{ duration: 0.3 }}
            >
              {tab.label}
            </motion.span>
            
            {/* The Underline Signal */}
            {isActive && (
              <motion.div
                className="absolute -bottom-1 left-1/2 h-[2px] w-3 bg-[var(--gold-primary)] rounded-full"
                layoutId="zenTabUnderline"
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
                style={{ x: '-50%' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

