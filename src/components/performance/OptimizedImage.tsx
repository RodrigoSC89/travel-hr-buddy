/**
import { useEffect, useRef, useState } from "react";;
 * Optimized Image Component
 * Lazy loading with adaptive quality for low bandwidth
 */

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  createPlaceholder,
  getOptimizedImageUrl,
  getAdaptiveQuality,
} from "@/lib/performance/image-optimizer";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  fallback?: React.ReactNode;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width = 400,
  height = 400,
  aspectRatio = "auto",
  fallback,
  priority = false,
  className,
  ...props
}: OptimizedImageProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || shouldLoad) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, shouldLoad]);

  const quality = getAdaptiveQuality();
  const optimizedUrl = getOptimizedImageUrl(src, { width, height, quality });
  const placeholderUrl = createPlaceholder(width, height);

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    auto: "",
  };

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {shouldLoad && (
        <img
          src={optimizedUrl}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}
      
      {!loaded && !error && (
        <img
          src={placeholderUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Avatar optimized for lists
 */
export function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
}) {
  const initials = alt
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (!src) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      aspectRatio="square"
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
      fallback={
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium",
            className
          )}
          style={{ width: size, height: size, fontSize: size * 0.4 }}
        >
          {initials}
        </div>
      }
    />
  );
}
