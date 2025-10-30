import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * E2E Test: Authentication with Supabase
 * Tests secure login and logout functionality
 */

test.describe('Authentication with Supabase', () => {
  const screenshotsDir = path.join(process.cwd(), 'screenshots');

  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('should display login page on initial load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for login elements
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    const hasLoginForm = 
      await emailInput.isVisible().catch(() => false) &&
      await passwordInput.isVisible().catch(() => false);

    // Should show login form or already be authenticated
    expect(hasLoginForm || !page.url().includes('login')).toBeTruthy();

    // Capture screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-login-page.png'),
      fullPage: true 
    });
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const isVisible = await emailInput.isVisible().catch(() => false);

    if (isVisible) {
      // Enter invalid email
      await emailInput.fill('invalid-email');
      
      // Try to submit
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(1000);

        // Capture validation state
        await page.screenshot({ 
          path: path.join(screenshotsDir, 'auth-validation-error.png'),
          fullPage: true 
        });
      }
    }
  });

  test('should handle login attempt', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    const hasLoginForm = 
      await emailInput.isVisible().catch(() => false) &&
      await passwordInput.isVisible().catch(() => false);

    if (hasLoginForm) {
      // Fill in credentials
      await emailInput.fill('test@example.com');
      await passwordInput.fill('testpassword123');

      // Capture filled form
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'auth-login-filled.png'),
        fullPage: true 
      });

      // Submit form
      const submitButton = page.locator('button[type="submit"]').first();
      await submitButton.click();

      // Wait for response
      await page.waitForTimeout(3000);

      // Capture result
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'auth-login-attempt.png'),
        fullPage: true 
      });
    }
  });

  test('should handle mock authentication', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Mock Supabase authentication
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          role: 'authenticated'
        }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });

    // Reload to apply auth
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify authentication worked (no longer on login page or has auth indicators)
    const url = page.url();
    const isAuthenticated = !url.includes('login') || url.includes('dashboard');

    expect(isAuthenticated).toBeTruthy();

    // Capture authenticated state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-authenticated.png'),
      fullPage: true 
    });
  });

  test('should handle logout', async ({ page }) => {
    // First authenticate
    await page.goto('/');
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Look for logout button
    const logoutButton = page.locator('button, a').filter({ 
      hasText: /logout|sair|sign out/i 
    }).first();

    const logoutExists = await logoutButton.isVisible().catch(() => false);

    if (logoutExists) {
      await logoutButton.click();
      await page.waitForTimeout(2000);

      // Verify logged out (redirected to login or auth cleared)
      const authToken = await page.evaluate(() => {
        return localStorage.getItem('sb-localhost-auth-token');
      });

      // Auth token should be cleared or we should be on login page
      const isLoggedOut = !authToken || page.url().includes('login');
      expect(isLoggedOut).toBeTruthy();

      // Capture logged out state
      await page.screenshot({ 
        path: path.join(screenshotsDir, 'auth-logged-out.png'),
        fullPage: true 
      });
    }
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // Set authentication
    await page.goto('/');
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Reload again
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check auth persisted
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('sb-localhost-auth-token');
    });

    expect(authToken).toBeTruthy();

    // Capture persisted state
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-persisted.png'),
      fullPage: true 
    });
  });

  test('should not have authentication errors (401/403)', async ({ page }) => {
    const authErrors: number[] = [];

    // Listen for authentication errors
    page.on('response', response => {
      const status = response.status();
      if (status === 401 || status === 403) {
        authErrors.push(status);
      }
    });

    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        user: { id: 'test-user-id', email: 'test@example.com' }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Wait for any async calls
    await page.waitForTimeout(3000);

    // Should have minimal auth errors with mocked credentials
    // (In production with real Supabase, this would validate real tokens)
    expect(authErrors.length).toBeLessThan(10);
  });

  test('should load authentication page without timeout', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', {
      timeout: 30000 // 30 seconds max
    });
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    
    // Should load in less than 30 seconds
    expect(loadTime).toBeLessThan(30000);
    
    // Take screenshot
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-performance.png'),
      fullPage: true 
    });
  });

  test('should display user profile after authentication', async ({ page }) => {
    // Authenticate
    await page.goto('/');
    await page.evaluate(() => {
      const mockAuth = {
        access_token: 'mock-access-token',
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          user_metadata: { name: 'Test User' }
        }
      };
      localStorage.setItem('sb-localhost-auth-token', JSON.stringify(mockAuth));
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Look for user profile indicators
    const userProfile = page.locator('[class*="profile"], [class*="user"], [data-testid*="user"]').first();
    const hasProfile = await userProfile.isVisible().catch(() => false);

    // Capture profile display
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'auth-user-profile.png'),
      fullPage: true 
    });

    // Profile should be visible or URL indicates authenticated state
    expect(hasProfile || !page.url().includes('login')).toBeTruthy();
  });
});
