/**
 * PATCH 398 - Crew Module Consolidation
 * 
 * @deprecated This module has been consolidated into @/modules/crew
 * Please update your imports to use @/modules/crew instead
 * 
 * This file now redirects to the unified crew management module
 */

// Re-export named exports for backward compatibility
export * from "@/modules/crew";

/**
 * Migration Notice:
 * ----------------
 * This module (src/modules/operations/crew) has been deprecated and merged
 * into the unified crew management module at src/modules/crew.
 * 
 * Please update your imports:
 * 
 * OLD (deprecated):
 *   import { ConsentScreen } from '@/modules/operations/crew'
 * 
 * NEW (recommended):
 *   import { ConsentScreen } from '@/modules/crew'
 * 
 * All functionality remains available through the consolidated module including:
 * - Crew member management and performance tracking
 * - Offline sync capabilities for mobile/field operations
 * - Ethics and consent management
 * - Checklists, reports, and attendance tracking
 * - Certification tracking and rotation scheduling
 */
