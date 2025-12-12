/**
 * Performance Logging Hook
 * PATCH 623 - Monitor component render times
 */

import { memo, memo, useEffect, useRef } from "react";;;

interface PerformanceLogOptions {
  componentName: string;
  threshold?: number; // milliseconds
  onSlowRender?: (time: number) => void;
}

export const usePerformanceLog = memo(function({ 
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
      
      
      if (mountDuration > threshold) {
        onSlowRender?.(mountDuration);
      }
    }
  }, [componentName, threshold, onSlowRender]);

  // Reset render start time on each render
  useEffect(() => {
    renderStartTime.current = Date.now();
  });
}
