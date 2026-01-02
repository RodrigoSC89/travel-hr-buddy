/**
 * FloatingButtonsContainer - Unified container for all floating buttons
 * Prevents overlapping by stacking buttons vertically with proper spacing
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingButtonsContainerProps {
  children: React.ReactNode;
}

/**
 * Container that organizes floating buttons in a vertical stack
 * Usage: Wrap individual floating buttons as children
 */
export function FloatingButtonsContainer({ children }: FloatingButtonsContainerProps) {
  return (
    <TooltipProvider>
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-4"
        role="group"
        aria-label="Botões de ação rápida"
      >
        {children}
      </div>
    </TooltipProvider>
  );
}

/**
 * Individual floating button wrapper with tooltip support
 */
interface FloatingButtonWrapperProps {
  children: React.ReactNode;
  tooltip?: string;
  delay?: number;
}

export function FloatingButtonWrapper({ 
  children, 
  tooltip,
  delay = 0 
}: FloatingButtonWrapperProps) {
  const content = (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay * 0.1, type: "spring", stiffness: 260, damping: 20 }}
    >
      {children}
    </motion.div>
  );

  if (!tooltip) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {content}
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-background border">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default FloatingButtonsContainer;
