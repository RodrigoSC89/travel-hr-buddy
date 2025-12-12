/**
import { useContext, useEffect, useState, useCallback } from "react";;
 * Smart Prefetch Provider
 * PATCH 900: Corrigido para evitar erro de useContext null
 */

import React, { useEffect, useState, memo } from "react";
import { resourceHints } from "@/lib/performance/resource-hints";

// Componente interno que usa os hooks de forma segura
const PrefetchInitializer = memo(() => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    
    try {
      resourceHints.initializeCommonHints();
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        resourceHints.preconnect(supabaseUrl);
      }
      
      setInitialized(true);
    } catch (error) {
      console.warn("Prefetch initialization failed:", error);
    }
  }, [initialized]);

  return null;
});

PrefetchInitializer.displayName = "PrefetchInitializer";

function SmartPrefetchProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrefetchInitializer />
      {children}
    </>
  );
}

export const SmartPrefetchProvider = memo(SmartPrefetchProviderComponent);
