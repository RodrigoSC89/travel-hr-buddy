/**
import { useEffect, useRef, useState, useCallback } from "react";;
 * OptimizedImagePro Component
 * PATCH 753 - Imagem otimizada com lazy loading e placeholder blur
 */

import React, { useState, useRef, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { useAdaptiveLoading } from "@/hooks/useConnectionSpeed";
import {
  createPlaceholder,
  calculateOptimalDimensions,
  isImageInViewport,
} from "@/lib/performance/image-optimizer";

interface OptimizedImageProProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImagePro = memo(function OptimizedImagePro({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = "blur",
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { shouldLazyLoadImages, imageQuality } = useAdaptiveLoading();
  
  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !shouldLazyLoadImages) {
      setIsInView(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px", threshold: 0.01 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority, shouldLazyLoadImages]);
  
  // Calculate optimal size
  const optimalWidth = width || (containerRef.current?.offsetWidth 
    ? calculateOptimalDimensions(containerRef.current.offsetWidth, 1).width
    : undefined);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  });
  
  const handleError = () => {
    setError(true);
    onError?.();
  });
  
  const blurPlaceholder = createPlaceholder(
    optimalWidth || 100,
    height || 100,
    "hsl(var(--muted))"
  );
  
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        !isLoaded && placeholder === "blur" && "bg-muted/50",
        className
      )}
      style={{ width, height }}
    >
      {/* Blur Placeholder */}
      {!isLoaded && placeholder === "blur" && (
        <img
          src={blurPlaceholder}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-lg"
        />
      )}
      
      {/* Main Image */}
      {isInView && !error && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={optimalWidth}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            "w-full h-full object-cover"
          )}
          {...props}
        />
      )}
      
      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <span className="text-sm text-muted-foreground">Imagem indisponível</span>
        </div>
      )}
    </div>
  );
});

OptimizedImagePro.displayName = "OptimizedImagePro";
