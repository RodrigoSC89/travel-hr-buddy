/**
 * GlobalAILevel3Button - Floating AI Level 3 button for all pages
 * Adds autonomous AI capabilities globally
 */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AILevel3Panel } from "@/components/ai/AILevel3Panel";
import { useLocation } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function GlobalAILevel3Button() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Detect module from current route
  const getModuleFromPath = (path: string): string => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return 'general';
    
    const moduleMap: Record<string, string> = {
      'central-comando': 'command',
      'maintenance-command': 'maintenance',
      'voyage-command': 'voyage',
      'fleet-command': 'fleet',
      'finance-command': 'finance',
      'esg-emissions': 'esg',
      'waste-management': 'esg',
      'sustainability-score': 'esg',
      'compliance-center': 'compliance',
      'isps-security': 'security',
      'drill-simulator': 'safety',
      'cargo-management': 'cargo',
      'charter-party': 'charter',
      'port-call-optimization': 'port',
      'voyage-accounting': 'voyage',
      'weather-command': 'weather',
      'ai-command': 'ai',
      'tracking': 'tracking',
    };

    return moduleMap[segments[0]] || segments[0];
  };

  const currentModule = getModuleFromPath(location.pathname);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          <Button
            className="rounded-full h-12 w-12 shadow-xl bg-gradient-to-br from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 border border-white/20"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Brain className="h-5 w-5" />
            </motion.div>
          </Button>
          
          {/* Pulse effect */}
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
          </span>
        </div>
      </SheetTrigger>

      <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20">
              <Brain className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <span className="flex items-center gap-2">
                IA Autônoma Level 3
                <Sparkles className="h-4 w-4 text-warning" />
              </span>
              <p className="text-xs font-normal text-muted-foreground">
                Módulo: {currentModule}
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <AILevel3Panel module={currentModule} />
      </SheetContent>
    </Sheet>
  );
}

export default GlobalAILevel3Button;
