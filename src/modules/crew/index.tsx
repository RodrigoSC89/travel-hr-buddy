/**
 * CONSOLIDATED Crew Management Module
 * Combines crew/ + crew-app/ functionality
 * 
 * Features:
 * - Crew member management and performance tracking
 * - Offline sync capabilities for mobile/field operations
 * - Ethics and consent management
 * - Checklists, reports, and attendance tracking
 */

export { ConsentScreen } from "./components/ConsentScreen";
export { SyncStatus } from "./components/SyncStatus";
export { useSync } from "./hooks/useSync";
export * from "./ethics-guard";

// Re-export copilot functionality if needed
export * from "./copilot";
