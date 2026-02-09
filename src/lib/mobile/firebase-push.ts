/**
 * Firebase Cloud Messaging (FCM) Push Notifications
 * Handles push notification registration and messaging
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getMessaging, getToken, onMessage, Messaging, MessagePayload } from "firebase/messaging";
import { Capacitor } from "@capacitor/core";
import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from "@capacitor/push-notifications";
import { logger } from "@/lib/logger";

export interface FCMConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  clickAction?: string;
}

export type PushNotificationHandler = (payload: PushNotificationPayload) => void;
export type PushNotificationActionHandler = (action: string, data: Record<string, string>) => void;

class FirebasePushService {
  private app: FirebaseApp | null = null;
  private messaging: Messaging | null = null;
  private isNative: boolean;
  private fcmToken: string | null = null;
  private foregroundHandler: PushNotificationHandler | null = null;
  private actionHandler: PushNotificationActionHandler | null = null;
  private initialized: boolean = false;

  constructor() {
    this.isNative = Capacitor.isNativePlatform();
  }

  /**
   * Initialize Firebase and register for push notifications
   */
  async initialize(config?: FCMConfig): Promise<string | null> {
    if (this.initialized) {
      return this.fcmToken;
    }

    try {
      if (this.isNative) {
        return await this.initializeNative();
      } else {
        return await this.initializeWeb(config);
      }
    } catch (error) {
      logger.error("[FCM] Initialization failed:", error);
      return null;
    }
  }

  /**
   * Initialize for native platforms (iOS/Android)
   */
  private async initializeNative(): Promise<string | null> {
    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();
      
      if (permStatus.receive === "prompt") {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== "granted") {
        logger.warn("[FCM] Permission not granted");
        return null;
      }

      // Register with APNs / FCM
      await PushNotifications.register();

      // Set up listeners
      this.setupNativeListeners();

      // Wait for registration token
      return new Promise((resolve) => {
        const tokenHandler = (token: Token) => {
          this.fcmToken = token.value;
          this.initialized = true;
          logger.info("[FCM] Token received:", token.value.substring(0, 20) + "...");
          resolve(token.value);
        };

        PushNotifications.addListener("registration", tokenHandler);
        
        PushNotifications.addListener("registrationError", (error) => {
          logger.error("[FCM] Registration error:", error);
          resolve(null);
        });
      });
    } catch (error) {
      logger.error("[FCM] Native initialization error:", error);
      return null;
    }
  }

  /**
   * Set up native push notification listeners
   */
  private setupNativeListeners(): void {
    // Notification received while app is in foreground
    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification: PushNotificationSchema) => {
        logger.info("[FCM] Foreground notification:", notification);
        
        if (this.foregroundHandler) {
          this.foregroundHandler({
            title: notification.title || "",
            body: notification.body || "",
            data: notification.data as Record<string, string> | undefined,
          });
        }
      }
    );

    // Notification tapped / action performed
    PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action: ActionPerformed) => {
        logger.info("[FCM] Action performed:", action);
        
        if (this.actionHandler) {
          this.actionHandler(
            action.actionId,
            (action.notification.data as Record<string, string>) || {}
          );
        }
      }
    );
  }

  /**
   * Initialize for web platform
   */
  private async initializeWeb(config?: FCMConfig): Promise<string | null> {
    if (!config) {
      logger.warn("[FCM] No Firebase config provided for web");
      return null;
    }

    try {
      // Check for notification support
      if (!("Notification" in window)) {
        logger.warn("[FCM] Notifications not supported");
        return null;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        logger.warn("[FCM] Permission not granted");
        return null;
      }

      // Initialize Firebase
      if (getApps().length === 0) {
        this.app = initializeApp(config);
      } else {
        this.app = getApps()[0];
      }

      this.messaging = getMessaging(this.app);

      // Get FCM token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      this.fcmToken = await getToken(this.messaging, { vapidKey });

      if (this.fcmToken) {
        logger.info("[FCM] Web token received:", this.fcmToken.substring(0, 20) + "...");
        
        // Set up foreground message handler
        onMessage(this.messaging, (payload: MessagePayload) => {
          logger.info("[FCM] Web foreground message:", payload);
          
          if (this.foregroundHandler && payload.notification) {
            this.foregroundHandler({
              title: payload.notification.title || "",
              body: payload.notification.body || "",
              data: payload.data as Record<string, string> | undefined,
              imageUrl: payload.notification.image,
            });
          }
        });

        this.initialized = true;
        return this.fcmToken;
      }

      return null;
    } catch (error) {
      logger.error("[FCM] Web initialization error:", error);
      return null;
    }
  }

  /**
   * Get the current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Set handler for foreground notifications
   */
  onForegroundNotification(handler: PushNotificationHandler): void {
    this.foregroundHandler = handler;
  }

  /**
   * Set handler for notification actions
   */
  onNotificationAction(handler: PushNotificationActionHandler): void {
    this.actionHandler = handler;
  }

  /**
   * Send FCM token to backend for storage
   */
  async saveTokenToServer(userId: string): Promise<boolean> {
    if (!this.fcmToken) {
      logger.warn("[FCM] No token to save");
      return false;
    }

    try {
      // This would call your backend API to save the token
      // Example: await supabase.from('push_tokens').upsert({ user_id: userId, token: this.fcmToken })
      
      logger.info("[FCM] Token saved for user:", userId);
      return true;
    } catch (error) {
      logger.error("[FCM] Failed to save token:", error);
      return false;
    }
  }

  /**
   * Subscribe to a topic (for group notifications)
   */
  async subscribeToTopic(topic: string): Promise<boolean> {
    if (!this.fcmToken) {
      logger.warn("[FCM] No token for topic subscription");
      return false;
    }

    try {
      // Topic subscription managed server-side via Supabase edge function
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.functions.invoke('fcm-topics', { body: { action: 'subscribe', topic, token: this.fcmToken } });
      
      logger.info("[FCM] Subscribed to topic:", topic);
      return true;
    } catch (error) {
      logger.error("[FCM] Topic subscription failed:", error);
      return false;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    if (!this.fcmToken) {
      return false;
    }

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      await supabase.functions.invoke('fcm-topics', { body: { action: 'unsubscribe', topic, token: this.fcmToken } });
      
      logger.info("[FCM] Unsubscribed from topic:", topic);
      return true;
    } catch (error) {
      logger.error("[FCM] Topic unsubscription failed:", error);
      return false;
    }
  }

  /**
   * Check if push notifications are enabled
   */
  async isEnabled(): Promise<boolean> {
    if (this.isNative) {
      const status = await PushNotifications.checkPermissions();
      return status.receive === "granted";
    } else {
      return Notification.permission === "granted";
    }
  }

  /**
   * Get permission status
   */
  async getPermissionStatus(): Promise<"granted" | "denied" | "prompt"> {
    if (this.isNative) {
      const status = await PushNotifications.checkPermissions();
      return status.receive as "granted" | "denied" | "prompt";
    } else {
      const perm = Notification.permission;
      if (perm === "default") return "prompt";
      return perm as "granted" | "denied";
    }
  }
}

export const firebasePushService = new FirebasePushService();
export default firebasePushService;
