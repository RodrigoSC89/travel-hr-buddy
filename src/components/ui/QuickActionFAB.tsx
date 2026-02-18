/**
 * CommandScore - Quick action floating button com ações contextuais
 * Benchmark: Linear (⌘.), Notion slash commands
 */

import React, { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap, Plus, FileText, Users, Ship, Wrench,
  AlertTriangle, ClipboardCheck, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  action?: () => void;
  color?: string;
}

const defaultActions: QuickAction[] = [
  { id: "vessel", label: "Nova Embarcação", icon: <Ship className="h-4 w-4" />, path: "/ops?action=new-vessel" },
  { id: "crew", label: "Novo Tripulante", icon: <Users className="h-4 w-4" />, path: "/people?action=new-crew" },
  { id: "wo", label: "Work Order", icon: <Wrench className="h-4 w-4" />, path: "/maintenance?action=new-wo" },
  { id: "incident", label: "Reportar Incidente", icon: <AlertTriangle className="h-4 w-4" />, path: "/compliance?action=new-incident", color: "destructive" },
  { id: "checklist", label: "Nova Checklist", icon: <ClipboardCheck className="h-4 w-4" />, path: "/compliance?action=new-checklist" },
  { id: "document", label: "Novo Documento", icon: <FileText className="h-4 w-4" />, path: "/documents?action=new" },
];

export const QuickActionFAB = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = useCallback((action: QuickAction) => {
    setIsOpen(false);
    if (action.path) navigate(action.path);
    else if (action.action) action.action();
  }, [navigate]);

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB + Actions */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {isOpen && defaultActions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ delay: i * 0.04, type: "spring", damping: 20 }}
            >
              <button
                onClick={() => handleAction(action)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg",
                  "bg-card border border-border text-foreground",
                  "hover:bg-accent transition-colors text-sm font-medium",
                  "whitespace-nowrap"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div whileTap={{ scale: 0.92 }}>
          <Button
            size="icon"
            className={cn(
              "h-14 w-14 rounded-2xl shadow-2xl transition-all",
              isOpen 
                ? "bg-muted text-muted-foreground rotate-45" 
                : "bg-primary text-primary-foreground hover:shadow-primary/30 hover:shadow-xl"
            )}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
          </Button>
        </motion.div>
      </div>
    </>
  );
});

QuickActionFAB.displayName = "QuickActionFAB";
