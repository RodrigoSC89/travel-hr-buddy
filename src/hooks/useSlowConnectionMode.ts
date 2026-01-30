/**
 * Hook para ativar modo de conexão lenta automaticamente
 * Otimizado para redes 2Mbps ou inferiores
 */

import { useEffect, useState, useCallback } from "react";

interface SlowModeSettings {
  isSlowConnection: boolean;
  enableLightweightMode: boolean;
  reducedAnimations: boolean;
  lowQualityImages: boolean;
  fetchTimeout: number;
  pageSize: number;
  prefetchEnabled: boolean;
  cacheFirst: boolean;
}

const DEFAULT_SETTINGS: SlowModeSettings = {
  isSlowConnection: false,
  enableLightweightMode: false,
  reducedAnimations: false,
  lowQualityImages: false,
  fetchTimeout: 10000,
  pageSize: 20,
  prefetchEnabled: true,
  cacheFirst: false,
};

const SLOW_SETTINGS: SlowModeSettings = {
  isSlowConnection: true,
  enableLightweightMode: true,
  reducedAnimations: true,
  lowQualityImages: true,
  fetchTimeout: 30000,
  pageSize: 5,
  prefetchEnabled: false,
  cacheFirst: true,
};

export function useSlowConnectionMode() {
  const [settings, setSettings] = useState<SlowModeSettings>(DEFAULT_SETTINGS);

  // PATCH v26: Removido navigator.onLine check - não confiável no iOS PWA
  const detectConnection = useCallback(() => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;

    // PATCH v26: Não verificar navigator.onLine - causa falsos positivos no iOS
    // Se não há Network Information API, usar defaults normais

    if (!connection) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    const { effectiveType, saveData, downlink } = connection;
    const isSlowConnection = 
      effectiveType === "2g" || 
      effectiveType === "slow-2g" || 
      saveData === true ||
      (downlink && downlink < 2); // Less than 2 Mbps

    if (isSlowConnection) {
      setSettings(SLOW_SETTINGS);
      document.documentElement.classList.add("slow-connection", "low-bandwidth");
      
      // Reduce motion preference
      if (!document.documentElement.style.getPropertyValue("--reduce-motion")) {
        document.documentElement.style.setProperty("--reduce-motion", "reduce");
      }
    } else {
      setSettings(DEFAULT_SETTINGS);
      document.documentElement.classList.remove("slow-connection", "low-bandwidth");
      document.documentElement.style.removeProperty("--reduce-motion");
    }
  }, []);

  useEffect(() => {
    detectConnection();

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", detectConnection);
    }

    // PATCH v37: REMOVIDO listeners online/offline - causam falsos positivos no iOS PWA

    return () => {
      if (connection) {
        connection.removeEventListener("change", detectConnection);
      }
    };
  }, [detectConnection]);

  return settings;
}

/**
 * Hook simplificado para verificar se deve usar modo leve
 */
export function useLightweightMode(): boolean {
  const { enableLightweightMode } = useSlowConnectionMode();
  return enableLightweightMode;
}

/**
 * Hook para configurações de fetch adaptativas
 */
export function useAdaptiveFetchConfig() {
  const { fetchTimeout, cacheFirst, pageSize } = useSlowConnectionMode();
  
  return {
    timeout: fetchTimeout,
    cacheFirst,
    pageSize,
    headers: cacheFirst ? { "Cache-Control": "max-age=300" } : undefined,
  };
}

export default useSlowConnectionMode;
