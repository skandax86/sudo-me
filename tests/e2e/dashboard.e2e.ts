/**
 * E2E Tests for Dashboard
 * Tests the main dashboard functionality
 */

import { test, expect } from '@playwright/test';

// Test user that has completed onboarding
// Note: In a real scenario, you'd seed the database with a test user
const testCredentials = {
  email: process.env.E2E_TEST_EMAIL || 'e2e-dashboard@example.com',
  password: process.env.E2E_TEST_PASSWORD || 'TestPassword123!',
};

test.describe('Dashboard', () => {
  test.describe.configure({ mode: 'serial' });

  // This test assumes a user exists and has completed onboarding
  // In CI, you would seed the database before running these tests
  test.skip('should display dashboard after login', async ({ page }) => {
    // Login first
    await page.goto('/auth/login');
    
    await page.fill('input[placeholder*="example.com"]', testCredentials.email);
    await page.fill('input[placeholder*="password"]', testCredentials.password);
    await page.click('button:has-text("Login")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    
    // Check dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.context().clearCookies();
    
    await page.goto('/dashboard');
    
    // Should redirect to login or setup
    await expect(page).toHaveURL(/\/(auth\/login|setup)/);
  });
});

test.describe('Dashboard - Navigation', () => {
  test.skip('should navigate to daily log page', async ({ page }) => {
    // Assumes user is logged in
    await page.goto('/dashboard');
    
    // Click on daily log link
    await page.click('a:has-text("Log")');
    
    await expect(page).toHaveURL(/\/dashboard\/log/);
  });

  test.skip('should navigate to goals page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a:has-text("Goals")');
    
    await expect(page).toHaveURL(/\/dashboard\/goals/);
  });

  test.skip('should navigate to finance page', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a:has-text("Finance")');
    
    await expect(page).toHaveURL(/\/dashboard\/finance/);
  });
});

test.describe('Dashboard - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/auth/signup');
    
    // Page should still be usable
    await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/auth/signup');
    
    await expect(page.locator('h2:has-text("Create Account")')).toBeVisible();
  });
});

test.describe('Dashboard - Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});

