/**
 * Dashboard Components
 * 
 * Centralized exports for all dashboard-related components.
 */

// Layout
export { default as DashboardLayout, useDashboard } from './DashboardLayout';

// Domain Components
export { DomainCard, MiniDomainCard, DomainActionButton } from './DomainCard';
export {
  DomainDashboard,
  DomainHeader,
  FeatureSection,
  ComingSoon,
  EmptyDomainState,
} from './DomainDashboard';

// Widgets
export {
  BaseWidget,
  MetricWidget,
  ActionWidget,
  ProgressWidget,
  ListWidget,
} from './widgets/BaseWidget';

// Types
export type {
  BaseWidgetProps,
  MetricWidgetProps,
  ActionWidgetProps,
  ProgressWidgetProps,
  ListItem,
  ListWidgetProps,
  WidgetSize,
} from './widgets/BaseWidget';

