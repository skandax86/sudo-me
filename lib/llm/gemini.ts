import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DailyLog } from '@/types/database';

// Note: For client-side usage, this should be called via API route
// Server-side only - API key is not exposed to client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export interface CoachingTip {
  category: 'Discipline' | 'Career' | 'Fitness' | 'Finance' | 'General';
  title: string;
  text: string;
}

export async function generateCoachingTip(
  journalEntry: string,
  dailyLogs: DailyLog[]
): Promise<CoachingTip | null> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn('Gemini API key not configured');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });

    // Summarize recent logs
    const recentLogs = dailyLogs.slice(-7); // Last 7 days
    const summary = {
      disciplineScores: recentLogs.map(log => log.discipline_score || 0),
      averageDiscipline: recentLogs.length > 0 
        ? recentLogs.reduce((sum, log) => sum + (log.discipline_score || 0), 0) / recentLogs.length 
        : 0,
      leetCodeTotal: recentLogs.reduce((sum, log) => sum + (log.leetcode_solved || 0), 0),
      workoutDays: recentLogs.filter(log => log.workout_type && log.workout_type !== 'Rest').length,
    };

    const prompt = `Analyze user performance:
- Journal: ${journalEntry.substring(0, 500)}
- Weekly summary: Average discipline: ${summary.averageDiscipline.toFixed(0)}%, LeetCode solved: ${summary.leetCodeTotal}, Workout days: ${summary.workoutDays}/7

Generate a 100-word coaching tip in JSON format:
{
  "category": "Discipline" | "Career" | "Fitness" | "Finance" | "General",
  "title": "Tip title (max 50 chars)",
  "text": "Tip content (max 100 words)"
}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const tip = JSON.parse(jsonMatch[0]);
      return tip as CoachingTip;
    }

    // Fallback if JSON parsing fails
    return {
      category: 'General',
      title: 'Keep Going!',
      text: 'You\'re making progress. Stay consistent and focused on your goals.',
    };
  } catch (error) {
    console.error('Error generating coaching tip:', error);
    return null;
  }
}

export async function generateGoalSuggestions(
  timeframe: 'Short-term' | 'Mid-term' | 'Long-term',
  context: string
): Promise<Array<{ title: string; category: string; rationale: string }> | null> {
  const genAI = getGenAI();
  if (!genAI) {
    console.warn('Gemini API key not configured');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp' 
    });

    const prompt = `Based on this context: "${context}", suggest 3 ${timeframe} goals in JSON array format:
[
  {
    "title": "Goal title",
    "category": "Fitness" | "Career" | "Finance" | "Habits" | "Learning" | "Travel" | "Health" | "Lifestyle",
    "rationale": "Why this goal matters (max 50 words)"
  }
]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return null;
  } catch (error) {
    console.error('Error generating goal suggestions:', error);
    return null;
  }
}

