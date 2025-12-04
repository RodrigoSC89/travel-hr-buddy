/**
 * Connection-Aware Utilities - PATCH 750
 * Optimizes app behavior based on network conditions
 */

export interface ConnectionInfo {
  type: 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';
  saveData: boolean;
  downlink: number; // Mbps
  rtt: number; // Round-trip time in ms
  effectiveType: string;
}

/**
 * Get current connection information
 */
export function getConnectionInfo(): ConnectionInfo {
  const conn = (navigator as any).connection || 
               (navigator as any).mozConnection || 
               (navigator as any).webkitConnection;

  if (!conn) {
    return {
      type: 'unknown',
      saveData: false,
      downlink: 10,
      rtt: 100,
      effectiveType: '4g'
    };
  }

  return {
    type: conn.effectiveType || 'unknown',
    saveData: conn.saveData || false,
    downlink: conn.downlink || 10,
    rtt: conn.rtt || 100,
    effectiveType: conn.effectiveType || '4g'
  };
}

/**
 * Check if user is on slow connection (2Mb or less)
 */
export function isSlowConnection(): boolean {
  const { type, saveData, downlink } = getConnectionInfo();
  return saveData || type === 'slow-2g' || type === '2g' || downlink <= 2;
}

/**
 * Check if user is offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Get optimized image quality based on connection
 */
export function getOptimalImageQuality(): 'low' | 'medium' | 'high' {
  const { type, saveData } = getConnectionInfo();
  
  if (saveData || type === 'slow-2g' || type === '2g') {
    return 'low';
  }
  if (type === '3g') {
    return 'medium';
  }
  return 'high';
}

/**
 * Get optimal animation complexity
 */
export function getOptimalAnimationLevel(): 'none' | 'reduced' | 'full' {
  const { type, saveData } = getConnectionInfo();
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return 'none';
  
  if (saveData || type === 'slow-2g' || type === '2g') {
    return 'none';
  }
  if (type === '3g') {
    return 'reduced';
  }
  return 'full';
}

/**
 * Get optimal polling interval based on connection
 */
export function getOptimalPollingInterval(baseInterval: number): number {
  const { type, saveData } = getConnectionInfo();
  
  if (saveData || type === 'slow-2g') {
    return baseInterval * 4; // 4x slower
  }
  if (type === '2g') {
    return baseInterval * 3; // 3x slower
  }
  if (type === '3g') {
    return baseInterval * 2; // 2x slower
  }
  return baseInterval;
}

/**
 * Get optimal fetch timeout
 */
export function getOptimalTimeout(): number {
  const { type, saveData, rtt } = getConnectionInfo();
  
  if (saveData || type === 'slow-2g') {
    return Math.max(30000, rtt * 10); // 30s minimum
  }
  if (type === '2g') {
    return Math.max(20000, rtt * 8); // 20s minimum
  }
  if (type === '3g') {
    return Math.max(15000, rtt * 5); // 15s minimum
  }
  return 10000; // 10s for good connections
}

/**
 * Subscribe to connection changes
 */
export function onConnectionChange(callback: (info: ConnectionInfo) => void): () => void {
  const conn = (navigator as any).connection;
  
  if (!conn) {
    return () => {};
  }

  const handler = () => callback(getConnectionInfo());
  conn.addEventListener('change', handler);
  
  return () => conn.removeEventListener('change', handler);
}

/**
 * Defer non-critical operations on slow connections
 */
export function deferOnSlowConnection<T>(
  fn: () => Promise<T>,
  delay: number = 2000
): Promise<T> {
  if (isSlowConnection()) {
    return new Promise((resolve, reject) => {
      setTimeout(() => fn().then(resolve).catch(reject), delay);
    });
  }
  return fn();
}

/**
 * Batch requests on slow connections
 */
export class RequestBatcher {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number;

  constructor(batchDelay: number = 500) {
    this.batchDelay = batchDelay;
  }

  add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ fn, resolve, reject });
      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.timeout) return;

    const delay = isSlowConnection() ? this.batchDelay * 2 : this.batchDelay;
    
    this.timeout = setTimeout(async () => {
      const batch = [...this.queue];
      this.queue = [];
      this.timeout = null;

      // Execute all requests in parallel
      await Promise.all(
        batch.map(async ({ fn, resolve, reject }) => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
      );
    }, delay);
  }
}

export const requestBatcher = new RequestBatcher();
