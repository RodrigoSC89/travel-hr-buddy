/**
 * Performance Log Hook
 * PATCH 623 - Performance monitoring with dynamic logs
 */

import { useEffect, useRef } from "react";

interface PerformanceLogOptions {
  componentName: string;
  threshold?: number; // milliseconds
  onSlowRender?: (time: number) => void;
}

export function usePerformanceLog({ 
  componentName, 
  threshold = 3000,
  onSlowRender 
}: PerformanceLogOptions) {
  const startTimeRef = useRef<number>(0);
  const mountTimeRef = useRef<number>(0);

  useEffect(() => {
    // Mark component mount start
    mountTimeRef.current = performance.now();
    startTimeRef.current = performance.now();

    // Start performance measurement
    const markName = `${componentName}-start`;
    const measureName = `${componentName}-render`;

    performance.mark(markName);

    return () => {
      // Calculate render time
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;
      
      try {
        performance.mark(`${componentName}-end`);
        performance.measure(measureName, markName, `${componentName}-end`);
        
        const measures = performance.getEntriesByName(measureName, 'measure');
        const measure = measures[measures.length - 1];
        
        if (measure) {
          console.log(`[Performance] ${componentName}: ${measure.duration.toFixed(2)}ms`);
          
          // Check if render time exceeds threshold
          if (measure.duration > threshold) {
            console.warn(
              `[Performance Alert] ${componentName} took ${measure.duration.toFixed(2)}ms (threshold: ${threshold}ms)`
            );
            
            if (onSlowRender) {
              onSlowRender(measure.duration);
            }

            // Optional: Log to analytics or database
            logPerformanceToDatabase(componentName, measure.duration);
          }
        }
      } catch (error) {
        console.error(`[Performance] Error measuring ${componentName}:`, error);
      }

      // Cleanup performance marks
      performance.clearMarks(markName);
      performance.clearMarks(`${componentName}-end`);
      performance.clearMeasures(measureName);
    };
  }, [componentName, threshold, onSlowRender]);

  return {
    logEvent: (eventName: string) => {
      const eventTime = performance.now() - startTimeRef.current;
      console.log(`[Performance Event] ${componentName}.${eventName}: ${eventTime.toFixed(2)}ms`);
    }
  };
}

/**
 * Log performance metrics to database or analytics service
 */
async function logPerformanceToDatabase(componentName: string, duration: number) {
  try {
    // Optional: Implement actual logging to Supabase or analytics service
    // const { error } = await supabase.from('performance_logs').insert({
    //   component_name: componentName,
    //   duration_ms: duration,
    //   timestamp: new Date().toISOString(),
    //   user_agent: navigator.userAgent
    // });

    // For now, just log to console
    console.log(`[Performance DB Log] ${componentName}: ${duration.toFixed(2)}ms`);
  } catch (error) {
    console.error('[Performance] Failed to log to database:', error);
  }
}
