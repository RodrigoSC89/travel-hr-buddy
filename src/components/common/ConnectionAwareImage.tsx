/**
import { useEffect, useState } from "react";;
 * Connection-Aware Image Component
 * Optimizes image loading based on network conditions
 */

import React, { useState, useEffect, memo } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";

interface ConnectionAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: React.ReactNode;
  fallback?: string;
}

export const ConnectionAwareImage = memo(function ConnectionAwareImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder,
  fallback = "/placeholder.svg"
}: ConnectionAwareImageProps) {
  const { quality, online } = useNetworkStatus();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(priority);

  // Defer non-priority images on slow connections
  useEffect(() => {
    if (priority || quality === "fast") {
      setShouldLoad(true);
      return;
    }

    // Delay loading on slow connections
    const delay = quality === "slow" ? 1000 : 300;
    const timer = setTimeout(() => setShouldLoad(true), delay);
    return () => clearTimeout(timer);
  }, [priority, quality]);

  // Don't load images when offline (unless cached)
  if (!online && !loaded) {
    return (
      <div 
        className={cn(
          "bg-muted flex items-center justify-center text-muted-foreground text-sm",
          className
        )}
        style={{ width, height }}
      >
        📷 Offline
      </div>
    );
  }

  // Skip non-critical images on very slow connections
  if (quality === "slow" && !priority && !loaded) {
    return placeholder || (
      <div 
        className={cn("bg-muted/50 rounded", className)}
        style={{ width, height }}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)} style={{ width, height }}>
      {/* Placeholder while loading */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Actual image */}
      {shouldLoad && (
        <img
          src={error ? fallback : src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true}
          onError={() => setError(true}
          className={cn(
            "transition-opacity duration-300",
            loaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  );
  };

export default ConnectionAwareImage;
