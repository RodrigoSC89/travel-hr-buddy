/**
 * Hook para usar o serviço de conexão adaptativa
 * Permite componentes reagirem a mudanças na qualidade da conexão
 */

import { useState, useEffect } from "react";
import { connectionAdaptive, ConnectionQuality } from "@/lib/performance/connection-adaptive";

export function useConnectionAdaptive() {
  const [info, setInfo] = useState(connectionAdaptive.getInfo());

  useEffect(() => {
    const unsubscribe = connectionAdaptive.onChange(setInfo);
    return unsubscribe;
  }, []);

  return {
    quality: info.quality,
    isOnline: info.quality !== "offline",
    isSlow: info.quality === "slow",
    isModerate: info.quality === "moderate",
    isFast: info.quality === "fast",
    saveData: info.saveData,
    recommendations: connectionAdaptive.getRecommendations(),
    shouldLoadHeavyResources: connectionAdaptive.shouldLoadHeavyResources(),
    effectiveType: info.effectiveType,
    downlink: info.downlink,
    rtt: info.rtt,
  };
}

/**
 * Hook simplificado que retorna apenas se deve usar modo leve
 */
export function useLightMode(): boolean {
  const { quality, saveData } = useConnectionAdaptive();
  return quality === "slow" || quality === "offline" || saveData;
}

/**
 * Hook para debounce adaptativo baseado na conexão
 */
export function useAdaptiveDebounce(): number {
  const { recommendations } = useConnectionAdaptive();
  return recommendations.debounceMs;
}
