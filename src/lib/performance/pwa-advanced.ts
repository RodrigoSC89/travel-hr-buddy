/**
 * PWA Advanced - Enterprise Excellence v5.0
 * Service Worker v20 with advanced caching strategies
 */

interface CacheStrategy {
  name: string;
  urlPattern: RegExp;
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only';
  maxAge: number;
  maxEntries: number;
}

interface SyncTask {
  id: string;
  url: string;
  method: string;
  body?: string;
  headers: Record<string, string>;
  timestamp: number;
  retries: number;
}

class PWAManager {
  private static instance: PWAManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private syncQueue: SyncTask[] = [];
  private isOnline = navigator.onLine;

  private readonly cacheStrategies: CacheStrategy[] = [
    {
      name: 'static-assets',
      urlPattern: /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
      strategy: 'cache-first',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      maxEntries: 100
    },
    {
      name: 'api-responses',
      urlPattern: /\/rest\/v1\//,
      strategy: 'network-first',
      maxAge: 5 * 60 * 1000, // 5 minutes
      maxEntries: 50
    },
    {
      name: 'html-pages',
      urlPattern: /\.html$|\/$/,
      strategy: 'stale-while-revalidate',
      maxAge: 60 * 60 * 1000, // 1 hour
      maxEntries: 20
    },
    {
      name: 'realtime',
      urlPattern: /\/realtime\//,
      strategy: 'network-only',
      maxAge: 0,
      maxEntries: 0
    }
  ];

  private constructor() {
    this.init();
  }

  static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  /**
   * Initialize PWA features
   */
  private async init(): Promise<void> {
    if (typeof window === 'undefined') return;

    this.setupOnlineListener();
    await this.registerServiceWorker();
    this.loadSyncQueue();
  }

  /**
   * Register service worker
   */
  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      // Check for updates periodically
      setInterval(() => {
        this.swRegistration?.update();
      }, 60 * 60 * 1000); // Every hour

      // Handle updates
      this.swRegistration.addEventListener('updatefound', () => {
        const newWorker = this.swRegistration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Setup online/offline listeners
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Notify user about available update
   */
  private notifyUpdateAvailable(): void {
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  /**
   * Apply pending update
   */
  async applyUpdate(): Promise<void> {
    if (!this.swRegistration?.waiting) return;

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  /**
   * Add request to background sync queue
   */
  async addToSyncQueue(request: Request): Promise<void> {
    const task: SyncTask = {
      id: crypto.randomUUID(),
      url: request.url,
      method: request.method,
      body: request.method !== 'GET' ? await request.text() : undefined,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: Date.now(),
      retries: 0
    };

    this.syncQueue.push(task);
    this.saveSyncQueue();

    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  /**
   * Process background sync queue
   */
  private async processSyncQueue(): Promise<void> {
    const tasks = [...this.syncQueue];
    
    for (const task of tasks) {
      try {
        const response = await fetch(task.url, {
          method: task.method,
          headers: task.headers,
          body: task.body
        });

        if (response.ok) {
          this.removeFromQueue(task.id);
        } else if (response.status >= 500) {
          this.incrementRetry(task.id);
        }
      } catch (error) {
        this.incrementRetry(task.id);
      }
    }
  }

  /**
   * Remove task from queue
   */
  private removeFromQueue(taskId: string): void {
    this.syncQueue = this.syncQueue.filter(t => t.id !== taskId);
    this.saveSyncQueue();
  }

  /**
   * Increment retry count
   */
  private incrementRetry(taskId: string): void {
    const task = this.syncQueue.find(t => t.id === taskId);
    if (task) {
      task.retries++;
      if (task.retries >= 5) {
        this.removeFromQueue(taskId);
      } else {
        this.saveSyncQueue();
      }
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('pwa_sync_queue', JSON.stringify(this.syncQueue));
    } catch (e) {
      console.warn('Failed to save sync queue');
    }
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const saved = localStorage.getItem('pwa_sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (e) {
      this.syncQueue = [];
    }
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    return await Notification.requestPermission();
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) return null;

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') return null;

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Would be VAPID public key from env
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
        )
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Convert VAPID key
   */
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  }

  /**
   * Prompt for installation
   */
  async promptInstall(): Promise<boolean> {
    const event = (window as unknown as { deferredPrompt?: { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } }).deferredPrompt;
    if (!event) return false;

    await event.prompt();
    const result = await event.userChoice;
    return result.outcome === 'accepted';
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    if (!('caches' in window)) return;

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ name: string; count: number; size: number }[]> {
    if (!('caches' in window)) return [];

    const stats: { name: string; count: number; size: number }[] = [];
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const requests = await cache.keys();
      
      let totalSize = 0;
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      }

      stats.push({
        name,
        count: requests.length,
        size: totalSize
      });
    }

    return stats;
  }

  /**
   * Get installability status
   */
  getInstallStatus(): {
    isInstallable: boolean;
    isInstalled: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
  } {
    const userAgent = navigator.userAgent.toLowerCase();
    let platform: 'ios' | 'android' | 'desktop' | 'unknown' = 'unknown';

    if (/iphone|ipad|ipod/.test(userAgent)) {
      platform = 'ios';
    } else if (/android/.test(userAgent)) {
      platform = 'android';
    } else if (/windows|mac|linux/.test(userAgent)) {
      platform = 'desktop';
    }

    return {
      isInstallable: 'serviceWorker' in navigator && 'PushManager' in window,
      isInstalled: this.isInstalled(),
      platform
    };
  }
}

export const pwaManager = PWAManager.getInstance();
export { PWAManager };
export type { CacheStrategy, SyncTask };
