import { memo } from 'react';
import { motion } from "framer-motion";

export const Loader = memo(function() {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label="Carregando..."
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, scale: [1, 1.05, 1] }}
      transition={{ duration: 1, repeat: Infinity }}
      className="w-6 h-6 border-4 border-[var(--nautilus-primary)] border-t-transparent rounded-full animate-spin"
    />
  );
}
