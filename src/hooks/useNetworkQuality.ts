/**
 * useNetworkQuality Hook
 * React hook for connection-aware components
 * Re-exports from network-monitor for backwards compatibility
 */

export { useNetworkStatus, useNetworkAware } from '@/lib/performance/network-monitor';
export type { NetworkStatus } from '@/lib/performance/network-monitor';
