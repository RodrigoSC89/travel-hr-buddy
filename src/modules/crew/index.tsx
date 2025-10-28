/**
 * CONSOLIDATED Crew Management Module
 * PATCH 466: Combines crew/ + crew-management/ functionality
 * 
 * Features:
 * - Crew member management and performance tracking
 * - Offline sync capabilities for mobile/field operations
 * - Ethics and consent management
 * - Checklists, reports, and attendance tracking
 * - Certifications, rotations, and performance analytics
 */

// Core components
export { ConsentScreen } from "./components/ConsentScreen";
export { SyncStatus } from "./components/SyncStatus";

// Crew management components (from crew-management)
export { CrewOverview } from "./components/CrewOverview";
export { CrewMembers } from "./components/CrewMembers";
export { CrewCertifications } from "./components/CrewCertifications";
export { CrewRotations } from "./components/CrewRotations";
export { CrewPerformance } from "./components/CrewPerformance";

// Hooks
export { useSync } from "./hooks/useSync";

// Ethics guard
export * from "./ethics-guard";

// Copilot functionality
export * from "./copilot";
