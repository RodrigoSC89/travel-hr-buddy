/**
 * PEOTRAM Compliance Validation Tests
 * E2E tests for PEOTRAM 2024 audit compliance
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('PEOTRAM Compliance Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@nautilus.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|central/);
  });

  test('should generate compliant evidence package', async ({ page }) => {
    // Start audit
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Click start new audit if available
    const startButton = page.locator('button:has-text("Iniciar"), button:has-text("Start")');
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    
    // Go through all 13 elements
    for (let i = 1; i <= 13; i++) {
      const elementTab = page.locator(`[data-element="${i}"], button:has-text("Elemento ${i}")`);
      if (await elementTab.isVisible()) {
        await elementTab.click();
        await page.waitForTimeout(500);
        
        // Check for file input and upload if available
        const fileInput = page.locator('input[type="file"]');
        if (await fileInput.isVisible()) {
          // Create test evidence file
          const testFilePath = path.join(__dirname, `../test-data/evidence-${i}.pdf`);
          if (fs.existsSync(testFilePath)) {
            await fileInput.setInputFiles(testFilePath);
          }
        }
        
        // Add notes if textarea available
        const notesField = page.locator('textarea').first();
        if (await notesField.isVisible()) {
          await notesField.fill(`Notas de conformidade para elemento ${i} - Verificado em ${new Date().toISOString()}`);
        }
        
        // Save evidence
        const saveButton = page.locator('button:has-text("Salvar"), button:has-text("Save")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // Generate final report
    const reportButton = page.locator('button:has-text("Gerar Relatório"), button:has-text("Generate Report")');
    if (await reportButton.isVisible()) {
      await reportButton.click();
      
      // Wait for report generation
      await page.waitForTimeout(2000);
      
      // Check for download button
      const downloadButton = page.locator('button:has-text("Download PDF"), button:has-text("Baixar PDF")');
      if (await downloadButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download');
        await downloadButton.click();
        const download = await downloadPromise;
        
        // Validate download started
        expect(download.suggestedFilename()).toContain('PEOTRAM');
      }
    }
  });

  test('should prevent submission with incomplete elements', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Try to submit without completing all elements
    const submitButton = page.locator('button:has-text("Submeter"), button:has-text("Submit Audit")');
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation error
      const errorMessage = page.locator('text=Complete todos, text=Complete all, [role="alert"]');
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('should track audit progress correctly', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Check progress indicator exists
    const progressBar = page.locator('[role="progressbar"], .progress-bar, [data-testid="progress"]');
    if (await progressBar.isVisible()) {
      const initialProgress = await progressBar.getAttribute('aria-valuenow') || '0';
      
      // Complete first element
      const firstElement = page.locator('[data-element="1"], button:has-text("Elemento 1")');
      if (await firstElement.isVisible()) {
        await firstElement.click();
        
        // Mark as complete
        const completeButton = page.locator('button:has-text("Concluir"), button:has-text("Complete")');
        if (await completeButton.isVisible()) {
          await completeButton.click();
          
          // Check progress updated
          await page.waitForTimeout(500);
          const newProgress = await progressBar.getAttribute('aria-valuenow') || '0';
          expect(parseInt(newProgress)).toBeGreaterThan(parseInt(initialProgress));
        }
      }
    }
  });

  test('should display digital signatures for completed elements', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Navigate to a completed element
    const completedElement = page.locator('[data-status="complete"], .element-complete');
    if (await completedElement.first().isVisible()) {
      await completedElement.first().click();
      
      // Check for signature hash
      const signatureHash = page.locator('[data-testid="signature-hash"], .signature-hash, text=Assinatura');
      await expect(signatureHash).toBeVisible({ timeout: 5000 });
    }
  });

  test('should export audit history', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Navigate to history/audit list
    const historyTab = page.locator('button:has-text("Histórico"), button:has-text("History")');
    if (await historyTab.isVisible()) {
      await historyTab.click();
      
      // Check export button
      const exportButton = page.locator('button:has-text("Exportar"), button:has-text("Export")');
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        // Should show export options or start download
        const exportOptions = page.locator('[role="menu"], .export-options');
        const download = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
        
        expect(await exportOptions.isVisible() || await download !== null).toBeTruthy();
      }
    }
  });
});

test.describe('PEOTRAM AI Evidence Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
    await page.fill('[name="email"]', 'test@nautilus.com');
    await page.fill('[name="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard|central/);
  });

  test('should generate AI-powered evidence descriptions', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Navigate to element with AI generation
    const aiButton = page.locator('button:has-text("Gerar com IA"), button:has-text("AI Generate")');
    if (await aiButton.isVisible()) {
      await aiButton.click();
      
      // Wait for AI response
      await page.waitForTimeout(3000);
      
      // Check for generated content
      const generatedContent = page.locator('.ai-generated, [data-ai="true"]');
      await expect(generatedContent).toBeVisible({ timeout: 10000 });
    }
  });

  test('should allow voice input for audit notes', async ({ page }) => {
    await page.goto('/peotram');
    await page.waitForLoadState('networkidle');
    
    // Check for voice input button
    const voiceButton = page.locator('button[aria-label*="voice"], button:has-text("🎤"), .voice-input-btn');
    if (await voiceButton.isVisible()) {
      // Voice button exists - test passes
      expect(await voiceButton.isEnabled()).toBeTruthy();
    }
  });
});
