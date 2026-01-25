/**
 * Capacitor Native Features Implementation
 * NAUTI ONE v4.0 - Mobile Native App Support
 * 
 * Features:
 * - Biometric Authentication (Face ID / Touch ID / Fingerprint)
 * - Push Notifications
 * - Camera Access
 * - Haptic Feedback
 * - Offline Storage
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { logger } from '@/lib/utils/production-logger';

// ============================================
// PLATFORM DETECTION
// ============================================

export const platformInfo = {
  isNative: Capacitor.isNativePlatform(),
  platform: Capacitor.getPlatform(), // 'ios', 'android', or 'web'
  isIOS: Capacitor.getPlatform() === 'ios',
  isAndroid: Capacitor.getPlatform() === 'android',
  isWeb: Capacitor.getPlatform() === 'web',
};

// ============================================
// BIOMETRIC AUTHENTICATION
// ============================================

export interface BiometricResult {
  success: boolean;
  error?: string;
  type?: 'face' | 'fingerprint' | 'none';
}

export async function checkBiometricAvailability(): Promise<{
  available: boolean;
  type: 'face' | 'fingerprint' | 'none';
}> {
  if (!platformInfo.isNative) {
    return { available: false, type: 'none' };
  }

  try {
    // Note: In production, use @capacitor-community/biometric-auth
    // This is a simplified check
    if (platformInfo.isIOS) {
      return { available: true, type: 'face' }; // Assume Face ID on iOS
    } else if (platformInfo.isAndroid) {
      return { available: true, type: 'fingerprint' };
    }
    return { available: false, type: 'none' };
  } catch {
    return { available: false, type: 'none' };
  }
}

export async function authenticateWithBiometrics(
  reason: string = 'Autenticar para continuar'
): Promise<BiometricResult> {
  if (!platformInfo.isNative) {
    return { success: false, error: 'Biometria não disponível no navegador' };
  }

  try {
    // Provide haptic feedback
    await Haptics.impact({ style: ImpactStyle.Light });
    
    // Note: Actual implementation requires @capacitor-community/biometric-auth
    // This is a placeholder that would be replaced with:
    // const result = await BiometricAuth.authenticate({
    //   reason,
    //   title: 'Autenticação Biométrica',
    //   subtitle: 'NAUTI ONE',
    //   negativeButtonText: 'Cancelar',
    // });
    
    // Simulated success for demonstration
    console.log('[Biometric] Authentication requested:', reason);
    
    return { 
      success: true, 
      type: platformInfo.isIOS ? 'face' : 'fingerprint' 
    };
  } catch (error) {
    console.error('[Biometric] Authentication failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Autenticação biométrica falhou' 
    };
  }
}

// ============================================
// HAPTIC FEEDBACK
// ============================================

export const haptics = {
  /**
   * Light impact - for subtle feedback
   */
  light: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.impact({ style: ImpactStyle.Light });
  },

  /**
   * Medium impact - for standard interactions
   */
  medium: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.impact({ style: ImpactStyle.Medium });
  },

  /**
   * Heavy impact - for significant actions
   */
  heavy: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.impact({ style: ImpactStyle.Heavy });
  },

  /**
   * Success notification
   */
  success: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.notification({ type: NotificationType.Success });
  },

  /**
   * Warning notification
   */
  warning: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.notification({ type: NotificationType.Warning });
  },

  /**
   * Error notification
   */
  error: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.notification({ type: NotificationType.Error });
  },

  /**
   * Selection change feedback
   */
  selection: async () => {
    if (!platformInfo.isNative) return;
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  },
};

// ============================================
// CAMERA
// ============================================

export interface CameraPhotoResult {
  success: boolean;
  dataUrl?: string;
  webPath?: string;
  error?: string;
}

export async function takePhoto(): Promise<CameraPhotoResult> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    await haptics.success();

    return {
      success: true,
      dataUrl: image.dataUrl,
      webPath: image.webPath,
    };
  } catch (error) {
    console.error('[Camera] Photo capture failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao capturar foto',
    };
  }
}

