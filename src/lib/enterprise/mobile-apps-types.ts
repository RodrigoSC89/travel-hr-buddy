/**
 * 📱 MOBILE APPS - Types & Logic
 * Offline-first, on-device AI, push notifications
 */

export interface MobileConfig {
  offlineEnabled: boolean;
  syncInterval: number;
  pushNotifications: boolean;
  biometricAuth: boolean;
  cameraIntegration: boolean;
  barcodeScanning: boolean;
}

export interface OfflineData {
  table: string;
  lastSync: Date;
  pendingChanges: number;
  localRecords: number;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  type: 'alert' | 'reminder' | 'update';
  priority: 'high' | 'normal' | 'low';
  data?: Record<string, any>;
  sentAt: Date;
  readAt?: Date;
}

export class MobileAppsEngine {
  private static instance: MobileAppsEngine;
  static getInstance() { return this.instance || (this.instance = new MobileAppsEngine()); }

  getDefaultConfig(): MobileConfig {
    return {
      offlineEnabled: true,
      syncInterval: 300,
      pushNotifications: true,
      biometricAuth: true,
      cameraIntegration: true,
      barcodeScanning: true,
    };
  }

  createNotification(params: Omit<PushNotification, 'id' | 'sentAt'>): PushNotification {
    return { ...params, id: crypto.randomUUID(), sentAt: new Date() };
  }

  getOfflineStatus(tables: string[]): OfflineData[] {
    return tables.map(table => ({
      table,
      lastSync: new Date(),
      pendingChanges: 0,
      localRecords: Math.floor(Math.random() * 100),
    }));
  }
}

export const mobileApps = MobileAppsEngine.getInstance();
