/**
 * UNIFIED Lib Index
 * Centralized exports for all unified lib modules
 * 
 * PATCH 178.1 - Complete unified library exports
 * 
 * Usage:
 * import { logger, formatCurrency, logError, validateEmail } from "@/lib/unified";
 */

// ==================== LOGGER ====================
export * from "./logger.unified";

// ==================== FORMAT UTILS ====================
export {
  // Number formatting
  formatNumber,
  formatCurrency,
  formatPercent,
  formatMetricValue,
  // Date/Time formatting
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  // File/Size formatting
  formatBytes,
  formatFileSize,
  // Duration formatting
  formatDuration,
  formatMs,
  // Document formatting (BR)
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatPhoneNumber,
  // Text formatting
  truncateText,
  capitalize,
  titleCase,
  slugify,
  // Maritime/Nautical formatting
  formatCoordinates,
  formatKnots,
  formatNauticalMiles,
  formatHeading,
} from "./format-utils.unified";

// ==================== ERROR HANDLING ====================
export {
  // Custom Error Types
  APIError,
  ValidationError,
  CircuitOpenError,
  NetworkError,
  AuthError,
  // Error Tracker
  errorTracker,
  // Helper Functions
  logError,
  logErrorOnce,
  cleanupErrorCache,
  handleApiError,
  getErrorMessage,
  isRetryableError,
  normalizeError,
  // React Hook
  useErrorTracking,
  // Types
  type ErrorContext,
} from "./error-handling.unified";

// ==================== VALIDATION ====================
export {
  // Zod Schemas
  emailSchema,
  passwordSchema,
  simplePasswordSchema,
  cpfSchema,
  cnpjSchema,
  phoneSchema,
  nameSchema,
  urlSchema,
  // Form Schemas
  loginSchema,
  signupSchema,
  profileSchema,
  passwordChangeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  vesselSchema,
  crewMemberSchema,
  certificateSchema,
  // Validation Functions
  validateEmail,
  validateCPF,
  validateCNPJ,
  validatePassword,
  validatePhone,
  sanitizeHtml,
  sanitizeString,
  validateInput,
  // Validation Patterns
  VALIDATION_PATTERNS,
  // Types
  type LoginFormData,
  type SignupFormData,
  type ProfileFormData,
  type PasswordChangeFormData,
  type VesselFormData,
  type CrewMemberFormData,
  type CertificateFormData,
} from "./validation.unified";

// ==================== SLOW CONNECTION OPTIMIZER ====================
export {
  // Connection Quality
  detectConnectionQuality,
  type ConnectionQuality,
  type ConnectionMetrics,
  // Adaptive Fetch
  adaptiveFetch,
  type AdaptiveFetchOptions,
  // Payload Optimization
  compressPayload,
  paginateForSlowConnection,
  // Image Optimization
  getOptimizedImageUrl,
  preloadCriticalImages,
  type ImageOptimizationOptions,
  // Cache Strategies
  getCached,
  setCached,
  clearOldCache,
  type CacheEntry,
  // Loading State
  estimateLoadTime,
  getLoadingMessage,
  type LoadingState,
  // Hooks
  useSlowConnectionFetch,
  useConnectionQuality,
  useAdaptivePolling,
} from "./slow-connection.unified";
