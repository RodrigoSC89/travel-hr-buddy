import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ChecklistItem } from "../types";

interface ItemListProps {
  items: ChecklistItem[];
  onToggle?: (itemId: string) => void;
  readonly?: boolean;
}

export function ItemList({ items, onToggle, readonly = false }: ItemListProps) {
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {sortedItems.map((item) => (
        <div 
          key={item.id} 
          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => !readonly && onToggle?.(item.id)}
        >
          <Checkbox 
            checked={item.status === "completed"} 
            disabled={readonly}
            className="mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${item.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                {item.title}
              </h4>
              {item.required && (
                <Badge variant="outline" className="text-xs">Required</Badge>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-muted-foreground mb-2">
                {item.description}
              </p>
            )}
            
            {item.notes && (
              <p className="text-sm bg-muted p-2 rounded mb-2">
                {item.notes}
              </p>
            )}
            
            {item.timestamp && (
              <p className="text-xs text-muted-foreground">
                Completed at {new Date(item.timestamp).toLocaleString()}
                {item.inspector && ` by ${item.inspector}`}
              </p>
            )}
          </div>
        </div>
      ))}
      
      {items.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No items in this checklist
        </div>
      )}
    </div>
  );
}
