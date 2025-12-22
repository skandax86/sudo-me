'use client';

import { ReactNode, Suspense } from 'react';
import Link from 'next/link';

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
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
      <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
      <div className="h-16 bg-slate-200 rounded" />
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
      <p className="text-slate-500 text-sm">{message}</p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="inline-block mt-3 text-violet-600 hover:underline text-sm font-medium"
        >
          {actionLabel} →
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
    <div
      className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-100 ${sizeClasses[size]} ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <h3 className="font-bold text-slate-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {headerRight}
          {actionHref && actionLabel && (
            <Link
              href={actionHref}
              className="text-violet-600 text-sm font-medium hover:underline"
            >
              {actionLabel}
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
    </div>
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
}

const colorClasses = {
  default: 'text-slate-800',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  danger: 'text-red-600',
};

const trendClasses = {
  up: 'text-emerald-600',
  down: 'text-red-600',
  neutral: 'text-slate-500',
};

export function MetricWidget({
  title,
  value,
  icon,
  subtitle,
  trend,
  trendValue,
  color = 'default',
}: MetricWidgetProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={`text-4xl font-bold ${colorClasses[color]}`}>{value}</p>
          {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendClasses[trend]}`}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ACTION WIDGET (QUICK ACTION BUTTONS)
// ============================================================================

export interface ActionWidgetProps {
  label: string;
  icon: string;
  href: string;
  gradient: string;
  shadowColor: string;
}

export function ActionWidget({ label, icon, href, gradient, shadowColor }: ActionWidgetProps) {
  return (
    <Link
      href={href}
      className={`bg-gradient-to-r ${gradient} text-white rounded-2xl p-6 text-center hover:opacity-90 transition shadow-lg ${shadowColor}`}
    >
      <span className="text-3xl block mb-2">{icon}</span>
      <span className="font-bold">{label}</span>
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
}

export function ProgressWidget({
  title,
  current,
  target,
  unit = '',
  icon,
  color = 'violet',
}: ProgressWidgetProps) {
  const percentage = Math.min((current / target) * 100, 100);
  
  return (
    <div className="p-4 bg-slate-50 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span className="text-slate-700 font-medium">{title}</span>
        </div>
        <span className="text-slate-500 text-sm">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-${color}-500 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
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
      <div className="text-center py-6 text-slate-400">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-xl ${
            item.isComplete ? 'bg-emerald-50' : 'bg-slate-50'
          }`}
        >
          {item.icon && <span className="text-xl">{item.icon}</span>}
          <div className="flex-1 min-w-0">
            <p className={`font-medium truncate ${
              item.isComplete ? 'text-emerald-700' : 'text-slate-700'
            }`}>
              {item.title}
            </p>
            {item.subtitle && (
              <p className="text-xs text-slate-500 truncate">{item.subtitle}</p>
            )}
          </div>
          {item.rightContent}
          {item.isComplete && <span className="text-emerald-500 font-bold">✓</span>}
        </div>
      ))}
    </div>
  );
}

