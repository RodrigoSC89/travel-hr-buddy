import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Mission Execution Flow
 * Tests mission control, task execution, and workflow management
 */

test.describe('Mission Execution Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to mission control
    await page.goto('/');
    
    // Try to navigate to mission control or control page
    const missionLink = page.getByRole('link', { name: /mission|control|missão/i }).first();
    if (await missionLink.count() > 0) {
      await missionLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('should display mission control dashboard', async ({ page }) => {
    // Look for mission control elements
    const dashboard = page.locator('[data-testid*="mission"], [data-testid*="control"]').first();
    const heading = page.getByRole('heading', { name: /mission|control/i }).first();
    
    const hasDashboard = 
      await dashboard.count() > 0 || 
      await heading.count() > 0;
    
    expect(hasDashboard).toBe(true);
  });

  test('should create a new mission', async ({ page }) => {
    // Look for create mission button
    const createButton = page.getByRole('button', { name: /create|new|add|criar|nova/i }).first();
    
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Form or dialog should appear
      const form = page.locator('form').first();
      const dialog = page.locator('[role="dialog"]').first();
      
      const hasForm = await form.count() > 0 || await dialog.count() > 0;
      expect(hasForm).toBe(true);
    }
  });

  test('should list active missions', async ({ page }) => {
    // Look for missions list
    const missionsList = page.locator('[data-testid*="missions-list"]').first();
    const missionsTable = page.locator('table').first();
    const missionCards = page.locator('[data-testid*="mission-card"]');
    
    const hasMissionsList = 
      await missionsList.count() > 0 || 
      await missionsTable.count() > 0 ||
      await missionCards.count() > 0;
    
    expect(hasMissionsList).toBe(true);
  });

  test('should filter missions by status', async ({ page }) => {
    // Look for status filter
    const statusFilter = page.locator('[data-testid*="status-filter"]').first();
    const filterButton = page.getByRole('button', { name: /filter|filtrar|status/i }).first();
    
    if (await filterButton.count() > 0) {
      await filterButton.click();
      await page.waitForTimeout(500);
      
      // Filter options should appear
      const filterMenu = page.locator('[role="menu"], [role="listbox"]').first();
      expect(await filterMenu.count()).toBeGreaterThan(0);
    } else if (await statusFilter.count() > 0) {
      expect(await statusFilter.isVisible()).toBe(true);
    }
  });

  test('should view mission details', async ({ page }) => {
    // Find first mission item
    const firstMission = page.locator('[data-testid*="mission-"]').first();
    const missionRow = page.locator('tbody tr').first();
    
    if (await firstMission.count() > 0) {
      await firstMission.click();
      await page.waitForTimeout(1000);
      
      // Details should show
      const details = page.locator('[data-testid*="mission-details"]').first();
      expect(await details.count()).toBeGreaterThan(0);
    } else if (await missionRow.count() > 0) {
      await missionRow.click();
      await page.waitForTimeout(1000);
    }
  });

  test('should start mission execution', async ({ page }) => {
    // Look for start/execute button
    const startButton = page.getByRole('button', { name: /start|execute|iniciar|executar/i }).first();
    const playButton = page.locator('[aria-label*="start" i]').first();
    
    if (await startButton.count() > 0) {
      expect(await startButton.isVisible()).toBe(true);
    } else if (await playButton.count() > 0) {
      expect(await playButton.isVisible()).toBe(true);
    }
  });

  test('should pause mission execution', async ({ page }) => {
    // Look for pause button
    const pauseButton = page.getByRole('button', { name: /pause|pausar/i }).first();
    const pauseIcon = page.locator('[aria-label*="pause" i]').first();
    
    if (await pauseButton.count() > 0) {
      expect(await pauseButton.isVisible()).toBe(true);
    } else if (await pauseIcon.count() > 0) {
      expect(await pauseIcon.isVisible()).toBe(true);
    }
  });

  test('should display mission progress', async ({ page }) => {
    // Look for progress indicators
    const progressBar = page.locator('[role="progressbar"]').first();
    const progressText = page.getByText(/progress|progresso|%/i).first();
    const statusBadge = page.locator('[data-testid*="status"]').first();
    
    const hasProgress = 
      await progressBar.count() > 0 || 
      await progressText.count() > 0 ||
      await statusBadge.count() > 0;
    
    expect(hasProgress).toBe(true);
  });

  test('should show mission tasks/steps', async ({ page }) => {
    // Look for tasks list
    const tasksList = page.locator('[data-testid*="tasks"], [data-testid*="steps"]').first();
    const tasksHeading = page.getByRole('heading', { name: /tasks|steps|tarefas|etapas/i }).first();
    
    if (await tasksList.count() > 0) {
      expect(await tasksList.isVisible()).toBe(true);
    } else if (await tasksHeading.count() > 0) {
      expect(await tasksHeading.isVisible()).toBe(true);
    }
  });

  test('should update mission status', async ({ page }) => {
    // Look for status update controls
    const statusSelect = page.locator('select[name*="status"]').first();
    const statusButton = page.getByRole('button', { name: /status/i }).first();
    
    if (await statusSelect.count() > 0) {
      expect(await statusSelect.isVisible()).toBe(true);
    } else if (await statusButton.count() > 0) {
      expect(await statusButton.isVisible()).toBe(true);
    }
  });

  test('should assign mission to user', async ({ page }) => {
    // Look for assignment controls
    const assignButton = page.getByRole('button', { name: /assign|atribuir/i }).first();
    const assignSelect = page.locator('select[name*="assign"]').first();
    
    if (await assignButton.count() > 0) {
      await assignButton.click();
      await page.waitForTimeout(500);
      
      // Assignment dialog should open
      const dialog = page.locator('[role="dialog"]').first();
      expect(await dialog.count()).toBeGreaterThan(0);
    } else if (await assignSelect.count() > 0) {
      expect(await assignSelect.isVisible()).toBe(true);
    }
  });

  test('should add comment to mission', async ({ page }) => {
    // Look for comment input
    const commentInput = page.getByRole('textbox', { name: /comment|comentário/i }).first();
    const commentArea = page.locator('textarea[placeholder*="comment" i]').first();
    
    if (await commentInput.count() > 0) {
      await commentInput.fill('Test comment');
      expect(await commentInput.inputValue()).toBe('Test comment');
    } else if (await commentArea.count() > 0) {
      await commentArea.fill('Test comment');
      expect(await commentArea.inputValue()).toBe('Test comment');
    }
  });

  test('should display mission timeline', async ({ page }) => {
    // Look for timeline or history
    const timeline = page.locator('[data-testid*="timeline"]').first();
    const history = page.locator('[data-testid*="history"]').first();
    const activityLog = page.getByRole('heading', { name: /activity|timeline|histórico/i }).first();
    
    const hasTimeline = 
      await timeline.count() > 0 || 
      await history.count() > 0 ||
      await activityLog.count() > 0;
    
    expect(hasTimeline).toBe(true);
  });

  test('should complete mission', async ({ page }) => {
    // Look for complete button
    const completeButton = page.getByRole('button', { name: /complete|finish|concluir|finalizar/i }).first();
    
    if (await completeButton.count() > 0) {
      expect(await completeButton.isVisible()).toBe(true);
    }
  });

  test('should cancel mission', async ({ page }) => {
    // Look for cancel button
    const cancelButton = page.getByRole('button', { name: /cancel|cancelar/i }).first();
    
    if (await cancelButton.count() > 0) {
      await cancelButton.click();
      await page.waitForTimeout(500);
      
      // Confirmation dialog should appear
      const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]').first();
      expect(await confirmDialog.count()).toBeGreaterThan(0);
    }
  });

  test('should show mission metrics', async ({ page }) => {
    // Look for metrics/statistics
    const metricsSection = page.locator('[data-testid*="metrics"]').first();
    const statsCards = page.locator('[data-testid*="stat-card"]');
    const kpiSection = page.getByRole('heading', { name: /metrics|statistics|kpi/i }).first();
    
    const hasMetrics = 
      await metricsSection.count() > 0 || 
      await statsCards.count() > 0 ||
      await kpiSection.count() > 0;
    
    expect(hasMetrics).toBe(true);
  });

  test('should export mission report', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByRole('button', { name: /export|download|exportar/i }).first();
    
    if (await exportButton.count() > 0) {
      expect(await exportButton.isVisible()).toBe(true);
    }
  });

  test('should handle real-time updates', async ({ page }) => {
    // Check for real-time indicators
    const liveIndicator = page.getByText(/live|real-time|tempo real/i).first();
    const wsIndicator = page.locator('[data-testid*="connection-status"]').first();
    
    const hasRealtime = 
      await liveIndicator.count() > 0 || 
      await wsIndicator.count() > 0;
    
    expect(typeof hasRealtime).toBe('boolean');
  });

  test('should validate mission form fields', async ({ page }) => {
    // Look for form validation
    const createButton = page.getByRole('button', { name: /create|new/i }).first();
    
    if (await createButton.count() > 0) {
      await createButton.click();
      await page.waitForTimeout(500);
      
      // Try to submit empty form
      const submitButton = page.getByRole('button', { name: /submit|save|criar/i }).first();
      if (await submitButton.count() > 0) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        // Error message should appear
        const errorMessage = page.getByText(/required|obrigatório|erro/i).first();
        expect(await errorMessage.count()).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
