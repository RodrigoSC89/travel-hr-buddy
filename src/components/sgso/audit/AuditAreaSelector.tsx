/**
 * Audit Area Selector Component
 * Displays audit areas and criteria for selection
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuditArea, AuditResult } from "./types";

interface AuditAreaSelectorProps {
  areas: AuditArea[];
  selectedResults: AuditResult[];
  onAddResult: (area: string, criterion: string) => void;
  onRemoveResult: (criterion: string) => void;
}

export const AuditAreaSelector = React.memo(function AuditAreaSelector({
  areas,
  selectedResults,
  onAddResult,
  onRemoveResult,
}: AuditAreaSelectorProps) {
  const isSelected = (criterion: string) =>
    selectedResults.some((r) => r.criterion === criterion);

  const handleToggle = (area: AuditArea, criterion: string, checked: boolean) => {
    if (checked) {
      onAddResult(area.name, criterion);
    } else {
      onRemoveResult(criterion);
    }
  };

  return (
    <div className="space-y-4">
      {areas.map((area) => (
        <Card key={area.id}>
          <CardHeader className="py-3">
            <CardTitle className="text-base">{area.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {area.criteria.map((criterion) => (
              <div key={criterion} className="flex items-center gap-2">
                <Checkbox
                  id={`${area.id}-${criterion}`}
                  checked={isSelected(criterion)}
                  onCheckedChange={(checked) =>
                    handleToggle(area, criterion, !!checked)
                  }
                />
                <Label
                  htmlFor={`${area.id}-${criterion}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {criterion}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
