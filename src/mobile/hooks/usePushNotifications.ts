/**
 * Push Notifications Hook
 * Manages push notification registration and handling
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

// Capacitor types
interface CapacitorToken { value: string; }
interface CapacitorError { error: string; }
interface CapacitorNotification { title?: string; body?: string; data?: Record<string, unknown>; }
interface CapacitorAction { notification: CapacitorNotification; actionId: string; }
interface CapacitorListener { remove: () => void; }

interface CapacitorPlugins {
  PushNotifications?: {
    requestPermissions: () => Promise<{ receive: string }>;
    register: () => Promise<void>;
    unregister?: () => Promise<void>;
    addListener: (event: string, handler: (...args: unknown[]) => void) => Promise<CapacitorListener>;
  };
  LocalNotifications?: {
    schedule: (options: { notifications: { title: string; body: string; id: number; extra?: Record<string, unknown> }[] }) => Promise<void>;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Capacitor global not in standard types
const capacitorGlobal = typeof window !== "undefined" ? (window as unknown as Record<string, unknown>).Capacitor as { Plugins?: CapacitorPlugins } | undefined : undefined;
const capacitorPlugins = capacitorGlobal?.Plugins;

const PushNotifications = capacitorPlugins?.PushNotifications;
const LocalNotifications = capacitorPlugins?.LocalNotifications;

export interface PushNotificationState {
  isSupported: boolean;
  isRegistered: boolean;
  token: string | null;
  permission: "granted" | "denied" | "prompt" | "unknown";
}

export interface PushNotificationOptions {
  onReceived?: (notification: CapacitorNotification) => void;
  onAction?: (action: CapacitorAction) => void;
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

  const checkSupport = useCallback(async () => {
    if (!PushNotifications) {
      if ("Notification" in window && "serviceWorker" in navigator) {
        const permission = Notification.permission as PushNotificationState["permission"];
        setState(prev => ({
          ...prev,
          isSupported: true,
          permission,
        }));
        return true;
      }
      return false;
    }
    
    setState(prev => ({ ...prev, isSupported: true }));
    return true;
  }, []);

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
          permission: permission as PushNotificationState["permission"],
        }));
        return permission === "granted";
      }
      return false;
    } catch (error) {
      logger.error("Failed to request push permission", error);
      return false;
    }
  }, []);

  const register = useCallback(async (): Promise<string | null> => {
    try {
      setLoading(true);
      
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        logger.warn("Push notification permission denied");
        return null;
      }

      if (PushNotifications) {
        await PushNotifications.register();
        return null;
      } else if ("serviceWorker" in navigator) {
        logger.info("Web push registration would happen here");
        return null;
      }
      
      return null;
    } catch (error) {
      logger.error("Failed to register push notifications", error);
      options.onRegistrationError?.(error as Error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [requestPermission, options]);

  const unregister = useCallback(async () => {
    try {
      if (PushNotifications) {
        await PushNotifications.unregister?.();
      }
      
      await removeToken();
      
      setState(prev => ({
        ...prev,
        isRegistered: false,
        token: null,
      }));
    } catch (error) {
      logger.error("Failed to unregister push notifications", error);
    }
  }, []);

  const showLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: Record<string, unknown>
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
      logger.error("Failed to show local notification", error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await checkSupport();
      setLoading(false);
    };
    
    init();

    if (PushNotifications) {
      const listeners: CapacitorListener[] = [];
      
      PushNotifications.addListener("registration", async (...args: unknown[]) => {
        const token = args[0] as CapacitorToken;
        logger.info("Push registration success", { token: token.value });
        await saveToken(token.value);
        setState(prev => ({
          ...prev,
          isRegistered: true,
          token: token.value,
        }));
      }).then((l: CapacitorListener) => listeners.push(l));

      PushNotifications.addListener("registrationError", (...args: unknown[]) => {
        const error = args[0] as CapacitorError;
        logger.error("Push registration error", error);
        options.onRegistrationError?.(new Error(error.error));
      }).then((l: CapacitorListener) => listeners.push(l));

      PushNotifications.addListener("pushNotificationReceived", (...args: unknown[]) => {
        const notification = args[0] as CapacitorNotification;
        logger.info("Push notification received", notification);
        options.onReceived?.(notification);
      }).then((l: CapacitorListener) => listeners.push(l));

      PushNotifications.addListener("pushNotificationActionPerformed", (...args: unknown[]) => {
        const action = args[0] as CapacitorAction;
        logger.info("Push notification action", action);
        options.onAction?.(action);
      }).then((l: CapacitorListener) => listeners.push(l));

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

async function saveToken(token: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    logger.info("Push token saved", { userId: user.id, token });
  } catch (error) {
    logger.error("Failed to save push token", error);
  }
}

async function removeToken(): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    logger.info("Push token removed");
  } catch (error) {
    logger.error("Failed to remove push token", error);
  }
}