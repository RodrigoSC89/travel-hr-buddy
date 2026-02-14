/**
 * PEOTRAM Element Selector - Grid to select and navigate between 13 elements
 */
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PeotramElement } from "@/data/peotram-elements-data";

interface PeotramElementSelectorProps {
  elements: PeotramElement[];
  selectedElementId: number | null;
  onSelectElement: (id: number) => void;
  elementScores?: Record<number, number>;
}

export function PeotramElementSelector({
  elements,
  selectedElementId,
  onSelectElement,
  elementScores = {},
}: PeotramElementSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
      {elements.map((el) => {
        const score = elementScores[el.id] ?? 0;
        const isSelected = selectedElementId === el.id;
        const totalItems = el.subelements.reduce((acc, s) => acc + s.items.length, 0);

        return (
          <Card
            key={el.id}
            onClick={() => onSelectElement(el.id)}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isSelected && "ring-2 ring-primary shadow-lg",
              el.isCritical && !isSelected && "border-destructive/30",
            )}
          >
            <CardContent className="p-3 text-center">
              <div className={cn(
                "text-2xl font-bold mb-1",
                el.isCritical ? "text-destructive" : "text-warning",
                isSelected && "text-primary"
              )}>
                {el.id}
              </div>
              <p className="text-[10px] text-muted-foreground line-clamp-2 h-6 leading-tight">{el.name}</p>
              <div className="mt-2 space-y-1">
                <Progress value={score} className={cn("h-1", 
                  score >= 90 ? "[&>div]:bg-success" : 
                  score >= 60 ? "[&>div]:bg-warning" : "[&>div]:bg-destructive"
                )} />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground">{totalItems} itens</span>
                  {el.isCritical && <Badge variant="destructive" className="text-[8px] h-3 px-1">CRIT</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default PeotramElementSelector;
