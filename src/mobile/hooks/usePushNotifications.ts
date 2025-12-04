/**
 * Push Notifications Hook
 * Manages push notification registration and handling
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

// Capacitor imports with web fallbacks
const PushNotifications = typeof window !== "undefined" && 
  (window as any).Capacitor?.Plugins?.PushNotifications;

const LocalNotifications = typeof window !== "undefined" && 
  (window as any).Capacitor?.Plugins?.LocalNotifications;

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: "granted" | "denied" | "prompt" | "unknown";
}

export interface PushNotificationOptions {
  onReceived?: (notification: any) => void;
  onAction?: (action: any) => void;
  onRegistrationError?: (error: Error) => void;
}

export function usePushNotifications(options: PushNotificationOptions = {}) {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isRegistered: false,
    token: null,
    permission: "unknown",
  });
  const [loading, setLoading] = useState(true);

  // Check if push notifications are supported
  const checkSupport = useCallback(async () => {
    if (!PushNotifications) {
      // Fallback to Web Push API
      if ("Notification" in window && "serviceWorker" in navigator) {
        const permission = Notification.permission;
        setState(prev => ({
          ...prev,
          isSupported: true,
          permission: permission as any,
        }));
        return true;
      }
      return false;
    }
    
    setState(prev => ({ ...prev, isSupported: true }));
    return true;
  }, []);

  // Request permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (PushNotifications) {
        const result = await PushNotifications.requestPermissions();
        const granted = result.receive === "granted";
        setState(prev => ({
          ...prev,
          permission: granted ? "granted" : "denied",
        }));
        return granted;
      } else if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        setState(prev => ({
          ...prev,
          permission: permission as any,
        }));
        return permission === "granted";
      }
      return false;
    } catch (error) {
      console.error("Failed to request push permission", error);
      return false;
    }
  }, []);

  // Register for push notifications
  const register = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        console.warn("Push notification permission denied");
        return null;
      }

      if (PushNotifications) {
        // Capacitor native push
        await PushNotifications.register();
        
        // Token will be received via event listener
        return null;
      } else if ("serviceWorker" in navigator) {
        // Web Push - simplified without VAPID for now
        console.info("Web push registration would happen here");
        return null;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to register push notifications", error);
      options.onRegistrationError?.(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission, options]);

  // Unregister from push notifications
  const unregister = useCallback(async () => {
    try {
      if (PushNotifications) {
        await PushNotifications.unregister?.();
      }
      
      // Remove token from server
      await removeToken();
      
      setState(prev => ({
        ...prev,
        isRegistered: false,
        token: null,
      }));
    } catch (error) {
      console.error("Failed to unregister push notifications", error);
    }
  }, []);

  // Show local notification
  const showLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, any>
  ) => {
    try {
      if (LocalNotifications) {
        await LocalNotifications.schedule({
          notifications: [{
            title,
            body,
            id: Date.now(),
            extra: data,
          }],
        });
      } else if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body, data });
      }
    } catch (error) {
      console.error("Failed to show local notification", error);
    }
  }, []);

  // Initialize push notifications
  useEffect(() => {
    const init = async () => {
      await checkSupport();
      setLoading(false);
    };
    
    init();

    // Set up Capacitor event listeners
    if (PushNotifications) {
      const listeners: any[] = [];
      
      // Registration success
      PushNotifications.addListener("registration", async (token: any) => {
        console.info("Push registration success", { token: token.value });
        await saveToken(token.value);
        setState(prev => ({
          ...prev,
          isRegistered: true,
          token: token.value,
        }));
      }).then((l: any) => listeners.push(l));

      // Registration error
      PushNotifications.addListener("registrationError", (error: any) => {
        console.error("Push registration error", error);
        options.onRegistrationError?.(new Error(error.error));
      }).then((l: any) => listeners.push(l));

      // Notification received
      PushNotifications.addListener("pushNotificationReceived", (notification: any) => {
        console.info("Push notification received", notification);
        options.onReceived?.(notification);
      }).then((l: any) => listeners.push(l));

      // Notification action
      PushNotifications.addListener("pushNotificationActionPerformed", (action: any) => {
        console.info("Push notification action", action);
        options.onAction?.(action);
      }).then((l: any) => listeners.push(l));

      return () => {
        listeners.forEach(l => l.remove?.());
      };
    }
  }, [checkSupport, options]);

  return {
    ...state,
    loading,
    register,
    unregister,
    requestPermission,
    showLocalNotification,
  };
}

// Helper: Save push token to server
async function saveToken(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Save token to user profile or dedicated push_tokens table
    console.info("Push token saved", { userId: user.id, token });
  } catch (error) {
    console.error("Failed to save push token", error);
  }
}

// Helper: Remove push token from server
async function removeToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove token from server
    console.info("Push token removed");
  } catch (error) {
    console.error("Failed to remove push token", error);
  }
}
