/**
 * Filter Panel Widget
 * Componente reutilizável para filtros de dashboard
 * FASE B.2 - Consolidação de Dashboards
 */

import { useState } from "react";;;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterConfig } from "@/types/dashboard-config";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterPanelProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (filterId: string, value: unknown: unknown: unknown) => void;
  onReset?: () => void;
  className?: string;
  horizontal?: boolean;
}

export const FilterPanel = ({
  filters,
  values,
  onChange,
  onReset,
  className,
  horizontal = false
}: FilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

  const renderFilter = (filter: FilterConfig) => {
    const value = values[filter.id] || filter.defaultValue;

    switch (filter.type) {
    case "select":
      return (
        <div key={filter.id} className="space-y-2">
          <label className="text-sm font-medium">{filter.label}</label>
          <Select
            value={value}
            onValueChange={(v) => onChange(filter.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case "search":
      return (
        <div key={filter.id} className="space-y-2">
          <label className="text-sm font-medium">{filter.label}</label>
          <Input
            type="text"
            placeholder={filter.placeholder}
            value={value || ""}
            onChange={(e) => onChange(filter.id, e.target.value)}
          />
        </div>
      );

    case "date":
      return (
        <div key={filter.id} className="space-y-2">
          <label className="text-sm font-medium">{filter.label}</label>
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(filter.id, e.target.value)}
          />
        </div>
      );

    case "daterange":
      return (
        <div key={filter.id} className="space-y-2">
          <label className="text-sm font-medium">{filter.label}</label>
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Início"
              value={value?.start || ""}
              onChange={(e) => onChange(filter.id, { ...value, start: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Fim"
              value={value?.end || ""}
              onChange={(e) => onChange(filter.id, { ...value, end: e.target.value })}
            />
          </div>
        </div>
      );

    default:
      return null;
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </CardTitle>
        <div className="flex gap-2">
          {onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent>
          <div className={cn(
            "gap-4",
            horizontal ? "flex flex-wrap" : "grid grid-cols-1"
          )}>
            {filters.map(renderFilter)}
          </div>
        </CardContent>
      )}
    </Card>
  );
};
