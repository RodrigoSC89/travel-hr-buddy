import { useEffect, useState } from "react";
import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";
import { logger } from "@/lib/logger";

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Request permission for local notifications
      const localPermissions = await LocalNotifications.requestPermissions();
      
      if (localPermissions.display === "granted") {
        setPermissionGranted(true);
        
        // Request permission for push notifications
        await PushNotifications.requestPermissions();
        
        // Register for push notifications
        await PushNotifications.register();
        
        // Add listeners
        PushNotifications.addListener("registration", (token) => {
          logger.debug("Push notification registered", { token: token.value });
        });

        PushNotifications.addListener("registrationError", (error) => {
          logger.error("Error on push notification registration", error);
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {
          logger.info("Push notification received", { 
            title: notification.title,
            body: notification.body 
          });
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          logger.info("Push notification action performed", {
            actionId: notification.actionId
          });
        });
      }
    } catch (error) {
      logger.logCaughtError("Failed to initialize notifications", error);
    }
  };

  const scheduleNotification = async (options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }) => {
    if (!permissionGranted) {
      return;
    }

    try {
      const notificationOptions: ScheduleOptions = {
        notifications: [
          {
            title: options.title,
            body: options.body,
            id: options.id,
            schedule: options.schedule ? { at: options.schedule } : undefined,
            sound: "default",
            attachments: undefined,
            actionTypeId: "",
            extra: {}
          }
        ]
      };

      await LocalNotifications.schedule(notificationOptions);
    } catch (error) {
      logger.logCaughtError("Failed to schedule notification", error, {
        title: options.title,
        id: options.id
      });
    }
  };

  const cancelNotification = async (id: number) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      logger.logCaughtError("Failed to cancel notification", error, { id });
    }
  };

  return {
    permissionGranted,
    scheduleNotification,
    cancelNotification,
  };
};