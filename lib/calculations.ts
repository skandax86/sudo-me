import { DISCIPLINE_WEIGHTS } from './constants';

// Input for discipline score calculation
export interface DisciplineInput {
  wokeUp6am: boolean;
  coldShower: boolean;
  noPhoneFirstHour: boolean;
  meditated: boolean;
  plannedTomorrow: boolean;
}

// Calculate discipline score (0-100%)
export function calculateDisciplineScore(input: DisciplineInput): number {
  const wakeScore = input.wokeUp6am ? 100 : 0;
  const phoneScore = input.noPhoneFirstHour ? 100 : 0;
  const showerScore = input.coldShower ? 100 : 0;
  const meditationScore = input.meditated ? 100 : 0;
  const planScore = input.plannedTomorrow ? 100 : 0;
  
  return Math.round(
    wakeScore * DISCIPLINE_WEIGHTS.wakeUpTime +
    phoneScore * DISCIPLINE_WEIGHTS.noPhoneFirstHour +
    showerScore * DISCIPLINE_WEIGHTS.coldShower +
    meditationScore * DISCIPLINE_WEIGHTS.meditation +
    planScore * DISCIPLINE_WEIGHTS.planTomorrowDone
  );
}

// Allocate investment amount
export function allocateInvestment(amount: number) {
  return {
    lowRisk: Math.round(amount * 0.3),
    midRisk: Math.round(amount * 0.4),
    highRisk: Math.round(amount * 0.3)
  };
}

// Check budget health
export function checkBudgetHealth(
  spent: number,
  limit: number
): 'HEALTHY' | 'CAUTION' | 'WARNING' | 'BREACH' {
  const percentage = (spent / limit) * 100;
  
  if (percentage >= 100) return 'BREACH';
  if (percentage >= 90) return 'WARNING';
  if (percentage >= 75) return 'CAUTION';
  return 'HEALTHY';
}

