/**
 * PATCH 1001: Re-export unified offline components
 */

// Re-export from the main offline module for backward compatibility
export { OfflineStatusBar as OfflineIndicator, OfflineStatusBadge } from '@/components/offline/OfflineStatusBar';
export { OfflineBanner, CacheIndicator } from './OfflineBanner';
