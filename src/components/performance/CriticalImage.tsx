/**
 * CriticalImage - Optimized Image Component for LCP
 * PATCH 880: Zero CLS, priority loading for hero/LCP images
 */

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface CriticalImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  sizes?: string;
  srcSet?: string;
  onLoad?: () => void;
}

export const CriticalImage: React.FC<CriticalImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = "empty",
  blurDataURL,
  sizes,
  srcSet,
  onLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Calculate aspect ratio for CLS prevention
  const aspectRatio = width / height;

  useEffect(() => {
    if (priority && imgRef.current) {
      // Force eager loading for priority images
      imgRef.current.loading = "eager";
      imgRef.current.decoding = "sync";
      
      // Add fetchpriority hint
      imgRef.current.setAttribute("fetchpriority", "high");
    }
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
  };

  // Placeholder styles
  const placeholderStyle: React.CSSProperties = placeholder === "blur" && blurDataURL
    ? {
        backgroundImage: `url(${blurDataURL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        filter: "blur(20px)",
        transform: "scale(1.1)",
      }
    : {
        backgroundColor: "hsl(var(--muted))",
      };

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ aspectRatio }}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio }}
    >
      {/* Placeholder - prevents CLS */}
      {!isLoaded && (
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={placeholderStyle}
          aria-hidden="true"
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        srcSet={srcSet}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{ aspectRatio }}
        data-lcp={priority ? "true" : undefined}
        data-priority={priority ? "high" : undefined}
      />
    </div>
  );
};

/**
 * Responsive Image with srcSet generation
 */
interface ResponsiveImageProps extends Omit<CriticalImageProps, "srcSet"> {
  breakpoints?: number[];
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  breakpoints = [320, 640, 768, 1024, 1280, 1536],
  ...props
}) => {
  // Generate srcSet from breakpoints
  const srcSet = breakpoints
    .map((bp) => {
      // For local images, just use the src
      // For CDN images, you'd transform the URL here
      return `${src} ${bp}w`;
    })
    .join(", ");

  // Generate sizes attribute
  const sizes = breakpoints
    .slice(0, -1)
    .map((bp, i) => `(max-width: ${bp}px) ${bp}px`)
    .concat(["100vw"])
    .join(", ");

  return (
    <CriticalImage
      {...props}
      src={src}
      srcSet={srcSet}
      sizes={sizes}
    />
  );
};

export default CriticalImage;
