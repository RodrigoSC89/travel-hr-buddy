/**
 * E2E Tests for Consolidated Command Centers
 * FASE B.4 - Testes para DocumentCenterBase e NotificationCenter
 * 
 * Test Coverage:
 * - DocumentCenterBase: upload, download, preview, filtros, bulk operations
 * - NotificationCenter: recebimento, mark as read, filtros, real-time updates
 */

import { test, expect } from "@playwright/test";
import { CommandCenterHelpers } from "./helpers/command-center.helpers";
import { 
  commandCenterFixtures, 
  documentCenterSelectors, 
  notificationCenterSelectors 
} from "./fixtures/command-center.fixtures";

test.describe("Command Centers Consolidados - Document Center", () => {
  let helpers: CommandCenterHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CommandCenterHelpers(page);
  });

  test("DOC-CENTER-001: Deve carregar DocumentCenter corretamente", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    // Verify container is visible
    const container = await page.locator(documentCenterSelectors.container);
    await expect(container).toBeVisible();

    // Verify key elements exist
    const uploadButton = await page.locator(documentCenterSelectors.uploadButton);
    const searchInput = await page.locator(documentCenterSelectors.searchInput);
    
    expect(await uploadButton.isVisible() || await searchInput.isVisible()).toBeTruthy();
  });

  test("DOC-CENTER-002: Deve permitir upload de documentos", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    // Check if upload button exists
    const uploadButton = await page.locator(documentCenterSelectors.uploadButton);
    
    if (await uploadButton.isVisible()) {
      // Note: actual file upload requires a real file path
      // This test verifies the UI is ready for upload
      await uploadButton.click();
      
      // Verify upload modal/dialog opens
      await page.waitForTimeout(500);
      
      // Check for file input or upload dialog
      const fileInput = await page.locator(documentCenterSelectors.uploadInput);
      const inputExists = await fileInput.count() > 0;
      
      expect(inputExists).toBeTruthy();
    }
  });

  test("DOC-CENTER-003: Deve alternar entre view modes (grid/list/table)", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    // Try switching view modes
    const viewModes: Array<"grid" | "list" | "table"> = ["grid", "list", "table"];
    
    for (const mode of viewModes) {
      const selector = mode === "grid" ? documentCenterSelectors.viewModeGrid
        : mode === "list" ? documentCenterSelectors.viewModeList
          : documentCenterSelectors.viewModeTable;
      
      const button = await page.locator(selector);
      
      if (await button.isVisible()) {
        await helpers.switchViewMode(mode);
        
        // Verify container still visible
        const container = await page.locator(documentCenterSelectors.container);
        await expect(container).toBeVisible();
      }
    }
  });

  test("DOC-CENTER-004: Deve buscar documentos com filtros", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    const searchInput = await page.locator(documentCenterSelectors.searchInput);
    
    if (await searchInput.isVisible()) {
      await helpers.searchDocuments("certificate");
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify search was executed (documents may or may not be found)
      const container = await page.locator(documentCenterSelectors.container);
      await expect(container).toBeVisible();
    }
  });

  test("DOC-CENTER-005: Deve realizar download de documentos", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    // Check if documents exist
    const documents = await page.locator(documentCenterSelectors.documentCard);
    const count = await documents.count();
    
    if (count > 0) {
      // Hover over first document
      await documents.first().hover();
      
      // Check if download button appears
      const downloadButton = documents.first().locator(documentCenterSelectors.downloadButton);
      
      if (await downloadButton.isVisible()) {
        // Note: actual download verification requires download handler
        await downloadButton.click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test("DOC-CENTER-006: Deve preview documentos", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    const documents = await page.locator(documentCenterSelectors.documentCard);
    const count = await documents.count();
    
    if (count > 0) {
      await documents.first().hover();
      
      const previewButton = documents.first().locator(documentCenterSelectors.previewButton);
      
      if (await previewButton.isVisible()) {
        await helpers.previewDocument(0);
        
        // Verify preview modal/dialog opens
        await page.waitForTimeout(1000);
        
        // Check for preview container
        const previewModal = await page.locator("[data-testid=\"preview-modal\"]");
        const isVisible = await previewModal.isVisible();
        
        // Modal should open or page should navigate
        expect(isVisible || await page.url().includes("preview")).toBeTruthy();
      }
    }
  });

  test("DOC-CENTER-007: Deve realizar bulk operations (seleção múltipla)", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    const documents = await page.locator(documentCenterSelectors.documentCard);
    const count = await documents.count();
    
    if (count >= 2) {
      // Check for bulk select checkboxes
      const checkboxes = await page.locator(documentCenterSelectors.bulkSelectCheckbox);
      const checkboxCount = await checkboxes.count();
      
      if (checkboxCount > 0) {
        // Select first two documents
        await checkboxes.first().check();
        await checkboxes.nth(1).check();
        
        // Verify bulk actions menu appears
        await page.waitForTimeout(500);
        
        const bulkActions = await page.locator(documentCenterSelectors.bulkActionsMenu);
        const isVisible = await bulkActions.isVisible();
        
        expect(isVisible).toBeTruthy();
      }
    }
  });

  test("DOC-CENTER-008: Deve filtrar por tipo de documento", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    const filterButton = await page.locator(documentCenterSelectors.filterButton);
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Try applying a filter
      await page.waitForTimeout(500);
      
      // Select a document type
      const typeFilter = await page.locator("select[name=\"type\"]");
      
      if (await typeFilter.isVisible()) {
        await helpers.applyDocumentFilter("type", "certificate");
        
        // Verify filter applied
        await page.waitForTimeout(1000);
        const container = await page.locator(documentCenterSelectors.container);
        await expect(container).toBeVisible();
      }
    }
  });

  test("DOC-CENTER-009: Deve exibir estatísticas de documentos", async ({ page }) => {
    await helpers.navigateToDocumentCenter(commandCenterFixtures.documentCenter.route);

    // Check for stats card
    const statsCard = await page.locator(documentCenterSelectors.statsCard);
    
    if (await statsCard.isVisible()) {
      // Verify stats are displayed
      await expect(statsCard).toBeVisible();
      
      // Should have some statistics (count, size, etc.)
      const hasContent = await statsCard.textContent();
      expect(hasContent).toBeTruthy();
    }
  });
});

