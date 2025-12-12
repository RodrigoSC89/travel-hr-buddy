/**
import { useCallback, useEffect, useState } from "react";;
 * Progressive Content Loading
 * Loads content progressively based on connection speed
 */

import React, { useState, useEffect, useCallback } from "react";
import { useConnectionAware } from "@/hooks/use-connection-aware";
import { useInView } from "react-intersection-observer";
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ProgressiveContentProps {
  children: React.ReactNode;
  priority?: "high" | "medium" | "low";
  placeholder?: React.ReactNode;
  className?: string;
  onVisible?: () => void;
}

export const ProgressiveContent: React.FC<ProgressiveContentProps> = ({
  children,
  priority = "medium",
  placeholder,
  className,
  onVisible
}) => {
  const [shouldRender, setShouldRender] = useState(priority === "high");
  const { shouldReduceData, isSlowConnection } = useConnectionAware();
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: isSlowConnection ? "50px" : "200px"
  });

  useEffect(() => {
    if (priority === "high") {
      setShouldRender(true);
      return;
    }

    if (inView) {
      const delay = shouldReduceData 
        ? priority === "medium" ? 100 : 300
        : 0;
      
      const timer = setTimeout(() => {
        setShouldRender(true);
        onVisible?.();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [inView, priority, shouldReduceData, onVisible]);

  return (
    <div ref={ref} className={className}>
      {shouldRender ? children : (placeholder || <ContentPlaceholder />)}
    </div>
  );
};

const ContentPlaceholder: React.FC = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
);

/**
 * Progressive Image with blur-up effect
 */
interface ProgressiveImageProps {
  src: string;
  alt: string;
  lowResSrc?: string;
  className?: string;
  width?: number;
  height?: number;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  lowResSrc,
  className,
  width,
  height
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowResSrc || "");
  const { shouldReduceData } = useConnectionAware();

  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: true,
    rootMargin: "100px"
  });

  useEffect(() => {
    if (inView && !shouldReduceData) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
    } else if (inView && shouldReduceData) {
      // On slow connections, load directly without preloading
      setCurrentSrc(src);
    }
  }, [inView, src, shouldReduceData]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {currentSrc ? (
        <img
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            "transition-all duration-500",
            isLoaded ? "blur-0" : "blur-sm scale-105"
          )}
          loading="lazy"
        />
      ) : (
        <Skeleton className="w-full h-full min-h-[100px]" />
      )}
    </div>
  );
};

/**
 * Progressive List - renders items progressively
 */
interface ProgressiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  batchSize?: number;
  className?: string;
  itemClassName?: string;
}

export function ProgressiveList<T>({
  items,
  renderItem,
  keyExtractor,
  batchSize = 10,
  className,
  itemClassName
}: ProgressiveListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const { isSlowConnection } = useConnectionAware();
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "200px"
  });

  useEffect(() => {
    if (inView && visibleCount < items.length) {
      const increment = isSlowConnection ? Math.ceil(batchSize / 2) : batchSize;
      setVisibleCount(prev => Math.min(prev + increment, items.length));
    }
  }, [inView, items.length, batchSize, isSlowConnection, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <div className={className}>
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item, index)} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
      {visibleCount < items.length && (
        <div ref={ref} className="py-4 flex justify-center">
          <Skeleton className="h-8 w-32" />
        </div>
      )}
    </div>
  );
}
