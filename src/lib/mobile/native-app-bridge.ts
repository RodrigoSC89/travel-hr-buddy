/**
 * Native App Bridge - PROMPT 6
 * Ponte para recursos nativos mobile
 */

import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';

export interface NativeFeature {
  available: boolean;
  supported: boolean;
  initialized: boolean;
}

export interface NativeCapabilities {
  camera: NativeFeature;
  haptics: NativeFeature;
  push_notifications: NativeFeature;
  local_notifications: NativeFeature;
  device_info: NativeFeature;
  network: NativeFeature;
  geolocation: NativeFeature;
}

export interface CameraOptions {
  source: 'camera' | 'gallery' | 'prompt';
  quality: number; // 0-100
  allowEditing?: boolean;
  resultType: 'uri' | 'base64';
}

export interface NotificationOptions {
  title: string;
  body: string;
  id?: number;
  schedule?: {
    at: Date;
  } | {
    every: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
  };
  sound?: string;
  attachments?: Array<{
    id: string;
    url: string;
    options?: any;
  }>;
}

class NativeAppBridge {
  private capabilities: NativeCapabilities | null = null;

  /**
   * Initialize native capabilities
   */
  async initialize(): Promise<NativeCapabilities> {
    if (!Capacitor.isNativePlatform()) {
      return this.getWebCapabilities();
    }

    const capabilities: NativeCapabilities = {
      camera: await this.checkCameraCapability(),
      haptics: await this.checkHapticsCapability(),
      push_notifications: await this.checkPushNotificationsCapability(),
      local_notifications: await this.checkLocalNotificationsCapability(),
      device_info: { available: true, supported: true, initialized: true },
      network: { available: true, supported: true, initialized: true },
      geolocation: await this.checkGeolocationCapability()
    };

    this.capabilities = capabilities;
    return capabilities;
  }