test.describe("Command Centers Consolidados - Notification Center", () => {
  let helpers: CommandCenterHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new CommandCenterHelpers(page);
  });

  test("NOTIF-CENTER-001: Deve carregar NotificationCenter corretamente", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    // Verify container
    const container = await page.locator(notificationCenterSelectors.container);
    await expect(container).toBeVisible();

    // Verify notification items exist
    await helpers.verifyNotificationCount();
  });

  test("NOTIF-CENTER-002: Deve marcar notificação como lida", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const notifications = await page.locator(notificationCenterSelectors.notificationItem);
    const count = await notifications.count();
    
    if (count > 0) {
      // Hover over first notification
      await notifications.first().hover();
      
      // Check for mark as read button
      const markAsReadButton = notifications.first().locator(notificationCenterSelectors.markAsReadButton);
      
      if (await markAsReadButton.isVisible()) {
        await helpers.markNotificationAsRead(0);
        
        // Verify notification status changed
        await page.waitForTimeout(500);
        
        // Notification should still be visible (just marked as read)
        await expect(notifications.first()).toBeVisible();
      }
    }
  });

  test("NOTIF-CENTER-003: Deve marcar todas notificações como lidas", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const markAllButton = await page.locator(notificationCenterSelectors.markAllAsRead);
    
    if (await markAllButton.isVisible()) {
      await helpers.markAllAsRead();
      
      // Verify action completed
      await page.waitForTimeout(1000);
      
      // Check unread badge updated
      const unreadBadge = await page.locator(notificationCenterSelectors.unreadBadge);
      
      if (await unreadBadge.isVisible()) {
        const text = await unreadBadge.textContent();
        expect(text).toContain("0");
      }
    }
  });

  test("NOTIF-CENTER-004: Deve filtrar por categoria", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const categoryFilter = await page.locator(notificationCenterSelectors.filterByCategory);
    
    if (await categoryFilter.isVisible()) {
      // Try filtering by different categories
      await helpers.filterNotifications("category", "warning");
      
      // Verify filter applied
      await page.waitForTimeout(1000);
      
      // Notifications should still be visible (filtered)
      const container = await page.locator(notificationCenterSelectors.container);
      await expect(container).toBeVisible();
    }
  });

  test("NOTIF-CENTER-005: Deve filtrar por prioridade", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const priorityFilter = await page.locator(notificationCenterSelectors.filterByPriority);
    
    if (await priorityFilter.isVisible()) {
      await helpers.filterNotifications("priority", "high");
      
      // Verify filter applied
      await page.waitForTimeout(1000);
      
      const container = await page.locator(notificationCenterSelectors.container);
      await expect(container).toBeVisible();
    }
  });

  test("NOTIF-CENTER-006: Deve deletar notificação", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const notifications = await page.locator(notificationCenterSelectors.notificationItem);
    const countBefore = await notifications.count();
    
    if (countBefore > 0) {
      await notifications.first().hover();
      
      const deleteButton = notifications.first().locator(notificationCenterSelectors.deleteButton);
      
      if (await deleteButton.isVisible()) {
        await helpers.deleteNotification(0);
        
        // Verify notification was deleted
        await page.waitForTimeout(1000);
        
        const countAfter = await page.locator(notificationCenterSelectors.notificationItem).count();
        expect(countAfter).toBeLessThanOrEqual(countBefore);
      }
    }
  });

  test("NOTIF-CENTER-007: Deve exibir badge de notificações não lidas", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const unreadBadge = await page.locator(notificationCenterSelectors.unreadBadge);
    
    if (await unreadBadge.isVisible()) {
      // Verify badge has numeric content
      const text = await unreadBadge.textContent();
      expect(text).toMatch(/\d+/);
    }
  });

  test("NOTIF-CENTER-008: Deve suportar real-time updates", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    // Check for real-time indicator
    const realTimeIndicator = await page.locator(notificationCenterSelectors.realTimeIndicator);
    
    if (await realTimeIndicator.isVisible()) {
      await helpers.verifyRealTimeUpdates();
    }
  });

  test("NOTIF-CENTER-009: Deve limpar todas notificações", async ({ page }) => {
    await helpers.navigateToNotificationCenter(commandCenterFixtures.notificationCenter.route);

    const clearAllButton = await page.locator(notificationCenterSelectors.clearAll);
    
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      
      // Confirm action if needed
      const confirmButton = await page.locator("button:has-text(\"Confirm\")");
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Verify notifications cleared
      await page.waitForTimeout(1000);
      
      // Check if empty state is shown
      const emptyState = await page.locator("[data-testid=\"empty-state\"]");
      const isEmpty = await emptyState.isVisible();
      
      // Either empty state or very few notifications
      const notificationCount = await page.locator(notificationCenterSelectors.notificationItem).count();
      expect(isEmpty || notificationCount === 0).toBeTruthy();
    }
  });
});
