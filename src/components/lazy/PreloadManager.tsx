/**
 * PreloadManager - FASE 2.5 Lazy Loading
 * 
 * Componente para gerenciar preload inteligente de módulos
 */

import { memo, memo, useEffect } from "react";;;
import { useLocation } from "react-router-dom";
import { preloadForRoute, preloadCriticalModules } from "@/lib/lazy-loaders";

export const PreloadManager = memo(function() {
  const location = useLocation();

  useEffect(() => {
    // Preload módulos críticos em idle time (apenas uma vez)
    preloadCriticalModules();
  }, []);

  useEffect(() => {
    // Preload baseado na rota atual
    preloadForRoute(location.pathname);
  }, [location.pathname]);

  return null; // Este componente não renderiza nada
});

export default PreloadManager;
