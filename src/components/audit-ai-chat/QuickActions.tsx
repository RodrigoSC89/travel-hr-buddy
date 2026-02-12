/**
 * QuickActions Component - Pre-defined audit actions
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";

interface QuickAction {
  label: string;
  prompt: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
  onAction: (prompt: string) => void;
  disabled?: boolean;
  moduleColor?: string;
}

export function QuickActions({ actions, onAction, disabled, moduleColor = "blue" }: QuickActionsProps) {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-accent hover:border-accent"
            onClick={() => onAction(action.prompt)}
            disabled={disabled}
          >
            <div className="flex items-start gap-2 w-full">
              <Sparkles className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
              <span className="text-xs leading-relaxed line-clamp-2">{action.label}</span>
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
