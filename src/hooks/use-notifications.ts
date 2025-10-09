import { useEffect, useState } from "react";
import { LocalNotifications, ScheduleOptions } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {return;
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
        PushNotifications.addListener("registration", (token) => {});

        PushNotifications.addListener("registrationError", (error) => {
          console.error("Error on registration: " + JSON.stringify(error));
        });

        PushNotifications.addListener("pushNotificationReceived", (notification) => {);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {);
        });
      }
    } catch (error) {
      console.error("Error initializing notifications:", error);
    }
  };

  const scheduleNotification = async (options: {
    title: string;
    body: string;
    id: number;
    schedule?: Date;
  }) => {
    if (!permissionGranted) {
      console.warn("Notification permission not granted");
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

      await LocalNotifications.schedule(notificationOptions);} catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  const cancelNotification = async (id: number) => {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  return {
    permissionGranted,
    scheduleNotification,
    cancelNotification,
  };
};