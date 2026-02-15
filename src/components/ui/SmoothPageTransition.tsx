/**
 * Smooth Page Transition - Cinematic Edition v2
 * World-class page transitions with spring physics, blur, and parallax
 */

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ReactNode, useMemo } from "react";

interface SmoothPageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    filter: "blur(8px)",
    scale: 0.97,
  },
  enter: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1], // Custom easeOutQuint
      staggerChildren: 0.06,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(6px)",
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function SmoothPageTransition({ children, className }: SmoothPageTransitionProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  const pageKey = useMemo(() => location.pathname, [location.pathname]);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey}
        variants={pageVariants}
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
 * Fade transition with blur - enhanced
 */
export function FadeTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, filter: "blur(4px)", scale: 0.99 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Slide transition with spring physics - enhanced
 */
export function SlideTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30, filter: "blur(6px)", scale: 0.97 }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)", scale: 1 }}
      exit={{ opacity: 0, x: -20, filter: "blur(4px)", scale: 0.98 }}
      transition={{ type: "spring", stiffness: 250, damping: 25, mass: 0.8 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scale transition with spring bounce
 */
export function ScaleTransition({ children, className }: SmoothPageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
