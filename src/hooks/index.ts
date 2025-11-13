/**
 * Centralized exports for all application hooks
 * 
 * This file provides a single import point for all custom hooks,
 * making it easier to import and use them throughout the application.
 * 
 * @example
 * import { useUsers, useEnhancedNotifications, useMaritimeChecklists } from '@/hooks';
 */

// User Management
export { useUsers } from "./use-users";
export type { UserWithRole } from "./use-users";

// Notifications
export { useEnhancedNotifications } from "./use-enhanced-notifications";
export type { Notification } from "./use-enhanced-notifications";

// Maritime Operations
export { useMaritimeChecklists } from "./use-maritime-checklists";

// Authentication & Permissions
export { useAuth } from "@/contexts/AuthContext";
export { usePermissions } from "./use-permissions";
export { useOrganizationPermissions } from "./use-organization-permissions";
export type { UserRole, Permission } from "./use-permissions";

// UI & UX
export { useToast } from "./use-toast";
export { useIsMobile } from "./use-mobile";
export { useKeyboardShortcuts } from "./use-keyboard-shortcuts";
export { useFocusTrap } from "./use-focus-trap";
export { useArrowNavigation } from "./use-arrow-navigation";

// System & Operations
export { useOfflineStorage } from "./use-offline-storage";
export { useAPIHealth } from "./use-api-health";
export { useRestoreLogsSummary } from "./use-restore-logs-summary";
export { useRestoreLogsMetrics } from "./use-restore-logs-metrics";

// Business Logic
export { useProfile } from "./use-profile";
export { useAuthProfile } from "./use-auth-profile";
export { useExpenses } from "./useExpenses";
export { default as useModules } from "./useModules";
export { useMaritimeActions } from "./useMaritimeActions";
export { useButtonHandlers } from "./useButtonHandlers";
export { useFormActions } from "./use-form-actions";
export { useSidebarActions } from "./use-sidebar-actions";
export { useSystemActions } from "./use-system-actions";
export { useNavigationManager } from "./use-navigation-manager";
export { useBreadcrumbs } from "./use-breadcrumbs";

// Specialized Features
export { useTrainingModules } from "./use-training-modules";
export { useTravelPredictions } from "./use-travel-predictions";
export { useVoiceNavigation } from "./use-voice-navigation";
export { useServiceIntegrations } from "./use-service-integrations";
