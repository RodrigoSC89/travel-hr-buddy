/**
 * PATCH 589 - Offline Indicator Component
 * PATCH iOS PWA v14: All offline indicators DISABLED - navigator.onLine unreliable
 */

import React, { memo } from "react";

interface OfflineIndicatorProps {
  /** Show as compact badge */
  compact?: boolean;
  /** Show sync status */
  showSyncStatus?: boolean;
  /** Position */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "inline";
  /** Custom class */
  className?: string;
}

/**
 * DISABLED: OfflineIndicator
 * PATCH iOS PWA v14: This component previously showed offline status
 * which caused false positives on iOS Safari PWA due to unreliable navigator.onLine
 * Now always returns null
 */
export const OfflineIndicator = memo<OfflineIndicatorProps>(() => {
  // PATCH iOS PWA: Always return null - never show offline indicator
  return null;
});

OfflineIndicator.displayName = "OfflineIndicator";

/**
 * DISABLED: FloatingOfflineIndicator
 * PATCH iOS PWA v14: This component previously showed floating offline indicator
 * which caused false positives on iOS Safari PWA due to unreliable navigator.onLine
 * Now always returns null
 */
export const FloatingOfflineIndicator = memo(() => {
  // PATCH iOS PWA: Always return null - never show offline indicator
  return null;
});

FloatingOfflineIndicator.displayName = "FloatingOfflineIndicator";

/**
 * DISABLED: OfflineBanner
 * PATCH iOS PWA v14: This component previously showed "Você está offline" banner
 * which caused false positives on iOS Safari PWA due to unreliable navigator.onLine
 * Now always returns null
 */
export const OfflineBanner = memo<{ className?: string }>(() => {
  // PATCH iOS PWA: Always return null - never show offline banner
  return null;
});

OfflineBanner.displayName = "OfflineBanner";
