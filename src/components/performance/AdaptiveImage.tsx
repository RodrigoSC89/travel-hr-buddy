/**
 * Adaptive Image Component
 * Automatically serves WebP/AVIF with fallbacks and lazy loading
 */

import { memo, memo, memo, useEffect, useRef, useState } from "react";;;
import { useNetworkStatus } from "@/hooks/use-network-status";
import { cn } from "@/lib/utils";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  quality?: number;
}

// Generate optimized srcset for responsive images
function generateSrcSet(src: string, widths: number[] = [320, 640, 768, 1024, 1280]): string {
  // For external URLs or data URLs, return original
  if (src.startsWith("data:") || src.startsWith("http")) {
    return src;
  }
  
  return widths
    .map(w => `${src}?w=${w} ${w}w`)
    .join(", ");
}

// Get quality based on network
function getAdaptiveQuality(quality: "fast" | "medium" | "slow" | "offline"): number {
  switch (quality) {
  case "fast": return 85;
  case "medium": return 70;
  case "slow": return 50;
  case "offline": return 40;
  default: return 75;
  }
}

export const AdaptiveImage = memo(function AdaptiveImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  onLoad,
  onError,
  sizes = "100vw",
  quality: customQuality,
}: AdaptiveImageProps) {
  const { quality: networkQuality, online } = useNetworkStatus();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  const adaptiveQuality = customQuality ?? getAdaptiveQuality(networkQuality);

  // Intersection observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px", threshold: 0.01 }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  });

  const handleError = () => {
    setHasError(true);
    onError?.();
  });

  // Placeholder styles
  const placeholderStyle = placeholder === "blur" && blurDataURL
    ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: "cover" }
    : {};

  // Don't load images when offline unless cached
  const shouldLoad = isInView && (online || priority);

  return (
    <div
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        !isLoaded && "animate-pulse",
        className
      )}
      style={{
        width: width ? `${width}px` : "100%",
        height: height ? `${height}px` : "auto",
        aspectRatio: width && height ? `${width}/${height}` : undefined,
        ...placeholderStyle,
      }}
    >
      {shouldLoad && !hasError && (
        <picture>
          {/* AVIF for modern browsers */}
          <source
            type="image/avif"
            srcSet={generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/i, ".avif"))}
            sizes={sizes}
          />
          {/* WebP for good support */}
          <source
            type="image/webp"
            srcSet={generateSrcSet(src.replace(/\.(jpg|jpeg|png)$/i, ".webp"))}
            sizes={sizes}
          />
          {/* Original format fallback */}
          <img
            src={src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
          />
        </picture>
      )}

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Imagem indisponível</span>
        </div>
      )}

      {/* Offline indicator */}
      {!online && !priority && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/80 text-muted-foreground">
          <span className="text-xs">Offline</span>
        </div>
      )}
    </div>
  );
});

export default AdaptiveImage;
