/**
 * Offline Status Banner
 * PATCH v16 iOS PWA: DESATIVADO - navigator.onLine não é confiável no iOS Safari
 * Este componente NUNCA deve exibir UI de "Offline" pois causa falsos positivos
 */

import React, { memo } from "react";

interface OfflineStatusBannerProps {
  isFromCache?: boolean;
  lastSync?: Date | null;
  onRetry?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

/**
 * DISABLED: OfflineStatusBanner
 * PATCH iOS PWA v16: Este componente causava falsos positivos de "Modo Offline"
 * no iOS Safari PWA. Agora sempre retorna null.
 */
export const OfflineStatusBanner = memo<OfflineStatusBannerProps>(() => {
  // PATCH iOS PWA: SEMPRE retornar null - nunca mostrar banner offline
  // navigator.onLine e isFromCache não são confiáveis no iOS Safari PWA
  return null;
});

OfflineStatusBanner.displayName = "OfflineStatusBanner";

export default OfflineStatusBanner;
