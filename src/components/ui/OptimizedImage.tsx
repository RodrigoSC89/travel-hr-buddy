/**
 * Optimized Image Component - PATCH 750
 * Connection-aware image loading with lazy loading and placeholders
 */

import { useState, useRef, useEffect, memo } from 'react';
import { useConnectionAware } from '@/hooks/use-connection-aware';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Generate a lightweight SVG placeholder
 */
function generatePlaceholder(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect fill="hsl(220, 13%, 91%)" width="100%" height="100%"/>
    <rect fill="hsl(220, 13%, 85%)" x="10%" y="10%" width="80%" height="80%" rx="8"/>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className,
  width = 300,
  height = 200,
  priority = false,
  placeholder = 'skeleton',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const { imageQuality, isSlowConnection } = useConnectionAware();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: isSlowConnection ? '50px' : '200px', // Smaller margin for slow connections
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority, isSlowConnection]);

  // Build optimized src with quality parameter
  const optimizedSrc = (() => {
    if (!src || hasError) return generatePlaceholder(width, height);
    if (!isInView) return generatePlaceholder(width, height);
    
    // If it's a Supabase storage URL, add transformations
    if (src.includes('supabase.co/storage')) {
      const qualityMap = { low: 50, medium: 70, high: 85 };
      const separator = src.includes('?') ? '&' : '?';
      return `${src}${separator}quality=${qualityMap[imageQuality]}&width=${width}`;
    }
    
    return src;
  })();

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-muted',
        className
      )}
      style={{ width, height }}
    >
      {/* Skeleton placeholder */}
      {placeholder === 'skeleton' && !isLoaded && (
        <div 
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      )}

      {/* Blur placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div 
          className="absolute inset-0 bg-muted backdrop-blur-xl"
        />
      )}

      {/* Actual image */}
      <img
        ref={imgRef}
        src={optimizedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <span className="text-xs text-muted-foreground">
            Imagem indisponível
          </span>
        </div>
      )}
    </div>
  );
});

/**
 * CSS for shimmer animation - add to index.css
 */
export const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

export default OptimizedImage;
