/**
 * Centralized exports for application hooks
 * This file provides a single entry point for importing hooks
 * and helps maintain consistency across the codebase
 */

// User management hooks
export { useUsers } from "./use-users";
export type { UserWithRole } from "./use-users";

// Notification hooks
export { useEnhancedNotifications } from "./use-enhanced-notifications";
export type { Notification } from "./use-enhanced-notifications";

// Maritime checklist hooks
export { useMaritimeChecklists } from "./use-maritime-checklists";

// Re-export common hook types
export type { Checklist, ChecklistTemplate, ChecklistItem } from "@/components/maritime-checklists/checklist-types";
