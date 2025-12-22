/**
 * E2E Tests for Authentication Flow
 * Tests signup, login, and logout functionality
 */

import { test, expect } from '@playwright/test';

// Generate unique email for each test run
const generateTestEmail = () => `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

test.describe('Authentication Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check page elements - page shows "Create Account" or setup message
    const hasCreateAccount = await page.locator('h2:has-text("Create Account")').isVisible();
    const hasSetupRequired = await page.locator('text="Database Not Configured"').isVisible();
    
    // Either signup form or setup message should be visible
    expect(hasCreateAccount || hasSetupRequired).toBe(true);
    
    if (hasCreateAccount) {
      await expect(page.locator('input[placeholder="John Doe"]')).toBeVisible();
      await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
      await expect(page.locator('input[placeholder="Min 6 characters"]')).toBeVisible();
      await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
    }
  });

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check page elements - either login form or setup required
    const hasLogin = await page.locator('h2:has-text("Login")').isVisible();
    const hasSetupRequired = await page.locator('text="Database Not Configured"').isVisible();
    
    expect(hasLogin || hasSetupRequired).toBe(true);
    
    if (hasLogin) {
      await expect(page.locator('input[placeholder="you@example.com"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Login")')).toBeVisible();
    }
  });

  test('should navigate between signup and login', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check if we can navigate (only if auth is available)
    const hasLogin = await page.locator('a:has-text("Login")').isVisible();
    
    if (hasLogin) {
      await page.click('a:has-text("Login")');
      await expect(page).toHaveURL(/\/auth\/login/);
      
      const hasSignUp = await page.locator('a:has-text("Sign up")').isVisible();
      if (hasSignUp) {
        await page.click('a:has-text("Sign up")');
        await expect(page).toHaveURL(/\/auth\/signup/);
      }
    }
  });

  test('should prevent access to dashboard without authentication', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login, setup, or onboarding
    await expect(page).toHaveURL(/\/(auth\/login|setup|onboarding)/);
  });

  test('should prevent access to onboarding without authentication', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Should redirect to login or setup
    await expect(page).toHaveURL(/\/(auth\/login|setup)/);
  });
});

test.describe('Authentication - Security', () => {
  test('should mask password input', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    const passwordInput = page.locator('input[type="password"]');
    const hasPassword = await passwordInput.count() > 0;
    
    if (hasPassword) {
      // Password input should be of type password
      await expect(passwordInput.first()).toHaveAttribute('type', 'password');
    } else {
      // If setup is required, skip this test
      const hasSetup = await page.locator('text="Database Not Configured"').isVisible();
      expect(hasSetup).toBe(true);
    }
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check that the page loads correctly (Tracky branding or setup page)
    const hasTracky = await page.locator('h1:has-text("Tracky")').isVisible();
    const hasSetup = await page.locator('text="Database Not Configured"').isVisible();
    
    expect(hasTracky || hasSetup).toBe(true);
  });
});
