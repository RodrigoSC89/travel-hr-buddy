/**
 * PATCH 180.0 - Network Aware Image Component
 * Automatically adjusts image quality based on connection speed
 */

import { memo, memo, useEffect, useMemo, useRef, useState, useCallback } from "react";;;
import { cn } from "@/lib/utils";
import { useSlowNetwork } from "@/components/performance/SlowNetworkOptimizer";
import { Skeleton } from "./skeleton";

interface NetworkAwareImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Low quality placeholder image */
  lowQualitySrc?: string;
  /** Fallback if image fails */
  fallback?: React.ReactNode;
  /** Aspect ratio (e.g., "16/9", "1/1") */
  aspectRatio?: string;
}

export const NetworkAwareImage = memo(function({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  lowQualitySrc,
  fallback,
  aspectRatio,
}: NetworkAwareImageProps) {
  const { isSlowNetwork, optimizations } = useSlowNetwork();
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Determine which image to use
  const imageSrc = useMemo(() => {
    if (optimizations.reduceImageQuality && lowQualitySrc) {
      return lowQualitySrc;
    }
    return src;
  }, [src, lowQualitySrc, optimizations.reduceImageQuality]);

  // Lazy loading with IntersectionObserver
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: isSlowNetwork ? "50px" : "200px", // Smaller margin on slow networks
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isSlowNetwork]);

  const handleLoad = () => setLoadState("loaded");
  const handleError = () => setLoadState("error");

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{
        width,
        height,
        aspectRatio,
      }}
    >
      {/* Skeleton placeholder */}
      {loadState === "loading" && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Error fallback */}
      {loadState === "error" && (
        fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
            <svg 
              className="w-8 h-8 opacity-50" 
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
        )
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity",
            loadState === "loaded" ? "opacity-100" : "opacity-0",
            // Faster transition on slow networks
            isSlowNetwork ? "duration-150" : "duration-300"
          )}
        />
      )}

      {/* Low quality indicator */}
      {isSlowNetwork && optimizations.reduceImageQuality && loadState === "loaded" && (
        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/50 text-white text-[10px] rounded">
          LQ
        </div>
      )}
    </div>
  );
}

/**
 * Optimized avatar for slow networks
 */
export const NetworkAwareAvatar = memo(function({
  src,
  alt,
  fallbackInitials,
  size = 40,
  className,
}: {
  src?: string;
  alt: string;
  fallbackInitials?: string;
  size?: number;
  className?: string;
}) {
  const { isSlowNetwork } = useSlowNetwork();
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );

  const initials = fallbackInitials || alt.charAt(0).toUpperCase();

  // On very slow networks, skip image loading entirely
  if (isSlowNetwork && !src) {
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
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-muted overflow-hidden",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Fallback initials */}
      {(!src || loadState === "error") && (
        <span 
          className="font-medium text-muted-foreground"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}

      {/* Loading skeleton */}
      {src && loadState === "loading" && (
        <Skeleton className="absolute inset-0 rounded-full" />
      )}

      {/* Image */}
      {src && loadState !== "error" && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoadState("loaded")}
          onError={() => setLoadState("error")}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-200",
            loadState === "loaded" ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
