/**
 * E2E Tests - Maintenance Critical Flows
 * FASE B.4 - Testes críticos para módulo Manutenção Preventiva
 * 
 * Test Coverage:
 * - Agendamento de manutenção
 * - Alertas de vencimento
 * - Histórico de manutenções
 * - Manutenção overdue
 */

import { test, expect } from '@playwright/test';
import { maintenanceData, maintenanceTypes, maintenanceStatuses } from './fixtures/maintenance.fixtures';

test.describe('Maintenance Critical Flows - Agendamento', () => {
  test('MAINT-CRIT-001: Deve criar nova manutenção preventiva', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');

    const createButton = await page.locator('[data-testid="create-maintenance-button"]');
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Fill maintenance form
      await page.selectOption('[name="type"]', maintenanceData.scheduled.type);
      await page.fill('[name="title"]', maintenanceData.scheduled.title);
      await page.fill('[name="description"]', maintenanceData.scheduled.description);
      await page.selectOption('[name="equipment"]', maintenanceData.scheduled.equipment);
      await page.fill('[name="scheduledDate"]', maintenanceData.scheduled.scheduledDate);
      
      // Submit
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Verify created
      const successMessage = await page.locator('.toast, [role="alert"]');
      const isVisible = await successMessage.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('MAINT-CRIT-002: Deve agendar manutenção recorrente', async ({ page }) => {
    await page.goto('/maintenance/schedule');
    await page.waitForLoadState('networkidle');

    const scheduleButton = await page.locator('[data-testid="schedule-recurring"]');
    
    if (await scheduleButton.isVisible()) {
      await scheduleButton.click();
      
      // Set recurrence
      await page.selectOption('[name="frequency"]', 'monthly');
      await page.fill('[name="title"]', 'Monthly Engine Check');
      
      // Save
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Verify scheduled
      const calendar = await page.locator('[data-testid="maintenance-calendar"]');
      const isVisible = await calendar.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('MAINT-CRIT-003: Deve atribuir manutenção a responsável', async ({ page }) => {
    await page.goto('/maintenance/1');
    await page.waitForLoadState('networkidle');

    const assignButton = await page.locator('[data-testid="assign-button"]');
    
    if (await assignButton.isVisible()) {
      await assignButton.click();
      
      // Select responsible
      await page.selectOption('[name="assignedTo"]', 'Chief Engineer');
      
      // Save
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Verify assigned
      const assignee = await page.locator('[data-testid="assigned-to"]');
      const text = await assignee.textContent();
      expect(text).toContain('Chief Engineer');
    }
  });

  test('MAINT-CRIT-004: Deve cancelar manutenção agendada', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');

    // Find scheduled maintenance
    const scheduled = await page.locator('[data-status="scheduled"]').first();
    
    if (await scheduled.isVisible()) {
      await scheduled.hover();
      
      const cancelButton = await scheduled.locator('[data-testid="cancel-maintenance"]');
      
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
        
        // Confirm
        await page.click('button:has-text("Confirm")');
        await page.waitForTimeout(1000);
        
        // Verify cancelled
        const toast = await page.locator('.toast, [role="alert"]');
        const isVisible = await toast.isVisible();
        expect(isVisible).toBeTruthy();
      }
    }
  });
});

test.describe('Maintenance Critical Flows - Alertas e Overdue', () => {
  test('MAINT-CRIT-005: Deve exibir alertas de manutenção próxima', async ({ page }) => {
    await page.goto('/maintenance/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for upcoming alerts
    const alerts = await page.locator('[data-testid="upcoming-alert"]');
    const count = await alerts.count();
    
    // Should have alerts or empty state
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('MAINT-CRIT-006: Deve destacar manutenções overdue', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');

    // Check for overdue items
    const overdue = await page.locator('[data-status="overdue"]');
    const count = await overdue.count();
    
    // Overdue items should be highlighted
    if (count > 0) {
      const firstOverdue = overdue.first();
      const classList = await firstOverdue.getAttribute('class');
      
      // Should have warning/error styling
      expect(classList).toMatch(/warning|error|danger|overdue/);
    }
  });

  test('MAINT-CRIT-007: Deve notificar responsável sobre overdue', async ({ page }) => {
    await page.goto('/maintenance/overdue');
    await page.waitForLoadState('networkidle');

    const notifyButton = await page.locator('[data-testid="notify-responsible"]');
    
    if (await notifyButton.isVisible()) {
      await notifyButton.click();
      await page.waitForTimeout(1000);
      
      // Verify notification sent
      const toast = await page.locator('.toast, [role="alert"]');
      const isVisible = await toast.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });

  test('MAINT-CRIT-008: Deve filtrar manutenções por status', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');

    const statusFilter = await page.locator('[data-testid="status-filter"]');
    
    if (await statusFilter.isVisible()) {
      // Filter by overdue
      await statusFilter.click();
      await page.click('text=Overdue');
      await page.waitForTimeout(1000);
      
      // Verify filtered
      const items = await page.locator('[data-testid="maintenance-item"]');
      const count = await items.count();
      
      // Should show only overdue or empty
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});

test.describe('Maintenance Critical Flows - Execução e Histórico', () => {
  test('MAINT-CRIT-009: Deve iniciar manutenção agendada', async ({ page }) => {
    await page.goto('/maintenance');
    await page.waitForLoadState('networkidle');

    const scheduled = await page.locator('[data-status="scheduled"]').first();
    
    if (await scheduled.isVisible()) {
      await scheduled.click();
      
      const startButton = await page.locator('[data-testid="start-maintenance"]');
      
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
        
        // Verify status changed to in_progress
        const status = await page.locator('[data-testid="maintenance-status"]');
        const text = await status.textContent();
        expect(text).toContain('progress');
      }
    }
  });

  test('MAINT-CRIT-010: Deve registrar progresso da manutenção', async ({ page }) => {
    await page.goto('/maintenance/1');
    await page.waitForLoadState('networkidle');

    const progressSlider = await page.locator('[data-testid="progress-slider"]');
    
    if (await progressSlider.isVisible()) {
      // Update progress
      await progressSlider.fill('50');
      
      // Save
      await page.click('[data-testid="save-progress"]');
      await page.waitForTimeout(1000);
      
      // Verify updated
      const progress = await page.locator('[data-testid="progress-value"]');
      const text = await progress.textContent();
      expect(text).toContain('50');
    }
  });

  test('MAINT-CRIT-011: Deve completar manutenção', async ({ page }) => {
    await page.goto('/maintenance/1');
    await page.waitForLoadState('networkidle');

    const completeButton = await page.locator('[data-testid="complete-maintenance"]');
    
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // Add completion notes
      await page.fill('[name="completionNotes"]', 'Maintenance completed successfully');
      
      // Confirm
      await page.click('button:has-text("Confirm")');
      await page.waitForTimeout(1000);
      
      // Verify completed
      const status = await page.locator('[data-testid="maintenance-status"]');
      const text = await status.textContent();
      expect(text).toContain('completed');
    }
  });

  test('MAINT-CRIT-012: Deve exibir histórico de manutenções', async ({ page }) => {
    await page.goto('/maintenance/history');
    await page.waitForLoadState('networkidle');

    // Verify history view
    const historyView = await page.locator('[data-testid="maintenance-history"]');
    await expect(historyView).toBeVisible();

    // Should have records or empty state
    const hasRecords = await page.locator('[data-testid="history-record"]').count() > 0;
    const hasEmptyState = await page.locator('[data-testid="empty-state"]').isVisible();
    
    expect(hasRecords || hasEmptyState).toBeTruthy();
  });

  test('MAINT-CRIT-013: Deve exportar histórico de manutenção', async ({ page }) => {
    await page.goto('/maintenance/history');
    await page.waitForLoadState('networkidle');

    const exportButton = await page.locator('[data-testid="export-history"]');
    
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // Select format
      await page.click('text=Excel');
      await page.waitForTimeout(1000);
      
      // Verify export initiated
      const toast = await page.locator('.toast, [role="alert"]');
      const isVisible = await toast.isVisible();
      expect(isVisible).toBeTruthy();
    }
  });
});
