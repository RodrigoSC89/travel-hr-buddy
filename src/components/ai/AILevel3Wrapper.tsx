/**
 * AILevel3Wrapper - Global AI Level 3 integration wrapper
 * Add to any page for autonomous AI capabilities
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AILevel3Panel } from "@/components/ai/AILevel3Panel";
import { cn } from "@/lib/utils";

interface AILevel3WrapperProps {
  module: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
  position?: 'right' | 'bottom';
}

export function AILevel3Wrapper({ 
  module, 
  children, 
  className,
  defaultExpanded = false,
  position = 'right'
}: AILevel3WrapperProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMinimized, setIsMinimized] = useState(false);

  if (position === 'bottom') {
    return (
      <div className={cn("flex flex-col h-full", className)}>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
        
        <AnimatePresence>
          {isExpanded && !isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t bg-card/50 backdrop-blur"
            >
              <div className="flex items-center justify-between p-2 border-b">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  IA Autônoma Level 3
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(true)} aria-label="Minimizar">
                    <Minimize2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(false)} aria-label="Fechar">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4 max-h-[300px] overflow-auto">
                <AILevel3Panel module={module} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating trigger */}
        {!isExpanded && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="fixed bottom-20 right-4 z-40"
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="rounded-full h-12 w-12 shadow-lg bg-primary hover:bg-primary/90"
            >
              <Brain className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {isMinimized && isExpanded && (
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              onClick={() => setIsMinimized(false)}
              variant="outline"
              className="rounded-full h-10 px-4 shadow-lg gap-2"
            >
              <Brain className="h-4 w-4" />
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Right position (side panel)
  return (
    <div className={cn("flex h-full gap-4", className)}>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      
      <AnimatePresence>
        {isExpanded && !isMinimized && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="shrink-0 border-l bg-card/30 backdrop-blur overflow-hidden"
          >
            <div className="w-[380px] h-full overflow-auto p-4">
              <AILevel3Panel module={module} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger */}
      {!isExpanded && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-20 right-4 z-40"
        >
          <Button
            onClick={() => setIsExpanded(true)}
            className="rounded-full h-14 w-14 shadow-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Brain className="h-6 w-6" />
          </Button>
        </motion.div>
      )}

      {isMinimized && isExpanded && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button
            onClick={() => setIsMinimized(false)}
            variant="outline"
            className="rounded-full h-10 px-4 shadow-lg gap-2"
          >
            <Brain className="h-4 w-4" />
            <span className="text-xs">IA Level 3</span>
          </Button>
        </div>
      )}
    </div>
  );
}

export default AILevel3Wrapper;
