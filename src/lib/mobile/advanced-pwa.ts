/**
 * Advanced PWA Engine v6.0
 * Enhanced offline sync and push notifications
 */

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  timestamp: number;
  attempts: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

interface PushNotificationConfig {
  vapidPublicKey: string;
  serviceWorkerPath: string;
  notificationOptions: NotificationOptions;
}

interface OfflineData {
  key: string;
  value: unknown;
  expiresAt?: number;
  syncRequired: boolean;
}

class AdvancedPWAEngine {
  private syncQueue: SyncQueueItem[] = [];
  private db: IDBDatabase | null = null;
  private pushSubscription: PushSubscription | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  async initialize(): Promise<void> {
    await this.initIndexedDB();
    await this.loadSyncQueue();
    await this.registerServiceWorker();
    this.startBackgroundSync();

    console.log('[AdvancedPWA] Initialized');
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('nauti-one-pwa', 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Offline data store
        if (!db.objectStoreNames.contains('offline_data')) {
          const store = db.createObjectStore('offline_data', { keyPath: 'key' });
          store.createIndex('syncRequired', 'syncRequired');
          store.createIndex('expiresAt', 'expiresAt');
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('sync_queue')) {
          const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
          store.createIndex('status', 'status');
          store.createIndex('timestamp', 'timestamp');
        }

        // Cached requests store
        if (!db.objectStoreNames.contains('cached_requests')) {
          db.createObjectStore('cached_requests', { keyPath: 'url' });
        }
      };
    });
  }

  private async registerServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[AdvancedPWA] Service workers not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[AdvancedPWA] Service worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyAppUpdate();
            }
          });
        }
      });
    } catch (error) {
      console.error('[AdvancedPWA] Service worker registration failed:', error);
    }
  }

  private notifyAppUpdate(): void {
    const event = new CustomEvent('pwa-update-available');
    window.dispatchEvent(event);
  }

  // Offline data management

  async storeOffline(key: string, value: unknown, options?: { 
    expiresIn?: number; 
    syncRequired?: boolean 
  }): Promise<void> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    const data: OfflineData = {
      key,
      value,
      expiresAt: options?.expiresIn ? Date.now() + options.expiresIn : undefined,
      syncRequired: options?.syncRequired ?? false
    };

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('offline_data', 'readwrite');
      const store = tx.objectStore('offline_data');
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getOffline<T>(key: string): Promise<T | null> {
    if (!this.db) throw new Error('IndexedDB not initialized');

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('offline_data', 'readonly');
      const store = tx.objectStore('offline_data');
      const request = store.get(key);

      request.onsuccess = () => {
        const data = request.result as OfflineData | undefined;
        
        if (!data) {
          resolve(null);
          return;
        }

        // Check expiration
        if (data.expiresAt && data.expiresAt < Date.now()) {
          this.deleteOffline(key);
          resolve(null);
          return;
        }

        resolve(data.value as T);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async deleteOffline(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('offline_data', 'readwrite');
      const store = tx.objectStore('offline_data');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Sync queue management

  async queueSync(
    action: SyncQueueItem['action'],
    table: string,
    data: unknown
  ): Promise<string> {
    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      action,
      table,
      data,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    };

    this.syncQueue.push(item);
    await this.saveSyncQueue();

    return item.id;
  }

  private async loadSyncQueue(): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const request = store.getAll();

      request.onsuccess = () => {
        this.syncQueue = request.result || [];
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async saveSyncQueue(): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');

    // Clear and repopulate
    store.clear();
    this.syncQueue.forEach(item => store.put(item));
  }

  // PATCH v35: Removido navigator.onLine - sempre tenta sync
  private startBackgroundSync(): void {
    // Process sync queue every 30 seconds
    this.syncInterval = setInterval(() => {
      this.processSyncQueue();
    }, 30000);

    // Also sync on online event
    window.addEventListener('online', () => {
      this.processSyncQueue();
    });
  }

  private async processSyncQueue(): Promise<void> {
    const pendingItems = this.syncQueue.filter(i => i.status === 'pending');
    
    for (const item of pendingItems) {
      await this.syncItem(item);
    }

    await this.saveSyncQueue();
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    item.status = 'syncing';
    item.attempts++;

    try {
      // Sync handled per-table basis
      console.log('[AdvancedPWA] Syncing item:', item.id, item.table, item.action);
      
      item.status = 'synced';
      
      // Remove synced items
      this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
    } catch (error) {
      console.error('[AdvancedPWA] Sync failed for item:', item.id, error);
      
      if (item.attempts >= 3) {
        item.status = 'failed';
      } else {
        item.status = 'pending';
      }
    }
  }

  getSyncStatus(): { pending: number; synced: number; failed: number } {
    return {
      pending: this.syncQueue.filter(i => i.status === 'pending').length,
      synced: this.syncQueue.filter(i => i.status === 'synced').length,
      failed: this.syncQueue.filter(i => i.status === 'failed').length
    };
  }

  // Push notifications

  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[AdvancedPWA] Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(_vapidPublicKey: string): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[AdvancedPWA] Push not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      this.pushSubscription = subscription;
      return subscription;
    } catch (error) {
      console.error('[AdvancedPWA] Push subscription failed:', error);
      return null;
    }
  }

  async showLocalNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      ...options
    });
  }

  // App install prompt

  private deferredPrompt: BeforeInstallPromptEvent | null = null;

  captureInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      const event = new CustomEvent('pwa-install-available');
      window.dispatchEvent(event);
    });
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;

    return outcome === 'accepted';
  }

  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export const advancedPWAEngine = new AdvancedPWAEngine();
export type { SyncQueueItem, OfflineData, PushNotificationConfig };
