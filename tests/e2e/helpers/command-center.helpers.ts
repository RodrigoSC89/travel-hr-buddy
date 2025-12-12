/**
 * Command Center Test Helpers
 * FASE B.4 - Helpers para testes de command centers consolidados
 */

import { Page, expect } from "@playwright/test";
import { documentCenterSelectors, notificationCenterSelectors } from "../fixtures/command-center.fixtures";

export class CommandCenterHelpers {
  constructor(private page: Page) {}

  // ===== DOCUMENT CENTER HELPERS =====

  async navigateToDocumentCenter(route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState("networkidle");
  }

  async uploadDocument(filePath: string) {
    // Click upload button
    await this.page.click(documentCenterSelectors.uploadButton);
    
    // Set file input
    const fileInput = await this.page.locator(documentCenterSelectors.uploadInput);
    await fileInput.setInputFiles(filePath);
    
    // Wait for upload to complete
    await this.page.waitForTimeout(2000);
  }

  async switchViewMode(mode: "grid" | "list" | "table") {
    const selector = mode === "grid" ? documentCenterSelectors.viewModeGrid
      : mode === "list" ? documentCenterSelectors.viewModeList
        : documentCenterSelectors.viewModeTable;
    
    await this.page.click(selector);
    await this.page.waitForTimeout(500);
  }

  async searchDocuments(query: string) {
    await this.page.fill(documentCenterSelectors.searchInput, query);
    await this.page.waitForTimeout(500);
  }

  async downloadDocument(documentIndex: number = 0) {
    const documents = await this.page.locator(documentCenterSelectors.documentCard);
    const document = documents.nth(documentIndex);
    
    await document.hover();
    await document.locator(documentCenterSelectors.downloadButton).click();
    await this.page.waitForTimeout(1000);
  }

  async deleteDocument(documentIndex: number = 0) {
    const documents = await this.page.locator(documentCenterSelectors.documentCard);
    const document = documents.nth(documentIndex);
    
    await document.hover();
    await document.locator(documentCenterSelectors.deleteButton).click();
    
    // Confirm deletion
    await this.page.click("button:has-text(\"Confirm\")");
    await this.page.waitForTimeout(1000);
  }

  async previewDocument(documentIndex: number = 0) {
    const documents = await this.page.locator(documentCenterSelectors.documentCard);
    const document = documents.nth(documentIndex);
    
    await document.hover();
    await document.locator(documentCenterSelectors.previewButton).click();
    await this.page.waitForTimeout(1000);
  }

  async selectMultipleDocuments(count: number) {
    for (let i = 0; i < count; i++) {
      const checkbox = await this.page.locator(documentCenterSelectors.bulkSelectCheckbox).nth(i);
      await checkbox.check();
    }
  }

  async performBulkAction(action: "download" | "delete" | "archive") {
    await this.page.click(documentCenterSelectors.bulkActionsMenu);
    await this.page.click(`text=${action}`);
    await this.page.waitForTimeout(1000);
  }

  async verifyDocumentCount(expectedCount: number) {
    const documents = await this.page.locator(documentCenterSelectors.documentCard).count();
    expect(documents).toBe(expectedCount);
  }

  async applyDocumentFilter(filterType: string, value: string) {
    await this.page.click(documentCenterSelectors.filterButton);
    await this.page.selectOption(`select[name="${filterType}"]`, value);
    await this.page.waitForTimeout(500);
  }

  // ===== NOTIFICATION CENTER HELPERS =====

  async navigateToNotificationCenter(route: string) {
    await this.page.goto(route);
    await this.page.waitForLoadState("networkidle");
  }

  async verifyNotificationCount(expectedCount?: number) {
    const notifications = await this.page.locator(notificationCenterSelectors.notificationItem).count();
    if (expectedCount !== undefined) {
      expect(notifications).toBe(expectedCount);
    } else {
      expect(notifications).toBeGreaterThan(0);
    }
  }

  async markNotificationAsRead(notificationIndex: number = 0) {
    const notification = await this.page.locator(notificationCenterSelectors.notificationItem).nth(notificationIndex);
    await notification.hover();
    await notification.locator(notificationCenterSelectors.markAsReadButton).click();
    await this.page.waitForTimeout(500);
  }

  async markAllAsRead() {
    await this.page.click(notificationCenterSelectors.markAllAsRead);
    await this.page.waitForTimeout(1000);
  }

  async deleteNotification(notificationIndex: number = 0) {
    const notification = await this.page.locator(notificationCenterSelectors.notificationItem).nth(notificationIndex);
    await notification.hover();
    await notification.locator(notificationCenterSelectors.deleteButton).click();
    await this.page.waitForTimeout(500);
  }

  async filterNotifications(filterType: "category" | "priority", value: string) {
    const selector = filterType === "category" 
      ? notificationCenterSelectors.filterByCategory
      : notificationCenterSelectors.filterByPriority;
    
    await this.page.click(selector);
    await this.page.click(`text=${value}`);
    await this.page.waitForTimeout(500);
  }

  async verifyUnreadBadge(expectedCount: number) {
    const badge = await this.page.locator(notificationCenterSelectors.unreadBadge);
    const text = await badge.textContent();
    expect(text).toContain(expectedCount.toString());
  }

  async verifyRealTimeUpdates() {
    const indicator = await this.page.locator(notificationCenterSelectors.realTimeIndicator);
    await expect(indicator).toBeVisible();
  }
}
