/**
 * DEPRECATED: Use @/hooks/unified instead
 * This file re-exports from the unified module for backward compatibility
 */

export { 
  useNetwork as useNetworkStatus,
  useNetwork,
  useAdaptiveSettings,
  useConnectionQuality,
  useLightMode,
  useAdaptiveDebounce,
  type NetworkStatus,
  type ConnectionQuality,
  type AdaptiveSettings,
} from "@/hooks/unified/useNetwork";
