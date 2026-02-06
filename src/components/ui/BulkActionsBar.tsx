/**
 * BulkActionsBar - Floating action bar for multi-select operations
 * Inspired by Gmail, Jira, Monday.com
 * 
 * Appears when items are selected, provides batch operations
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, CheckSquare, Trash2, Download, Tag, ArrowRight, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  variant?: "default" | "destructive" | "outline";
  requiresConfirmation?: boolean;
}

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions: BulkAction[];
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions,
  className,
}: BulkActionsBarProps) {
  const primaryActions = actions.slice(0, 3);
  const overflowActions = actions.slice(3);

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className={cn(
            "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
            "bg-card border-2 border-primary/20 rounded-2xl shadow-2xl",
            "px-5 py-3 flex items-center gap-4",
            "backdrop-blur-xl",
            className
          )}
        >
          {/* Selection info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedCount} de {totalCount}
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {selectedCount < totalCount && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-primary hover:text-primary"
                  onClick={onSelectAll}
                >
                  Selecionar Todos
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={onDeselectAll}
              >
                Limpar
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border" />

          {/* Primary actions */}
          <div className="flex items-center gap-2">
            {primaryActions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === "destructive" ? "destructive" : "outline"}
                size="sm"
                className="gap-2 h-8"
                onClick={() => action.onClick([])}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}

            {/* Overflow menu */}
            {overflowActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowActions.map((action, index) => (
                    <React.Fragment key={action.id}>
                      {action.variant === "destructive" && index > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => action.onClick([])}
                        className={cn(
                          "gap-2",
                          action.variant === "destructive" && "text-destructive focus:text-destructive"
                        )}
                      >
                        {action.icon}
                        {action.label}
                      </DropdownMenuItem>
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Close */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            onClick={onDeselectAll}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manage selection state for bulk operations
 */
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(items.map(i => i.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const isSelected = (id: string) => selectedIds.has(id);

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggleItem,
    selectAll,
    deselectAll,
    isSelected,
  };
}
