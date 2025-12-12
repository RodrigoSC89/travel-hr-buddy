/**
 * Capacitor Mobile Optimizations
 * PATCH 838: Otimizações para compatibilidade mobile
 */

import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

// Check if running on native platform
export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

// Haptic Feedback
export const hapticFeedback = {
  light: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  },
  medium: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
  },
  heavy: async () => {
    if (isNative) {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    }
  },
  selection: async () => {
    if (isNative) {
      await Haptics.selectionStart();
      await Haptics.selectionEnd();
    }
  },
};

// Safe Area Insets
export const getSafeAreaInsets = () => {
  if (typeof window === "undefined") return { top: 0, bottom: 0, left: 0, right: 0 };
  
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("--sat") || "0"),
    bottom: parseInt(style.getPropertyValue("--sab") || "0"),
    left: parseInt(style.getPropertyValue("--sal") || "0"),
    right: parseInt(style.getPropertyValue("--sar") || "0"),
  };
};

// Status Bar Height
export const getStatusBarHeight = () => {
  if (platform === "ios") return 44;
  if (platform === "android") return 24;
  return 0;
};

// Navigation Bar Height
export const getNavBarHeight = () => {
  if (platform === "ios") return 34; // Home indicator
  if (platform === "android") return 48;
  return 0;
};

// Touch Target Sizes (minimum for accessibility)
export const TOUCH_TARGET_SIZE = 44; // 44x44 minimum for iOS

// Viewport utilities
export const getViewportHeight = () => {
  if (typeof window === "undefined") return 0;
  return window.innerHeight;
};

export const getViewportWidth = () => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
};

// Keyboard handling
export const addKeyboardListeners = (
  onShow: (height: number) => void,
  onHide: () => void
) => {
  if (typeof window === "undefined") return () => {};
  
  const handleResize = () => {
    const viewportHeight = window.visualViewport?.height || window.innerHeight;
    const windowHeight = window.innerHeight;
    
    if (viewportHeight < windowHeight * 0.75) {
      onShow(windowHeight - viewportHeight);
    } else {
      onHide();
    }
  };
  
  window.visualViewport?.addEventListener("resize", handleResize);
  
  return () => {
    window.visualViewport?.removeEventListener("resize", handleResize);
  };
};

// Scroll Lock for modals
export const lockScroll = () => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
};

export const unlockScroll = () => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
};

// Pull to refresh threshold
export const PULL_TO_REFRESH_THRESHOLD = 80;

// Swipe gesture threshold
export const SWIPE_THRESHOLD = 50;
export const SWIPE_VELOCITY_THRESHOLD = 0.3;

// Device capabilities
export const deviceCapabilities = {
  hasTouch: typeof window !== "undefined" && "ontouchstart" in window,
  hasVibration: typeof navigator !== "undefined" && "vibrate" in navigator,
  hasCamera: isNative,
  hasNotifications: isNative,
  hasGeolocation: typeof navigator !== "undefined" && "geolocation" in navigator,
};

export default {
  isNative,
  platform,
  hapticFeedback,
  getSafeAreaInsets,
  getStatusBarHeight,
  getNavBarHeight,
  TOUCH_TARGET_SIZE,
  getViewportHeight,
  getViewportWidth,
  addKeyboardListeners,
  lockScroll,
  unlockScroll,
  PULL_TO_REFRESH_THRESHOLD,
  SWIPE_THRESHOLD,
  SWIPE_VELOCITY_THRESHOLD,
  deviceCapabilities,
};
