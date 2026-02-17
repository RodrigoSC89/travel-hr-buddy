/**
 * PATCH iOS PWA v14: OfflineBanner disabled
 * navigator.onLine is unreliable on iOS Safari PWA
 * This component now always returns null to prevent false offline warnings
 */

import * as React from "react";

interface OfflineBannerProps {
  className?: string;
  showSyncStatus?: boolean;
}

/**
 * DISABLED: This component previously showed "Você está offline" banner
 * which caused false positives on iOS Safari PWA due to unreliable navigator.onLine
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = () => {
  // PATCH iOS PWA: Always return null - never show offline banner
  return null;
};

/**
 * Componente para indicar que dados são do cache
 * This one is kept as it's informational, not blocking
 */
export const CacheIndicator: React.FC<{ isFromCache: boolean; className?: string }> = ({
  isFromCache,
  className,
}) => {
  if (!isFromCache) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full ${className || ''}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
      Dados em cache
    </span>
  );
};
