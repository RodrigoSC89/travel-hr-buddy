/**
 * Web Vitals Reporter
 * Reports Core Web Vitals to analytics for production monitoring
 * PATCH: Audit Plan 2025 - Observability
 */

import { onCLS, onLCP, onTTFB, onFCP, onINP, type Metric } from 'web-vitals';

// Thresholds based on Google's recommendations
const THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  LCP: { good: 2500, needsImprovement: 4000 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
};

type VitalName = keyof typeof THRESHOLDS;
type VitalRating = 'good' | 'needs-improvement' | 'poor';

interface VitalReport {
  name: VitalName;
  value: number;
  rating: VitalRating;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  connectionType?: string;
}

// Buffer for batching reports
let vitalsBuffer: VitalReport[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

const getRating = (name: VitalName, value: number): VitalRating => {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

const getConnectionType = (): string => {
  const nav = navigator as Navigator & { 
    connection?: { effectiveType?: string } 
  };
  return nav.connection?.effectiveType || 'unknown';
};

const handleVital = (metric: Metric) => {
  const report: VitalReport = {
    name: metric.name as VitalName,
    value: metric.value,
    rating: getRating(metric.name as VitalName, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType || 'navigate',
    timestamp: Date.now(),
    url: window.location.href,
    connectionType: getConnectionType(),
  };
  
  vitalsBuffer.push(report);
  
  // Log in development
  if (import.meta.env.DEV) {
    const color = report.rating === 'good' ? '🟢' : 
                  report.rating === 'needs-improvement' ? '🟡' : '🔴';
  }
  
  // Schedule flush
  scheduleFlush();
};

const scheduleFlush = () => {
  if (flushTimeout) return;
  
  flushTimeout = setTimeout(() => {
    flushVitals();
    flushTimeout = null;
  }, 5000); // Batch every 5 seconds
};

const flushVitals = async () => {
  if (vitalsBuffer.length === 0) return;
  
  const vitalsToSend = [...vitalsBuffer];
  vitalsBuffer = [];
  
  // Skip sending in development
  if (import.meta.env.DEV) {
    return;
  }
  
  try {
    // Send to analytics endpoint
    // Using sendBeacon for reliability during page unload
    const data = JSON.stringify({
      vitals: vitalsToSend,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
    
    // If we have a Supabase edge function for analytics
    const analyticsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics`;
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(analyticsUrl, data);
    } else {
      fetch(analyticsUrl, {
        method: 'POST',
        body: data,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {
        // Silent fail - analytics shouldn't break the app
      });
    }
  } catch {
    // Silent fail
  }
};

// Check for performance issues
const checkForIssues = (vitals: VitalReport[]) => {
  const issues: string[] = [];
  
  vitals.forEach(vital => {
    if (vital.rating === 'poor') {
      issues.push(`${vital.name} is poor (${vital.value.toFixed(2)})`);
    }
  });
  
  if (issues.length > 0 && import.meta.env.DEV) {
  }
  
  return issues;
};

// Initialize web vitals collection
export const initWebVitals = () => {
  // Only run in browser
  if (typeof window === 'undefined') return;
  
  try {
    onCLS(handleVital);
    onLCP(handleVital);
    onTTFB(handleVital);
    onFCP(handleVital);
    onINP(handleVital);
    
    // Flush on page unload
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushVitals();
      }
    });
    
    // Flush on beforeunload as backup
    window.addEventListener('beforeunload', flushVitals);
    
    if (import.meta.env.DEV) {
    }
  } catch (error) {
    console.warn('[Web Vitals] Failed to initialize:', error);
    console.warn('[Web Vitals] Failed to initialize:', error);
  }
};

// Get current vitals summary
export const getVitalsSummary = (): Record<string, VitalReport | undefined> => {
  const summary: Record<string, VitalReport | undefined> = {};
  
  vitalsBuffer.forEach(vital => {
    // Keep the latest value for each metric
    summary[vital.name] = vital;
  });
  
  return summary;
};

// Export for testing
export const __testing = {
  vitalsBuffer,
  handleVital,
  flushVitals,
  checkForIssues,
};
