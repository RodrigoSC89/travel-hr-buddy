/**
 * OptimizedImage - FASE A.4
 * 
 * Componente de imagem otimizada com:
 * - Lazy loading com Intersection Observer
 * - Placeholders (blur/skeleton)
 * - Versões responsivas (srcset)
 * - Formato WebP
 */

import { useEffect, useRef, useState } from "react";;;
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  /** Path base da imagem (sem extensão) */
  src: string;
  /** Texto alternativo */
  alt: string;
  /** Classe CSS adicional */
  className?: string;
  /** Tipo de placeholder */
  placeholder?: "blur" | "skeleton" | "none";
  /** Prioridade de carregamento (disable lazy loading) */
  priority?: boolean;
  /** Tamanho padrão */
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  placeholder = "blur",
  priority = false,
  sizes = "(max-width: 640px) 400px, 800px",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

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
        rootMargin: "50px", // Pré-carrega 50px antes de aparecer
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Determinar paths das imagens
  const basePath = src.replace(/\.(png|jpg|jpeg)$/, "");
  const smallWebP = `${basePath}-small.webp`;
  const mediumWebP = `${basePath}-medium.webp`;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        placeholder === "skeleton" && !isLoaded && "animate-pulse bg-muted",
        className
      )}
    >
      {/* Placeholder blur (base64 tiny image) */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10 blur-xl"
          aria-hidden="true"
        />
      )}

      {/* Imagem otimizada */}
      {isInView && (
        <picture>
          <source
            type="image/webp"
            srcSet={`${smallWebP} 400w, ${mediumWebP} 800w`}
            sizes={sizes}
          />
          <img
            ref={imgRef}
            src={mediumWebP}
            alt={alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className
            )}
            onLoad={() => setIsLoaded(true)}
          />
        </picture>
      )}

      {/* Fallback skeleton */}
      {!isInView && placeholder === "skeleton" && (
        <div className="h-full w-full bg-muted" />
      )}
    </div>
  );
}
