# LLM Cost Optimization Guide

**Version:** 1.0.0  
**Last Updated:** December 18, 2024  
**Priority:** ⚠️ **Cost-Critical**

---

## 🎯 Quick Summary

**Recommended: Gemini Flash 2.5** - **99% cost savings vs OpenAI GPT-4**

| Metric | Gemini Flash 2.5 | OpenAI GPT-4 | Savings |
|--------|------------------|--------------|---------|
| **Cost per 1M tokens** | $0.075 | $30.00 | **99.75%** |
| **Free Tier** | ✅ 15 req/min | ❌ None | **$0/month** |
| **Monthly Cost (100 users)** | $5-10 | $1,000-1,500 | **$990-1,490** |

**Quick Setup:** Get free API key at https://aistudio.google.com/apikey → Add to `.env.local` → Install `@google/generative-ai` → Done!

---

## Cost Comparison

### Current Recommendation: **Gemini Flash 2.5** (Best Value)

| Provider | Model | Cost per 1M tokens | Free Tier | Quality | Recommendation |
|----------|-------|-------------------|-----------|---------|----------------|
| **Google Gemini** | Flash 2.5 | **$0.075** | ✅ 15 req/min | ⭐⭐⭐⭐ | ✅ **RECOMMENDED** |
| **Google Gemini** | Pro 2.5 | $1.25 | ❌ | ⭐⭐⭐⭐⭐ | For complex tasks |
| **OpenAI** | GPT-4 | $30.00 | ❌ | ⭐⭐⭐⭐⭐ | ❌ Too expensive |
| **OpenAI** | GPT-3.5 Turbo | $0.50 | ❌ | ⭐⭐⭐ | Alternative |
| **Anthropic** | Claude Haiku | $0.25 | ❌ | ⭐⭐⭐⭐ | Good alternative |
| **Anthropic** | Claude Sonnet | $3.00 | ❌ | ⭐⭐⭐⭐⭐ | Expensive |
| **Ollama** | Llama 3.1 | **FREE** | ✅ Unlimited | ⭐⭐⭐ | ✅ **FREE** |
| **Hugging Face** | Various | **FREE** | ✅ Limited | ⭐⭐⭐ | ✅ **FREE** |
| **OpenRouter** | Aggregator | Varies | ❌ | Varies | Cost comparison |

**Winner: Gemini Flash 2.5** - Best balance of cost, quality, and free tier

---

## Recommended Solution: Multi-Tier LLM Strategy

### Tier 1: Primary (Free/Cheap)
**Gemini Flash 2.5** - For 90% of use cases
- **Cost:** $0.075 per 1M tokens (input)
- **Free Tier:** 15 requests/minute
- **Quality:** Excellent for coaching tips, goal suggestions
- **Latency:** Fast (~1-2 seconds)

### Tier 2: Fallback (Free)
**Ollama (Local)** - For development/testing
- **Cost:** FREE (runs locally)
- **Quality:** Good for testing
- **Latency:** Depends on hardware
- **Use Case:** Development, offline mode

### Tier 3: Premium (When Needed)
**Gemini Pro 2.5** - For complex analysis
- **Cost:** $1.25 per 1M tokens
- **Quality:** Highest
- **Use Case:** Complex goal breakdowns, detailed analysis

---

## Implementation Strategy

### 1. Primary: Gemini Flash 2.5 (Recommended)

**Why Gemini Flash 2.5:**
- ✅ **60x cheaper** than GPT-4 ($0.075 vs $30 per 1M tokens)
- ✅ **Free tier:** 15 requests/minute (sufficient for most users)
- ✅ **High quality:** Excellent for coaching and suggestions
- ✅ **Fast:** Low latency
- ✅ **Google Cloud integration:** Easy with Firebase

**Cost Estimate (Per User/Month):**
- Average: 10 LLM calls/day = 300 calls/month
- Free tier covers: 15 req/min = 21,600 req/day (more than enough!)
- **Cost: $0/month** (within free tier)

**Implementation:**
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
  
  const prompt = `Analyze the user's weekly performance...`;
  
  const result = await model.generateContent(prompt);
  return parseResponse(result.response.text());
}
```

---

### 2. Free Alternative: Ollama (Local Development)

**Why Ollama:**
- ✅ **Completely FREE** - No API costs
- ✅ **Privacy:** Data stays local
- ✅ **Unlimited:** No rate limits
- ✅ **Offline:** Works without internet

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull model
ollama pull llama3.1:8b

# Run server
ollama serve
```

