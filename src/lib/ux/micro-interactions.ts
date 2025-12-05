/**
 * Micro-interactions System - PATCH 836
 * Lightweight animations optimized for slow connections
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { bandwidthOptimizer } from '@/lib/performance/low-bandwidth-optimizer';

type InteractionType = 
  | 'button-press'
  | 'card-hover'
  | 'list-item'
  | 'toggle'
  | 'input-focus'
  | 'success'
  | 'error'
  | 'loading'
  | 'ripple'
  | 'shake'
  | 'bounce'
  | 'pulse';

interface AnimationConfig {
  duration: number;
  easing: string;
  properties: string[];
}

// Optimized animation configs for different connection speeds
const ANIMATIONS: Record<InteractionType, Record<string, AnimationConfig>> = {
  'button-press': {
    fast: { duration: 150, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', properties: ['transform', 'opacity'] },
    slow: { duration: 0, easing: 'linear', properties: [] },
  },
  'card-hover': {
    fast: { duration: 200, easing: 'ease-out', properties: ['transform', 'box-shadow'] },
    slow: { duration: 100, easing: 'ease-out', properties: ['transform'] },
  },
  'list-item': {
    fast: { duration: 300, easing: 'ease-out', properties: ['opacity', 'transform'] },
    slow: { duration: 0, easing: 'linear', properties: [] },
  },
  'toggle': {
    fast: { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', properties: ['transform', 'background-color'] },
    slow: { duration: 100, easing: 'linear', properties: ['background-color'] },
  },
  'input-focus': {
    fast: { duration: 150, easing: 'ease-out', properties: ['border-color', 'box-shadow'] },
    slow: { duration: 0, easing: 'linear', properties: ['border-color'] },
  },
  'success': {
    fast: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', properties: ['transform', 'opacity'] },
    slow: { duration: 200, easing: 'ease-out', properties: ['opacity'] },
  },
  'error': {
    fast: { duration: 300, easing: 'ease-out', properties: ['transform'] },
    slow: { duration: 150, easing: 'linear', properties: [] },
  },
  'loading': {
    fast: { duration: 1000, easing: 'linear', properties: ['transform'] },
    slow: { duration: 1000, easing: 'linear', properties: ['opacity'] },
  },
  'ripple': {
    fast: { duration: 400, easing: 'ease-out', properties: ['transform', 'opacity'] },
    slow: { duration: 0, easing: 'linear', properties: [] },
  },
  'shake': {
    fast: { duration: 300, easing: 'ease-out', properties: ['transform'] },
    slow: { duration: 0, easing: 'linear', properties: [] },
  },
  'bounce': {
    fast: { duration: 400, easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', properties: ['transform'] },
    slow: { duration: 0, easing: 'linear', properties: [] },
  },
  'pulse': {
    fast: { duration: 500, easing: 'ease-in-out', properties: ['transform', 'opacity'] },
    slow: { duration: 300, easing: 'ease-in-out', properties: ['opacity'] },
  },
};

/**
 * Get animation config based on connection
 */
function getAnimationConfig(type: InteractionType): AnimationConfig {
  const isSlowConnection = bandwidthOptimizer.isLowBandwidth();
  return ANIMATIONS[type][isSlowConnection ? 'slow' : 'fast'];
}

/**
 * Generate CSS transition string
 */
export function getTransitionStyle(type: InteractionType): React.CSSProperties {
  const config = getAnimationConfig(type);
  
  if (config.properties.length === 0) {
    return {};
  }
  
  const transition = config.properties
    .map(prop => `${prop} ${config.duration}ms ${config.easing}`)
    .join(', ');
  
  return { transition };
}

/**
 * CSS classes for micro-interactions
 */
export const interactionClasses = {
  buttonPress: `
    active:scale-95 
    transition-transform 
    duration-150 
    ease-out
  `.trim().replace(/\s+/g, ' '),
  
  cardHover: `
    hover:scale-[1.02] 
    hover:shadow-lg 
    transition-all 
    duration-200 
    ease-out
  `.trim().replace(/\s+/g, ' '),
  
  listItemEnter: `
    animate-fade-in
  `.trim(),
  
  inputFocus: `
    focus:ring-2 
    focus:ring-primary/50 
    focus:border-primary 
    transition-all 
    duration-150
  `.trim().replace(/\s+/g, ' '),
  
  success: `
    animate-scale-in
  `.trim(),
  
  error: `
    animate-shake
  `.trim(),
};

/**
 * Hook for ripple effect
 */
export function useRippleEffect() {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const nextId = useRef(0);
  
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (bandwidthOptimizer.isLowBandwidth()) return;
    
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const id = nextId.current++;
    setRipples(prev => [...prev, { x, y, id }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 400);
  }, []);
  
  return { ripples, createRipple };
}

/**
 * Hook for button press animation
 */
export function useButtonPress() {
  const [isPressed, setIsPressed] = useState(false);
  
  const handlers = {
    onMouseDown: () => setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onMouseLeave: () => setIsPressed(false),
    onTouchStart: () => setIsPressed(true),
    onTouchEnd: () => setIsPressed(false),
  };
  
  const style: React.CSSProperties = isPressed
    ? { transform: 'scale(0.95)', ...getTransitionStyle('button-press') }
    : { transform: 'scale(1)', ...getTransitionStyle('button-press') };
  
  return { isPressed, handlers, style };
}

/**
 * Hook for staggered list animations
 */
export function useStaggeredList<T>(items: T[], staggerDelay = 50) {
  const [visibleCount, setVisibleCount] = useState(0);
  const isSlowConnection = bandwidthOptimizer.isLowBandwidth();
  
  useEffect(() => {
    if (isSlowConnection) {
      // Show all at once on slow connections
      setVisibleCount(items.length);
      return;
    }
    
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      
      if (count >= items.length) {
        clearInterval(interval);
      }
    }, staggerDelay);
    
    return () => clearInterval(interval);
  }, [items.length, staggerDelay, isSlowConnection]);
  
  return items.map((item, index) => ({
    item,
    isVisible: index < visibleCount,
    style: {
      opacity: index < visibleCount ? 1 : 0,
      transform: index < visibleCount ? 'translateY(0)' : 'translateY(10px)',
      transition: isSlowConnection ? 'none' : `opacity 300ms ease-out ${index * staggerDelay}ms, transform 300ms ease-out ${index * staggerDelay}ms`,
    },
  }));
}

/**
 * Hook for pulse animation on updates
 */
export function usePulseOnChange<T>(value: T) {
  const [isPulsing, setIsPulsing] = useState(false);
  const prevValue = useRef(value);
  
  useEffect(() => {
    if (prevValue.current !== value) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 500);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value]);
  
  const pulseClass = isPulsing && !bandwidthOptimizer.isLowBandwidth() 
    ? 'animate-pulse' 
    : '';
  
  return { isPulsing, pulseClass };
}

/**
 * Hook for shake animation on error
 */
export function useShakeOnError(hasError: boolean) {
  const [isShaking, setIsShaking] = useState(false);
  const prevError = useRef(hasError);
  
  useEffect(() => {
    if (hasError && !prevError.current) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 300);
      prevError.current = hasError;
      return () => clearTimeout(timer);
    }
    prevError.current = hasError;
  }, [hasError]);
  
  const shakeStyle: React.CSSProperties = isShaking && !bandwidthOptimizer.isLowBandwidth()
    ? { animation: 'shake 0.3s ease-out' }
    : {};
  
  return { isShaking, shakeStyle };
}