  /**
   * Take photo using native camera
   */
  async takePhoto(options: CameraOptions = {
    source: 'camera',
    quality: 90,
    resultType: 'uri'
  }): Promise<{ success: true; imageUrl: string } | { success: false; error: string }> {
    try {
      if (!this.capabilities?.camera.available) {
        return { success: false, error: 'Camera not available' };
      }

      const image = await Camera.getPhoto({
        source: options.source === 'camera' ? CameraSource.Camera : 
                options.source === 'gallery' ? CameraSource.Photos : CameraSource.Prompt,
        quality: options.quality,
        allowEditing: options.allowEditing || false,
        resultType: options.resultType === 'base64' ? CameraResultType.Base64 : CameraResultType.Uri
      });

      return {
        success: true,
        imageUrl: options.resultType === 'base64' 
          ? `data:image/jpeg;base64,${image.base64String}`
          : image.webPath || image.path || ''
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown camera error'
      };
    }
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHaptic(
    style: 'light' | 'medium' | 'heavy' = 'medium'
  ): Promise<void> {
    if (!this.capabilities?.haptics.available) return;

    try {
      const impactStyle = style === 'light' ? ImpactStyle.Light :
                         style === 'medium' ? ImpactStyle.Medium : ImpactStyle.Heavy;
      await Haptics.impact({ style: impactStyle });
    } catch (error) {
      console.warn('Haptics failed:', error);
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleNotification(options: NotificationOptions): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.capabilities?.local_notifications.available) {
        return { success: false, error: 'Local notifications not available' };
      }

      await LocalNotifications.schedule({
        notifications: [{
          id: options.id || Math.floor(Math.random() * 1000000),
          title: options.title,
          body: options.body,
          schedule: options.schedule,
          sound: options.sound,
          attachments: options.attachments
        }]
      });

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Notification scheduling failed'
      };
    }
  }

  /**
   * Register for push notifications
   */
  async registerPushNotifications(): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      if (!this.capabilities?.push_notifications.available) {
        return { success: false, error: 'Push notifications not available' };
      }

      // Request permissions
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      
      if (permStatus.receive !== 'granted') {
        return { success: false, error: 'Push notification permission denied' };
      }

      // Register with FCM/APNS
      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          resolve({ success: true, token: token.value });
        });

        PushNotifications.addListener('registrationError', (error) => {
          resolve({ success: false, error: error.error });
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          resolve({ success: false, error: 'Registration timeout' });
        }, 10000);
      });
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Push notification registration failed'
      };
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<{
    platform: string;
    version: string;
    model: string;
    manufacturer: string;
    isNative: boolean;
  }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        platform: 'web',
        version: navigator.userAgent,
        model: 'Unknown',
        manufacturer: 'Unknown',
        isNative: false
      };
    }

    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      
      return {
        platform: info.platform,
        version: info.osVersion,
        model: info.model,
        manufacturer: info.manufacturer,
        isNative: true
      };
    } catch (error) {
      return {
        platform: 'unknown',
        version: 'unknown',
        model: 'unknown',
        manufacturer: 'unknown',
        isNative: Capacitor.isNativePlatform()
      };
    }
  }

  /**
   * Check network connectivity
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    connectionType: string;
    cellular: boolean;
  }> {
    try {
      const { Network } = await import('@capacitor/network');
      const status = await Network.getStatus();
      
      return {
        connected: status.connected,
        connectionType: status.connectionType,
        cellular: status.connectionType === 'cellular'
      };
    } catch (error) {
      // Fallback to web API
      return {
        connected: navigator.onLine,
        connectionType: 'unknown',
        cellular: false
      };
    }
  }

  /**
   * Get current position
   */
  async getCurrentPosition(): Promise<{
    success: boolean;
    coordinates?: { latitude: number; longitude: number; accuracy: number };
    error?: string;
  }> {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });

      return {
        success: true,
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Geolocation failed'
      };
    }
  }

  /**
   * Share content using native share
   */
  async shareContent(content: {
    title?: string;
    text?: string;
    url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share(content);
      return { success: true };
    } catch (error) {
      // Fallback to Web Share API
      if (navigator.share) {
        try {
          await navigator.share(content);
          return { success: true };
        } catch (shareError) {
          return { 
            success: false, 
            error: shareError instanceof Error ? shareError.message : 'Share failed'
          };
        }
      }
      
      return { 
        success: false, 
        error: 'Share not supported on this platform'
      };
    }
  }

  private async checkCameraCapability(): Promise<NativeFeature> {
    try {
      const permissions = await Camera.checkPermissions();
      return {
        available: permissions.camera !== 'denied',
        supported: true,
        initialized: true
      };
    } catch (error) {
      return { available: false, supported: false, initialized: false };
    }
  }

  private async checkHapticsCapability(): Promise<NativeFeature> {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      return { available: true, supported: true, initialized: true };
    } catch (error) {
      return { available: false, supported: true, initialized: false };
    }
  }

  private async checkPushNotificationsCapability(): Promise<NativeFeature> {
    try {
      const permissions = await PushNotifications.checkPermissions();
      return {
        available: permissions.receive !== 'denied',
        supported: true,
        initialized: true
      };
    } catch (error) {
      return { available: false, supported: false, initialized: false };
    }
  }

  private async checkLocalNotificationsCapability(): Promise<NativeFeature> {
    try {
      const permissions = await LocalNotifications.checkPermissions();
      return {
        available: permissions.display !== 'denied',
        supported: true,
        initialized: true
      };
    } catch (error) {
      return { available: false, supported: false, initialized: false };
    }
  }

  private async checkGeolocationCapability(): Promise<NativeFeature> {
    try {
      const { Geolocation } = await import('@capacitor/geolocation');
      const permissions = await Geolocation.checkPermissions();
      return {
        available: permissions.location !== 'denied',
        supported: true,
        initialized: true
      };
    } catch (error) {
      return { available: false, supported: false, initialized: false };
    }
  }

  private getWebCapabilities(): NativeCapabilities {
    return {
      camera: { available: 'mediaDevices' in navigator, supported: true, initialized: true },
      haptics: { available: 'vibrate' in navigator, supported: true, initialized: true },
      push_notifications: { available: 'serviceWorker' in navigator, supported: true, initialized: true },
      local_notifications: { available: 'Notification' in window, supported: true, initialized: true },
      device_info: { available: true, supported: true, initialized: true },
      network: { available: 'onLine' in navigator, supported: true, initialized: true },
      geolocation: { available: 'geolocation' in navigator, supported: true, initialized: true }
    };
  }
}

export const nativeAppBridge = new NativeAppBridge();