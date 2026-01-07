/**
 * Capacitor Service
 * Centralized service for native mobile features
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { PushNotifications, Token, PushNotificationSchema } from '@capacitor/push-notifications';
import { logger } from '@/lib/logger';

export interface MobileServiceConfig {
  enableHaptics?: boolean;
  enablePushNotifications?: boolean;
  enableCamera?: boolean;
  pushServerKey?: string;
}

class CapacitorService {
  private config: MobileServiceConfig = {};
  private pushToken: string | null = null;
  private initialized = false;

  /**
   * Check if running on native platform
   */
  get isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Get current platform
   */
  get platform(): 'ios' | 'android' | 'web' {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  }

  /**
   * Check if a plugin is available
   */
  isPluginAvailable(name: string): boolean {
    return Capacitor.isPluginAvailable(name);
  }

  /**
   * Initialize mobile services
   */
  async init(config: MobileServiceConfig = {}): Promise<void> {
    if (this.initialized) {
      logger.warn('[CapacitorService] Already initialized');
      return;
    }

    this.config = config;

    if (!this.isNative) {
      logger.info('[CapacitorService] Running on web, skipping native init');
      this.initialized = true;
      return;
    }

    try {
      // Initialize push notifications if enabled
      if (config.enablePushNotifications) {
        await this.initPushNotifications();
      }

      // Request local notification permissions
      await this.requestLocalNotificationPermission();

      this.initialized = true;
      logger.info('[CapacitorService] Initialized', { platform: this.platform });
    } catch (error) {
      logger.error('[CapacitorService] Init failed', { 
        error: error instanceof Error ? error.message : 'Unknown' 
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HAPTICS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Trigger light haptic feedback
   */
  async hapticLight(): Promise<void> {
    if (!this.isNative || !this.config.enableHaptics) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Trigger medium haptic feedback
   */
  async hapticMedium(): Promise<void> {
    if (!this.isNative || !this.config.enableHaptics) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Trigger heavy haptic feedback
   */
  async hapticHeavy(): Promise<void> {
    if (!this.isNative || !this.config.enableHaptics) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Trigger selection haptic
   */
  async hapticSelection(): Promise<void> {
    if (!this.isNative) return;
    try {
      await Haptics.selectionStart();
      await Haptics.selectionEnd();
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Trigger notification haptic
   */
  async hapticNotification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.isNative) return;
    try {
      const notificationType = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      }[type];
      await Haptics.notification({ type: notificationType });
    } catch (e) {
      // Silently fail
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // CAMERA
  // ═══════════════════════════════════════════════════════════════

  /**
   * Take a photo
   */
  async takePhoto(): Promise<Photo | null> {
    if (!this.isPluginAvailable('Camera')) {
      logger.warn('[CapacitorService] Camera not available');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      return photo;
    } catch (error) {
      if ((error as Error).message?.includes('cancelled')) {
        return null;
      }
      logger.error('[CapacitorService] Camera error', { error });
      throw error;
    }
  }

  /**
   * Pick photo from gallery
   */
  async pickPhoto(): Promise<Photo | null> {
    if (!this.isPluginAvailable('Camera')) {
      logger.warn('[CapacitorService] Camera not available');
      return null;
    }

    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      return photo;
    } catch (error) {
      if ((error as Error).message?.includes('cancelled')) {
        return null;
      }
      logger.error('[CapacitorService] Photo picker error', { error });
      throw error;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // LOCAL NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Request local notification permission
   */
  private async requestLocalNotificationPermission(): Promise<boolean> {
    if (!this.isPluginAvailable('LocalNotifications')) return false;

    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (e) {
      return false;
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleNotification(options: {
    id: number;
    title: string;
    body: string;
    scheduleAt?: Date;
    extra?: Record<string, unknown>;
  }): Promise<void> {
    if (!this.isPluginAvailable('LocalNotifications')) {
      logger.warn('[CapacitorService] LocalNotifications not available');
      return;
    }

    try {
      const scheduleOptions: ScheduleOptions = {
        notifications: [
          {
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: options.scheduleAt ? { at: options.scheduleAt } : undefined,
            extra: options.extra,
          },
        ],
      };

      await LocalNotifications.schedule(scheduleOptions);
      logger.debug('[CapacitorService] Notification scheduled', { id: options.id });
    } catch (error) {
      logger.error('[CapacitorService] Schedule notification error', { error });
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(id: number): Promise<void> {
    if (!this.isPluginAvailable('LocalNotifications')) return;

    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (e) {
      // Silently fail
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PUSH NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Initialize push notifications
   */
  private async initPushNotifications(): Promise<void> {
    if (!this.isPluginAvailable('PushNotifications')) {
      logger.warn('[CapacitorService] PushNotifications not available');
      return;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        await PushNotifications.register();
      }

      // Listen for registration
      PushNotifications.addListener('registration', (token: Token) => {
        this.pushToken = token.value;
        logger.info('[CapacitorService] Push registered', { 
          token: token.value.substring(0, 20) + '...' 
        });
      });

      // Listen for errors
      PushNotifications.addListener('registrationError', (error) => {
        logger.error('[CapacitorService] Push registration error', { error });
      });

      // Listen for notifications
      PushNotifications.addListener('pushNotificationReceived', 
        (notification: PushNotificationSchema) => {
          logger.info('[CapacitorService] Push received', { 
            title: notification.title 
          });
        }
      );
    } catch (error) {
      logger.error('[CapacitorService] Push init error', { error });
    }
  }

  /**
   * Get push notification token
   */
  getPushToken(): string | null {
    return this.pushToken;
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get safe area insets
   */
  getSafeAreaInsets(): { top: number; bottom: number; left: number; right: number } {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }

    const style = getComputedStyle(document.documentElement);
    return {
      top: parseInt(style.getPropertyValue('--sat') || '0'),
      bottom: parseInt(style.getPropertyValue('--sab') || '0'),
      left: parseInt(style.getPropertyValue('--sal') || '0'),
      right: parseInt(style.getPropertyValue('--sar') || '0'),
    };
  }

  /**
   * Get status bar height
   */
  getStatusBarHeight(): number {
    if (this.platform === 'ios') return 44;
    if (this.platform === 'android') return 24;
    return 0;
  }

  /**
   * Get navigation bar height
   */
  getNavBarHeight(): number {
    if (this.platform === 'ios') return 34;
    if (this.platform === 'android') return 48;
    return 0;
  }
}

// Singleton export
export const capacitorService = new CapacitorService();

// Convenience exports
export const isNative = () => capacitorService.isNative;
export const platform = () => capacitorService.platform;
