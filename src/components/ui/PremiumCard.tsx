/**
 * PremiumCard - Deep Ocean Command Center card with glassmorphism v2
 * Hover glow, gradient borders, spring animations, and glass effects
 */
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "primary" | "success" | "warning" | "destructive";
  hover?: boolean;
  delay?: number;
  glass?: boolean;
}

const glowMap = {
  cyan: "hover:shadow-[0_0_35px_-5px_hsla(190,95%,50%,0.2)]",
  primary: "hover:shadow-[0_0_35px_-5px_hsla(214,84%,46%,0.2)]",
  success: "hover:shadow-[0_0_35px_-5px_hsla(142,71%,45%,0.2)]",
  warning: "hover:shadow-[0_0_35px_-5px_hsla(45,100%,51%,0.2)]",
  destructive: "hover:shadow-[0_0_35px_-5px_hsla(4,90%,55%,0.2)]",
};

const borderGlowMap = {
  cyan: "hover:border-[hsla(190,95%,50%,0.3)]",
  primary: "hover:border-primary/30",
  success: "hover:border-success/30",
  warning: "hover:border-warning/30",
  destructive: "hover:border-destructive/30",
};

export function PremiumCard({
  children,
  className,
  glowColor = "primary",
  hover = true,
  delay = 0,
  glass = false,
}: PremiumCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: delay * 0.08, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      whileHover={hover && !shouldReduceMotion ? { 
        y: -4, 
        scale: 1.01,
        transition: { type: "spring", stiffness: 300, damping: 20 } 
      } : {}}
      className={cn(
        "relative rounded-xl border border-border/50 bg-card p-5",
        "transition-all duration-300 ease-out",
        glass && "backdrop-blur-xl bg-card/80",
        "dark:glass-command",
        hover && glowMap[glowColor],
        hover && borderGlowMap[glowColor],
        className
      )}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </motion.div>
  );
}