**Implementation:**
```typescript
// lib/llm/ollama.ts
export async function generateWithOllama(prompt: string) {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.1:8b',
      prompt: prompt,
      stream: false
    })
  });
  
  return response.json();
}
```

**Use Cases:**
- Local development
- Testing
- Offline mode
- Privacy-sensitive scenarios

---

### 3. Budget Alternative: Hugging Face Inference API

**Why Hugging Face:**
- ✅ **Free tier:** 1,000 requests/month
- ✅ **Multiple models:** Choose best for task
- ✅ **Good quality:** Open-source models

**Models to Consider:**
- `mistralai/Mistral-7B-Instruct-v0.2` - Fast, good quality
- `meta-llama/Llama-3.1-8B-Instruct` - High quality
- `google/gemma-2-2b-it` - Very fast, lightweight

**Implementation:**
```typescript
// lib/llm/huggingface.ts
export async function generateWithHF(prompt: string) {
  const response = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ inputs: prompt })
    }
  );
  
  return response.json();
}
```

---

### 4. Cost-Effective Aggregator: OpenRouter

**Why OpenRouter:**
- ✅ **Multiple providers:** Compare costs
- ✅ **Cheap models:** Access to budget-friendly options
- ✅ **Unified API:** Single integration

**Recommended Models:**
- `google/gemini-flash-1.5` - $0.075/1M tokens
- `anthropic/claude-haiku` - $0.25/1M tokens
- `openai/gpt-3.5-turbo` - $0.50/1M tokens

---

## Cost Optimization Strategies

### 1. Caching

**Cache LLM responses** to avoid redundant API calls:

```typescript
// Cache common responses
const cacheKey = `llm:${hash(prompt)}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const response = await generateWithGemini(prompt);
await redis.setex(cacheKey, 86400, JSON.stringify(response)); // 24h cache
```

**Savings:** 50-70% reduction in API calls

### 2. Prompt Optimization

**Shorter prompts = Lower costs:**

```typescript
// ❌ Bad: Long prompt
const prompt = `You are a personal development coach. Analyze the user's performance... [500 words]`;

// ✅ Good: Concise prompt
const prompt = `Analyze: ${summary}. Tip: 100 words max. Format: JSON`;
```

**Savings:** 30-50% cost reduction

### 3. Batch Processing

**Process multiple requests together:**

```typescript
// Instead of 10 separate calls
const batch = await Promise.all([
  generateTip(log1),
  generateTip(log2),
  // ...
]);

// Use batch API if available
```

### 4. Rate Limiting

**Limit LLM calls per user:**

```typescript
// Max 10 LLM calls per day per user
const dailyCalls = await getDailyLLMCalls(userId);
if (dailyCalls >= 10) {
  return getCachedTip(); // Use cached response
}
```

---

## Recommended Configuration

### Production Setup

```typescript
// lib/llm/config.ts
export const LLM_CONFIG = {
  // Primary: Gemini Flash (free tier)
  primary: {
    provider: 'gemini',
    model: 'gemini-2.0-flash-exp',
    apiKey: process.env.GEMINI_API_KEY,
    freeTierLimit: 15, // requests per minute
    costPer1MTokens: 0.075
  },
  
  // Fallback: Hugging Face (free tier)
  fallback: {
    provider: 'huggingface',
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    apiKey: process.env.HUGGINGFACE_API_KEY,
    freeTierLimit: 1000 // requests per month
  },
  
  // Local: Ollama (development)
  local: {
    provider: 'ollama',
    model: 'llama3.1:8b',
    url: 'http://localhost:11434',
    cost: 0 // FREE
  },
  
  // Caching
  cache: {
    enabled: true,
    ttl: 86400, // 24 hours
    strategy: 'redis' // or 'memory'
  },
  
  // Rate limiting
  rateLimit: {
    perUser: 10, // calls per day
    perMinute: 15 // global limit
  }
};
```

---

## Cost Estimates

### Scenario 1: Single User (Personal Use)

**Usage:**
- 10 coaching tips/day
- 5 goal suggestions/week
- 2 action plans/week

**Monthly:**
- Total calls: ~350 calls/month
- **Gemini Flash:** $0 (within free tier)
- **GPT-4:** ~$10-15/month
- **Savings:** $10-15/month

### Scenario 2: 100 Users

**Usage:**
- Same per user as above

**Monthly:**
- Total calls: ~35,000 calls/month
- **Gemini Flash:** ~$5-10/month (mostly free tier)
- **GPT-4:** ~$1,000-1,500/month
- **Savings:** ~$1,000/month

### Scenario 3: 1,000 Users

**Usage:**
- Same per user as above

**Monthly:**
- Total calls: ~350,000 calls/month
- **Gemini Flash:** ~$50-100/month
- **GPT-4:** ~$10,000-15,000/month
- **Savings:** ~$10,000/month

---

## Migration Guide

### From OpenAI to Gemini

**Step 1:** Update environment variables
```bash
# Remove
OPENAI_API_KEY=...

