/**
 * Smooth Page Transition v3 - Cinematic with reduced-motion support
 * Premium page transitions with spring physics, blur, and parallax
 */

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, useMemo } from "react";
import { useLightMode } from "@/hooks/useConnectionAdaptive";

interface SmoothPageTransitionProps {
  children: ReactNode;
  className?: string;
}

const fullVariants = {
  initial: {
    opacity: 0,
    y: 16,
    filter: "blur(6px)",
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: "blur(4px)",
    scale: 0.99,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const lightVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export function SmoothPageTransition({ children, className }: SmoothPageTransitionProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const isLightMode = useLightMode();
  
  const pageKey = useMemo(() => location.pathname, [location.pathname]);

  // No animation for reduced motion or very slow connections
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const variants = isLightMode ? lightVariants : fullVariants;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Fade transition with blur - for modals and overlays
 */
export function FadeTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(6px)", scale: 0.98 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(4px)", scale: 0.99 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide transition with spring physics - for panels
 */
export function SlideTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -16, filter: "blur(3px)" }}
      transition={{ type: "spring", stiffness: 300, damping: 28, mass: 0.7 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale transition with spring bounce - for cards and modals
 */
export function ScaleTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container for list items
 */
export function StaggerContainer({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
  },
};
