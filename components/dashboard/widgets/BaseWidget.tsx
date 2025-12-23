'use client';

import { ReactNode, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ZenCard, ZenFade, ZenNumber, ZenProgress } from '@/components/zen';

// ============================================================================
// WIDGET TYPES
// ============================================================================

export type WidgetSize = 'small' | 'medium' | 'large' | 'full';

export interface BaseWidgetProps {
  title: string;
  icon?: string;
  size?: WidgetSize;
  actionHref?: string;
  actionLabel?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
}

// ============================================================================
// SIZE CLASSES
// ============================================================================

const sizeClasses: Record<WidgetSize, string> = {
  small: 'col-span-1',
  medium: 'col-span-1 md:col-span-1',
  large: 'col-span-1 md:col-span-2',
  full: 'col-span-1 md:col-span-3',
};

// ============================================================================
// LOADING SKELETON
// ============================================================================

function WidgetSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-[var(--surface-2)] rounded w-3/4 mb-3" />
      <div className="h-4 bg-[var(--surface-2)] rounded w-1/2 mb-3" />
      <div className="h-16 bg-[var(--surface-2)] rounded" />
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string;
}

function EmptyState({ icon = '📭', message = 'No data yet', actionHref, actionLabel }: EmptyStateProps) {
  return (
    <div className="text-center py-8">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-[var(--text-muted)] text-sm">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1 mt-3 text-[var(--gold-primary)] hover:opacity-80 text-sm font-medium transition-opacity"
        >
          {actionLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ============================================================================
// BASE WIDGET COMPONENT
// ============================================================================

export function BaseWidget({
  title,
  icon,
  size = 'medium',
  actionHref,
  actionLabel,
  isLoading = false,
  isEmpty = false,
  emptyMessage,
  emptyIcon,
  children,
  className = '',
  headerRight,
}: BaseWidgetProps) {
  return (
    <ZenCard className={`p-6 ${sizeClasses[size]} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="font-medium text-[var(--text-primary)]">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="text-[var(--gold-primary)] text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-1"
            >
              {actionLabel}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      <Suspense fallback={<WidgetSkeleton />}>
        {isLoading ? (
          <WidgetSkeleton />
        ) : isEmpty ? (
          <EmptyState
            icon={emptyIcon}
            message={emptyMessage}
            actionHref={actionHref}
            actionLabel={actionLabel}
          />
        ) : (
          children
        )}
      </Suspense>
    </ZenCard>
  );
}

// ============================================================================
// METRIC WIDGET (SMALL STAT CARDS)
// ============================================================================

export interface MetricWidgetProps {
  title: string;
  value: string | number;
  icon: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'default' | 'success' | 'warning' | 'danger';
  isElite?: boolean;
}

const colorClasses = {
  default: 'text-[var(--text-primary)]',
  success: 'text-[var(--status-success)]',
  warning: 'text-[var(--status-warning)]',
  danger: 'text-[var(--status-error)]',
};

export function MetricWidget({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendValue,
  color = 'default',
  isElite = false,
}: MetricWidgetProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <ZenCard className="p-5" isElite={isElite}>
      <div className="flex items-center gap-3 mb-3">
        <span className={`text-2xl ${isElite ? 'drop-shadow-[0_0_8px_rgba(198,169,106,0.4)]' : ''}`}>{icon}</span>
        <h3 className="text-[var(--text-muted)] text-xs font-medium uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-3xl font-light ${colorClasses[color]} ${isElite ? 'text-[var(--gold-primary)]' : ''}`}>
            {typeof value === 'number' ? <ZenNumber value={value} isElite={isElite} /> : value}
          </p>
          {subtitle && <p className="text-sm text-[var(--text-muted)] mt-1">{subtitle}</p>}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-[var(--status-success)]' : 
            trend === 'down' ? 'text-[var(--status-error)]' : 
            'text-[var(--text-muted)]'
          }`}>
            <TrendIcon size={14} />
            {trendValue}
          </div>
        )}
      </div>
    </ZenCard>
  );
}

// ============================================================================
// ACTION WIDGET (QUICK ACTION BUTTONS)
// ============================================================================

export interface ActionWidgetProps {
  label: string;
  icon: string;
  href: string;
  gradient?: string;
}

export function ActionWidget({ label, icon, href, gradient }: ActionWidgetProps) {
  return (
    <Link href={href}>
      <motion.div
        className={`rounded-[20px] p-6 text-center text-white transition-all ${
          gradient || 'bg-gradient-to-br from-[var(--gold-primary)] to-[var(--gold-soft)]'
        }`}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-3xl block mb-2">{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// PROGRESS WIDGET
// ============================================================================

export interface ProgressWidgetProps {
  title: string;
  current: number;
  target: number;
  unit?: string;
  icon?: string;
  color?: string;
  isElite?: boolean;
}

export function ProgressWidget({
  title,
  current,
  target,
  unit = '',
  icon,
  color,
  isElite = false,
}: ProgressWidgetProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="p-4 bg-[var(--surface-2)] rounded-[16px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className={isElite ? 'drop-shadow-[0_0_6px_rgba(198,169,106,0.4)]' : ''}>{icon}</span>}
          <span className="text-[var(--text-primary)] font-medium text-sm">{title}</span>
        </div>
        <span className="text-[var(--text-muted)] text-sm">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <ZenProgress value={percentage} isElite={isElite} />
    </div>
  );
}

// ============================================================================
// LIST WIDGET
// ============================================================================

export interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  rightContent?: ReactNode;
  isComplete?: boolean;
}

export interface ListWidgetProps {
  items: ListItem[];
  emptyMessage?: string;
  maxItems?: number;
}

export function ListWidget({ items, emptyMessage = 'No items', maxItems = 5 }: ListWidgetProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-6 text-[var(--text-muted)]">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayItems.map((item, index) => (
        <motion.div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-[12px] ${
            item.isComplete ? 'bg-[var(--status-success)]/10' : 'bg-[var(--surface-2)]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {item.icon && <span className="text-xl">{item.icon}</span>}
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate text-sm ${
              item.isComplete ? 'text-[var(--status-success)]' : 'text-[var(--text-primary)]'
            }`}>
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-xs text-[var(--text-muted)] truncate">{item.subtitle}</p>
            )}
          </div>
          {item.rightContent}
          {item.isComplete && (
            <motion.span 
              className="text-[var(--status-success)] font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
            >
              ✓
            </motion.span>
          )}
        </motion.div>
      ))}
    </div>
  );
}
