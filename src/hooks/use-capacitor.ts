/**
 * Capacitor React Hooks
 * Hooks for using native mobile features in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { capacitorService } from '@/lib/mobile/capacitor-service';
import type { Photo } from '@capacitor/camera';

/**
 * Hook to check if running on native platform
 */
export function useIsNative(): boolean {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(capacitorService.isNative);
  }, []);

  return isNative;
}

/**
 * Hook to get current platform
 */
export function usePlatform(): 'ios' | 'android' | 'web' {
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web'>('web');

  useEffect(() => {
    setPlatform(capacitorService.platform);
  }, []);

  return platform;
}

/**
 * Hook for haptic feedback
 */
export function useHaptics() {
  const isNative = useIsNative();

  const light = useCallback(async () => {
    if (!isNative) return;
    await capacitorService.hapticLight();
  }, [isNative]);

  const medium = useCallback(async () => {
    if (!isNative) return;
    await capacitorService.hapticMedium();
  }, [isNative]);

  const heavy = useCallback(async () => {
    if (!isNative) return;
    await capacitorService.hapticHeavy();
  }, [isNative]);

  const selection = useCallback(async () => {
    if (!isNative) return;
    await capacitorService.hapticSelection();
  }, [isNative]);

  const notification = useCallback(async (type: 'success' | 'warning' | 'error' = 'success') => {
    if (!isNative) return;
    await capacitorService.hapticNotification(type);
  }, [isNative]);

  return { light, medium, heavy, selection, notification, isNative };
}

/**
 * Hook for camera functionality
 */
export function useCamera() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const takePhoto = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await capacitorService.takePhoto();
      setPhoto(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Camera error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const pickPhoto = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await capacitorService.pickPhoto();
      setPhoto(result);
      return result;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Photo picker error';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearPhoto = useCallback(() => {
    setPhoto(null);
    setError(null);
  }, []);

  return { photo, takePhoto, pickPhoto, clearPhoto, loading, error };
}

/**
 * Hook for local notifications
 */
export function useLocalNotifications() {
  const schedule = useCallback(async (options: {
    id: number;
    title: string;
    body: string;
    scheduleAt?: Date;
    extra?: Record<string, unknown>;
  }) => {
    await capacitorService.scheduleNotification(options);
  }, []);

  const cancel = useCallback(async (id: number) => {
    await capacitorService.cancelNotification(id);
  }, []);

  return { schedule, cancel };
}

/**
 * Hook for safe area insets
 */
export function useSafeArea() {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    setInsets(capacitorService.getSafeAreaInsets());
  }, []);

  return insets;
}

/**
 * Hook for platform-specific styles
 */
export function usePlatformStyles() {
  const platform = usePlatform();
  const isNative = useIsNative();

  return {
    statusBarHeight: capacitorService.getStatusBarHeight(),
    navBarHeight: capacitorService.getNavBarHeight(),
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web',
    isNative,
    // Common style helpers
    containerPadding: isNative ? {
      paddingTop: capacitorService.getStatusBarHeight(),
      paddingBottom: capacitorService.getNavBarHeight(),
    } : {},
  };
}
