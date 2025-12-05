/**
 * E2E Testing Helpers
 * Utilities for testing offline scenarios and performance
 */

/**
 * Simulate network conditions
 */
export const networkSimulator = {
  /**
   * Go offline
   */
  goOffline() {
    if ('serviceWorker' in navigator) {
      // Dispatch offline event
      window.dispatchEvent(new Event('offline'));
    }
  },

  /**
   * Go online
   */
  goOnline() {
    if ('serviceWorker' in navigator) {
      window.dispatchEvent(new Event('online'));
    }
  },

  /**
   * Simulate slow network by adding delay to fetch
   */
  simulateSlowNetwork(delayMs: number = 2000) {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  },

  /**
   * Simulate packet loss
   */
  simulatePacketLoss(failureRate: number = 0.3) {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      if (Math.random() < failureRate) {
        throw new Error('Simulated network failure');
      }
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  },
};

/**
 * Data attributes for testing
 */
export const testIds = {
  // Add test IDs to elements for E2E testing
  create: (id: string) => ({ 'data-testid': id }),
  
  // Common test IDs
  LOADING_SPINNER: 'loading-spinner',
  ERROR_MESSAGE: 'error-message',
  OFFLINE_BANNER: 'offline-banner',
  SYNC_STATUS: 'sync-status',
  RETRY_BUTTON: 'retry-button',
};

/**
 * Wait utilities for tests
 */
export const waitUtils = {
  /**
   * Wait for element to appear
   */
  async waitForElement(selector: string, timeout: number = 5000): Promise<Element | null> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return null;
  },

  /**
   * Wait for network to be idle
   */
  async waitForNetworkIdle(timeout: number = 5000): Promise<void> {
    return new Promise((resolve) => {
      let timer: NodeJS.Timeout;
      let pendingRequests = 0;

      const checkIdle = () => {
        if (pendingRequests === 0) {
          clearTimeout(timer);
          resolve();
        }
      };

      timer = setTimeout(resolve, timeout);

      // This is a simplified version - in real tests use proper network monitoring
      setTimeout(checkIdle, 1000);
    });
  },

  /**
   * Wait for condition
   */
  async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) return true;
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    return false;
  },
};

/**
 * Storage utilities for tests
 */
export const storageUtils = {
  /**
   * Clear all storage
   */
  clearAll() {
    localStorage.clear();
    sessionStorage.clear();
    
    if ('indexedDB' in window) {
      indexedDB.databases?.().then(databases => {
        databases.forEach(db => {
          if (db.name) indexedDB.deleteDatabase(db.name);
        });
      });
    }
  },

  /**
   * Seed localStorage with test data
   */
  seedLocalStorage(data: Record<string, any>) {
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  },
};

/**
 * Performance testing utilities
 */
export const perfUtils = {
  /**
   * Measure component render time
   */
  measureRender(callback: () => void): number {
    const start = performance.now();
    callback();
    return performance.now() - start;
  },

  /**
   * Get memory usage
   */
  getMemoryUsage(): { used: number; total: number; limit: number } | null {
    const memory = (performance as any).memory;
    if (!memory) return null;
    
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };
  },

  /**
   * Log performance marks
   */
  logMarks() {
    const marks = performance.getEntriesByType('mark');
    console.table(marks.map(m => ({ name: m.name, time: m.startTime.toFixed(2) })));
  },
};
