/**
 * Shared Framer Motion Variants - Cinematic UX System
 * Reusable animation presets for all modules
 */
import type { Variants, Transition } from "framer-motion";

// === Entry Animations ===
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// === Container Stagger ===
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
};

// === KPI Card Animation ===
export const kpiCard: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

// === Tab Content ===
export const tabContent: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// === Hover / Interactive ===
export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px hsla(var(--primary) / 0.15)",
    transition: { duration: 0.3 },
  },
};

// === Page Transition ===
export const pageTransition: Transition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3,
};

// === Pulse for alerts ===
export const pulseVariant: Variants = {
  idle: { scale: 1 },
  pulse: { 
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
  },
};

// === Micro-interactions ===
export const microBounce = {
  whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 17 } },
};

export const cardHoverLift = {
  whileHover: { y: -4, boxShadow: "0 12px 24px -8px hsla(var(--primary) / 0.12)", transition: { duration: 0.25 } },
  whileTap: { y: 0, scale: 0.99 },
};

export const shimmerPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: { opacity: [0.5, 0.8, 0.5], transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } },
};

// === Badge / notification bounce ===
export const notificationBadge: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 15 } },
};
