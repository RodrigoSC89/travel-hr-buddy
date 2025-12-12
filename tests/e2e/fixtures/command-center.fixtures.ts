/**
 * Command Center Test Fixtures
 * FASE B.4 - Testes para Command Centers Consolidados
 */

export const commandCenterFixtures = {
  documentCenter: {
    route: "/documents",
    viewModes: ["grid", "list", "table"],
    documentTypes: ["certificate", "report", "log", "manual", "policy"],
    statuses: ["active", "expired", "pending", "archived"],
    mockDocuments: [
      {
        id: "1",
        name: "Safety Certificate.pdf",
        type: "certificate",
        status: "active",
        size: "2.5 MB",
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Maintenance Report.pdf",
        type: "report",
        status: "pending",
        size: "1.8 MB",
        createdAt: "2024-02-20",
      },
    ],
  },
  notificationCenter: {
    route: "/notifications",
    categories: ["alert", "info", "warning", "success"],
    priorities: ["high", "medium", "low"],
    mockNotifications: [
      {
        id: "1",
        title: "Certificate Expiring Soon",
        message: "Safety certificate expires in 30 days",
        category: "warning",
        priority: "high",
        read: false,
        timestamp: "2024-12-10T10:30:00Z",
      },
      {
        id: "2",
        title: "Maintenance Completed",
        message: "Engine maintenance successfully completed",
        category: "success",
        priority: "medium",
        read: false,
        timestamp: "2024-12-09T15:45:00Z",
      },
    ],
  },
};

export const documentCenterSelectors = {
  container: "[data-testid=\"document-center\"]",
  uploadButton: "[data-testid=\"upload-button\"]",
  uploadInput: "input[type=\"file\"]",
  viewModeGrid: "[data-testid=\"view-mode-grid\"]",
  viewModeList: "[data-testid=\"view-mode-list\"]",
  viewModeTable: "[data-testid=\"view-mode-table\"]",
  searchInput: "[data-testid=\"search-input\"]",
  filterButton: "[data-testid=\"filter-button\"]",
  documentCard: "[data-testid=\"document-card\"]",
  downloadButton: "[data-testid=\"download-button\"]",
  deleteButton: "[data-testid=\"delete-button\"]",
  previewButton: "[data-testid=\"preview-button\"]",
  bulkSelectCheckbox: "[data-testid=\"bulk-select\"]",
  bulkActionsMenu: "[data-testid=\"bulk-actions\"]",
  statsCard: "[data-testid=\"stats-card\"]",
};

export const notificationCenterSelectors = {
  container: "[data-testid=\"notification-center\"]",
  notificationItem: "[data-testid=\"notification-item\"]",
  markAsReadButton: "[data-testid=\"mark-as-read\"]",
  markAsUnreadButton: "[data-testid=\"mark-as-unread\"]",
  deleteButton: "[data-testid=\"delete-notification\"]",
  filterByCategory: "[data-testid=\"filter-category\"]",
  filterByPriority: "[data-testid=\"filter-priority\"]",
  markAllAsRead: "[data-testid=\"mark-all-as-read\"]",
  clearAll: "[data-testid=\"clear-all\"]",
  unreadBadge: "[data-testid=\"unread-badge\"]",
  realTimeIndicator: "[data-testid=\"real-time-indicator\"]",
};
