/**
 * Premium Loading & Empty State Components
 * Cinematic skeleton loaders and polished empty states
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox, Search, FileX, Wifi } from "lucide-react";
import { Button } from "./button";

// ============================================
// SHIMMER SKELETON
// ============================================
export function ShimmerSkeleton({ 
  className, 
  lines = 3,
  avatar = false 
}: { 
  className?: string; 
  lines?: number;
  avatar?: boolean;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {avatar && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted animate-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-1/3 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "0.1s" }} />
            <div className="h-3 w-1/4 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "0.2s" }} />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-md bg-muted animate-shimmer"
          style={{
            width: `${85 - i * 15}%`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// CARD SKELETON
// ============================================
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-xl border border-border/50 bg-card/50 p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded-md bg-muted animate-shimmer" />
            <div className="h-8 w-8 rounded-lg bg-muted animate-shimmer" />
          </div>
          <div className="h-8 w-20 rounded-md bg-muted animate-shimmer" style={{ animationDelay: "0.1s" }} />
          <div className="h-2 w-full rounded-full bg-muted animate-shimmer" style={{ animationDelay: "0.2s" }} />
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// TABLE SKELETON
// ============================================
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="bg-muted/30 px-4 py-3 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-muted animate-shimmer flex-1" style={{ animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-4 py-3 flex gap-4 border-t border-border/30">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-4 rounded bg-muted/60 animate-shimmer flex-1" style={{ animationDelay: `${(r * cols + c) * 0.03}s` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// PREMIUM EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "search" | "error" | "offline";
}

const variantConfig = {
  default: { Icon: Inbox, gradient: "from-primary/10 to-accent/10" },
  search: { Icon: Search, gradient: "from-primary/10 to-primary/5" },
  error: { Icon: FileX, gradient: "from-destructive/10 to-destructive/5" },
  offline: { Icon: Wifi, gradient: "from-warning/10 to-warning/5" },
};

export function PremiumEmptyState({ icon, title, description, action, variant = "default" }: EmptyStateProps) {
  const config = variantConfig[variant];
  const DisplayIcon = icon || config.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br", config.gradient)}
      >
        <DisplayIcon className="h-9 w-9 text-muted-foreground" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.label}
        </Button>
      )}
    </motion.div>
  );
}

// ============================================
// FULL PAGE LOADER
// ============================================
export function PremiumPageLoader({ message = "Carregando..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-sm text-muted-foreground font-medium"
      >
        {message}
      </motion.p>
    </div>
  );
}
