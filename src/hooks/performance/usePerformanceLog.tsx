/**
 * Performance Logging Hook
 * PATCH 623 - Monitor component render times
 */

import { useEffect, useRef } from "react";

interface PerformanceLogOptions {
  componentName: string;
  threshold?: number; // milliseconds
  onSlowRender?: (time: number) => void;
}

export function usePerformanceLog({ 
  componentName, 
  threshold = 1000,
  onSlowRender 
}: PerformanceLogOptions) {
  const renderStartTime = useRef<number>(Date.now());
  const mountTime = useRef<number | null>(null);

  useEffect(() => {
    // Measure mount time
    if (!mountTime.current) {
      mountTime.current = Date.now();
      const mountDuration = mountTime.current - renderStartTime.current;
      
      console.log(`[Performance] ${componentName} mounted in ${mountDuration}ms`);
      
      if (mountDuration > threshold) {
        console.warn(`[Performance] ${componentName} exceeded threshold (${threshold}ms)`);
        onSlowRender?.(mountDuration);
      }
    }
  }, [componentName, threshold, onSlowRender]);

  // Reset render start time on each render
  useEffect(() => {
    renderStartTime.current = Date.now();
  });
}
