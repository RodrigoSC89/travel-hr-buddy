/**
 * Production Export Index
 * Central export for all production utilities
 */

// Core production utilities
export { 
  readinessChecker, 
  useReadinessChecker,
  type ReadinessCheck,
  type ReadinessReport 
} from './readiness-checker';

export {
  systemDiagnostics,
  useSystemDiagnostics,
  type DiagnosticResult,
  type DiagnosticsReport
} from './system-diagnostics';

export {
  offlineTester,
  useOfflineTester,
  type OfflineTestResult,
  type OfflineTestReport
} from './offline-test';

// Security
export {
  securityAuditService,
  useSecurityAudit,
  type SecurityCheck,
  type SecurityAuditReport
} from '../security/security-audit-service';

// Performance config stubs (lighthouse-config removed during cleanup)
export const performanceThresholds = { LCP: 2500, FID: 100, CLS: 0.1 };
export const lazyLoadingConfig = { retries: 3, delay: 1000 };
export const cachingStrategy = { staleTime: 120000, gcTime: 600000 };
export const preloadConfig = { criticalRoutes: [] as string[] };
export const measureCoreWebVitals = () => ({});
export const reportWebVitalsToAnalytics = () => {};

// Billing
export {
  PRICING_TIERS,
  formatPrice,
  getTierByProductId,
  getTierById,
  type PricingTier
} from '../billing/pricing-tiers';

// Sync & Uploads
export {
  resumableUploadService,
} from '../uploads/resumable-upload-service';

export {
  deltaSyncService,
} from '../sync/delta-sync-service';

// AI Memory
export {
  aiSessionMemory,
} from '../ai/session-memory-service';
