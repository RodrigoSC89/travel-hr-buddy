/**
 * Analytics Module Index
 * PATCH 839: Enhanced analytics system
 */

export { analytics, useAnalytics } from "./analytics-client";
export {
  analytics as advancedAnalytics,
  useAnalytics as useAdvancedAnalytics,
  usePageTracking,
  useAnalyticsData,
  type AnalyticsEvent,
  type PerformanceMetric,
} from "./advanced-analytics";
