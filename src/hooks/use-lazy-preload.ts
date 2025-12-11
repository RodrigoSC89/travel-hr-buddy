/**
 * useLazyPreload - FASE 2.5 Lazy Loading
 * 
 * Hook para preload inteligente de módulos baseado em navegação
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { preloadForRoute, preloadCriticalModules } from "@/lib/lazy-loaders";

/**
 * Hook para preload automático baseado na rota atual
 */
export function useLazyPreload() {
  const location = useLocation();

  useEffect(() => {
    // Preload módulos críticos em idle time
    preloadCriticalModules();
  }, []);

  useEffect(() => {
    // Preload baseado na rota atual
    preloadForRoute(location.pathname);
  }, [location.pathname]);
}

/**
 * Hook para preload manual de módulos específicos
 */
export function useManualPreload() {
  return {
    preloadCharts: async () => {
      const { loadRecharts } = await import("@/lib/lazy-loaders");
      return loadRecharts();
    },
    preloadPDF: async () => {
      const { loadJsPDF } = await import("@/lib/lazy-loaders");
      return loadJsPDF();
    },
    preloadMap: async () => {
      const { loadMapbox } = await import("@/lib/lazy-loaders");
      return loadMapbox();
    },
    preloadAI: async () => {
      const { loadTensorFlow } = await import("@/lib/lazy-loaders");
      return loadTensorFlow();
    },
    preloadEditor: async () => {
      const { loadTipTap } = await import("@/lib/lazy-loaders");
      return loadTipTap();
    },
  };
}

export default useLazyPreload;
