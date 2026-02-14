/**
 * World-Class Transitions & Micro-Interactions
 * Cinematographic quality animations for premium UX
 */
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ============================================
// STAGGERED CHILDREN - Cards, lists, grids
// ============================================
interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}

export function StaggeredContainer({ children, className, delay = 0, staggerDelay = 0.06 }: StaggerProps) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 12, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// GLASS CARD - Premium glassmorphism effect
// ============================================
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, glowColor = "primary", hover = true }: GlassCardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-md",
        "shadow-premium-sm hover:shadow-premium-md transition-shadow duration-300",
        `hover:border-${glowColor}/30`,
        className
      )}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// HERO COUNTER - Animated KPI with glow
// ============================================
interface HeroCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  icon?: ReactNode;
  className?: string;
}

export function HeroCounter({ value, label, prefix, suffix, trend, icon, className }: HeroCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("flex flex-col items-center gap-1 p-4", className)}
    >
      {icon && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
          className="text-primary mb-1"
        >
          {icon}
        </motion.div>
      )}
      <div className="flex items-baseline gap-0.5">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <motion.span
          className="text-3xl font-bold tabular-nums bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {value.toLocaleString("pt-BR")}
        </motion.span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {trend !== undefined && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            trend > 0 ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}
        >
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </motion.span>
      )}
    </motion.div>
  );
}

// ============================================
// SHIMMER SKELETON - Premium loading
// ============================================
export function ShimmerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-muted/60",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    />
  );
}

// ============================================
// FLOATING ACTION - Pulse glow button
// ============================================
interface FloatingActionProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  pulse?: boolean;
}

export function FloatingAction({ children, onClick, className, pulse = true }: FloatingActionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative rounded-full p-3 bg-primary text-primary-foreground shadow-premium-lg",
        "hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-shadow duration-300",
        className
      )}
    >
      {pulse && (
        <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
      )}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

// ============================================
// REVEAL ON SCROLL - Intersection observer
// ============================================
export function RevealOnScroll({ children, className }: { children: ReactNode; className?: string }) {
  const shouldReduce = useReducedMotion();
  if (shouldReduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// GLOW BORDER - Animated border gradient
// ============================================
export function GlowBorder({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="relative rounded-xl bg-card border border-border/50">
        {children}
      </div>
    </div>
  );
}
