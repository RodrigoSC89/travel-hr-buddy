/**
 * PremiumCard - Deep Ocean Command Center card with glassmorphism
 * Provides hover glow, gradient borders, and smooth animations
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
}

const glowMap = {
  cyan: "hover:shadow-[0_0_30px_-6px_hsla(190,95%,50%,0.15)]",
  primary: "hover:shadow-[0_0_30px_-6px_hsla(214,84%,46%,0.15)]",
  success: "hover:shadow-[0_0_30px_-6px_hsla(142,71%,45%,0.15)]",
  warning: "hover:shadow-[0_0_30px_-6px_hsla(45,100%,51%,0.15)]",
  destructive: "hover:shadow-[0_0_30px_-6px_hsla(4,90%,55%,0.15)]",
};

export function PremiumCard({
  children,
  className,
  glowColor = "primary",
  hover = true,
  delay = 0,
}: PremiumCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={hover && !shouldReduceMotion ? { y: -3, transition: { duration: 0.2 } } : {}}
      className={cn(
        "relative rounded-xl border border-border/50 bg-card p-5",
        "transition-all duration-300 ease-out",
        "dark:glass-command",
        hover && glowMap[glowColor],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
