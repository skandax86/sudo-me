/**
 * Test Mocks Index
 * Central export for all test mocks and utilities
 */

// Re-export all mocks
export * from './supabase';

// Mock fetch helper
export const mockFetch = (response: unknown, options: { ok?: boolean; status?: number } = {}) => {
  const { ok = true, status = 200 } = options;
  
  return jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      headers: new Headers(),
    })
  );
};

// Mock Next.js router
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
  pathname: '/',
  query: {},
  asPath: '/',
  route: '/',
  basePath: '',
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

export const mockUseRouter = () => {
  jest.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
  }));
  
  return mockRouter;
};

// Date mocking utilities
export const mockDate = (date: Date | string) => {
  const mockDate = typeof date === 'string' ? new Date(date) : date;
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  return () => jest.useRealTimers();
};

// Async test helpers
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

// Error factory for testing error handling
export const createError = (message: string, code?: string) => {
  const error = new Error(message);
  if (code) {
    (error as Error & { code: string }).code = code;
  }
  return error;
};

