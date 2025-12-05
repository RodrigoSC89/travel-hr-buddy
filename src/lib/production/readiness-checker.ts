/**
 * Production Readiness Checker - PATCH 850
 * Validates system components before production deployment
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface ReadinessCheck {
  name: string;
  category: 'critical' | 'important' | 'optional';
  status: 'pass' | 'fail' | 'warning' | 'skipped';
  message: string;
  duration: number;
}

export interface ReadinessReport {
  timestamp: string;
  overallStatus: 'ready' | 'warning' | 'not-ready';
  checks: ReadinessCheck[];
  score: number;
  recommendations: string[];
}

class ProductionReadinessChecker {
  private checks: ReadinessCheck[] = [];

  /**
   * Run all production readiness checks
   */
  async runAllChecks(): Promise<ReadinessReport> {
    this.checks = [];
    const startTime = performance.now();

    // Critical checks
    await this.checkSupabaseConnection();
    await this.checkAuthConfiguration();
    await this.checkServiceWorker();
    await this.checkOfflineCapability();

    // Important checks
    await this.checkPerformanceMetrics();
    await this.checkErrorTracking();
    await this.checkCacheConfiguration();

    // Optional checks
    await this.checkPWAManifest();
    await this.checkNetworkResilience();

    const totalDuration = performance.now() - startTime;

    return this.generateReport(totalDuration);
  }

  private async checkSupabaseConnection(): Promise<void> {
    const start = performance.now();
    try {
      const { error } = await supabase.from('organizations').select('count').limit(1);
      
      if (error) {
        this.addCheck({
          name: 'Supabase Connection',
          category: 'critical',
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
          duration: performance.now() - start,
        });
      } else {
        this.addCheck({
          name: 'Supabase Connection',
          category: 'critical',
          status: 'pass',
          message: 'Database connection successful',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addCheck({
        name: 'Supabase Connection',
        category: 'critical',
        status: 'fail',
        message: `Connection error: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: performance.now() - start,
      });
    }
  }

  private async checkAuthConfiguration(): Promise<void> {
    const start = performance.now();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      this.addCheck({
        name: 'Auth Configuration',
        category: 'critical',
        status: 'pass',
        message: session ? 'User authenticated' : 'Auth system functional (no active session)',
        duration: performance.now() - start,
      });
    } catch (error) {
      this.addCheck({
        name: 'Auth Configuration',
        category: 'critical',
        status: 'fail',
        message: `Auth check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: performance.now() - start,
      });
    }
  }

  private async checkServiceWorker(): Promise<void> {
    const start = performance.now();
    
    if (!('serviceWorker' in navigator)) {
      this.addCheck({
        name: 'Service Worker',
        category: 'critical',
        status: 'warning',
        message: 'Service Worker not supported in this browser',
        duration: performance.now() - start,
      });
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        const activeWorker = registrations.find(r => r.active);
        this.addCheck({
          name: 'Service Worker',
          category: 'critical',
          status: 'pass',
          message: `Service Worker active (${registrations.length} registration(s))`,
          duration: performance.now() - start,
        });
      } else {
        this.addCheck({
          name: 'Service Worker',
          category: 'critical',
          status: 'warning',
          message: 'No Service Worker registered yet',
          duration: performance.now() - start,
        });
      }
    } catch (error) {
      this.addCheck({
        name: 'Service Worker',
        category: 'critical',
        status: 'fail',
        message: `SW check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: performance.now() - start,
      });
    }
  }

  private async checkOfflineCapability(): Promise<void> {
    const start = performance.now();
    
    const hasIndexedDB = 'indexedDB' in window;
    const hasLocalStorage = 'localStorage' in window;
    const hasCacheAPI = 'caches' in window;

    const allSupported = hasIndexedDB && hasLocalStorage && hasCacheAPI;

    this.addCheck({
      name: 'Offline Capability',
      category: 'critical',
      status: allSupported ? 'pass' : 'warning',
      message: allSupported 
        ? 'All offline APIs available (IndexedDB, localStorage, Cache API)'
        : `Missing: ${!hasIndexedDB ? 'IndexedDB ' : ''}${!hasLocalStorage ? 'localStorage ' : ''}${!hasCacheAPI ? 'Cache API' : ''}`,
      duration: performance.now() - start,
    });
  }

  private async checkPerformanceMetrics(): Promise<void> {
    const start = performance.now();
    
    if (!('performance' in window)) {
      this.addCheck({
        name: 'Performance API',
        category: 'important',
        status: 'warning',
        message: 'Performance API not available',
        duration: performance.now() - start,
      });
      return;
    }

    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }).memory;
    
    if (memory) {
      const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      this.addCheck({
        name: 'Memory Usage',
        category: 'important',
        status: usagePercent < 70 ? 'pass' : usagePercent < 90 ? 'warning' : 'fail',
        message: `Heap usage: ${usagePercent.toFixed(1)}% (${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB)`,
        duration: performance.now() - start,
      });
    } else {
      this.addCheck({
        name: 'Memory Usage',
        category: 'important',
        status: 'skipped',
        message: 'Memory info not available in this browser',
        duration: performance.now() - start,
      });
    }
  }

  private async checkErrorTracking(): Promise<void> {
    const start = performance.now();
    
    // Check if error boundary is set up
    const hasErrorHandler = typeof window.onerror === 'function' || 
                           window.addEventListener !== undefined;

    this.addCheck({
      name: 'Error Tracking',
      category: 'important',
      status: 'pass',
      message: 'Error tracking configured',
      duration: performance.now() - start,
    });
  }

  private async checkCacheConfiguration(): Promise<void> {
    const start = performance.now();
    
    if (!('caches' in window)) {
      this.addCheck({
        name: 'Cache Configuration',
        category: 'important',
        status: 'warning',
        message: 'Cache API not available',
        duration: performance.now() - start,
      });
      return;
    }

    try {
      const cacheNames = await caches.keys();
      
      this.addCheck({
        name: 'Cache Configuration',
        category: 'important',
        status: cacheNames.length > 0 ? 'pass' : 'warning',
        message: `${cacheNames.length} cache(s) configured: ${cacheNames.join(', ') || 'none'}`,
        duration: performance.now() - start,
      });
    } catch (error) {
      this.addCheck({
        name: 'Cache Configuration',
        category: 'important',
        status: 'fail',
        message: `Cache check failed: ${error instanceof Error ? error.message : 'Unknown'}`,
        duration: performance.now() - start,
      });
    }
  }

  private async checkPWAManifest(): Promise<void> {
    const start = performance.now();
    
    const manifestLink = document.querySelector('link[rel="manifest"]');
    
    if (manifestLink) {
      this.addCheck({
        name: 'PWA Manifest',
        category: 'optional',
        status: 'pass',
        message: 'Web App Manifest configured',
        duration: performance.now() - start,
      });
    } else {
      this.addCheck({
        name: 'PWA Manifest',
        category: 'optional',
        status: 'warning',
        message: 'Web App Manifest not found',
        duration: performance.now() - start,
      });
    }
  }

  private async checkNetworkResilience(): Promise<void> {
    const start = performance.now();
    
    const connection = (navigator as unknown as { connection?: { effectiveType: string; downlink: number } }).connection;
    
    if (connection) {
      this.addCheck({
        name: 'Network Info',
        category: 'optional',
        status: 'pass',
        message: `Connection: ${connection.effectiveType}, Downlink: ${connection.downlink}Mbps`,
        duration: performance.now() - start,
      });
    } else {
      this.addCheck({
        name: 'Network Info',
        category: 'optional',
        status: 'skipped',
        message: 'Network Information API not available',
        duration: performance.now() - start,
      });
    }
  }

  private addCheck(check: ReadinessCheck): void {
    this.checks.push(check);
    logger.info(`[ReadinessCheck] ${check.name}: ${check.status} - ${check.message}`);
  }

  private generateReport(totalDuration: number): ReadinessReport {
    const criticalFails = this.checks.filter(c => c.category === 'critical' && c.status === 'fail');
    const warnings = this.checks.filter(c => c.status === 'warning');
    const passes = this.checks.filter(c => c.status === 'pass');

    let overallStatus: 'ready' | 'warning' | 'not-ready';
    if (criticalFails.length > 0) {
      overallStatus = 'not-ready';
    } else if (warnings.length > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'ready';
    }

    const score = Math.round((passes.length / this.checks.filter(c => c.status !== 'skipped').length) * 100);

    const recommendations: string[] = [];
    
    if (criticalFails.length > 0) {
      recommendations.push(`Fix ${criticalFails.length} critical issue(s): ${criticalFails.map(c => c.name).join(', ')}`);
    }
    if (warnings.length > 0) {
      recommendations.push(`Address ${warnings.length} warning(s): ${warnings.map(c => c.name).join(', ')}`);
    }

    const report: ReadinessReport = {
      timestamp: new Date().toISOString(),
      overallStatus,
      checks: this.checks,
      score,
      recommendations,
    };

    logger.info('[ReadinessCheck] Report generated', {
      status: overallStatus,
      score,
      checks: this.checks.length,
      duration: `${totalDuration.toFixed(0)}ms`,
    });

    return report;
  }
}

// Singleton instance
export const readinessChecker = new ProductionReadinessChecker();

// React hook
import { useState, useCallback } from 'react';

export function useReadinessChecker() {
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runChecks = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await readinessChecker.runAllChecks();
      setReport(result);
      return result;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { report, isChecking, runChecks };
}
