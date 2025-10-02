/**
 * React Hook for Accessibility Features
 * Provides easy access to WCAG compliance tools
 */

import { useEffect, useRef, useCallback } from 'react';
import { screenReaderAnnouncer, FocusTrap } from '@/lib/accessibility/wcag-utils';

/**
 * Hook for screen reader announcements
 */
export function useScreenReader() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    screenReaderAnnouncer.announce(message, priority);
  }, []);

  const clear = useCallback(() => {
    screenReaderAnnouncer.clear();
  }, []);

  return { announce, clear };
}

/**
 * Hook for focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const elementRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  useEffect(() => {
    if (!focusTrapRef.current) {
      focusTrapRef.current = new FocusTrap();
    }

    if (isActive && elementRef.current) {
      focusTrapRef.current.activate(elementRef.current);
    } else if (!isActive && focusTrapRef.current) {
      focusTrapRef.current.deactivate();
    }

    return () => {
      if (focusTrapRef.current) {
        focusTrapRef.current.deactivate();
      }
    };
  }, [isActive]);

  return elementRef;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(onEscape?: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onEscape]);
}

/**
 * Hook to ensure focus is visible
 */
export function useFocusVisible() {
  useEffect(() => {
    // Add focus-visible class to body to enable custom focus styles
    document.body.classList.add('focus-visible-enabled');

    return () => {
      document.body.classList.remove('focus-visible-enabled');
    };
  }, []);
}

/**
 * Hook to announce route changes to screen readers
 */
export function useRouteAnnouncement(currentPath: string, pageName: string) {
  const { announce } = useScreenReader();
  const previousPath = useRef(currentPath);

  useEffect(() => {
    if (previousPath.current !== currentPath) {
      announce(`Navegado para ${pageName}`, 'polite');
      previousPath.current = currentPath;
    }
  }, [currentPath, pageName, announce]);
}

/**
 * Hook to ensure minimum touch target size (44x44px for WCAG AAA)
 */
export function useTouchTarget(minSize = 44) {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const { width, height } = element.getBoundingClientRect();

    if (width < minSize || height < minSize) {
      console.warn(
        `Touch target too small: ${width}x${height}px. Minimum recommended: ${minSize}x${minSize}px`,
        element
      );
    }
  }, [minSize]);

  return elementRef;
}

/**
 * Hook for skip to content functionality
 */
export function useSkipToContent() {
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      (mainContent as HTMLElement).scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return { skipToMainContent };
}
