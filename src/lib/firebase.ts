/**
 * PATCH 138.0 - Firebase Cloud Messaging Integration
 * Provides push notification capabilities for mobile and web
 */

import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { 
  getMessaging, 
  getToken, 
  onMessage, 
  type Messaging,
  isSupported 
} from 'firebase/messaging';

// Firebase configuration - should be moved to environment variables in production
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// VAPID key for web push - should be in environment variables
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Initialize Firebase app and messaging
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    // Check if all required config is present
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      console.warn('Firebase configuration incomplete. Push notifications will not be available.');
      return;
    }

    // Check if messaging is supported
    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.warn('Firebase Messaging is not supported in this environment');
      return;
    }

    // Initialize Firebase app
    if (!app) {
      app = initializeApp(firebaseConfig);
    }

    // Initialize messaging
    if (!messaging) {
      messaging = getMessaging(app);
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      await initializeFirebase();
      if (!messaging) {
        throw new Error('Messaging not initialized');
      }
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('FCM Token obtained:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Listen for foreground messages
 */
export const onForegroundMessage = (callback: (payload: any) => void): (() => void) | null => {
  try {
    if (!messaging) {
      console.warn('Messaging not initialized');
      return null;
    }

    return onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });
  } catch (error) {
    console.error('Error setting up message listener:', error);
    return null;
  }
};

/**
 * Save FCM token to Supabase for the current user
 */
export const saveFCMTokenToSupabase = async (
  token: string,
  userId: string,
  supabaseClient: any
): Promise<boolean> => {
  try {
    const { error } = await supabaseClient
      .from('user_fcm_tokens')
      .upsert({
        user_id: userId,
        fcm_token: token,
        device_type: getDeviceType(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,device_type'
      });

    if (error) {
      console.error('Error saving FCM token to Supabase:', error);
      return false;
    }

    console.log('FCM token saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('Error in saveFCMTokenToSupabase:', error);
    return false;
  }
};

/**
 * Get device type for token tracking
 */
const getDeviceType = (): 'web' | 'android' | 'ios' => {
  if (typeof window === 'undefined') return 'web';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (/android/.test(userAgent)) return 'android';
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
  return 'web';
};

/**
 * Show notification using Notification API
 */
export const showNotification = (title: string, options?: NotificationOptions): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, options);
  }
};

/**
 * Check if notifications are supported and permitted
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};
