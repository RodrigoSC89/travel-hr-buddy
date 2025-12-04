/**
 * Accessibility React Hooks
 * WCAG 2.1 compliance utilities for React components
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { 
  createFocusTrap, 
  announce, 
  prefersReducedMotion,
  prefersHighContrast,
  prefersDarkMode,
  isKeyPressed,
  KeyboardKeys
} from '@/lib/accessibility';

// Hook for focus trapping in modals/dialogs
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const cleanup = createFocusTrap(containerRef.current);
    return cleanup;
  }, [isActive]);
  
  return containerRef;
}

// Hook for announcements to screen readers
export function useAnnounce() {
  return useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announce(message, priority);
  }, []);
}

// Hook for keyboard navigation in lists
export function useKeyboardNavigation<T extends HTMLElement>(
  items: T[],
  options: {
    loop?: boolean;
    orientation?: 'horizontal' | 'vertical';
    onSelect?: (index: number) => void;
  } = {}
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { loop = true, orientation = 'vertical', onSelect } = options;
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const prevKey = orientation === 'vertical' ? 'ARROW_UP' : 'ARROW_LEFT';
    const nextKey = orientation === 'vertical' ? 'ARROW_DOWN' : 'ARROW_RIGHT';
    
    if (isKeyPressed(event, prevKey as keyof typeof KeyboardKeys)) {
      event.preventDefault();
      setActiveIndex(prev => {
        if (prev === 0) return loop ? items.length - 1 : 0;
        return prev - 1;
      });
    } else if (isKeyPressed(event, nextKey as keyof typeof KeyboardKeys)) {
      event.preventDefault();
      setActiveIndex(prev => {
        if (prev === items.length - 1) return loop ? 0 : items.length - 1;
        return prev + 1;
      });
    } else if (isKeyPressed(event, 'HOME')) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (isKeyPressed(event, 'END')) {
      event.preventDefault();
      setActiveIndex(items.length - 1);
    } else if (isKeyPressed(event, 'ENTER') || isKeyPressed(event, 'SPACE')) {
      event.preventDefault();
      onSelect?.(activeIndex);
    }
  }, [items.length, loop, orientation, activeIndex, onSelect]);
  
  useEffect(() => {
    items[activeIndex]?.focus();
  }, [activeIndex, items]);
  
  return { activeIndex, setActiveIndex, handleKeyDown };
}

// Hook for media query preferences
export function useMediaPreferences() {
  const [preferences, setPreferences] = useState({
    reducedMotion: false,
    highContrast: false,
    darkMode: false,
  });
  
  useEffect(() => {
    setPreferences({
      reducedMotion: prefersReducedMotion(),
      highContrast: prefersHighContrast(),
      darkMode: prefersDarkMode(),
    });
    
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updatePreferences = () => {
      setPreferences({
        reducedMotion: reducedMotionQuery.matches,
        highContrast: highContrastQuery.matches,
        darkMode: darkModeQuery.matches,
      });
    };
    
    reducedMotionQuery.addEventListener('change', updatePreferences);
    highContrastQuery.addEventListener('change', updatePreferences);
    darkModeQuery.addEventListener('change', updatePreferences);
    
    return () => {
      reducedMotionQuery.removeEventListener('change', updatePreferences);
      highContrastQuery.removeEventListener('change', updatePreferences);
      darkModeQuery.removeEventListener('change', updatePreferences);
    };
  }, []);
  
  return preferences;
}

// Hook for skip link
export function useSkipLink(targetId: string = 'main-content') {
  useEffect(() => {
    const handleSkip = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !e.shiftKey && document.activeElement === document.body) {
        const skipLink = document.querySelector('[data-skip-link]');
        if (skipLink) {
          (skipLink as HTMLElement).focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleSkip);
    return () => document.removeEventListener('keydown', handleSkip);
  }, [targetId]);
}

// Hook for escape key to close modals
export function useEscapeKey(onEscape: () => void, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isActive]);
}

// Hook for returning focus after modal closes
export function useReturnFocus() {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    
    return () => {
      previousActiveElement.current?.focus();
    };
  }, []);
}
