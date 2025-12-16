/**
 * React Hook for Web Vitals Monitoring
 * Provides real-time performance metrics in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  webVitalsMonitor, 
  VitalMetric, 
  VitalsCallback,
  AlertCallback 
} from '@/lib/web-vitals-monitor';
import { useToast } from '@/hooks/use-toast';

interface UseWebVitalsOptions {
  showAlerts?: boolean;
  reportEndpoint?: string;
  isSlowNetwork?: boolean;
}

export const useWebVitals = (options: UseWebVitalsOptions = {}) => {
  const { showAlerts = false, reportEndpoint, isSlowNetwork = false } = options;
  const { toast } = useToast();
  
  const [metrics, setMetrics] = useState<Record<string, VitalMetric>>({});
  const [score, setScore] = useState<{
    score: number;
    rating: 'good' | 'needs-improvement' | 'poor';
  }>({ score: 0, rating: 'needs-improvement' });

  useEffect(() => {
    // Initialize monitor
    webVitalsMonitor.initialize({
      reportEndpoint,
      isSlowNetwork,
      onMetric: (metric) => {
        setMetrics(prev => ({ ...prev, [metric.name]: metric }));
        setScore(webVitalsMonitor.getScore());
      },
      onAlert: showAlerts ? (metric, message) => {
        toast({
          variant: 'destructive',
          title: 'Performance Alert',
          description: message
        });
      } : undefined
    });

    // Flush on page unload
    const handleUnload = () => webVitalsMonitor.flush();
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [reportEndpoint, isSlowNetwork, showAlerts, toast]);

  // Update slow network mode
  useEffect(() => {
    webVitalsMonitor.setSlowNetworkMode(isSlowNetwork);
  }, [isSlowNetwork]);

  const getMetricStatus = useCallback((name: string): {
    value: number | null;
    rating: string;
    formatted: string;
  } => {
    const metric = metrics[name];
    if (!metric) {
      return { value: null, rating: 'unknown', formatted: '-' };
    }

    let formatted = '';
    switch (name) {
      case 'CLS':
        formatted = metric.value.toFixed(3);
        break;
      case 'LCP':
      case 'FID':
      case 'TTFB':
      case 'FCP':
      case 'INP':
        formatted = `${Math.round(metric.value)}ms`;
        break;
      default:
        formatted = metric.value.toFixed(2);
    }

    return {
      value: metric.value,
      rating: metric.rating,
      formatted
    };
  }, [metrics]);

  return {
    metrics,
    score,
    getMetricStatus,
    // Individual metrics for convenience (INP replaced FID in web-vitals v4+)
    lcp: getMetricStatus('LCP'),
    cls: getMetricStatus('CLS'),
    ttfb: getMetricStatus('TTFB'),
    fcp: getMetricStatus('FCP'),
    inp: getMetricStatus('INP'),
    fid: getMetricStatus('INP') // Alias for backward compatibility
  };
};

export default useWebVitals;
