/**
 * E2E Tests for Onboarding Flow
 * Tests the complete user onboarding journey
 */

import { test, expect, Page } from '@playwright/test';

// Test fixtures
const testUser = {
  name: 'E2E Test User',
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
};

// Helper functions
async function signUpUser(page: Page) {
  await page.goto('/auth/signup');
  
  // Wait for the page to load
  await page.waitForSelector('input[placeholder*="John"]');
  
  // Fill in the signup form
  await page.fill('input[placeholder*="John"]', testUser.name);
  await page.fill('input[placeholder*="example.com"]', testUser.email);
  await page.fill('input[placeholder*="character"]', testUser.password);
  
  // Submit the form
  await page.click('button:has-text("Get Started")');
  
  // Wait for redirect to onboarding
  await page.waitForURL(/\/onboarding/);
}

test.describe('Onboarding Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Clear cookies/storage before each test
    await page.context().clearCookies();
  });

  test('should display welcome page after signup', async ({ page }) => {
    await signUpUser(page);
    
    // Should see welcome message
    await expect(page.locator('h1')).toContainText('Welcome');
    await expect(page.locator('button:has-text("Begin")')).toBeVisible();
  });

  test('should navigate through all onboarding steps', async ({ page }) => {
    await signUpUser(page);
    
    // Step 0: Welcome
    await page.click('button:has-text("Begin")');
    
    // Step 1: Focus Areas
    await expect(page.locator('text=Step 1 of 6')).toBeVisible();
    await expect(page.locator('text=What areas do you want')).toBeVisible();
    
    // Select Health & Fitness
    await page.click('button:has-text("Health & Fitness")');
    await expect(page.locator('text=1 area selected')).toBeVisible();
    
    await page.click('button:has-text("Next")');
    
    // Step 2: Specific Goals
    await expect(page.locator('text=Step 2 of 6')).toBeVisible();
    await page.click('button:has-text("Lose weight")');
    await page.click('button:has-text("Next")');
    
    // Step 3: Challenges
    await expect(page.locator('text=Step 3 of 6')).toBeVisible();
    await page.click('button:has-text("Build consistency")');
    await page.click('button:has-text("Next")');
    
    // Step 4: Commitment
    await expect(page.locator('text=Step 4 of 6')).toBeVisible();
    await page.click('button:has-text("Next")');
    
    // Step 5: Schedule
    await expect(page.locator('text=Step 5 of 6')).toBeVisible();
    await page.click('button:has-text("Next")');
    
    // Step 6: Tracking
    await expect(page.locator('text=Step 6 of 6')).toBeVisible();
    await page.click('button:has-text("Weight")');
    await page.click('button:has-text("Generate My Plan")');
    
    // Wait for plan generation
    await expect(page.locator('text=Creating Your Plan')).toBeVisible();
    
    // Wait for the plan to be ready (with retry)
    await expect(page.locator('text=Your Plan is Ready')).toBeVisible({ timeout: 30000 });
  });

  test('should prevent navigation when required selections are missing', async ({ page }) => {
    await signUpUser(page);
    
    // Go to focus areas
    await page.click('button:has-text("Begin")');
    
    // Try to proceed without selecting anything
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeDisabled();
    
    // Select a focus area
    await page.click('button:has-text("Health & Fitness")');
    await expect(nextButton).toBeEnabled();
  });

  test('should allow going back to previous steps', async ({ page }) => {
    await signUpUser(page);
    
    // Navigate through first two steps
    await page.click('button:has-text("Begin")');
    await page.click('button:has-text("Health & Fitness")');
    await page.click('button:has-text("Next")');
    
    // Should be on step 2
    await expect(page.locator('text=Step 2 of 6')).toBeVisible();
    
    // Go back
    await page.click('button:has-text("Back")');
    
    // Should be back on step 1
    await expect(page.locator('text=Step 1 of 6')).toBeVisible();
  });

  test('should persist selections when going back and forth', async ({ page }) => {
    await signUpUser(page);
    
    // Navigate and make selections
    await page.click('button:has-text("Begin")');
    await page.click('button:has-text("Health & Fitness")');
    await page.click('button:has-text("Career & Work")');
    await page.click('button:has-text("Next")');
    
    // Go back
    await page.click('button:has-text("Back")');
    
    // Selections should still be visible
    await expect(page.locator('text=2 areas selected')).toBeVisible();
  });
});

test.describe('Onboarding - Custom Goals', () => {
  test('should allow adding custom goals', async ({ page }) => {
    await signUpUser(page);
    
    await page.click('button:has-text("Begin")');
    await page.click('button:has-text("Health & Fitness")');
    await page.click('button:has-text("Next")');
    
    // Add a custom goal
    const customGoalInput = page.locator('input[placeholder*="Add your own"]');
    await customGoalInput.fill('Run a marathon');
    await page.click('button:has-text("Add")');
    
    // Custom goal should appear
    await expect(page.locator('text=Run a marathon')).toBeVisible();
    
    // Should be able to remove it
    await page.locator('text=Run a marathon').locator('..').locator('button:has-text("×")').click();
    await expect(page.locator('text=Run a marathon')).not.toBeVisible();
  });
});

test.describe('Onboarding - Edge Cases', () => {
  test('should handle multiple focus areas correctly', async ({ page }) => {
    await signUpUser(page);
    
    await page.click('button:has-text("Begin")');
    
    // Select multiple areas
    await page.click('button:has-text("Health & Fitness")');
    await page.click('button:has-text("Career & Work")');
    await page.click('button:has-text("Money & Wealth")');
    
    await expect(page.locator('text=3 areas selected')).toBeVisible();
    
    // Deselect one
    await page.click('button:has-text("Career & Work")');
    await expect(page.locator('text=2 areas selected')).toBeVisible();
  });

  test('should show progress bar', async ({ page }) => {
    await signUpUser(page);
    
    await page.click('button:has-text("Begin")');
    
    // Progress bar should be visible
    const progressBar = page.locator('[class*="bg-gradient-to-r"][class*="h-full"]');
    await expect(progressBar).toBeVisible();
  });
});

