import { motion, AnimatePresence } from "framer-motion";
import { memo, memo, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1]
    }
  }
};

export const PageTransition = memo(function({ children, className }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Variantes para diferentes tipos de transição
export const fadeVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
});

export const slideUpVariants = {
  initial: { opacity: 0, y: 40 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
});

export const slideRightVariants = {
  initial: { opacity: 0, x: -40 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, x: 40, transition: { duration: 0.2 } }
};

export const scaleVariants = {
  initial: { opacity: 0, scale: 0.9 },
  enter: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

// Stagger children animation
export const staggerContainer = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
});
