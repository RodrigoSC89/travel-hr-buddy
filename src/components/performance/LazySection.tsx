/**
 * LazySection - Intersection Observer based lazy rendering
 * PATCH 880: Reduces initial render cost for heavy sections
 */

import React, { useRef, useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  rootMargin?: string;
  threshold?: number;
  minHeight?: number | string;
  once?: boolean;
}

export const LazySection = memo<LazySectionProps>(({
  children,
  fallback,
  className,
  rootMargin = "100px",
  threshold = 0.01,
  minHeight = 200,
  once = true,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Skip observer if already visible and once=true
    if (once && hasBeenVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasBeenVisible(true);
          
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, once, hasBeenVisible]);

  // Determine what to render
  const shouldRender = once ? hasBeenVisible : isVisible;

  return (
    <div
      ref={ref}
      className={cn("transition-opacity duration-300", className)}
      style={{ minHeight: !shouldRender ? minHeight : undefined }}
      data-visible={shouldRender}
    >
      {shouldRender ? (
        children
      ) : (
        fallback || <DefaultFallback height={minHeight} />
      )}
    </div>
  );
});

LazySection.displayName = "LazySection";

// Default loading fallback
const DefaultFallback: React.FC<{ height: number | string }> = ({ height }) => (
  <div 
    className="flex flex-col gap-4 p-4"
    style={{ minHeight: height }}
  >
    <Skeleton className="h-8 w-1/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Hook for intersection observer
 */
export function useIntersection(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.root, options?.rootMargin, options?.threshold]);

  return [ref, isIntersecting];
}

/**
 * Content Visibility wrapper for CSS containment
 */
interface ContentVisibilityProps {
  children: React.ReactNode;
  className?: string;
  containIntrinsicSize?: string;
}

export const ContentVisibility: React.FC<ContentVisibilityProps> = ({
  children,
  className,
  containIntrinsicSize = "0 500px",
}) => (
  <div
    className={className}
    style={{
      contentVisibility: "auto",
      containIntrinsicSize,
    }}
  >
    {children}
  </div>
);

export default LazySection;
