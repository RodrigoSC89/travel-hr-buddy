/**
 * DEPRECATED: Use @/hooks/unified instead
 * This file re-exports from the unified module for backward compatibility
 */

export { 
  useNetwork as useNetworkStatus,
  useNetwork,
  useAdaptiveSettings,
  type NetworkStatus,
  type AdaptiveSettings,
} from "@/hooks/unified/useNetwork";
