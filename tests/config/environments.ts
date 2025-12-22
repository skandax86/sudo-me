/**
 * Test Environment Configuration
 * Provides environment-specific settings for different test contexts
 */

export type TestEnvironment = 'test' | 'staging' | 'production';

interface EnvironmentConfig {
  name: TestEnvironment;
  baseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  timeout: number;
  retries: number;
  features: {
    mockExternalServices: boolean;
    seedDatabase: boolean;
    cleanupAfterTests: boolean;
    enableScreenshots: boolean;
    enableVideoRecording: boolean;
  };
}

const environments: Record<TestEnvironment, EnvironmentConfig> = {
  test: {
    name: 'test',
    baseUrl: 'http://localhost:3000',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://test.supabase.co',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-key',
    timeout: 30000,
    retries: 0,
    features: {
      mockExternalServices: true,
      seedDatabase: true,
      cleanupAfterTests: true,
      enableScreenshots: true,
      enableVideoRecording: false,
    },
  },
  
  staging: {
    name: 'staging',
    baseUrl: process.env.STAGING_URL || 'https://staging.tracky.app',
    supabaseUrl: process.env.STAGING_SUPABASE_URL || '',
    supabaseAnonKey: process.env.STAGING_SUPABASE_KEY || '',
    timeout: 60000,
    retries: 1,
    features: {
      mockExternalServices: false,
      seedDatabase: false,
      cleanupAfterTests: false,
      enableScreenshots: true,
      enableVideoRecording: true,
    },
  },
  
  production: {
    name: 'production',
    baseUrl: process.env.PRODUCTION_URL || 'https://tracky.app',
    supabaseUrl: process.env.PRODUCTION_SUPABASE_URL || '',
    supabaseAnonKey: process.env.PRODUCTION_SUPABASE_KEY || '',
    timeout: 30000,
    retries: 2,
    features: {
      mockExternalServices: false,
      seedDatabase: false,
      cleanupAfterTests: false,
      enableScreenshots: true,
      enableVideoRecording: true,
    },
  },
};

export function getEnvironmentConfig(env?: TestEnvironment): EnvironmentConfig {
  const targetEnv = env || (process.env.TEST_ENV as TestEnvironment) || 'test';
  return environments[targetEnv] || environments.test;
}

export function isCI(): boolean {
  return process.env.CI === 'true';
}

export function shouldMockExternalServices(): boolean {
  const config = getEnvironmentConfig();
  return config.features.mockExternalServices;
}

export function getTestTimeout(): number {
  return getEnvironmentConfig().timeout;
}

export function getRetryCount(): number {
  return isCI() ? getEnvironmentConfig().retries : 0;
}

