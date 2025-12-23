/**
 * DIGITAL ZEN DESIGN SYSTEM
 * ============================
 * A design system that rewards discipline with visual serenity.
 * Champagne Gold is earned through consistency, not given.
 * 
 * THE FIVE LAWS OF DIGITAL ZEN:
 * 1. Silence Before Success - No visual emphasis until progress is earned
 * 2. Gold Never Persists - Gold appears briefly, then recedes
 * 3. Motion Serves Meaning - Nothing animates unless state has changed
 * 4. UI Calms as Discipline Increases - Better performance = quieter interface
 * 5. Absence Is a Feature - Empty space and restraint are intentional
 */

// ============================================
// COLOR TOKENS
// ============================================

export const colors = {
  // Base obsidian palette
  obsidian: {
    deepest: '#0B0B0D',    // Infinite depth base
    base: '#121216',       // Card surfaces
    elevated: '#1A1A1F',   // Elevated surfaces
    divider: '#1E1E24',    // Barely visible dividers
  },
  
  // Neutral text hierarchy
  neutral: {
    primary: '#E6E6EB',    // Primary text, high contrast
    secondary: '#B4B4BC',  // Secondary text
    muted: '#9A9AA1',      // Muted text, icons default
    ghost: '#6B6B73',      // Ghost text, hints
    disabled: '#3D3D44',   // Disabled states
  },
  
  // Champagne Gold - THE EARNED ACCENT
  gold: {
    primary: '#C6A96A',    // Primary gold, earned states
    soft: '#C6A96A1A',     // 10% opacity, subtle glow
    medium: '#C6A96A33',   // 20% opacity, halo effect
    bright: '#D4B97A',     // Brighter gold for milestones
  },
  
  // Status colors (used sparingly)
  status: {
    success: '#4ADE80',    // Emerald green, muted
    warning: '#FBBF24',    // Amber, rarely used
    error: '#F87171',      // Soft red, never alarming
    info: '#60A5FA',       // Calm blue
  },
  
  // Domain-specific accents (subtle, desaturated)
  domain: {
    health: '#34D399',     // Teal-emerald
    discipline: '#8B5CF6', // Violet
    learning: '#3B82F6',   // Blue
    finance: '#F59E0B',    // Amber
    career: '#EC4899',     // Pink
    personal: '#06B6D4',   // Cyan
  },
  
  // Light mode equivalents
  light: {
    base: '#FAFAFA',
    surface: '#FFFFFF',
    elevated: '#F4F4F5',
    divider: '#E4E4E7',
    text: {
      primary: '#18181B',
      secondary: '#52525B',
      muted: '#71717A',
    },
  },
} as const;

// ============================================
// MOTION TOKENS - Weighted Motion System
// ============================================

export const motion = {
  // Easing curves
  easing: {
    // Default - smooth, organic
    smooth: [0.22, 1, 0.36, 1] as const,
    // Liquid gold - slow, luxurious
    liquid: [0.16, 1, 0.3, 1] as const,
    // Weighty - heavy, grounded
    weighty: [0.34, 1.56, 0.64, 1] as const,
    // Calm - almost linear, zen
    calm: [0.25, 0.1, 0.25, 1] as const,
  },
  
  // Duration tokens
  duration: {
    instant: 100,     // Micro-interactions
    fast: 200,        // Quick feedback
    normal: 300,      // Standard transitions
    slow: 500,        // Emphasis
    gold: 600,        // Gold state transitions
    milestone: 800,   // Achievement moments
    pause: 700,       // Moment of stillness
  },
  
  // Motion weight classes
  weight: {
    heavy: {
      // Hero score, large numbers
      duration: 800,
      ease: [0.34, 1.56, 0.64, 1],
    },
    medium: {
      // Metric cards, standard elements
      duration: 400,
      ease: [0.22, 1, 0.36, 1],
    },
    light: {
      // Focus underlines, indicators
      duration: 300,
      ease: [0.16, 1, 0.3, 1],
    },
    organic: {
      // Gold transitions, color bleeds
      duration: 600,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
} as const;

// ============================================
// SPACING & LAYOUT
// ============================================

export const spacing = {
  card: {
    padding: '24px',
    paddingLg: '32px',
    gap: '16px',
    gapLg: '24px',
  },
  radius: {
    sm: '12px',
    md: '20px',
    lg: '28px',   // Soft, pebble-like
    full: '9999px',
  },
} as const;

// ============================================
// TYPOGRAPHY
// ============================================

export const typography = {
  tracking: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em',
    wider: '0.05em',
    widest: '0.1em',
  },
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
  },
} as const;

// ============================================
// GLOW & SHADOW SYSTEM
// ============================================

export const effects = {
  glow: {
    gold: `0 0 40px rgba(198, 169, 106, 0.1)`,
    goldMedium: `0 0 60px rgba(198, 169, 106, 0.15)`,
    goldStrong: `0 0 80px rgba(198, 169, 106, 0.2)`,
    subtle: `0 0 20px rgba(255, 255, 255, 0.03)`,
  },
  shadow: {
    card: `0 2px 8px rgba(0, 0, 0, 0.3)`,
    elevated: `0 8px 24px rgba(0, 0, 0, 0.4)`,
    float: `0 16px 48px rgba(0, 0, 0, 0.5)`,
  },
} as const;

// ============================================
// GOLD TRIGGER RULES
// ============================================

export const goldRules = {
  // Score threshold for gold (relative to user's baseline)
  scoreThreshold: 90,
  // Streak days needed for metric gold
  streakDays: 7,
  // Gold fade timeout (ms)
  fadeTimeout: 10000,
  // Animation duration for gold appearance
  transitionDuration: 600,
} as const;

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

export const components = {
  progressBar: {
    height: '2px',
    heightActive: '3px',
    goldPulse: true,
  },
  focusUnderline: {
    width: '12px',
    height: '2px',
    offset: '8px',
  },
  card: {
    borderWidth: '1px',
    haloBlur: '40px',
    haloOpacity: 0.1,
  },
} as const;

// Type exports
export type ColorToken = typeof colors;
export type MotionToken = typeof motion;

