import { test, expect } from '@playwright/test';

test.describe('🔐 Authentication E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login page for unauthenticated users', async ({ page }) => {
    await page.goto('/auth');
    await expect(page.locator('text=Login')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    // Should show validation error
    await expect(page.locator('text=/email|inválido/i')).toBeVisible({ timeout: 5000 });
  });

  test('should validate password minimum length', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123');
    await page.click('button[type="submit"]');
    // Should show validation error for short password
    await expect(page.locator('text=/senha|caracteres|curta/i')).toBeVisible({ timeout: 5000 });
  });

  test('should toggle between login and signup', async ({ page }) => {
    await page.goto('/auth');
    
    // Should start on login
    await expect(page.locator('text=Login')).toBeVisible();
    
    // Toggle to signup
    const signupLink = page.locator('text=/criar conta|cadastrar|registrar/i');
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page.locator('text=/cadastro|registrar|criar conta/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', 'wrongpassword123');
    await page.click('button[type="submit"]');
    
    // Should show authentication error
    await expect(page.locator('text=/erro|inválido|incorreto/i')).toBeVisible({ timeout: 10000 });
  });

  test('protected routes should redirect to login', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/central-comando');
    
    // Should redirect to auth or show login prompt
    const currentUrl = page.url();
    expect(currentUrl.includes('/auth') || currentUrl.includes('/login')).toBeTruthy();
  });

});

test.describe('🚀 Critical Operations E2E Tests', () => {

  test('should load dashboard page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Nautilus/i);
  });

  test('should navigate to Command Center', async ({ page }) => {
    await page.goto('/central-comando/visao-geral');
    await expect(page.locator('text=/comando|command|visão/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load fleet management', async ({ page }) => {
    await page.goto('/fleet-command');
    await expect(page.locator('text=/frota|fleet|embarcação/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load maintenance center', async ({ page }) => {
    await page.goto('/maintenance-command');
    await expect(page.locator('text=/manutenção|maintenance/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load crew management', async ({ page }) => {
    await page.goto('/crew-management');
    await expect(page.locator('text=/tripulação|crew|pessoal/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load compliance hub', async ({ page }) => {
    await page.goto('/compliance-hub');
    await expect(page.locator('text=/compliance|conformidade/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load AI operations center', async ({ page }) => {
    await page.goto('/ai-operations-center');
    await expect(page.locator('text=/ai|ia|inteligência/i')).toBeVisible({ timeout: 10000 });
  });

  test('should load security center', async ({ page }) => {
    await page.goto('/security-center');
    await expect(page.locator('text=/segurança|security/i')).toBeVisible({ timeout: 10000 });
  });

});

test.describe('🔘 Floating Buttons E2E Tests', () => {

  test('floating buttons should not overlap', async ({ page }) => {
    await page.goto('/central-comando/visao-geral');
    await page.waitForTimeout(2000); // Wait for animations
    
    // Get all floating button elements
    const floatingButtons = await page.locator('.fixed.bottom-6.right-6, .fixed.bottom-4.right-4').all();
    
    if (floatingButtons.length > 1) {
      const boxes = await Promise.all(floatingButtons.map(btn => btn.boundingBox()));
      
      // Check for overlapping
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const box1 = boxes[i];
          const box2 = boxes[j];
          
          if (box1 && box2) {
            const overlap = !(
              box1.x + box1.width < box2.x ||
              box2.x + box2.width < box1.x ||
              box1.y + box1.height < box2.y ||
              box2.y + box2.height < box1.y
            );
            
            expect(overlap).toBeFalsy();
          }
        }
      }
    }
  });

  test('floating buttons should be clickable', async ({ page }) => {
    await page.goto('/central-comando/visao-geral');
    await page.waitForTimeout(2000);
    
    // Check that buttons in the floating container are clickable
    const container = page.locator('[aria-label="Botões de ação rápida"]');
    if (await container.isVisible()) {
      const buttons = await container.locator('button').all();
      
      for (const button of buttons) {
        const isClickable = await button.isEnabled();
        expect(isClickable).toBeTruthy();
      }
    }
  });

});

test.describe('📱 Responsive Design E2E Tests', () => {

  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Nautilus/i);
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Nautilus/i);
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Nautilus/i);
  });

});
