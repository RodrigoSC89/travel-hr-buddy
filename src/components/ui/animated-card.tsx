/**
 * Animated Card Component
 * PATCH 860: UX Polimento Final - Cards com animações e feedback
 */

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "hover-lift" | "hover-glow" | "hover-border" | "interactive";
  delay?: number;
  children: React.ReactNode;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  variant = "default",
  delay = 0,
  className,
  children,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
    case "hover-lift":
      return "hover:-translate-y-1 hover:shadow-xl transition-all duration-300";
    case "hover-glow":
      return "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300";
    case "hover-border":
      return "hover:border-primary/50 transition-all duration-300";
    case "interactive":
      return "hover:-translate-y-1 hover:shadow-xl hover:border-primary/30 active:scale-[0.98] transition-all duration-200 cursor-pointer";
    default:
      return "";
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm",
        getVariantClasses(),
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for multiple cards
export const AnimatedCardGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className, staggerDelay = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
