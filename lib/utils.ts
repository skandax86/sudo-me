import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Phase } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculate current phase based on days elapsed
export function getCurrentPhase(daysElapsed: number): string {
  if (daysElapsed <= 30) return 'Foundation';
  if (daysElapsed <= 60) return 'Intensity';
  return 'Mastery';
}

// Calculate days elapsed from start date
export function getDaysElapsed(startDate: Date | string | null | undefined): number {
  if (!startDate) return 1;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  if (isNaN(start.getTime())) return 1;
  return Math.max(1, Math.floor(
    (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1);
}

