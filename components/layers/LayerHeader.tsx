'use client';

import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface LayerHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggle?: () => void;
  badge?: string;
  badgeColor?: 'gold' | 'success' | 'muted';
  action?: ReactNode;
}

/**
 * LayerHeader - Consistent header for each layer section
 * 
 * Design principles:
 * - Clear hierarchy through typography
 * - Subtle visual separation
 * - Optional collapse for less-urgent layers
 */
export function LayerHeader({
  title,
  subtitle,
  icon,
  collapsible = false,
  collapsed = false,
  onToggle,
  badge,
  badgeColor = 'muted',
  action,
}: LayerHeaderProps) {
  const badgeColors = {
    gold: 'bg-[var(--gold-soft)] text-[var(--gold-primary)]',
    success: 'bg-[var(--status-success)]/10 text-[var(--status-success)]',
    muted: 'bg-[var(--surface-2)] text-[var(--text-muted)]',
  };

  return (
    <motion.div
      className="flex items-center justify-between mb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {collapsible && (
          <motion.button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {collapsed ? (
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            ) : (
              <ChevronDown size={18} className="text-[var(--text-muted)]" />
            )}
          </motion.button>
        )}
        
        {icon && (
          <div className="text-[var(--gold-primary)]">
            {icon}
          </div>
        )}
        
        <div>
          <h2 className="text-[var(--text-primary)] font-medium text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[var(--text-ghost)] text-sm">{subtitle}</p>
          )}
        </div>
        
        {badge && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${badgeColors[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
      
      {action && (
        <div>{action}</div>
      )}
    </motion.div>
  );
}

