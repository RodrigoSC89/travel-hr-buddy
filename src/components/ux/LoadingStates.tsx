/**
 * Enhanced Loading States
 * PATCH 838: Estados de carregamento melhorados com Framer Motion
 */

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

// Spinner Component
export const Spinner = memo(({ 
  size = "default", 
  className 
}: { 
  size?: "sm" | "default" | "lg"; 
  className?: string;
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );
});

// Full Screen Loader
export const FullScreenLoader = memo(({ message = "Carregando..." }: { message?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
  >
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-primary" />
      </motion.div>
      <p className="text-lg font-medium">{message}</p>
    </div>
  </motion.div>
));

// Inline Loader
export const InlineLoader = ({ 
  text = "Carregando", 
  className 
}: { 
  text?: string; 
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn("flex items-center gap-2 text-muted-foreground", className)}
  >
    <Spinner size="sm" />
    <span className="text-sm">{text}</span>
    <motion.span
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      ...
    </motion.span>
  </motion.div>
);

// Button Loader
export const ButtonLoader = ({ loading, children }: { loading: boolean; children: React.ReactNode }) => (
  <AnimatePresence mode="wait">
    {loading ? (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2"
      >
        <Spinner size="sm" />
        <span>Processando...</span>
      </motion.div>
    ) : (
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Refresh Indicator
export const RefreshIndicator = ({ 
  refreshing, 
  onRefresh 
}: { 
  refreshing: boolean; 
  onRefresh?: () => void;
}) => (
  <motion.button
    onClick={onRefresh}
    disabled={refreshing}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-50"
  >
    <motion.div
      animate={refreshing ? { rotate: 360 } : {}}
      transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
    >
      <RefreshCw className="h-5 w-5" />
    </motion.div>
  </motion.button>
);

// Network Status Indicator
export const NetworkStatusIndicator = ({ online }: { online: boolean }) => (
  <AnimatePresence>
    {!online && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 text-center text-sm"
      >
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// Progress Bar
export const ProgressBar = ({ 
  progress, 
  showLabel = true 
}: { 
  progress: number; 
  showLabel?: boolean;
}) => (
  <div className="w-full">
    {showLabel && (
      <div className="flex justify-between mb-1">
        <span className="text-sm text-muted-foreground">Progresso</span>
        <span className="text-sm font-medium">{Math.round(progress)}%</span>
      </div>
    )}
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  </div>
);

// Pulse Dot
export const PulseDot = ({ 
  color = "primary",
  size = "default"
}: { 
  color?: "primary" | "success" | "warning" | "destructive";
  size?: "sm" | "default" | "lg";
}) => {
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-amber-500",
    destructive: "bg-red-500",
  };

  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-4 w-4",
  };

  return (
    <span className="relative flex">
      <motion.span
        className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          colorClasses[color]
        )}
        animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <span className={cn("relative inline-flex rounded-full", colorClasses[color], sizeClasses[size])} />
    </span>
  );
};

// Shimmer Effect
export const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("relative overflow-hidden bg-muted rounded", className)}>
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      animate={{ x: ["-100%", "100%"] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Typing Indicator
export const TypingIndicator = () => (
  <div className="flex items-center gap-1 p-2">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="h-2 w-2 bg-muted-foreground rounded-full"
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

export default {
  Spinner,
  FullScreenLoader,
  InlineLoader,
  ButtonLoader,
  RefreshIndicator,
  NetworkStatusIndicator,
  ProgressBar,
  PulseDot,
  Shimmer,
  TypingIndicator,
};
