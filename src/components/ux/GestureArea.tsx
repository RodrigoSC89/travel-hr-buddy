/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * Gesture Area - PATCH 836
 * Container with gesture detection
 */

import React, { useRef, useEffect } from "react";
import { useGestureNavigation } from "@/lib/ux/gesture-navigation";
import { cn } from "@/lib/utils";

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

interface GestureAreaProps {
  children: React.ReactNode;
  onGesture?: (gesture: GestureType, data?: Record<string, number>) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onPullToRefresh?: () => void;
  className?: string;
  enabled?: boolean;
}

export const GestureArea = memo(function({
  children,
  onGesture,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  onPullToRefresh,
  className,
  enabled = true,
}: GestureAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleGesture = (gesture: GestureType, data?: Record<string, number>) => {
    onGesture?.(gesture, data);
    
    switch (gesture) {
    case "swipe-left":
      onSwipeLeft?.();
      break;
    case "swipe-right":
      onSwipeRight?.();
      break;
    case "swipe-up":
      onSwipeUp?.();
      break;
    case "swipe-down":
      onSwipeDown?.();
      break;
    case "double-tap":
      onDoubleTap?.();
      break;
    case "long-press":
      onLongPress?.();
      break;
    case "pull-to-refresh":
      onPullToRefresh?.();
      break;
    }
  });
  
  const { bindGestures } = useGestureNavigation(handleGesture);
  
  useEffect(() => {
    if (enabled && containerRef.current) {
      bindGestures(containerRef.current);
    }
  }, [enabled, bindGestures]);
  
  return (
    <div ref={containerRef} className={cn("touch-pan-y", className)}>
      {children}
    </div>
  );
}

/**
 * Pull to Refresh Component
 */
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh = memo(function({
  children,
  onRefresh,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullProgress, setPullProgress] = React.useState(0);
  
  const handlePullToRefresh = async () => {
    if (disabled || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullProgress(0);
    }
  });
  
  return (
    <GestureArea
      onPullToRefresh={handlePullToRefresh}
      enabled={!disabled}
      className={className}
    >
      {/* Refresh indicator */}
      {(isRefreshing || pullProgress > 0) && (
        <div 
          className="flex justify-center py-4 transition-all"
          style={{ 
            height: isRefreshing ? 60 : pullProgress * 60,
            opacity: isRefreshing ? 1 : pullProgress,
          }}
        >
          <div 
            className={cn(
              "h-8 w-8 rounded-full border-2 border-primary border-t-transparent",
              isRefreshing && "animate-spin"
            )}
            style={{
              transform: `rotate(${pullProgress * 360}deg)`,
            }}
          />
        </div>
      )}
      {children}
    </GestureArea>
  );
}

export default GestureArea;
