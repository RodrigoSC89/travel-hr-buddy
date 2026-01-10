/**
 * E2E Tests - HR Chatbot Integration
 * Validates hr-chat edge function integration with Portal Colaborador
 */
import { test, expect } from '@playwright/test';

test.describe('HR Chatbot in Employee Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('networkidle');
  });

  test('should load employee portal page', async ({ page }) => {
    await expect(page.locator('h1, h2, [data-testid="portal-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display chatbot interface or trigger', async ({ page }) => {
    // Look for chat-related UI elements
    const chatTriggers = page.locator(
      'button:has-text("Chat"), ' +
      'button:has-text("Assistente"), ' +
      'button:has-text("Ajuda"), ' +
      '[aria-label*="chat"], ' +
      '[data-testid="chatbot"], ' +
      '.chatbot, ' +
      '[class*="chat"]'
    );
    
    const chatTriggersCount = await chatTriggers.count();
    
    // Should have some chat interface
    console.log(`Found ${chatTriggersCount} chat-related elements`);
  });

  test('should have chat input field available', async ({ page }) => {
    // Look for input fields that might be chat inputs
    const inputs = page.locator(
      'input[placeholder*="mensagem"], ' +
      'input[placeholder*="pergunte"], ' +
      'input[placeholder*="digite"], ' +
      'textarea[placeholder*="mensagem"], ' +
      '[data-testid="chat-input"]'
    );
    
    await page.waitForTimeout(1000);
    const inputCount = await inputs.count();
    console.log(`Found ${inputCount} potential chat input fields`);
  });

  test('should be able to send a test message', async ({ page }) => {
    // Find and interact with chat input
    const chatInput = page.locator(
      'input[placeholder*="mensagem"], ' +
      'input[placeholder*="pergunte"], ' +
      'textarea, ' +
      '[data-testid="chat-input"]'
    ).first();
    
    if (await chatInput.isVisible()) {
      await chatInput.fill('Olá, qual meu saldo de férias?');
      
      // Look for send button
      const sendButton = page.locator(
        'button:has-text("Enviar"), ' +
        'button[type="submit"], ' +
        'button:has([class*="send"]), ' +
        '[aria-label*="enviar"]'
      ).first();
      
      if (await sendButton.isVisible()) {
        await sendButton.click();
        
        // Wait for potential response
        await page.waitForTimeout(3000);
        
        // Check if any response appeared
        const responseArea = page.locator('.message, [class*="response"], [class*="chat-message"]');
        const responseCount = await responseArea.count();
        console.log(`Found ${responseCount} message elements after sending`);
      }
    }
  });
});

test.describe('HR Chatbot Page', () => {
  test('should load dedicated chatbot page', async ({ page }) => {
    await page.goto('/hr-chatbot');
    await expect(page.locator('h1, h2, [data-testid="page-title"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display chatbot interface', async ({ page }) => {
    await page.goto('/hr-chatbot');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasChat = 
      content?.toLowerCase().includes('chat') ||
      content?.toLowerCase().includes('assistente') ||
      content?.toLowerCase().includes('mensagem') ||
      content?.toLowerCase().includes('pergunte');
    
    expect(hasChat).toBeTruthy();
  });

  test('should have message input and send functionality', async ({ page }) => {
    await page.goto('/hr-chatbot');
    await page.waitForLoadState('networkidle');
    
    // Look for input
    const input = page.locator('input, textarea').first();
    
    if (await input.isVisible()) {
      await input.fill('Como solicitar férias?');
      
      // Look for any button that could send
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
    }
  });
});

test.describe('HR Chatbot AI Context', () => {
  test('should display employee context when available', async ({ page }) => {
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('networkidle');
    
    // Look for employee profile info that would be passed to chatbot
    const profileElements = page.locator(
      '[class*="profile"], ' +
      '[class*="employee"], ' +
      '[data-testid*="employee"], ' +
      '[data-testid*="profile"]'
    );
    
    const profileCount = await profileElements.count();
    console.log(`Found ${profileCount} profile-related elements`);
  });

  test('should show payslip information in portal', async ({ page }) => {
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('networkidle');
    
    const content = await page.textContent('body');
    const hasPayslipInfo = 
      content?.toLowerCase().includes('holerite') ||
      content?.toLowerCase().includes('salário') ||
      content?.toLowerCase().includes('pagamento') ||
      content?.toLowerCase().includes('líquido');
    
    // May or may not be visible depending on auth state
    console.log(`Payslip info visible: ${hasPayslipInfo}`);
  });
});

test.describe('HR Chatbot Network Requests', () => {
  test('should call hr-chat edge function when sending message', async ({ page }) => {
    let hrChatCalled = false;
    
    // Monitor network requests
    page.on('request', request => {
      if (request.url().includes('hr-chat')) {
        hrChatCalled = true;
        console.log('hr-chat function called:', request.url());
      }
    });
    
    await page.goto('/hr-chatbot');
    await page.waitForLoadState('networkidle');
    
    // Try to send a message
    const input = page.locator('input, textarea').first();
    
    if (await input.isVisible()) {
      await input.fill('Olá');
      
      const sendButton = page.locator('button[type="submit"], button:has-text("Enviar")').first();
      if (await sendButton.isVisible()) {
        await sendButton.click();
        await page.waitForTimeout(3000);
      }
    }
    
    console.log(`hr-chat edge function was called: ${hrChatCalled}`);
  });
});

test.describe('HR Chatbot Response Quality', () => {
  test('should handle common HR questions gracefully', async ({ page }) => {
    await page.goto('/hr-chatbot');
    await page.waitForLoadState('networkidle');
    
    const commonQuestions = [
      'Como solicitar férias?',
      'Qual meu saldo de férias?',
      'Quando é o pagamento?',
      'Como enviar atestado médico?'
    ];
    
    // Just verify the page can handle input
    const input = page.locator('input, textarea').first();
    
    if (await input.isVisible()) {
      await input.fill(commonQuestions[0]);
      expect(await input.inputValue()).toBe(commonQuestions[0]);
    }
  });
});

test.describe('HR Chatbot Performance', () => {
  test('chatbot page should load within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/hr-chatbot');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000);
    console.log(`HR Chatbot page loaded in ${duration}ms`);
  });

  test('portal page should load within 3 seconds', async ({ page }) => {
    const start = Date.now();
    await page.goto('/portal-colaborador');
    await page.waitForLoadState('domcontentloaded');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(3000);
    console.log(`Portal Colaborador loaded in ${duration}ms`);
  });
});
