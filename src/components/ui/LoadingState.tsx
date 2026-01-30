/**
 * LoadingState - Componente Unificado de Loading
 * Variantes: spinner, skeleton, pulse, dots
 * Acessível e consistente em todo o sistema
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "pulse" | "dots";
  size?: "sm" | "md" | "lg" | "xl";
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
};

const textSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

export function LoadingState({
  variant = "spinner",
  size = "md",
  message,
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-3",
    fullScreen && "fixed inset-0 bg-background/80 backdrop-blur-sm z-50",
    className
  );

  if (variant === "spinner") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} aria-hidden="true" />
        {message && (
          <p className={cn("text-muted-foreground animate-pulse", textSizeClasses[size])}>
            {message}
          </p>
        )}
        <span className="sr-only">{message || "Carregando..."}</span>
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3 w-full", className)} role="status" aria-live="polite">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
        {message && (
          <p className={cn("text-muted-foreground text-center", textSizeClasses[size])}>
            {message}
          </p>
        )}
        <span className="sr-only">{message || "Carregando..."}</span>
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <div
          className={cn(
            "rounded-full bg-primary/20 animate-pulse",
            size === "sm" && "w-8 h-8",
            size === "md" && "w-12 h-12",
            size === "lg" && "w-16 h-16",
            size === "xl" && "w-20 h-20"
          )}
        >
          <div
            className={cn(
              "rounded-full bg-primary/40 animate-ping absolute",
              size === "sm" && "w-8 h-8",
              size === "md" && "w-12 h-12",
              size === "lg" && "w-16 h-16",
              size === "xl" && "w-20 h-20"
            )}
          />
        </div>
        {message && (
          <p className={cn("text-muted-foreground", textSizeClasses[size])}>
            {message}
          </p>
        )}
        <span className="sr-only">{message || "Carregando..."}</span>
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={containerClasses} role="status" aria-live="polite">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-primary animate-bounce",
                size === "sm" && "w-1.5 h-1.5",
                size === "md" && "w-2 h-2",
                size === "lg" && "w-3 h-3",
                size === "xl" && "w-4 h-4"
              )}
              style={{
                animationDelay: `${i * 150}ms`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>
        {message && (
          <p className={cn("text-muted-foreground", textSizeClasses[size])}>
            {message}
          </p>
        )}
        <span className="sr-only">{message || "Carregando..."}</span>
      </div>
    );
  }

  return null;
}

// Convenience exports for common loading patterns
export function PageLoader({ message = "Carregando página..." }: { message?: string }) {
  return <LoadingState variant="spinner" size="lg" message={message} fullScreen />;
}

export function CardLoader({ message }: { message?: string }) {
  return (
    <div className="p-6">
      <LoadingState variant="skeleton" size="md" message={message} />
    </div>
  );
}

export function ButtonLoader({ message }: { message?: string }) {
  return <LoadingState variant="dots" size="sm" message={message} />;
}

export function InlineLoader({ message }: { message?: string }) {
  return <LoadingState variant="spinner" size="sm" message={message} />;
}

export default LoadingState;
