/**
 * Lazy-loaded Firebase wrapper to reduce initial bundle size (~300KB savings)
 * Only loads Firebase when actually needed
 */

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Messaging } from "firebase/messaging";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let isInitialized = false;

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "";

/**
 * Lazy initialize Firebase - only loads the library when called
 */
export const initializeFirebaseLazy = async (): Promise<FirebaseApp | null> => {
  if (isInitialized) return app;
  
  // Check if config is present
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return null;
  }

  try {
    const { initializeApp } = await import("firebase/app");
    app = initializeApp(firebaseConfig);
    isInitialized = true;
    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
    console.error("Failed to initialize Firebase:", error);
    return null;
  }
};

/**
 * Lazy initialize Firebase Messaging
 */
export const initializeMessagingLazy = async (): Promise<Messaging | null> => {
  if (messaging) return messaging;

  try {
    const firebaseApp = await initializeFirebaseLazy();
    if (!firebaseApp) return null;

    const { getMessaging, isSupported } = await import("firebase/messaging");
    
    const supported = await isSupported();
    if (!supported) {
      return null;
    }

    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (error) {
    console.error("Failed to initialize Firebase Messaging:", error);
    console.error("Failed to initialize Firebase Messaging:", error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermissionLazy = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      console.warn("Notification permission denied");
      return null;
    }

    const msg = await initializeMessagingLazy();
    if (!msg) return null;

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    
    return token;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    console.error("Failed to get FCM token:", error);
    return null;
  }
};

/**
 * Subscribe to foreground messages
 */
export const onForegroundMessageLazy = async (
  callback: (payload: any) => void
): Promise<(() => void) | null> => {
  try {
    const msg = await initializeMessagingLazy();
    if (!msg) return null;

    const { onMessage } = await import("firebase/messaging");
    return onMessage(msg, callback);
  } catch (error) {
    console.error("Failed to subscribe to messages:", error);
    console.error("Failed to subscribe to messages:", error);
    return null;
  }
};

export const isFirebaseInitialized = () => isInitialized;
export const getFirebaseApp = () => app;
export const getFirebaseMessaging = () => messaging;
