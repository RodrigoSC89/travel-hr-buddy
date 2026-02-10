/**
 * Push Notifications Manager for Capacitor
 * Handles push notification registration, listening, and sending
 */

import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { spaNavigate } from '@/lib/navigation/spa-navigate';

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

class PushNotificationManager {
  private initialized = false;
  private token: string | null = null;

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    if (!this.isSupported()) {
      logger.debug('Push notifications not supported on this platform');
      return;
    }

    if (this.initialized) {
      logger.debug('Push notifications already initialized');
      return;
    }

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive !== 'granted') {
        logger.warn('Push notification permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Set up listeners
      this.setupListeners();

      this.initialized = true;
      logger.info('Push notifications initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize push notifications', error as Error);
    }
  }

  /**
   * Set up push notification listeners
   */
  private setupListeners(): void {
    // Registration success
    PushNotifications.addListener('registration', async (token: Token) => {
      logger.info('Push registration success', { token: token.value });
      this.token = token.value;
      await this.saveTokenToDatabase(token.value);
    });

    // Registration error
    PushNotifications.addListener('registrationError', (error: { error: string }) => {
      logger.error('Push registration error', new Error(error.error));
    });

    // Notification received (foreground)
    PushNotifications.addListener(
      'pushNotificationReceived',
      async (notification: PushNotificationSchema) => {
        logger.info('Push notification received', { notification });

        // Show local notification when app is in foreground
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Date.now(),
              title: notification.title || 'Notification',
              body: notification.body || '',
              extra: notification.data,
            },
          ],
        });
      }
    );

    // Notification action performed (tap)
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        logger.info('Push notification tapped', { action });
        
        const data = action.notification.data;
        if (data?.route && typeof data.route === 'string') {
          // Navigate to the specified route (SPA-safe)
          spaNavigate(data.route);
        }
      }
    );
  }

  /**
   * Save push token to database
   */
  private async saveTokenToDatabase(token: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.debug('No user logged in, skipping token save');
        return;
      }

      // Note: push_tokens table should be created via migration
      // Using type assertion for forward compatibility
      const { error } = await (supabase as unknown as {
        from: (table: string) => {
          upsert: (data: Record<string, unknown>, options?: Record<string, unknown>) => Promise<{ error: Error | null }>;
        };
      }).from('push_tokens').upsert(
        {
          user_id: user.id,
          token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,token',
        }
      );

      if (error) {
        logger.error('Failed to save push token', new Error(error.message));
      } else {
        logger.info('Push token saved successfully');
      }
    } catch (error) {
      logger.error('Error saving push token', error as Error);
    }
  }

  /**
   * Get current push token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Send push notification to a user via Edge Function
   */
  async sendToUser(userId: string, notification: NotificationPayload): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          userId,
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
      });

      if (error) {
        logger.error('Failed to send push notification', new Error(error.message));
        return false;
      }

      logger.info('Push notification sent successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Error sending push notification', error as Error);
      return false;
    }
  }

  /**
   * Request local notification permission
   */
  async requestLocalPermission(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      logger.error('Error requesting local notification permission', error as Error);
      return false;
    }
  }

  /**
   * Show a local notification
   */
  async showLocalNotification(notification: NotificationPayload): Promise<void> {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: notification.title,
            body: notification.body,
            extra: notification.data,
          },
        ],
      });
    } catch (error) {
      logger.error('Error showing local notification', error as Error);
    }
  }

  /**
   * Remove push token on logout
   */
  async removeToken(): Promise<void> {
    if (!this.token) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Using type assertion for forward compatibility
        await (supabase as unknown as {
          from: (table: string) => {
            delete: () => { eq: (col: string, val: string) => { eq: (col: string, val: string) => Promise<void> } };
          };
        }).from('push_tokens')
          .delete()
          .eq('user_id', user.id)
          .eq('token', this.token);
      }

      this.token = null;
      logger.info('Push token removed');
    } catch (error) {
      logger.error('Error removing push token', error as Error);
    }
  }
}

export const pushNotificationManager = new PushNotificationManager();
export default pushNotificationManager;
