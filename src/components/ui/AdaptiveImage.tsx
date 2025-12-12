/**
 * AdaptiveImage - Imagem que se adapta à qualidade da conexão
 * Carrega versões menores em conexões lentas
 */

import { memo, memo, useEffect, useRef, useState, useCallback } from "react";;;
import { cn } from "@/lib/utils";
import { connectionAdaptive } from "@/lib/performance/connection-adaptive";

interface AdaptiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  onLoad?: () => void;
  onError?: () => void;
}

export const AdaptiveImage = memo(function({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = "blur",
  onLoad,
  onError,
}: AdaptiveImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const recommendations = connectionAdaptive.getRecommendations();

  useEffect(() => {
    if (priority && imgRef.current) {
      // Carregar imediatamente se for prioritária
      imgRef.current.loading = "eager";
    }
  }, [priority]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    onError?.();
  };

  // Calcular dimensões adaptativas
  const adaptiveWidth = width 
    ? Math.min(width, recommendations.maxImageWidth) 
    : undefined;

  if (error) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className
        )}
        style={{ width: adaptiveWidth, height }}
      >
        <span className="text-sm">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Placeholder blur */}
      {placeholder === "blur" && !loaded && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ width: adaptiveWidth, height }}
        />
      )}
      
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={adaptiveWidth}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className
        )}
      />
    </div>
  );
}

// Avatar otimizado para listas
export const AdaptiveAvatar = memo(function({
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
  const [error, setError] = useState(false);

  const initials = alt
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium",
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      onError={() => setError(true}
      className={cn("rounded-full object-cover", className)}
    />
  );
});
