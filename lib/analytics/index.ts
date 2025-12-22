/**
 * Analytics & Observability Module
 * 
 * Provides hooks for tracking user engagement, dashboard visits,
 * and widget interactions. Designed for easy integration with
 * third-party analytics providers.
 */

import { DomainId } from '@/lib/domains';

// ============================================================================
// EVENT TYPES
// ============================================================================

export type AnalyticsEvent =
  | { type: 'page_view'; path: string; title?: string }
  | { type: 'dashboard_visit'; domainId: DomainId | 'home' }
  | { type: 'widget_interaction'; widgetId: string; action: string; domainId: DomainId }
  | { type: 'feature_usage'; featureId: string; domainId: DomainId }
  | { type: 'onboarding_step'; step: string; completed: boolean }
  | { type: 'goal_created'; category: string; timeframe: string }
  | { type: 'habit_logged'; habitId: string; completed: boolean }
  | { type: 'transaction_added'; category: string; transactionType: 'Income' | 'Expense' }
  | { type: 'error'; message: string; context?: string };

export interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  userId?: string;
  sessionId?: string;
}

// ============================================================================
// ANALYTICS PROVIDER (STUB)
// ============================================================================

let analyticsConfig: AnalyticsConfig = {
  enabled: true,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Initialize analytics with user context
 */
export function initAnalytics(config: Partial<AnalyticsConfig>) {
  analyticsConfig = { ...analyticsConfig, ...config };
  
  if (analyticsConfig.debug) {
    console.log('[Analytics] Initialized with config:', analyticsConfig);
  }
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent) {
  if (!analyticsConfig.enabled) return;

  const enrichedEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    userId: analyticsConfig.userId,
    sessionId: analyticsConfig.sessionId,
  };

  if (analyticsConfig.debug) {
    console.log('[Analytics] Event:', enrichedEvent);
  }

  // STUB: Send to analytics provider
  // Examples:
  // - Mixpanel: mixpanel.track(event.type, enrichedEvent)
  // - Amplitude: amplitude.track(event.type, enrichedEvent)
  // - PostHog: posthog.capture(event.type, enrichedEvent)
  // - Custom API: fetch('/api/analytics', { method: 'POST', body: JSON.stringify(enrichedEvent) })
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  trackEvent({ type: 'page_view', path, title });
}

/**
 * Track dashboard visit
 */
export function trackDashboardVisit(domainId: DomainId | 'home') {
  trackEvent({ type: 'dashboard_visit', domainId });
}

/**
 * Track widget interaction
 */
export function trackWidgetInteraction(widgetId: string, action: string, domainId: DomainId) {
  trackEvent({ type: 'widget_interaction', widgetId, action, domainId });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureId: string, domainId: DomainId) {
  trackEvent({ type: 'feature_usage', featureId, domainId });
}

/**
 * Track onboarding progress
 */
export function trackOnboardingStep(step: string, completed: boolean) {
  trackEvent({ type: 'onboarding_step', step, completed });
}

/**
 * Track error for observability
 */
export function trackError(message: string, context?: string) {
  trackEvent({ type: 'error', message, context });
  
  // Also log to console in development
  if (analyticsConfig.debug) {
    console.error('[Analytics] Error:', message, context);
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Hook to track page views automatically
 */
export function usePageTracking() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView(pathname, document.title);
  }, [pathname]);
}

/**
 * Hook to track dashboard visits
 */
export function useDashboardTracking(domainId: DomainId | 'home') {
  useEffect(() => {
    trackDashboardVisit(domainId);
  }, [domainId]);
}

// ============================================================================
// A/B TESTING PREP
// ============================================================================

export interface Experiment {
  id: string;
  name: string;
  variants: string[];
  activeVariant?: string;
}

let activeExperiments: Experiment[] = [];

/**
 * Register an experiment
 */
export function registerExperiment(experiment: Experiment) {
  activeExperiments.push(experiment);
  
  if (analyticsConfig.debug) {
    console.log('[Analytics] Registered experiment:', experiment);
  }
}

/**
 * Get the active variant for an experiment
 */
export function getExperimentVariant(experimentId: string): string | null {
  const experiment = activeExperiments.find(e => e.id === experimentId);
  return experiment?.activeVariant || null;
}

/**
 * Check if user is in a specific variant
 */
export function isInVariant(experimentId: string, variantId: string): boolean {
  return getExperimentVariant(experimentId) === variantId;
}

// ============================================================================
// PERFORMANCE MONITORING PREP
// ============================================================================

/**
 * Mark a performance milestone
 */
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined') {
    performance.mark(name);
    
    if (analyticsConfig.debug) {
      console.log('[Performance] Mark:', name);
    }
  }
}

/**
 * Measure time between two marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof performance !== 'undefined') {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      const duration = entries[entries.length - 1]?.duration;
      
      if (analyticsConfig.debug && duration) {
        console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    } catch (e) {
      // Marks may not exist
      return null;
    }
  }
  return null;
}

