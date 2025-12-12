/**
 * Offline Test Utilities - PATCH 850
 * Utilities for testing offline functionality
 */

import { logger } from "@/lib/logger";

export interface OfflineTestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

export interface OfflineTestReport {
  timestamp: string;
  results: OfflineTestResult[];
  overallPassed: boolean;
  totalDuration: number;
}

class OfflineTester {
  /**
   * Run all offline capability tests
   */
  async runAllTests(): Promise<OfflineTestReport> {
    const startTime = performance.now();
    const results: OfflineTestResult[] = [];

    results.push(await this.testLocalStoragePersistence());
    results.push(await this.testIndexedDBOperations());
    results.push(await this.testCacheAPIFunctionality());
    results.push(await this.testServiceWorkerCache());
    results.push(await this.testOfflinePageAvailability());

    return {
      timestamp: new Date().toISOString(),
      results,
      overallPassed: results.every(r => r.passed),
      totalDuration: performance.now() - startTime,
    };
  }

  private async testLocalStoragePersistence(): Promise<OfflineTestResult> {
    const start = performance.now();
    const testData = { test: "offline", timestamp: Date.now() };
    
    try {
      localStorage.setItem("__offline_test__", JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem("__offline_test__") || "{}");
      localStorage.removeItem("__offline_test__");

      const passed = retrieved.test === testData.test;
      
      return {
        name: "LocalStorage Persistence",
        passed,
        message: passed ? "Dados persistidos corretamente" : "Falha na persistência",
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: "LocalStorage Persistence",
        passed: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testIndexedDBOperations(): Promise<OfflineTestResult> {
    const start = performance.now();
    
    try {
      const dbName = "__offline_test_db__";
      const storeName = "testStore";
      
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => {
          request.result.createObjectStore(storeName, { keyPath: "id" });
        };
      });

      // Write test
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(storeName, "readwrite");
        tx.objectStore(storeName).put({ id: 1, data: "test" });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      // Read test
      const result = await new Promise<any>((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const request = tx.objectStore(storeName).get(1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      db.close();
      indexedDB.deleteDatabase(dbName);

      const passed = result?.data === "test";
      
      return {
        name: "IndexedDB Operations",
        passed,
        message: passed ? "CRUD operations funcionando" : "Falha nas operações",
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: "IndexedDB Operations",
        passed: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testCacheAPIFunctionality(): Promise<OfflineTestResult> {
    const start = performance.now();
    
    try {
      if (!("caches" in window)) {
        return {
          name: "Cache API",
          passed: false,
          message: "Cache API não disponível",
          duration: performance.now() - start,
        };
      }

      const cacheName = "__offline_test_cache__";
      const testUrl = "/test-resource";
      const testContent = "cached content";

      const cache = await caches.open(cacheName);
      await cache.put(testUrl, new Response(testContent));
      
      const response = await cache.match(testUrl);
      const content = await response?.text();
      
      await caches.delete(cacheName);

      const passed = content === testContent;
      
      return {
        name: "Cache API",
        passed,
        message: passed ? "Cache funcionando corretamente" : "Falha no cache",
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: "Cache API",
        passed: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testServiceWorkerCache(): Promise<OfflineTestResult> {
    const start = performance.now();
    
    try {
      const cacheNames = await caches.keys();
      const swCaches = cacheNames.filter(name => 
        name.includes("nautilus") || name.includes("static") || name.includes("api")
      );

      if (swCaches.length === 0) {
        return {
          name: "Service Worker Cache",
          passed: false,
          message: "Nenhum cache do SW encontrado",
          duration: performance.now() - start,
        };
      }

      let totalItems = 0;
      for (const name of swCaches) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        totalItems += keys.length;
      }

      return {
        name: "Service Worker Cache",
        passed: totalItems > 0,
        message: `${swCaches.length} cache(s), ${totalItems} items em cache`,
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: "Service Worker Cache",
        passed: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
        duration: performance.now() - start,
      };
    }
  }

  private async testOfflinePageAvailability(): Promise<OfflineTestResult> {
    const start = performance.now();
    
    try {
      // Check if offline.html is cached
      const cacheNames = await caches.keys();
      let found = false;

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const response = await cache.match("/offline.html");
        if (response) {
          found = true;
          break;
        }
      }

      return {
        name: "Offline Page",
        passed: found,
        message: found ? "Página offline em cache" : "Página offline não encontrada no cache",
        duration: performance.now() - start,
      };
    } catch (error) {
      return {
        name: "Offline Page",
        passed: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
        duration: performance.now() - start,
      };
    }
  }

  /**
   * Simulate offline mode for testing
   */
  simulateOffline(duration: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      logger.info("[OfflineTest] Simulating offline mode");
      
      // Note: We can't actually disconnect, but we can test offline behaviors
      const originalOnline = navigator.onLine;
      Object.defineProperty(navigator, "onLine", { value: false, writable: true });
      
      window.dispatchEvent(new Event("offline"));

      setTimeout(() => {
        Object.defineProperty(navigator, "onLine", { value: originalOnline, writable: true });
        window.dispatchEvent(new Event("online"));
        logger.info("[OfflineTest] Back online");
        resolve();
      }, duration);
    });
  }
}

export const offlineTester = new OfflineTester();

// React hook
import { useState, useCallback } from "react";

export function useOfflineTester() {
  const [report, setReport] = useState<OfflineTestReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await offlineTester.runAllTests();
      setReport(result);
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);

  return { report, isRunning, runTests };
}
