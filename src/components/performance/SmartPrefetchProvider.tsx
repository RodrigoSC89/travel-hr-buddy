/**
 * Smart Prefetch Provider
 * Automatically tracks navigation and prefetches predicted routes
 */

import { useEffect } from 'react';
import { useSmartPrefetch } from '@/lib/performance/smart-prefetch';
import { resourceHints } from '@/lib/performance/resource-hints';

export function SmartPrefetchProvider({ children }: { children: React.ReactNode }) {
  // Initialize smart prefetch tracking
  useSmartPrefetch();

  // Setup common resource hints on mount
  useEffect(() => {
    resourceHints.initializeCommonHints();
    
    // Preconnect to Supabase
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      resourceHints.preconnect(supabaseUrl);
    }
  }, []);

  return <>{children}</>;
}
