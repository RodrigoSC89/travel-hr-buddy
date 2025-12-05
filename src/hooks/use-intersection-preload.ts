/**
 * Intersection-based Preloading Hook
 * Preloads resources when elements approach viewport
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface PreloadOptions {
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
  preloadUrls?: string[];
}

export function useIntersectionPreload<T extends HTMLElement>(options: PreloadOptions = {}) {
  const {
    rootMargin = '200px',
    threshold = 0,
    onVisible,
    preloadUrls = [],
  } = options;

  const elementRef = useRef<T>(null);
  const hasTriggered = useRef(false);

  const preloadResources = useCallback(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    // Preload URLs
    preloadUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

    // Call visibility callback
    onVisible?.();
  }, [preloadUrls, onVisible]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          preloadResources();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, preloadResources]);

  return elementRef;
}

/**
 * Preload component when link is hovered
 */
export function useHoverPreload(preloadFn: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onMouseEnter = useCallback(() => {
    timeoutRef.current = setTimeout(preloadFn, 100);
  }, [preloadFn]);

  const onMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { onMouseEnter, onMouseLeave };
}

/**
 * Preload images progressively
 */
export function useProgressiveImage(lowQualitySrc: string, highQualitySrc: string) {
  const [src, setSrc] = useState(lowQualitySrc);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setSrc(highQualitySrc);
      setIsLoaded(true);
    };
  }, [highQualitySrc]);

  return { src, isLoaded, isBlurred: !isLoaded };
}
