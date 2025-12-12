/**
 * AnimatedPage Component
 * Wrapper for page transitions using Framer Motion
 * PATCH 127.0 - Transições com Framer Motion
 */

import { motion } from "framer-motion";
import { memo, memo, ReactNode } from "react";

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

/**
 * Default animation variants for page transitions
 */
const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
  },
};

/**
 * Default transition configuration
 */
const pageTransition = {
  duration: 0.3,
  ease: "easeOut",
};

/**
 * AnimatedPage wrapper component
 * Wraps page content with smooth enter/exit animations
 * 
 * @example
 * ```tsx
 * <AnimatedPage>
 *   <YourPageContent />
 * </AnimatedPage>
 * ```
 */
export default function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Alternative animation presets
 */
export const animationPresets = {
  // Fade only
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  
  // Slide from right
  slideRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
  
  // Slide from left
  slideLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  },
  
  // Scale in
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  
  // Slide up
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
} as const;

/**
 * AnimatedPage with custom preset
 */
interface AnimatedPageWithPresetProps extends AnimatedPageProps {
  preset?: keyof typeof animationPresets;
}

export const AnimatedPageWithPreset = memo(function({ 
  children, 
  className = "", 
  preset = "fade" 
}: AnimatedPageWithPresetProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={animationPresets[preset]}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
