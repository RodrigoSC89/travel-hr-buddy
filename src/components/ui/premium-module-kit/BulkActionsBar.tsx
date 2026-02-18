/**
 * BulkActionsBar - Barra de ações em massa
 * Benchmark: Linear, Gmail, Notion
 */

import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkAction {
  id: string;
  label: string;
  icon: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  onClick: (selectedIds: string[]) => void;
}

interface BulkActionsBarProps {
  selectedCount: number;
  selectedIds: string[];
  actions: BulkAction[];
  onClearSelection: () => void;
  className?: string;
}

export const BulkActionsBar = memo(({
  selectedCount,
  selectedIds,
  actions,
  onClearSelection,
  className,
}: BulkActionsBarProps) => (
  <AnimatePresence>
    {selectedCount > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-3 px-4 py-2.5",
          "bg-foreground text-background rounded-xl shadow-2xl",
          "border border-border/10",
          className
        )}
      >
        <span className="text-sm font-medium whitespace-nowrap">
          {selectedCount} {selectedCount === 1 ? "selecionado" : "selecionados"}
        </span>

        <div className="h-4 w-px bg-background/20" />

        <div className="flex items-center gap-1.5">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                size="sm"
                variant={action.variant === "destructive" ? "destructive" : "secondary"}
                className="h-8 text-xs gap-1.5"
                onClick={() => action.onClick(selectedIds)}
              >
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            );
          })}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-background/60 hover:text-background hover:bg-background/10"
          onClick={onClearSelection}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    )}
  </AnimatePresence>
));

BulkActionsBar.displayName = "BulkActionsBar";
