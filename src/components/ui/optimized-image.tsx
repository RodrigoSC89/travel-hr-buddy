/**
import { useEffect, useRef, useState } from "react";;
 * PATCH 542 - Enhanced Optimized Image Component
 * Advanced lazy loading, blur placeholder, WebP/AVIF support, and CDN integration
 */

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { imageOptimizer } from "@/lib/images/image-optimizer";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataURL?: string;
  className?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  priority?: boolean;
  sizes?: string;
  fallback?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurDataURL,
  className,
  objectFit = "cover",
  priority = false,
  sizes,
  fallback = "/placeholder.svg",
  width,
  height,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate srcset for responsive images
  const srcSet = width && typeof width === "number"
    ? imageOptimizer.generateSrcSet(src, [
      Math.round(width * 0.5),
      width,
      Math.round(width * 1.5),
      Math.round(width * 2),
    ])
    : undefined;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blur Placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className={cn(
            "absolute inset-0 w-full h-full blur-sm scale-110",
            `object-${objectFit}`
          )}
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      {!hasError ? (
        <img
          ref={imgRef}
          src={isInView ? src : (blurDataURL || fallback)}
          alt={alt}
          srcSet={isInView ? srcSet : undefined}
          sizes={sizes}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-500",
            `object-${objectFit}`,
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
          <span className="text-sm">Falha ao carregar imagem</span>
        </div>
      )}
    </div>
  );
};