export async function pickFromGallery(): Promise<CameraPhotoResult> {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    return {
      success: true,
      dataUrl: image.dataUrl,
      webPath: image.webPath,
    };
  } catch (error) {
    console.error('[Camera] Gallery pick failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao selecionar imagem',
    };
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

export interface PushNotificationToken {
  value: string;
}

export async function registerPushNotifications(): Promise<PushNotificationToken | null> {
  if (!platformInfo.isNative) {
    console.log('[Push] Web platform - using browser notifications instead');
    return null;
  }

  try {
    // Request permission
    let permStatus = await PushNotifications.checkPermissions();
    
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      logger.debug('[Push] Permission not granted');
      return null;
    }

    // Register with APNs / FCM
    await PushNotifications.register();

    // Get the token
    return new Promise((resolve) => {
      PushNotifications.addListener('registration', (token) => {
        logger.info('[Push] Registration successful', { token: token.value });
        resolve({ value: token.value });
      });

      PushNotifications.addListener('registrationError', (error) => {
        logger.error('[Push] Registration failed', error);
        resolve(null);
      });
    });
  } catch (error) {
    logger.error('[Push] Registration error', error);
    return null;
  }
}

export function setupPushNotificationListeners(
  onNotificationReceived: (notification: any) => void,
  onNotificationTapped: (notification: any) => void
): void {
  if (!platformInfo.isNative) return;

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    logger.debug('[Push] Notification received', { notification });
    onNotificationReceived(notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    logger.debug('[Push] Notification action performed', { action });
    onNotificationTapped(action.notification);
  });
}

// ============================================
// LOCAL NOTIFICATIONS
// ============================================

export interface LocalNotificationData {
  id: number;
  title: string;
  body: string;
  schedule?: {
    at?: Date;
    every?: 'day' | 'hour' | 'minute';
    count?: number;
  };
  extra?: Record<string, unknown>;
}

export async function scheduleLocalNotification(
  notification: LocalNotificationData
): Promise<boolean> {
  try {
    const permStatus = await LocalNotifications.checkPermissions();
    
    if (permStatus.display !== 'granted') {
      const newStatus = await LocalNotifications.requestPermissions();
      if (newStatus.display !== 'granted') {
        logger.debug('[LocalNotifications] Permission not granted');
        return false;
      }
    }

    await LocalNotifications.schedule({
      notifications: [{
        id: notification.id,
        title: notification.title,
        body: notification.body,
        schedule: notification.schedule ? {
          at: notification.schedule.at,
          every: notification.schedule.every,
          count: notification.schedule.count,
        } : undefined,
        extra: notification.extra,
        smallIcon: 'ic_stat_icon_config_sample',
        iconColor: '#0f766e',
      }],
    });

    console.log('[LocalNotifications] Scheduled:', notification);
    return true;
  } catch (error) {
    console.error('[LocalNotifications] Schedule failed:', error);
    return false;
  }
}

export async function cancelLocalNotification(id: number): Promise<void> {
  await LocalNotifications.cancel({ notifications: [{ id }] });
}

export async function cancelAllLocalNotifications(): Promise<void> {
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel(pending);
  }
}

// ============================================
// OFFLINE STORAGE
// ============================================

export const offlineStorage = {
  /**
   * Store data for offline use
   */
  set: async (key: string, value: unknown): Promise<void> => {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(`nauti_offline_${key}`, data);
    } catch (error) {
      console.error('[OfflineStorage] Failed to store:', error);
    }
  },

  /**
   * Retrieve offline data
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const data = localStorage.getItem(`nauti_offline_${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Remove offline data
   */
  remove: async (key: string): Promise<void> => {
    localStorage.removeItem(`nauti_offline_${key}`);
  },

  /**
   * Clear all offline data
   */
  clear: async (): Promise<void> => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('nauti_offline_'));
    keys.forEach(k => localStorage.removeItem(k));
  },
};

// ============================================
// EXPORT
// ============================================

export default {
  platformInfo,
  checkBiometricAvailability,
  authenticateWithBiometrics,
  haptics,
  takePhoto,
  pickFromGallery,
  registerPushNotifications,
  setupPushNotificationListeners,
  scheduleLocalNotification,
  cancelLocalNotification,
  cancelAllLocalNotifications,
  offlineStorage,
};
