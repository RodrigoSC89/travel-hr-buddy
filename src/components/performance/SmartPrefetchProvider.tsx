/**
 * Smart Prefetch Provider
 * PATCH 900: Corrigido para evitar erro de useContext null
 */

import React, { useEffect, useState, memo } from 'react';
import { resourceHints } from '@/lib/performance/resource-hints';
import { logger } from "@/lib/logger";
import { SUPABASE_URL } from '@/lib/supabase/edge-function-helper';

// Componente interno que usa os hooks de forma segura
const PrefetchInitializer = memo(() => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    
    try {
      resourceHints.initializeCommonHints();
      
      if (SUPABASE_URL) {
        resourceHints.preconnect(SUPABASE_URL);
      }
      
      setInitialized(true);
    } catch (error) {
      logger.warn('Prefetch initialization failed:', error instanceof Error ? { message: error.message } : undefined);
    }
  }, [initialized]);

  return null;
});

PrefetchInitializer.displayName = 'PrefetchInitializer';

function SmartPrefetchProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrefetchInitializer />
      {children}
    </>
  );
}

export const SmartPrefetchProvider = memo(SmartPrefetchProviderComponent);
