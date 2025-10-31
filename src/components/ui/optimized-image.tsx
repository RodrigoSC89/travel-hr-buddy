/**
 * PATCH 541 - Optimized Image Component
 * Lazy loading, blur placeholder, and WebP/AVIF support
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  blurDataURL?: string;
  className?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  blurDataURL,
  className,
  objectFit = "cover",
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

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
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full transition-opacity duration-300",
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
