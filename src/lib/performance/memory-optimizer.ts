/**
 * Memory Optimizer - PATCH 850
 * Lightweight memory management for low-end devices
 */

interface MemoryInfo {
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}

interface PerformanceMemory extends Performance {
  memory?: MemoryInfo;
}

class MemoryOptimizer {
  private readonly HIGH_MEMORY_THRESHOLD = 0.8; // 80%
  private readonly CRITICAL_MEMORY_THRESHOLD = 0.9; // 90%
  private checkInterval: NodeJS.Timeout | null = null;

  getMemoryUsage(): number {
    const perf = performance as PerformanceMemory;
    if (perf.memory) {
      return perf.memory.usedJSHeapSize! / perf.memory.jsHeapSizeLimit!;
    }
    return 0;
  }

  isHighMemory(): boolean {
    return this.getMemoryUsage() > this.HIGH_MEMORY_THRESHOLD;
  }

  isCriticalMemory(): boolean {
    return this.getMemoryUsage() > this.CRITICAL_MEMORY_THRESHOLD;
  }

  clearLocalStorageOld(maxAgeDays: number = 7): void {
    try {
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
      const now = Date.now();
      
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            if (item.timestamp && now - item.timestamp > maxAge) {
              localStorage.removeItem(key);
            }
          } catch {
            // Invalid JSON, remove it
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.warn('[MemoryOptimizer] Error clearing localStorage:', e);
      console.warn('[MemoryOptimizer] Error clearing localStorage:', e);
    }
  }

  clearUnusedImages(): void {
    if (typeof document === 'undefined') return;
    
    const images = document.querySelectorAll('img[data-lazy]');
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement;
      if (!this.isInViewport(htmlImg)) {
        htmlImg.src = '';
        htmlImg.removeAttribute('src');
      }
    });
  }

  private isInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  async clearServiceWorkerCache(maxAgeDays: number = 3): Promise<void> {
    if (!('caches' in window)) return;
    
    try {
      const cacheNames = await caches.keys();
      const maxAge = maxAgeDays * 24 * 60 * 60 * 1000;
      
      for (const name of cacheNames) {
        if (name.includes('temp') || name.includes('old')) {
          await caches.delete(name);
        }
      }
    } catch (e) {
      console.warn('[MemoryOptimizer] Error clearing SW cache:', e);
      console.warn('[MemoryOptimizer] Error clearing SW cache:', e);
    }
  }

  startMonitoring(intervalMs: number = 30000): void {
    if (this.checkInterval) return;
    
    this.checkInterval = setInterval(() => {
      if (this.isCriticalMemory()) {
        this.performCleanup();
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async performCleanup(): Promise<void> {
    
    this.clearLocalStorageOld(3);
    this.clearUnusedImages();
    await this.clearServiceWorkerCache(1);
    
    // Force garbage collection hint
    if (typeof window !== 'undefined') {
      (window as any).gc?.();
    }
  }

  getStats(): { usage: number; status: 'low' | 'normal' | 'high' | 'critical' } {
    const usage = this.getMemoryUsage();
    let status: 'low' | 'normal' | 'high' | 'critical' = 'normal';
    
    if (usage > this.CRITICAL_MEMORY_THRESHOLD) {
      status = 'critical';
    } else if (usage > this.HIGH_MEMORY_THRESHOLD) {
      status = 'high';
    } else if (usage < 0.3) {
      status = 'low';
    }
    
    return { usage, status };
  }
}

export const memoryOptimizer = new MemoryOptimizer();
