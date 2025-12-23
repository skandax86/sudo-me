/**
 * 4-LAYER INFORMATION ARCHITECTURE
 * 
 * This system separates user concerns by TIME HORIZON:
 * 
 * Layer 1 - DAILY ACTIONS: What I do TODAY (5-7 items max, checklist)
 * Layer 2 - WEEKLY RHYTHM: What I repeat THIS WEEK (progress indicators)
 * Layer 3 - ACTIVE PROGRAMS: What I'm LEARNING/TRAINING (months-long)
 * Layer 4 - LONG-TERM VISION: Why I'm doing this (identity goals)
 * 
 * This reduces cognitive load by:
 * - Never showing goals in daily views
 * - Making daily action obvious and finite
 * - Keeping long-term motivation visible but not demanding
 */

export { DailyActionsLayer } from './DailyActionsLayer';
export { WeeklyRhythmLayer } from './WeeklyRhythmLayer';
export { ActiveProgramsLayer } from './ActiveProgramsLayer';
export { LongTermVisionLayer } from './LongTermVisionLayer';
export { LayerHeader } from './LayerHeader';

