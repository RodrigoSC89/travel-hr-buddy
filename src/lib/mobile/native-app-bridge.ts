/**
 * Native App Bridge - PROMPT 6
 * Ponte para recursos nativos mobile via Capacitor
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
    options?: unknown;
  }>;
}

export interface PhotoResult {
  success: boolean;
  imageUrl?: string;
  base64?: string;
  error?: string;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model: string;
  manufacturer: string;
  isNative: boolean;
}

export class NativeAppBridge {
  private initialized = false;
  private capabilities: NativeCapabilities | null = null;

  /**
   * Initialize the native bridge
   */
  async initialize(): Promise<NativeCapabilities> {
    if (this.initialized && this.capabilities) {
      return this.capabilities;
    }

    const isNative = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();

    this.capabilities = {
      camera: {
        available: isNative && Capacitor.isPluginAvailable('Camera'),
        supported: platform === 'ios' || platform === 'android',
        initialized: false
      },
      haptics: {
        available: isNative && Capacitor.isPluginAvailable('Haptics'),
        supported: platform === 'ios' || platform === 'android',
        initialized: false
      },
      push_notifications: {
        available: isNative && Capacitor.isPluginAvailable('PushNotifications'),
        supported: platform === 'ios' || platform === 'android',
        initialized: false
      },
      local_notifications: {
        available: isNative && Capacitor.isPluginAvailable('LocalNotifications'),
        supported: platform === 'ios' || platform === 'android',
        initialized: false
      },
      device_info: {
        available: isNative,
        supported: true,
        initialized: false
      },
      network: {
        available: isNative,
        supported: true,
        initialized: false
      },
      geolocation: {
        available: isNative,
        supported: platform === 'ios' || platform === 'android',
        initialized: false
      }
    };

    this.initialized = true;
    return this.capabilities;
  }

  /**
   * Take a photo using the device camera
   */
  async takePhoto(options: Partial<CameraOptions> = {}): Promise<PhotoResult> {
    const caps = await this.initialize();
    
    if (!caps.camera.available) {
      return {
        success: false,
        error: 'Camera not available on this device'
      };
    }

    const config = {
      source: options.source || 'camera',
      quality: options.quality || 90,
      allowEditing: options.allowEditing ?? false,
      resultType: options.resultType || 'uri'
    };

    try {
      const cameraSource = config.source === 'gallery' 
        ? CameraSource.Photos 
        : config.source === 'prompt'
          ? CameraSource.Prompt
          : CameraSource.Camera;

      const image = await Camera.getPhoto({
        quality: config.quality,
        allowEditing: config.allowEditing,
        resultType: config.resultType === 'base64' ? CameraResultType.Base64 : CameraResultType.Uri,
        source: cameraSource
      });

      return {
        success: true,
        imageUrl: image.webPath,
        base64: image.base64String
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture photo'
      };
    }
  }

  /**
   * Trigger haptic feedback
   */
  async triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
    const caps = await this.initialize();
    
    if (!caps.haptics.available) {
      return;
    }

    const impactStyle = style === 'light' 
      ? ImpactStyle.Light 
      : style === 'heavy' 
        ? ImpactStyle.Heavy 
        : ImpactStyle.Medium;

    try {
      await Haptics.impact({ style: impactStyle });
    } catch {
      // Silently fail if haptics not supported
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(options: NotificationOptions): Promise<{
    success: boolean;
    notificationId?: number;
    error?: string;
  }> {
    const caps = await this.initialize();
    
    if (!caps.local_notifications.available) {
      return {
        success: false,
        error: 'Local notifications not available'
      };
    }

    try {
      const notificationId = options.id || Math.floor(Math.random() * 100000);
      
      await LocalNotifications.schedule({
        notifications: [{
          title: options.title,
          body: options.body,
          id: notificationId,
          schedule: options.schedule as never,
          sound: options.sound,
          attachments: options.attachments as never,
          actionTypeId: '',
          extra: null
        }]
      });

      return {
        success: true,
        notificationId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule notification'
      };
    }
  }

  /**
   * Register for push notifications
   */
  async registerPushNotifications(): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    const caps = await this.initialize();
    
    if (!caps.push_notifications.available) {
      return {
        success: false,
        error: 'Push notifications not available'
      };
    }

    try {
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        return {
          success: false,
          error: 'Push notification permission denied'
        };
      }

      await PushNotifications.register();

      return new Promise((resolve) => {
        PushNotifications.addListener('registration', (token) => {
          resolve({
            success: true,
            token: token.value
          });
        });

        PushNotifications.addListener('registrationError', (error) => {
          resolve({
            success: false,
            error: error.error
          });
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          resolve({
            success: false,
            error: 'Registration timeout'
          });
        }, 10000);
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register push notifications'
      };
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<DeviceInfo> {
    // Web fallback
    if (!Capacitor.isNativePlatform()) {
      return {
        platform: 'web',
        version: navigator.userAgent,
        model: 'browser',
        manufacturer: 'unknown',
        isNative: false
      };
    }

    // Return basic info available from Capacitor core
    return {
      platform: Capacitor.getPlatform(),
      version: 'unknown',
      model: 'unknown',
      manufacturer: 'unknown',
      isNative: true
    };
  }

  /**
   * Check network connectivity
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    connectionType: string;
    cellular: boolean;
  }> {
    // Use web API as fallback
    return {
      connected: navigator.onLine,
      connectionType: 'unknown',
      cellular: false
    };
  }

  /**
   * Get current position using web Geolocation API
   */
  async getCurrentPosition(): Promise<{
    success: boolean;
    coordinates?: { latitude: number; longitude: number; accuracy: number };
    error?: string;
  }> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({
          success: false,
          error: 'Geolocation not supported'
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            success: true,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            }
          });
        },
        (error) => {
          resolve({
            success: false,
            error: error.message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  /**
   * Share content using native share or Web Share API
   */
  async shareContent(content: {
    title?: string;
    text?: string;
    url?: string;
  }): Promise<{ success: boolean; error?: string }> {
    // Use Web Share API
    if (navigator.share) {
      try {
        await navigator.share(content);
        return { success: true };
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return { success: false, error: 'Share cancelled' };
        }
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Share failed'
        };
      }
    }

    return {
      success: false,
      error: 'Share not supported on this device'
    };
  }

  /**
   * Check if running on native platform
   */
  isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get current platform
   */
  getPlatform(): 'ios' | 'android' | 'web' {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  }

  /**
   * Get capabilities
   */
  getCapabilities(): NativeCapabilities | null {
    return this.capabilities;
  }

  /**
   * Watch position changes
   */
  watchPosition(
    callback: (position: { latitude: number; longitude: number; accuracy: number }) => void,
    errorCallback?: (error: string) => void
  ): number | null {
    if (!navigator.geolocation) {
      errorCallback?.('Geolocation not supported');
      return null;
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        errorCallback?.(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  /**
   * Clear position watch
   */
  clearPositionWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }
}

export const nativeAppBridge = new NativeAppBridge();