# Add
GEMINI_API_KEY=your_gemini_key
```

**Step 2:** Update code
```typescript
// Before (OpenAI)
import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// After (Gemini)
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
```

**Step 3:** Test and deploy

---

## Free Tier Limits

### Gemini Flash 2.5
- **Rate Limit:** 15 requests/minute
- **Daily Limit:** ~21,600 requests/day (theoretical)
- **Cost:** $0 (within free tier)
- **Perfect for:** Most use cases

### Hugging Face
- **Free Tier:** 1,000 requests/month
- **Cost:** $0 (within free tier)
- **Perfect for:** Backup, testing

### Ollama
- **Rate Limit:** None (local)
- **Cost:** $0 (completely free)
- **Perfect for:** Development, privacy

---

## Implementation Priority

### Phase 1: Immediate (Free)
1. ✅ **Use Gemini Flash 2.5** as primary
2. ✅ **Implement caching** (reduce calls by 50-70%)
3. ✅ **Add rate limiting** (10 calls/user/day)

### Phase 2: Optimization
4. ✅ **Add Ollama** for local development
5. ✅ **Add Hugging Face** as fallback
6. ✅ **Optimize prompts** (shorter = cheaper)

### Phase 3: Advanced
7. ⚠️ **Batch processing** (if needed)
8. ⚠️ **Model selection** (use cheaper models for simple tasks)

---

## Code Example: Multi-Provider LLM Service

```typescript
// lib/llm/LLMService.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export class LLMService {
  private gemini: GoogleGenerativeAI;
  private cache: Map<string, any>;
  
  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    this.cache = new Map();
  }
  
  async generateCoachingTip(
    journalEntry: string,
    dailyLogs: DailyLog[]
  ): Promise<CoachingTip> {
    // Check cache first
    const cacheKey = this.getCacheKey(journalEntry, dailyLogs);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Use Gemini Flash (free tier)
    const model = this.gemini.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp'
    });
    
    const prompt = this.buildPrompt(journalEntry, dailyLogs);
    const result = await model.generateContent(prompt);
    
    const tip = this.parseResponse(result.response.text());
    
    // Cache for 24 hours
    this.cache.set(cacheKey, tip);
    setTimeout(() => this.cache.delete(cacheKey), 86400000);
    
    return tip;
  }
  
  private buildPrompt(journal: string, logs: DailyLog[]): string {
    // Optimized: Short, focused prompt
    return `Analyze: ${this.summarizeLogs(logs)}. Journal: ${journal.substring(0, 500)}. Generate 100-word coaching tip. JSON format.`;
  }
}
```

---

## Recommendations

### ✅ **Recommended: Gemini Flash 2.5**

**Why:**
- 60x cheaper than GPT-4
- Free tier covers most use cases
- High quality responses
- Easy integration with Firebase

**Cost:** $0/month for typical usage

### ⚠️ **Alternative: Ollama (Local)**

**Why:**
- Completely free
- No API limits
- Privacy-focused

**Use Case:** Development, testing, offline mode

### ⚠️ **Backup: Hugging Face**

**Why:**
- Free tier available
- Multiple model options

**Use Case:** Fallback when Gemini is unavailable

---

## Updated Architecture

**Primary:** Gemini Flash 2.5 (Free tier)  
**Fallback:** Hugging Face (Free tier)  
**Development:** Ollama (Local, free)  
**Premium:** Gemini Pro (only if needed)

**Estimated Monthly Cost:** $0-10 (vs $100-1000 with GPT-4)

---

**See Also:**
- [Technical Specification](./technical-specification.md)
- [System Architecture](../architecture/system-architecture.md)

