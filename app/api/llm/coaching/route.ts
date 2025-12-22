import { NextRequest, NextResponse } from 'next/server';
import { generateCoachingTip } from '@/lib/llm/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { journalEntry, dailyLogs } = body;

    if (!journalEntry) {
      return NextResponse.json(
        { error: 'Journal entry is required' },
        { status: 400 }
      );
    }

    const tip = await generateCoachingTip(journalEntry, dailyLogs || []);

    if (!tip) {
      return NextResponse.json(
        { error: 'Failed to generate coaching tip' },
        { status: 500 }
      );
    }

    return NextResponse.json(tip);
  } catch (error) {
    console.error('Error in coaching API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}




