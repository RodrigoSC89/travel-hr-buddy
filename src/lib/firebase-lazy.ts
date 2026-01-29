/**
 * Lazy-loaded Firebase wrapper to reduce initial bundle size (~300KB savings)
 * Only loads Firebase when actually needed
 */

import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import type { Messaging } from "firebase/messaging";
import { logger } from "@/lib/logger";

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;
let isInitialized = false;

// Safe getter for env vars
const getEnv = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env[key] as string) || "";
    }
  } catch {
    return "";
  }
  return "";
};

const firebaseConfig: FirebaseOptions = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID')
};

const VAPID_KEY = getEnv('VITE_FIREBASE_VAPID_KEY');

/**
 * Lazy initialize Firebase - only loads the library when called
 */
export const initializeFirebaseLazy = async (): Promise<FirebaseApp | null> => {
  if (isInitialized) return app;
  
  // Check if config is present
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    logger.warn("Firebase config not complete - skipping initialization");
    return null;
  }

  try {
    const { initializeApp } = await import("firebase/app");
    app = initializeApp(firebaseConfig);
    isInitialized = true;
    logger.info("Firebase initialized lazily");
    return app;
  } catch (error) {
    logger.error("Failed to initialize Firebase", error);
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
      logger.warn("Firebase Messaging not supported in this environment");
      return null;
    }

    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (error) {
    logger.error("Failed to initialize Firebase Messaging", error);
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
      logger.warn("Notification permission denied");
      return null;
    }

    const msg = await initializeMessagingLazy();
    if (!msg) return null;

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(msg, { vapidKey: VAPID_KEY });
    
    logger.info("FCM Token obtained", { tokenPrefix: token.substring(0, 20) + "..." });
    return token;
  } catch (error) {
    logger.error("Failed to get FCM token", error);
    return null;
  }
};

/**
 * Subscribe to foreground messages
 */
export const onForegroundMessageLazy = async (
  callback: (payload: unknown) => void
): Promise<(() => void) | null> => {
  try {
    const msg = await initializeMessagingLazy();
    if (!msg) return null;

    const { onMessage } = await import("firebase/messaging");
    return onMessage(msg, callback);
  } catch (error) {
    logger.error("Failed to subscribe to messages", error);
    return null;
  }
};

export const isFirebaseInitialized = () => isInitialized;
export const getFirebaseApp = () => app;
export const getFirebaseMessaging = () => messaging;
