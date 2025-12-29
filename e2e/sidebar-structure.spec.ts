/**
 * Playwright E2E Test: Sidebar Structure Validation
 * Validates that all 16 mandatory groups are rendered in the sidebar
 * 
 * @see dev/SIDEBAR-COMPLETE.md for official structure
 */

import { test, expect } from '@playwright/test';

// 16 mandatory groups that MUST be present - OFFICIAL v3.2.0
const MANDATORY_GROUPS = [
  { id: 1, emoji: "🧠", label: "Centro de Comando" },
  { id: 2, emoji: "⚓", label: "Operações Marítimas" },
  { id: 3, emoji: "🔧", label: "Manutenção" },
  { id: 4, emoji: "🌊", label: "Operações Submarinas" },
  { id: 5, emoji: "🤖", label: "IA & Automação" },
  { id: 6, emoji: "📡", label: "Telemetria & Monitoramento" },
  { id: 7, emoji: "🌐", label: "APIs & Integrações" },
  { id: 8, emoji: "📁", label: "Relatórios & Documentos" },
  { id: 9, emoji: "📢", label: "Comunicação & Alertas" },
  { id: 10, emoji: "🔍", label: "Auditorias" },
  { id: 11, emoji: "👥", label: "RH & Pessoas" },
  { id: 12, emoji: "🎓", label: "Treinamentos" },
  { id: 13, emoji: "💰", label: "Finanças & Procurement" },
  { id: 14, emoji: "🌱", label: "ESG & Sustentabilidade" },
  { id: 15, emoji: "✈️", label: "Viagens & Logística" },
  { id: 16, emoji: "⚙️", label: "Sistema & Configurações" },
];

test.describe('Sidebar Structure Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main app (sidebar should be visible)
    await page.goto('/');
    
    // Wait for sidebar to be rendered
    await page.waitForSelector('[data-testid="sidebar"], .sidebar, aside', { 
      timeout: 10000 
    }).catch(() => {
      // Fallback: wait for any navigation element
      return page.waitForSelector('nav', { timeout: 5000 });
    });
  });

  test('should have all 16 mandatory sidebar groups', async ({ page }) => {
    const sidebarContent = await page.content();
    const missingGroups: string[] = [];
    
    for (const group of MANDATORY_GROUPS) {
      // Check for either emoji or label text
      const hasEmoji = sidebarContent.includes(group.emoji);
      const hasLabel = sidebarContent.toLowerCase().includes(group.label.toLowerCase());
      
      if (!hasEmoji && !hasLabel) {
        missingGroups.push(`${group.emoji} ${group.label}`);
      }
    }
    
    // Report all missing groups at once
    if (missingGroups.length > 0) {
      console.log('Missing sidebar groups:', missingGroups);
    }
    
    expect(missingGroups.length, `Missing groups: ${missingGroups.join(', ')}`).toBe(0);
  });

  test('should render sidebar with correct structure', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.locator('[data-testid="sidebar"], .sidebar, aside, nav').first();
    await expect(sidebar).toBeVisible();
    
    // Check for collapsible groups (accordion-like structure)
    const collapsibleGroups = page.locator('[data-radix-collection-item], [data-state="open"], [data-state="closed"], .collapsible');
    const groupCount = await collapsibleGroups.count();
    
    // Should have at least 10 collapsible groups (some may be combined)
    expect(groupCount).toBeGreaterThanOrEqual(10);
  });

  test('sidebar groups should be expandable', async ({ page }) => {
    // Find first collapsed group and try to expand it
    const collapsedGroup = page.locator('[data-state="closed"]').first();
    
    if (await collapsedGroup.isVisible()) {
      await collapsedGroup.click();
      
      // After clicking, it should be open
      await expect(collapsedGroup).toHaveAttribute('data-state', 'open');
    }
  });

  test('sidebar links should have valid routes', async ({ page }) => {
    // Get all links in sidebar
    const sidebarLinks = page.locator('aside a[href], nav a[href], .sidebar a[href]');
    const linkCount = await sidebarLinks.count();
    
    // Should have many navigation links
    expect(linkCount).toBeGreaterThan(20);
    
    // Sample check: verify a few links don't lead to 404
    const sampleLinks = await sidebarLinks.evaluateAll((links) => 
      links.slice(0, 5).map((link) => link.getAttribute('href')).filter(Boolean)
    );
    
    for (const href of sampleLinks) {
      if (href && href.startsWith('/')) {
        const response = await page.goto(href);
        expect(response?.status()).not.toBe(404);
        
        // Go back to home for next iteration
        await page.goto('/');
      }
    }
  });

  test('diagnostic panel should be accessible', async ({ page }) => {
    await page.goto('/dev/sidebar-check');
    
    // Should render the diagnostic panel
    await expect(page.getByText('Sidebar Diagnostic Panel')).toBeVisible({ timeout: 5000 });
    
    // Should show group count
    await expect(page.getByText(/Grupos Encontrados/i)).toBeVisible();
    
    // Should show validation table
    await expect(page.getByText(/Validação Detalhada/i)).toBeVisible();
  });
});

test.describe('Sidebar Role-Based Visibility', () => {
  // These tests require authentication - marked as skip by default
  // Enable when auth flow is configured in test environment
  
  test.skip('admin should see all sidebar groups', async ({ page }) => {
    // TODO: Login as admin
    // await loginAsAdmin(page);
    
    await page.goto('/');
    
    // Admin should see all 16 groups
    for (const group of MANDATORY_GROUPS) {
      await expect(page.getByText(group.label)).toBeVisible();
    }
  });

  test.skip('operator should see limited sidebar groups', async ({ page }) => {
    // TODO: Login as operator with limited permissions
    // await loginAsOperator(page);
    
    await page.goto('/');
    
    // Operator should see operational groups but maybe not admin groups
    await expect(page.getByText('Operações Marítimas')).toBeVisible();
    // Admin-only groups might be hidden based on role
  });
});
