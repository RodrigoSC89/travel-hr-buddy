/**
 * Progressive Loader
 * PATCH 624 - Loading progressivo com feedback visual melhorado
 */

import { memo, memo, useEffect, useState } from "react";;;
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressiveLoaderProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  showProgress?: boolean;
  className?: string;
}

export const ProgressiveLoader = memo(function({
  isLoading,
  progress,
  message = "Carregando...",
  showProgress = false,
  className,
}: ProgressiveLoaderProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animação suave do progresso
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setDisplayProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex flex-col items-center justify-center gap-4 p-8",
            className
          )}
        >
          {/* Spinner animado */}
          <div className="relative">
            <motion.div
              className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            {showProgress && progress !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {Math.round(displayProgress)}%
                </span>
              </div>
            )}
          </div>

          {/* Mensagem */}
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            {message}
          </motion.p>

          {/* Barra de progresso */}
          {showProgress && (
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${displayProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Skeleton com shimmer effect otimizado
 */
export const ShimmerSkeleton = memo(function({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded-md",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:animate-shimmer",
        className
      )}
    />
  );
}

/**
 * Card skeleton com layout realista
 */
export const CardSkeleton = memo(function() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <ShimmerSkeleton className="h-5 w-32" />
        <ShimmerSkeleton className="h-8 w-8 rounded-full" />
      </div>
      <ShimmerSkeleton className="h-8 w-24" />
      <ShimmerSkeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Table skeleton
 */
export const TableSkeleton = memo(function({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-muted/50 border-b">
        {[1, 2, 3, 4].map((i) => (
          <ShimmerSkeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b last:border-0">
          {[1, 2, 3, 4].map((j) => (
            <ShimmerSkeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
