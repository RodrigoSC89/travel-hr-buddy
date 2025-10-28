/**
 * PATCH 398 - Crew Module Consolidation
 * 
 * This file consolidates crew management functionality from multiple locations:
 * - src/modules/crew (main module)
 * - src/modules/operations/crew (operations crew)
 * - src/components/crew (legacy components)
 * 
 * All functionality is now unified under src/modules/crew
 */

// Re-export all crew management functionality
export { default as CrewManagement } from "./index";
export * from "./components/ConsentScreen";
export * from "./components/SyncStatus";
export * from "./hooks/useSync";
export * from "./ethics-guard";
export * from "./copilot";

// Legacy compatibility exports
// These maintain backward compatibility with old import paths
export { default as CrewApp } from "./index";
export { default as CrewOperations } from "./index";

/**
 * Migration Notes:
 * ----------------
 * 
 * Old Import Paths (DEPRECATED):
 * - import CrewApp from '@/modules/operations/crew'
 * - import { CrewManagement } from '@/components/crew'
 * 
 * New Import Path (RECOMMENDED):
 * - import { CrewManagement } from '@/modules/crew'
 * 
 * All crew-related features are now available through the unified module:
 * - Crew member management
 * - Performance tracking
 * - Offline sync capabilities
 * - Ethics and consent management
 * - Checklists and reports
 * - Attendance tracking
 * - Crew wellbeing
 * - Crew training
 * - Crew rotation scheduling
 */

// Type definitions for crew management
export interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: "active" | "inactive" | "on_leave";
  email?: string;
  phone?: string;
  certifications?: string[];
  joinDate?: string;
  metadata?: Record<string, any>;
}

export interface CrewPerformance {
  crewMemberId: string;
  period: string;
  rating: number;
  metrics: Record<string, any>;
  feedback?: string;
}

export interface CrewSchedule {
  crewMemberId: string;
  startDate: string;
  endDate: string;
  vesselId?: string;
  position: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
}
