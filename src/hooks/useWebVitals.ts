/**
 * Sprint 5: React hook for Web Vitals monitoring
 */
import { useState, useEffect } from 'react';
import { webVitalsMonitor, type WebVitalMetric } from '@/lib/performance/web-vitals-monitor';

export function useWebVitals() {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [score, setScore] = useState(100);

  useEffect(() => {
    webVitalsMonitor.init();
    const unsub = webVitalsMonitor.subscribe((m) => {
      setMetrics(m);
      setScore(webVitalsMonitor.getScore());
    });
    return unsub;
  }, []);

  return { metrics, score, budget: webVitalsMonitor.getBudget() };
}
