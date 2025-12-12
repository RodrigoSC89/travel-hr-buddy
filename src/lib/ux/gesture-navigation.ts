/**
 * Gesture Navigation System - PATCH 836
 * Touch and mouse gesture recognition for navigation
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { hapticFeedback } from "./haptic-feedback";

type GestureType = 
  | "swipe-left" 
  | "swipe-right" 
  | "swipe-up" 
  | "swipe-down" 
  | "pinch-in" 
  | "pinch-out" 
  | "double-tap"
  | "long-press"
  | "pull-to-refresh";

interface GestureConfig {
  swipeThreshold: number;
  swipeVelocity: number;
  longPressDelay: number;
  doubleTapDelay: number;
  pinchThreshold: number;
}

interface GestureState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  startTime: number;
  initialDistance: number;
}

type GestureCallback = (gesture: GestureType, data?: Record<string, number>) => void;

const DEFAULT_CONFIG: GestureConfig = {
  swipeThreshold: 50,
  swipeVelocity: 0.3,
  longPressDelay: 500,
  doubleTapDelay: 300,
  pinchThreshold: 50,
};

/**
 * Hook for gesture detection
 */
export function useGestureNavigation(
  onGesture: GestureCallback,
  config: Partial<GestureConfig> = {}
) {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const elementRef = useRef<HTMLElement | null>(null);
  const stateRef = useRef<GestureState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0,
    initialDistance: 0,
  });
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<number | null>(null);
  
  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const now = Date.now();
    
    stateRef.current = {
      isActive: true,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      startTime: now,
      initialDistance: e.touches.length > 1 ? getDistance(e.touches) : 0,
    };
    
    // Check for double tap
    if (now - lastTapRef.current < mergedConfig.doubleTapDelay) {
      hapticFeedback.trigger("selection");
      onGesture("double-tap");
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
    
    // Start long press timer
    longPressTimerRef.current = window.setTimeout(() => {
      if (stateRef.current.isActive) {
        const dx = Math.abs(stateRef.current.currentX - stateRef.current.startX);
        const dy = Math.abs(stateRef.current.currentY - stateRef.current.startY);
        
        if (dx < 10 && dy < 10) {
          hapticFeedback.trigger("heavy");
          onGesture("long-press");
        }
      }
    }, mergedConfig.longPressDelay);
  }, [onGesture, mergedConfig.doubleTapDelay, mergedConfig.longPressDelay]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!stateRef.current.isActive) return;
    
    const touch = e.touches[0];
    stateRef.current.currentX = touch.clientX;
    stateRef.current.currentY = touch.clientY;
    
    // Cancel long press if moved
    if (longPressTimerRef.current) {
      const dx = Math.abs(touch.clientX - stateRef.current.startX);
      const dy = Math.abs(touch.clientY - stateRef.current.startY);
      
      if (dx > 10 || dy > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
    
    // Check for pinch
    if (e.touches.length > 1) {
      const currentDistance = getDistance(e.touches);
      const diff = currentDistance - stateRef.current.initialDistance;
      
      if (Math.abs(diff) > mergedConfig.pinchThreshold) {
        hapticFeedback.trigger("light");
        onGesture(diff > 0 ? "pinch-out" : "pinch-in", { scale: currentDistance / stateRef.current.initialDistance });
        stateRef.current.initialDistance = currentDistance;
      }
    }
    
    // Check for pull to refresh
    if (stateRef.current.startY < 100 && touch.clientY - stateRef.current.startY > 100) {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop === 0) {
        hapticFeedback.trigger("medium");
        onGesture("pull-to-refresh");
      }
    }
  }, [onGesture, mergedConfig.pinchThreshold]);
  
  const handleTouchEnd = useCallback(() => {
    if (!stateRef.current.isActive) return;
    
    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    const state = stateRef.current;
    const dx = state.currentX - state.startX;
    const dy = state.currentY - state.startY;
    const dt = Date.now() - state.startTime;
    const velocity = Math.sqrt(dx * dx + dy * dy) / dt;
    
    // Check for swipe
    if (velocity > mergedConfig.swipeVelocity) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      
      if (absDx > mergedConfig.swipeThreshold || absDy > mergedConfig.swipeThreshold) {
        hapticFeedback.trigger("light");
        
        if (absDx > absDy) {
          onGesture(dx > 0 ? "swipe-right" : "swipe-left", { velocity, distance: absDx });
        } else {
          onGesture(dy > 0 ? "swipe-down" : "swipe-up", { velocity, distance: absDy });
        }
      }
    }
    
    stateRef.current.isActive = false;
  }, [onGesture, mergedConfig.swipeThreshold, mergedConfig.swipeVelocity]);
  
  const bindGestures = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener("touchstart", handleTouchStart);
      elementRef.current.removeEventListener("touchmove", handleTouchMove);
      elementRef.current.removeEventListener("touchend", handleTouchEnd);
    }
    
    elementRef.current = element;
    
    if (element) {
      element.addEventListener("touchstart", handleTouchStart, { passive: true });
      element.addEventListener("touchmove", handleTouchMove, { passive: true });
      element.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener("touchstart", handleTouchStart);
        elementRef.current.removeEventListener("touchmove", handleTouchMove);
        elementRef.current.removeEventListener("touchend", handleTouchEnd);
      }
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  return { bindGestures };
}

/**
 * Hook for swipe navigation between routes
 */
export function useSwipeNavigation(routes: string[], currentIndex: number, navigate: (path: string) => void) {
  const [swipeProgress, setSwipeProgress] = useState(0);
  
  const handleGesture = useCallback((gesture: GestureType) => {
    if (gesture === "swipe-left" && currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1]);
    } else if (gesture === "swipe-right" && currentIndex > 0) {
      navigate(routes[currentIndex - 1]);
    }
    setSwipeProgress(0);
  }, [currentIndex, routes, navigate]);
  
  const { bindGestures } = useGestureNavigation(handleGesture);
  
  return {
    bindGestures,
    swipeProgress,
    canSwipeLeft: currentIndex < routes.length - 1,
    canSwipeRight: currentIndex > 0,
  };
}
