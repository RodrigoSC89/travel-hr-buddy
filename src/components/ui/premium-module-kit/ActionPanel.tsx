/**
 * Action Panel - Barra de ações rápidas contextual
 */

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, type LucideIcon } from "lucide-react";

export interface ActionItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  badge?: string | number;
  disabled?: boolean;
  hidden?: boolean;
}

export interface ActionGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: ActionItem[];
}

interface ActionPanelProps {
  actions?: ActionItem[];
  groups?: ActionGroup[];
  primaryAction?: ActionItem;
  className?: string;
}

export function ActionPanel({ actions = [], groups = [], primaryAction, className }: ActionPanelProps) {
  const visibleActions = actions.filter(a => !a.hidden);

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* Primary Action */}
      {primaryAction && !primaryAction.hidden && (
        <Button 
          onClick={primaryAction.onClick}
          disabled={primaryAction.disabled}
          className="gap-2"
        >
          <primaryAction.icon className="h-4 w-4" />
          {primaryAction.label}
          {primaryAction.badge && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {primaryAction.badge}
            </Badge>
          )}
        </Button>
      )}

      {/* Regular Actions */}
      {visibleActions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant || "outline"}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className="gap-2"
        >
          <action.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{action.label}</span>
          {action.badge && (
            <Badge variant="secondary" className="h-5 px-1.5">
              {action.badge}
            </Badge>
          )}
        </Button>
      ))}

      {/* Grouped Actions */}
      {groups.map((group) => {
        const visibleItems = group.items.filter(i => !i.hidden);
        if (visibleItems.length === 0) return null;

        return (
          <DropdownMenu key={group.id}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <group.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{group.label}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {visibleItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  {index > 0 && item.variant === "destructive" && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={item.variant === "destructive" ? "text-destructive" : ""}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </DropdownMenuItem>
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </div>
  );
}
