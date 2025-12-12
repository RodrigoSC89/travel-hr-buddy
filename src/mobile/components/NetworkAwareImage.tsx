/**
import { useEffect, useRef, useState, useCallback, useMemo } from "react";;
 * PATCH 589 - Network Aware Image Component
 * Optimized image loading based on network conditions
 */

import React, { useState, useEffect, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { networkDetector } from "../services/networkDetector";
import { Skeleton } from "@/components/unified/Skeletons.unified";

interface NetworkAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  placeholderColor?: string;
  aspectRatio?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Image component that adapts to network conditions
 * - Lazy loads by default
 * - Uses low-quality placeholder on slow networks
 * - Implements progressive loading
 * - Falls back gracefully on errors
 */
export const NetworkAwareImage = memo<NetworkAwareImageProps>(({
  src,
  alt,
  className,
  lowQualitySrc,
  placeholderColor = "bg-muted",
  aspectRatio = 16 / 9,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">("loading");
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Observe intersection for lazy loading
  useEffect(() => {
    if (priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before viewport
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Determine which source to use based on network
  useEffect(() => {
    if (!isInView) return;

    const networkStatus = networkDetector.getStatus();
    const isSlowNetwork = 
      !networkStatus.isOnline ||
      networkStatus.effectiveType === "slow-2g" ||
      networkStatus.effectiveType === "2g";

    if (isSlowNetwork && lowQualitySrc) {
      // Load low quality first on slow networks
      setCurrentSrc(lowQualitySrc);
    } else {
      setCurrentSrc(src);
    }
  }, [isInView, src, lowQualitySrc]);

  // Handle image load
  const handleLoad = () => {
    setImageState("loaded");
    
    // If we loaded low quality, upgrade to full quality
    if (currentSrc === lowQualitySrc && currentSrc !== src) {
      const fullQualityImg = new Image();
      fullQualityImg.onload = () => {
        setCurrentSrc(src);
      });
      fullQualityImg.src = src;
    }
    
    onLoad?.();
  });

  // Handle image error
  const handleError = () => {
    // Try fallback if available
    if (currentSrc !== lowQualitySrc && lowQualitySrc) {
      setCurrentSrc(lowQualitySrc);
    } else {
      setImageState("error");
      onError?.();
    }
  };

  // Generate srcset for responsive images
  const generateSrcSet = () => {
    if (!src) return undefined;
    
    // If it's a URL with size parameters, generate variants
    if (src.includes("?")) {
      const baseUrl = src.split("?")[0];
      return `${baseUrl}?w=400 400w, ${baseUrl}?w=800 800w, ${baseUrl}?w=1200 1200w`;
    }
    
    return undefined;
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden",
        placeholderColor,
        className
      )}
      style={{
        aspectRatio: aspectRatio.toString()
      }}
    >
      {/* Skeleton placeholder */}
      {imageState === "loading" && (
        <Skeleton className="absolute inset-0" />
      )}

      {/* Error state */}
      {imageState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <svg
            className="w-12 h-12 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}

      {/* Actual image */}
      {isInView && currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={generateSrcSet()}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            imageState === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
});

NetworkAwareImage.displayName = "NetworkAwareImage";

/**
 * Avatar variant with circular crop
 */
export const NetworkAwareAvatar = memo<
  Omit<NetworkAwareImageProps, "aspectRatio"> & { size?: number }
>(({ size = 40, className, ...props }) => {
  return (
    <div style={{ width: size, height: size }}>
      <NetworkAwareImage
        {...props}
        aspectRatio={1}
        className={cn("rounded-full", className)}
      />
    </div>
  );
});

NetworkAwareAvatar.displayName = "NetworkAwareAvatar";

/**
 * Background image variant
 */
export const NetworkAwareBackground = memo<
  NetworkAwareImageProps & { children?: React.ReactNode }
>(({ children, className, ...props }) => {
  return (
    <div className={cn("relative", className)}>
      <NetworkAwareImage
        {...props}
        className="absolute inset-0 -z-10"
      />
      {children}
    </div>
  );
});

NetworkAwareBackground.displayName = "NetworkAwareBackground";
