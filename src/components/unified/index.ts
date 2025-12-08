/**
 * UNIFIED Components Index
 * Centralized exports for all unified components
 * 
 * PATCH 178.1 - Complete unified component exports
 */

// ==================== SKELETON LOADERS ====================
export {
  // Base
  Skeleton,
  // Loading
  Loading,
  LoadingOverlay,
  // Cards
  SkeletonCard,
  // Tables
  SkeletonTable,
  // Lists
  SkeletonList,
  // Charts
  SkeletonChart,
  // Dashboards
  SkeletonDashboard,
  // Pages
  SkeletonPage,
  // Forms
  SkeletonForm,
  // Profile
  SkeletonProfile,
  // Legacy aliases
  LoadingSkeleton,
  LoadingCard,
  LoadingDashboard,
  LoadingState,
  SkeletonBase,
  SkeletonMetricCard,
  ModuleSkeleton,
  // Types
  type LoadingProps,
  type LoadingOverlayProps,
} from "./SkeletonLoaders.unified";

// ==================== NOTIFICATION CENTER ====================
export {
  NotificationCenter,
  NotificationBell,
  RealTimeNotificationCenter,
  EnhancedNotificationCenter,
  useUnifiedNotifications,
  type NotificationCenterProps,
  type NotificationBellProps,
  type UnifiedNotification,
  type NotificationCategory,
  type NotificationPriority,
  type NotificationType,
  type NotificationVariant,
  type NotificationMode,
} from "./NotificationCenter.unified";

// ==================== CONNECTION-AWARE FEEDBACK ====================
export {
  ConnectionBanner,
  ConnectionBadge,
  AdaptiveLoader,
  OfflineFallback,
  getBannerConfig,
  getBadgeConfig,
  type ConnectionBannerProps,
  type ConnectionBadgeProps,
  type AdaptiveLoaderProps,
  type OfflineFallbackProps,
} from "./ConnectionAwareFeedback.unified";
