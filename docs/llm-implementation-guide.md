# LLM Implementation Guide

**Cost-Optimized LLM Integration for PDS**  
**Version:** 1.0.0  
**Last Updated:** December 18, 2024

---

## 🎯 Quick Reference

**Recommended: Gemini Flash 2.5** - 60x cheaper than GPT-4, free tier available

**5-Minute Setup:**
1. Get API key: https://aistudio.google.com/apikey
2. Add to `.env.local`: `GEMINI_API_KEY=your_key`
3. Install: `npm install @google/generative-ai`
4. Use in code (see below)

**Cost:** $0/month (within free tier of 15 req/min)

---

## Quick Start: Gemini Flash 2.5 (Recommended)

### 1. Get Free API Key

1. Visit: https://aistudio.google.com/apikey
2. Sign in with Google account
3. Create API key
4. Copy key to `.env.local`

### 2. Install Dependencies

```bash
npm install @google/generative-ai
```

### 3. Implementation

```typescript
// lib/llm/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateCoachingTip(
  journalEntry: string,
  dailyLogs: DailyLog[]
): Promise<CoachingTip> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash-exp' // Latest Flash model
  });
  
  const prompt = buildCoachingPrompt(journalEntry, dailyLogs);
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return parseCoachingTip(response);
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to cached or default tip
    return getDefaultTip();
  }
}

function buildCoachingPrompt(journal: string, logs: DailyLog[]): string {
  // Optimized: Short, focused prompt (reduces costs)
  const summary = summarizeLogs(logs);
  return `Analyze user performance:
- Journal: ${journal.substring(0, 500)}
- Weekly summary: ${summary}

Generate a 100-word coaching tip in JSON:
{
  "category": "Discipline" | "Career" | "Fitness",
  "title": "Tip title",
  "text": "Tip content"
}`;
}
```

---

## Free Alternative: Ollama (Local)

### Setup

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model (8GB download)
ollama pull llama3.1:8b

# Start server
ollama serve
```

### Implementation

```typescript
// lib/llm/ollama.ts
export async function generateWithOllama(prompt: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 500
      }
    })
  });
  
  const data = await response.json();
  return data.response;
}
```

**Pros:**
- ✅ Completely FREE
- ✅ No API limits
- ✅ Privacy (data stays local)
- ✅ Works offline

**Cons:**
- ⚠️ Requires local setup
- ⚠️ Slower than cloud APIs
- ⚠️ Requires good hardware (8GB+ RAM)

---

## Cost Comparison

### Monthly Cost Estimates

| Scenario | Gemini Flash | GPT-4 | Savings |
|----------|--------------|-------|---------|
| **1 user** | $0 (free tier) | $10-15 | $10-15 |
| **100 users** | $5-10 | $1,000-1,500 | $990-1,490 |
| **1,000 users** | $50-100 | $10,000-15,000 | $9,950-14,900 |

**Recommendation:** Use Gemini Flash 2.5 - **99% cost savings**

---

## Multi-Provider Service

```typescript
// lib/llm/LLMService.ts
export class LLMService {
  async generate(prompt: string, useCase: LLMUseCase): Promise<string> {
    // Try primary (Gemini)
    try {
      return await this.generateWithGemini(prompt);
    } catch (error) {
      // Fallback to Ollama (local) or Hugging Face
      if (process.env.NODE_ENV === 'development') {
        return await this.generateWithOllama(prompt);
      }
      return await this.generateWithHF(prompt);
    }
  }
}
```

---

**See [LLM Cost Optimization Guide](./llm-cost-optimization.md) for complete details.**

