/**
 * Enhanced Loading Components
 * Production-grade loading states with accessibility
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

export function Spinner({ size = "md", className, label = "Loading..." }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <Loader2 
        className={cn("animate-spin text-primary", sizeClasses[size], className)} 
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  transparent?: boolean;
  children?: React.ReactNode;
}

export function LoadingOverlay({ 
  visible, 
  message = "Loading...", 
  transparent = false,
  children 
}: LoadingOverlayProps) {
  if (!visible) return <>{children}</>;

  return (
    <div className="relative">
      {children}
      <div 
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center z-50",
          transparent 
            ? "bg-background/60 backdrop-blur-sm" 
            : "bg-background"
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner size="lg" />
        {message && (
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  loadingText = "Loading...",
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      aria-busy={loading}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  );
}

interface ProgressLoaderProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressLoader({ 
  progress, 
  message, 
  showPercentage = true,
  className 
}: ProgressLoaderProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div 
      className={cn("w-full space-y-2", className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={message ?? "Loading progress"}
    >
      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        {message && <span>{message}</span>}
        {showPercentage && <span>{Math.round(clampedProgress)}%</span>}
      </div>
    </div>
  );
}

interface PulseDotsProps {
  count?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulseDots({ count = 3, size = "md", className }: PulseDotsProps) {
  const dotSizes = {
    sm: "h-1.5 w-1.5",
    md: "h-2 w-2",
    lg: "h-3 w-3"
  };

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-primary rounded-full animate-pulse",
            dotSizes[size]
          )}
          style={{ 
            animationDelay: `${i * 150}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface TypewriterLoaderProps {
  messages: string[];
  interval?: number;
  className?: string;
}

export function TypewriterLoader({ 
  messages, 
  interval = 3000,
  className 
}: TypewriterLoaderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval]);

  return (
    <div 
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
    >
      <Spinner size="sm" />
      <span className="text-sm text-muted-foreground animate-fade-in">
        {messages[currentIndex]}
      </span>
    </div>
  );
}

// Import React for the hook
import * as React from "react";

export default {
  Spinner,
  LoadingOverlay,
  LoadingButton,
  ProgressLoader,
  PulseDots,
  TypewriterLoader
};
