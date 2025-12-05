/**
 * System Diagnostics - PATCH 850
 * Comprehensive diagnostic utilities for production testing
 */

import { logger } from '@/lib/logger';

export interface DiagnosticResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
  details?: Record<string, unknown>;
}

export interface DiagnosticsReport {
  timestamp: string;
  results: DiagnosticResult[];
  overallPassed: boolean;
  totalDuration: number;
  systemInfo: SystemInfo;
}

interface SystemInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookiesEnabled: boolean;
  onLine: boolean;
  memory?: { used: number; total: number };
  connection?: { effectiveType: string; downlink: number };
}

class SystemDiagnostics {
  /**
   * Run all diagnostic tests
   */
  async runAllDiagnostics(): Promise<DiagnosticsReport> {
    const startTime = performance.now();
    const results: DiagnosticResult[] = [];

    // Core diagnostics
    results.push(await this.testLocalStorage());
    results.push(await this.testIndexedDB());
    results.push(await this.testCacheAPI());
    results.push(await this.testServiceWorker());
    results.push(await this.testNetworkConnectivity());
    results.push(await this.testWebWorkers());
    results.push(await this.testPerformanceAPI());

    const totalDuration = performance.now() - startTime;

    return {
      timestamp: new Date().toISOString(),
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration,
      systemInfo: this.getSystemInfo(),
    };
  }

  private async testLocalStorage(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      const testKey = '__diagnostic_test__';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      return {
        name: 'LocalStorage',
        passed: value === 'test',
        message: 'LocalStorage funcionando corretamente',
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: 'LocalStorage',
        passed: false,
        message: `LocalStorage indisponível: ${error instanceof Error ? error.message : 'Erro'}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testIndexedDB(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      if (!('indexedDB' in window)) {
        return {
          name: 'IndexedDB',
          passed: false,
          message: 'IndexedDB não suportado neste navegador',
          duration: performance.now() - start,
        };
      }

      const request = indexedDB.open('__diagnostic_test__', 1);
      
      await new Promise<void>((resolve, reject) => {
        request.onsuccess = () => {
          request.result.close();
          indexedDB.deleteDatabase('__diagnostic_test__');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      return {
        name: 'IndexedDB',
        passed: true,
        message: 'IndexedDB funcionando corretamente',
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: 'IndexedDB',
        passed: false,
        message: `IndexedDB falhou: ${error instanceof Error ? error.message : 'Erro'}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testCacheAPI(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      if (!('caches' in window)) {
        return {
          name: 'Cache API',
          passed: false,
          message: 'Cache API não suportada',
          duration: performance.now() - start,
        };
      }

      const cacheName = '__diagnostic_test__';
      const cache = await caches.open(cacheName);
      await cache.put('test', new Response('test'));
      const response = await cache.match('test');
      await caches.delete(cacheName);

      return {
        name: 'Cache API',
        passed: response !== undefined,
        message: 'Cache API funcionando corretamente',
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: 'Cache API',
        passed: false,
        message: `Cache API falhou: ${error instanceof Error ? error.message : 'Erro'}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testServiceWorker(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      if (!('serviceWorker' in navigator)) {
        return {
          name: 'Service Worker',
          passed: false,
          message: 'Service Worker não suportado',
          duration: performance.now() - start,
        };
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      
      return {
        name: 'Service Worker',
        passed: registrations.length > 0,
        message: registrations.length > 0 
          ? `${registrations.length} Service Worker(s) registrado(s)`
          : 'Nenhum Service Worker registrado',
        duration: performance.now() - start,
        details: { count: registrations.length },
      };
    } catch (error) {
      return {
        name: 'Service Worker',
        passed: false,
        message: `Falha ao verificar SW: ${error instanceof Error ? error.message : 'Erro'}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testNetworkConnectivity(): Promise<DiagnosticResult> {
    const start = performance.now();
    const isOnline = navigator.onLine;
    
    const connection = (navigator as any).connection;
    const details: Record<string, unknown> = {
      online: isOnline,
    };

    if (connection) {
      details.effectiveType = connection.effectiveType;
      details.downlink = connection.downlink;
      details.rtt = connection.rtt;
      details.saveData = connection.saveData;
    }

    return {
      name: 'Network',
      passed: true,
      message: isOnline 
        ? `Online - ${connection?.effectiveType || 'Conexão'} (${connection?.downlink || '?'}Mbps)`
        : 'Offline',
      duration: performance.now() - start,
      details,
    };
  }

  private async testWebWorkers(): Promise<DiagnosticResult> {
    const start = performance.now();
    try {
      if (!('Worker' in window)) {
        return {
          name: 'Web Workers',
          passed: false,
          message: 'Web Workers não suportados',
          duration: performance.now() - start,
        };
      }

      return {
        name: 'Web Workers',
        passed: true,
        message: 'Web Workers suportados',
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: 'Web Workers',
        passed: false,
        message: `Falha: ${error instanceof Error ? error.message : 'Erro'}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testPerformanceAPI(): Promise<DiagnosticResult> {
    const start = performance.now();
    
    const memory = (performance as any).memory;
    const details: Record<string, unknown> = {};

    if (memory) {
      details.usedJSHeapSize = memory.usedJSHeapSize;
      details.totalJSHeapSize = memory.totalJSHeapSize;
      details.jsHeapSizeLimit = memory.jsHeapSizeLimit;
      details.usagePercent = ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1);
    }

    return {
      name: 'Performance API',
      passed: true,
      message: memory 
        ? `Memória: ${details.usagePercent}% utilizada`
        : 'Performance API disponível (memória não acessível)',
      duration: performance.now() - start,
      details,
    };
  }

  private getSystemInfo(): SystemInfo {
    const connection = (navigator as any).connection;
    const memory = (performance as any).memory;

    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      memory: memory ? {
        used: memory.usedJSHeapSize,
        total: memory.jsHeapSizeLimit,
      } : undefined,
      connection: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
      } : undefined,
    };
  }
}

export const systemDiagnostics = new SystemDiagnostics();

// React hook
import { useState, useCallback } from 'react';

export function useSystemDiagnostics() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await systemDiagnostics.runAllDiagnostics();
      setReport(result);
      logger.info('[Diagnostics] Report generated', { passed: result.overallPassed });
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { report, isRunning, runDiagnostics };
}
