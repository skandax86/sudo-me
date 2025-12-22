/**
 * Integration Tests for /api/generate-plan
 * Tests the plan generation API endpoint
 */

// Set up globals BEFORE any imports
import { TextEncoder, TextDecoder } from 'util';

// Create a proper Response mock with static json method
class MockResponse {
  body: string;
  status: number;
  ok: boolean;
  headers: Map<string, string>;

  constructor(body?: string | null, init?: { status?: number; headers?: Record<string, string> }) {
    this.body = body || '';
    this.status = init?.status || 200;
    this.ok = this.status < 400;
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }

  static json(data: unknown, init?: { status?: number }) {
    return new MockResponse(JSON.stringify(data), init);
  }
}

class MockRequest {
  url: string;
  method: string;
  _body: string;
  headers: Map<string, string>;

  constructor(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
    this.url = url;
    this.method = init?.method || 'GET';
    this._body = init?.body || '';
    this.headers = new Map(Object.entries(init?.headers || {}));
  }

  async json() {
    return JSON.parse(this._body);
  }

  async text() {
    return this._body;
  }
}

// Apply globals
Object.assign(global, { 
  TextEncoder, 
  TextDecoder,
  Request: MockRequest,
  Response: MockResponse,
  Headers: Map,
  fetch: jest.fn(),
});

// Mock the Google AI client
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify({
            duration: 90,
            planName: 'AI Generated Plan',
            dailyHabits: [
              { name: 'Wake up early', target: 'Daily', icon: '⏰', time: '06:00' },
            ],
            weeklyGoals: ['Build consistency'],
            morningRoutine: [
              { activity: 'Hydrate', duration: '5 min', icon: '💧' },
            ],
            eveningRoutine: [
              { activity: 'Plan tomorrow', duration: '10 min', icon: '📋' },
            ],
            tracking: [
              { name: 'Habits', frequency: 'Daily', metric: 'Count' },
            ],
            milestones: {
              week1: 'Establish routine',
              week4: 'Build consistency',
            },
            coachingTip: 'Focus on one habit at a time',
            wakeTime: '06:00',
            sleepTime: '22:00',
          }),
        },
      }),
    }),
  })),
}));

describe('POST /api/generate-plan', () => {
  let POST: (req: unknown) => Promise<MockResponse>;

  beforeAll(async () => {
    // Dynamic import to ensure mocks are in place
    const module = await import('@/app/api/generate-plan/route');
    POST = module.POST as unknown as typeof POST;
  });

  describe('Successful requests', () => {
    it('should generate a plan with valid input', async () => {
      // Arrange
      const requestBody = {
        userName: 'Test User',
        age: 25,
        focusAreas: ['health'],
        goalsByFocus: { health: ['lose_weight'] },
        customGoals: {},
        challenges: { health: 'build_consistency' },
        hoursPerDay: 2,
        daysPerWeek: 5,
        planDuration: 90,
        wakeUpTime: '06:00',
        sleepTime: '22:00',
        workSchedule: '9-5',
        trackingAreas: ['weight', 'workouts'],
        customTracking: [],
        monthlyBudget: 50000,
      };

      const mockRequest = {
        json: async () => requestBody,
      };

      // Act
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('plan');
      expect(data).toHaveProperty('source');
      expect(data.plan).toHaveProperty('duration');
      expect(data.plan).toHaveProperty('planName');
      expect(data.plan).toHaveProperty('dailyHabits');
      expect(Array.isArray(data.plan.dailyHabits)).toBe(true);
    });

    it('should include wake and sleep times in plan', async () => {
      const requestBody = {
        wakeUpTime: '05:30',
        sleepTime: '21:30',
        hoursPerDay: 1,
        daysPerWeek: 5,
        planDuration: 30,
        focusAreas: ['discipline'],
        goalsByFocus: {},
        customGoals: {},
        challenges: {},
        trackingAreas: [],
        customTracking: [],
      };

      const mockRequest = {
        json: async () => requestBody,
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.plan.wakeTime).toBeDefined();
      expect(data.plan.sleepTime).toBeDefined();
    });
  });

  describe('Plan content validation', () => {
    it('should include milestones based on plan duration', async () => {
      const requestBody = {
        planDuration: 90,
        focusAreas: ['health'],
        goalsByFocus: {},
        customGoals: {},
        challenges: {},
        trackingAreas: [],
        customTracking: [],
        hoursPerDay: 1,
        daysPerWeek: 5,
        wakeUpTime: '06:00',
        sleepTime: '22:00',
      };

      const mockRequest = {
        json: async () => requestBody,
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.plan.milestones).toBeDefined();
      expect(typeof data.plan.milestones).toBe('object');
    });

    it('should include coaching tip', async () => {
      const requestBody = {
        planDuration: 30,
        focusAreas: ['discipline'],
        goalsByFocus: {},
        customGoals: {},
        challenges: {},
        trackingAreas: [],
        customTracking: [],
        hoursPerDay: 0.5,
        daysPerWeek: 3,
        wakeUpTime: '07:00',
        sleepTime: '23:00',
      };

      const mockRequest = {
        json: async () => requestBody,
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(data.plan.coachingTip).toBeDefined();
      expect(typeof data.plan.coachingTip).toBe('string');
    });
  });

  describe('Error handling', () => {
    it('should handle empty request body', async () => {
      const mockRequest = {
        json: async () => ({}),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      // Should still return a plan (fallback)
      expect(response.status).toBe(200);
      expect(data.plan).toBeDefined();
    });
  });
});
