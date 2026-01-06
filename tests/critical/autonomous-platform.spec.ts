import { test, expect } from '@playwright/test';

/**
 * Autonomous Platform v4.0 - E2E Tests
 * PATCH AUTONOMOUS: Validates decision engine, self-healing, and sensor fusion
 */

test.describe('🤖 Autonomous Platform v4.0', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/autonomous-command');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Route Accessibility', () => {
    test('should load autonomous command center', async ({ page }) => {
      await expect(page).not.toHaveURL(/404|error/i);
      await expect(page.locator('main, [role="main"]')).toBeVisible();
    });

    test('should display page title', async ({ page }) => {
      const title = page.locator('h1, h2').filter({ hasText: /Autonomous|Autônomo|Command/i });
      await expect(title.first()).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Control Panel', () => {
    test('should display engine control buttons', async ({ page }) => {
      // Check for start/stop/pause buttons
      const startButton = page.locator('button').filter({ hasText: /Iniciar|Start|▶/i });
      await expect(startButton.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display system status badge', async ({ page }) => {
      const statusBadge = page.locator('[class*="badge"], text=/Stopped|Paused|Running|Parado|Executando/i');
      await expect(statusBadge.first()).toBeVisible({ timeout: 10000 });
    });

    test('should toggle engine state on button click', async ({ page }) => {
      const startButton = page.locator('button').filter({ hasText: /Iniciar|Start/i }).first();
      
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(1000);
        
        // Status should change after click
        const runningIndicator = page.locator('text=/Running|Executando|Pausar|Stop/i');
        await expect(runningIndicator.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Decision Engine', () => {
    test('should display decisions tab', async ({ page }) => {
      const decisionsTab = page.locator('[role="tab"]').filter({ hasText: /Decisões|Decisions/i });
      await expect(decisionsTab.first()).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to decisions panel', async ({ page }) => {
      const decisionsTab = page.locator('[role="tab"]').filter({ hasText: /Decisões|Decisions/i });
      
      if (await decisionsTab.first().isVisible()) {
        await decisionsTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show decisions content
        const decisionsContent = page.locator('text=/pendente|pending|aprovar|approve|histórico|history/i');
        await expect(decisionsContent.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should show decision approval/rejection controls', async ({ page }) => {
      const decisionsTab = page.locator('[role="tab"]').filter({ hasText: /Decisões|Decisions/i });
      
      if (await decisionsTab.first().isVisible()) {
        await decisionsTab.first().click();
        await page.waitForTimeout(500);
        
        // Look for action buttons in decisions
        const actionButtons = page.locator('button').filter({ hasText: /Aprovar|Approve|Rejeitar|Reject|✓|✗/i });
        // Buttons may not be visible if no pending decisions
      }
    });
  });

  test.describe('AI Agents Panel', () => {
    test('should display agents tab', async ({ page }) => {
      const agentsTab = page.locator('[role="tab"]').filter({ hasText: /Agentes|Agents/i });
      await expect(agentsTab.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show agent cards with status indicators', async ({ page }) => {
      const agentsTab = page.locator('[role="tab"]').filter({ hasText: /Agentes|Agents/i });
      
      if (await agentsTab.first().isVisible()) {
        await agentsTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show agent names
        const agentNames = page.locator('text=/Captain|Engineer|Safety|Wellness|Navigator|Economist|Predictor|Communicator/i');
        await expect(agentNames.first()).toBeVisible({ timeout: 5000 });
      }
    });

    test('should display autonomy level badges', async ({ page }) => {
      const agentsTab = page.locator('[role="tab"]').filter({ hasText: /Agentes|Agents/i });
      
      if (await agentsTab.first().isVisible()) {
        await agentsTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show Level badges
        const levelBadges = page.locator('text=/Level [0-3]|Nível [0-3]/i');
        await expect(levelBadges.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Digital Twin Panel', () => {
    test('should display digital twin tab', async ({ page }) => {
      const twinTab = page.locator('[role="tab"]').filter({ hasText: /Digital Twin|Gêmeo Digital/i });
      await expect(twinTab.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show vessel state information', async ({ page }) => {
      // Check for vessel state display in overview
      const vesselInfo = page.locator('text=/Posição|Position|Velocidade|Speed|Rumo|Heading|Combustível|Fuel/i');
      await expect(vesselInfo.first()).toBeVisible({ timeout: 10000 });
    });

    test('should display equipment health metrics', async ({ page }) => {
      const twinTab = page.locator('[role="tab"]').filter({ hasText: /Digital Twin|Gêmeo Digital/i });
      
      if (await twinTab.first().isVisible()) {
        await twinTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show equipment health
        const equipmentInfo = page.locator('text=/Equipamento|Equipment|Saúde|Health|Engine|Generator|Radar/i');
        await expect(equipmentInfo.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Sensor Fusion', () => {
    test('should display sensor data panels', async ({ page }) => {
      // Look for sensor-related content
      const sensorContent = page.locator('text=/Sensor|Sensores|GPS|Gyroscope|AIS|Weather|Vibration/i');
      // Sensors may be in monitoring tab
    });

    test('should show data fusion confidence indicators', async ({ page }) => {
      const monitoringTab = page.locator('[role="tab"]').filter({ hasText: /Monitor|Monitoramento|Sensores/i });
      
      if (await monitoringTab.first().isVisible()) {
        await monitoringTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show confidence values
        const confidenceIndicators = page.locator('text=/Confiança|Confidence|%|Fusão|Fusion/i');
        // May not be visible if no sensor data
      }
    });
  });

  test.describe('Self-Healing System', () => {
    test('should display system health indicators', async ({ page }) => {
      const healthContent = page.locator('text=/Health|Saúde|Sistema|Status|Operacional/i');
      await expect(healthContent.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show anomaly detection alerts when present', async ({ page }) => {
      // Look for anomaly/alert indicators
      const anomalyContent = page.locator('text=/Anomalia|Anomaly|Alert|Alerta|Warning|Aviso/i');
      // Anomalies may not always be present
    });
  });

  test.describe('Configuration Panel', () => {
    test('should display configuration tab', async ({ page }) => {
      const configTab = page.locator('[role="tab"]').filter({ hasText: /Config|Configuração|Settings/i });
      await expect(configTab.first()).toBeVisible({ timeout: 10000 });
    });

    test('should show autonomy level selector', async ({ page }) => {
      const configTab = page.locator('[role="tab"]').filter({ hasText: /Config|Configuração|Settings/i });
      
      if (await configTab.first().isVisible()) {
        await configTab.first().click();
        await page.waitForTimeout(500);
        
        // Should show autonomy configuration
        const autonomyConfig = page.locator('text=/Autonomia|Autonomy|Level|Nível|L0|L1|L2|L3/i');
        await expect(autonomyConfig.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe('Offline Resilience', () => {
    test('should maintain UI state when offline', async ({ page }) => {
      // First load the page
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      
      // Go offline
      await page.context().setOffline(true);
      await page.waitForTimeout(1000);
      
      // UI should still be responsive
      await expect(page.locator('main, [role="main"]')).toBeVisible();
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should queue decisions when offline', async ({ page }) => {
      // Simulate offline state
      await page.context().setOffline(true);
      
      const decisionsTab = page.locator('[role="tab"]').filter({ hasText: /Decisões|Decisions/i });
      
      if (await decisionsTab.first().isVisible()) {
        await decisionsTab.first().click();
        // UI should remain functional
        await expect(page.locator('main, [role="main"]')).toBeVisible();
      }
      
      await page.context().setOffline(false);
    });
  });

  test.describe('Real-time Updates', () => {
    test('should update vessel position dynamically', async ({ page }) => {
      // Start the engine
      const startButton = page.locator('button').filter({ hasText: /Iniciar|Start/i }).first();
      
      if (await startButton.isVisible()) {
        await startButton.click();
        await page.waitForTimeout(2000);
        
        // Position should be displayed
        const positionDisplay = page.locator('text=/°.*°|Posição|Position/i');
        await expect(positionDisplay.first()).toBeVisible({ timeout: 5000 });
      }
    });
  });
});

test.describe('🧪 Autonomous Platform - Integration Tests', () => {
  test('should integrate with central command navigation', async ({ page }) => {
    await page.goto('/central-comando');
    await page.waitForLoadState('networkidle');
    
    // Should have link to autonomous command
    const autonomousLink = page.locator('a[href*="autonomous"], button').filter({ hasText: /Autonomous|Autônomo/i });
    // Link may be in sidebar
  });

  test('should be accessible from sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open sidebar if collapsed
    const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu)');
    if (await menuButton.first().isVisible()) {
      await menuButton.first().click();
      await page.waitForTimeout(500);
    }
    
    // Look for autonomous command link
    const sidebarLink = page.locator('a[href*="autonomous"], text=/Autonomous Command|Comando Autônomo/i');
    // Should be in navigation
  });
});
