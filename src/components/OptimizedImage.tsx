
/**
 * OptimizedImage Component
 * Automatic lazy loading, responsive images, and network-aware quality
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useNetworkAware } from "@/mobile/hooks/useNetworkAware";
import { 
  imageOptimizer, 
  generateSrcSet, 
  generateSizes 
} from "@/lib/image-optimizer";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  responsive?: boolean;
  priority?: boolean;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  blurPlaceholder?: boolean;
  onLoadComplete?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  responsive = true,
  priority = false,
  aspectRatio,
  objectFit = "cover",
  blurPlaceholder = true,
  className,
  onLoadComplete,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const { isSlowConnection } = useNetworkAware();

  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "50px 0px", threshold: 0.1 }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
  };

  // Determine quality based on network
  const quality = isSlowConnection ? 60 : 80;
  
  // Build optimized src with quality param if it's a dynamic URL
  const optimizedSrc = src.includes("?") 
    ? `${src}&q=${quality}` 
    : `${src}?q=${quality}`;

  const imageSrc = hasError ? fallbackSrc : (isInView ? optimizedSrc : undefined);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted",
        aspectRatio && `aspect-[${aspectRatio}]`,
        className
      )}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Blur placeholder */}
      {blurPlaceholder && !isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted/80 to-muted"
          aria-hidden="true"
        />
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        data-src={!priority ? optimizedSrc : undefined}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        onLoad={handleLoad}
        onError={handleError}
        srcSet={responsive && isInView ? generateSrcSet(src) : undefined}
        sizes={responsive ? generateSizes() : undefined}
        className={cn(
          "w-full h-full transition-opacity duration-300",
          objectFit === "cover" && "object-cover",
          objectFit === "contain" && "object-contain",
          objectFit === "fill" && "object-fill",
          objectFit === "none" && "object-none",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        {...props}
      />

      {/* Loading indicator for slow connections */}
      {isSlowConnection && !isLoaded && isInView && (
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Loading...
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
